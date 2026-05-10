"""
Transactions router — four endpoints that power the AMO frontend.

POST   /api/v1/transactions/receive          — provision a virtual account
POST   /api/v1/transactions/send             — AI-screened payout
GET    /api/v1/transactions/history/{acct}   — transaction history
GET    /api/v1/transactions/balance/{acct}   — current balance
"""

import json
import logging
from typing import Generator

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.models import TransactionDB, WalletDB
from app.schemas.transactions import (
    BalanceResponse,
    HistoryResponse,
    ReceiveMoneyRequest,
    SendMoneyRequest,
    TransactionRecord,
)
from app.services.fraud_engine import run_fraud_scan
from app.services.squad_client import SquadClient

log = logging.getLogger(__name__)
router = APIRouter()
squad  = SquadClient()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _split_name(full_name: str) -> tuple[str, str]:
    """Split 'First Last Extra' → ('First', 'Last Extra')."""
    parts = full_name.strip().split(maxsplit=1)
    return parts[0], parts[1] if len(parts) > 1 else ""


def _record_transaction(
    db: Session,
    *,
    sender_account: str,
    recipient_account: str,
    recipient_name: str,
    bank_code: str,
    amount: float,
    remark: str,
    reference: str,
    fraud: dict,
    status_val: str = "success",
) -> TransactionDB:
    """Persist a transaction row and return it."""
    tx = TransactionDB(
        sender_account    = sender_account,
        recipient_account = recipient_account,
        recipient_name    = recipient_name,
        bank_code         = bank_code,
        amount            = amount,
        remark            = remark,
        reference         = reference,
        risk_score        = round(fraud.get("risk_score", 0.0), 4),
        decision          = fraud.get("decision", "APPROVED"),
        explanation       = fraud.get("explanation", ""),
        modules_json      = json.dumps(fraud.get("modules", {})),
        status            = status_val,
    )
    db.add(tx)
    return tx


# ---------------------------------------------------------------------------
# 1. POST /receive — create virtual account
# ---------------------------------------------------------------------------

@router.post("/receive", status_code=status.HTTP_200_OK)
async def process_receive(
    req: ReceiveMoneyRequest,
    db: Session = Depends(get_db),
):
    """
    Provision (or retrieve) a Wema Bank virtual account via Squad.

    Idempotent — calling it twice with the same email returns the
    existing wallet instead of creating a duplicate.
    """
    # --- Idempotency: return existing wallet --------------------------------
    existing = db.query(WalletDB).filter(WalletDB.email == req.email).first()
    if existing:
        log.info("Returning existing wallet for %s", req.email)
        return {
            "status":          "success",
            "account_number":  existing.account_number,
            "bank_name":       existing.bank_name,
            "starting_balance": existing.balance,
        }

    # --- Call Squad gateway -------------------------------------------------
    first_name, last_name = _split_name(req.full_name)
    log.info("Creating virtual account for %s <%s>", req.full_name, req.email)

    res      = await squad.setup_receiving_account(first_name, last_name, req.email)
    acct_num = res.get("data", {}).get("account_number")
    bank_name = res.get("data", {}).get("bank_name", "Wema Bank")

    if not acct_num:
        log.error("Squad did not return an account_number for %s", req.email)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Payment gateway did not return an account number.",
        )

    # --- Persist wallet -----------------------------------------------------
    wallet = WalletDB(
        first_name     = first_name,
        last_name      = last_name,
        email          = req.email,
        account_number = acct_num,
        bank_name      = bank_name,
        balance        = 150_000.0,   # Demo seed balance
    )
    db.add(wallet)
    db.commit()

    log.info("Wallet created | acct=%s bank=%s email=%s", acct_num, bank_name, req.email)
    return {
        "status":           "success",
        "account_number":   acct_num,
        "bank_name":        bank_name,
        "starting_balance": 150_000.0,
    }


# ---------------------------------------------------------------------------
# 2. POST /send — AI-screened payout
# ---------------------------------------------------------------------------

@router.post("/send", status_code=status.HTTP_200_OK)
async def process_send(
    req: SendMoneyRequest,
    db: Session = Depends(get_db),
):
    """
    Send money from an AMO wallet to any Nigerian bank account.

    Flow:
      A. Validate sender exists + has sufficient balance
      B. Run 7-module AI Fraud Shield
      C. If BLOCKED → reject with 403
      D. Execute Squad NIP payout
      E. Debit sender, credit internal recipient (if any), persist record
      F. Return new balance + fraud metrics
    """
    # [A] LOOKUP + PREFLIGHT ------------------------------------------------
    sender = db.query(WalletDB).filter(
        WalletDB.account_number == req.sender_account
    ).first()

    if not sender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sender wallet not found. Please initialise your account first.",
        )
    if sender.balance < req.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient funds. Available: ₦{sender.balance:,.2f}, "
                f"Requested: ₦{req.amount:,.2f}."
            ),
        )

    # [B] FRAUD SCAN --------------------------------------------------------
    scan_input = {
        **req.model_dump(),
        "sender_balance": sender.balance,
    }
    log.info(
        "Starting fraud scan | sender=%s amount=₦%.2f recipient=%s",
        req.sender_account, req.amount, req.account_number,
    )
    fraud = await run_fraud_scan(scan_input)

    # [C] BLOCK CHECK -------------------------------------------------------
    if not fraud["is_safe"]:
        log.warning(
            "Transaction BLOCKED | score=%.4f sender=%s amount=%.2f",
            fraud["risk_score"], req.sender_account, req.amount,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Transaction blocked by AI Fraud Shield. "
                f"Risk score: {fraud['risk_score']:.0%}. "
                f"{fraud.get('explanation', '')}"
            ),
        )

    # [D] SQUAD PAYOUT ------------------------------------------------------
    log.info(
        "Initiating Squad payout | amount=₦%.2f nip=%s acct=%s",
        req.amount, req.nip_code, req.account_number,
    )
    gateway_result = await squad.send_money_out(
        amount  = req.amount,
        nip     = req.nip_code,
        account = req.account_number,
        name    = req.account_name,
        note    = req.remark,
    )

    reference = (
        gateway_result.get("data", {}).get("transaction_reference")
        or f"AMO-INT-{req.sender_account[-4:]}"
    )

    # [E] ATOMIC DB UPDATE --------------------------------------------------
    try:
        sender.balance -= req.amount

        # Internal transfer — credit recipient if they also have an AMO wallet
        internal_recipient = db.query(WalletDB).filter(
            WalletDB.account_number == req.account_number
        ).first()
        if internal_recipient:
            internal_recipient.balance += req.amount
            log.info("Internal credit applied to %s", req.account_number)

        _record_transaction(
            db,
            sender_account    = req.sender_account,
            recipient_account = req.account_number,
            recipient_name    = req.account_name,
            bank_code         = req.nip_code,
            amount            = req.amount,
            remark            = req.remark,
            reference         = reference,
            fraud             = fraud,
        )
        db.commit()
        db.refresh(sender)

    except Exception as exc:
        db.rollback()
        log.exception("DB commit failed after successful payout | ref=%s: %s", reference, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Transfer executed but balance sync failed. Contact support.",
        ) from exc

    log.info(
        "Transfer complete | ref=%s new_balance=₦%.2f decision=%s",
        reference, sender.balance, fraud["decision"],
    )

    return {
        "status":      "success",
        "new_balance": sender.balance,
        "reference":   reference,
        "metrics": {
            "risk_score":   fraud["risk_score"],
            "decision":     fraud["decision"],
            "explanation":  fraud["explanation"],
            "modules":      fraud["modules"],
            "scan_time_ms": fraud["scan_time_ms"],
        },
    }


# ---------------------------------------------------------------------------
# 3. GET /history/{account_number}
# ---------------------------------------------------------------------------

@router.get("/history/{account_number}", status_code=status.HTTP_200_OK)
async def get_transaction_history(
    account_number: str,
    db: Session = Depends(get_db),
):
    """Return the 50 most recent debits for an account, newest first."""
    if not account_number.isdigit() or len(account_number) != 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="account_number must be exactly 10 digits.",
        )

    transactions = (
        db.query(TransactionDB)
        .filter(TransactionDB.sender_account == account_number)
        .order_by(TransactionDB.created_at.desc())
        .limit(50)
        .all()
    )

    records = [
        {
            "id":                tx.id,
            "recipient_account": tx.recipient_account,
            "recipient_name":    tx.recipient_name,
            "bank_code":         tx.bank_code or "",
            "amount":            tx.amount,
            "remark":            tx.remark or "",
            "reference":         tx.reference,
            "risk_score":        tx.risk_score,
            "decision":          tx.decision,
            "explanation":       tx.explanation or "",
            "status":            tx.status,
            "created_at":        (
                tx.created_at.isoformat()
                if tx.created_at else ""
            ),
        }
        for tx in transactions
    ]

    return {
        "account_number": account_number,
        "total":          len(records),
        "transactions":   records,
    }


# ---------------------------------------------------------------------------
# 4. GET /balance/{account_number}
# ---------------------------------------------------------------------------

@router.get("/balance/{account_number}", status_code=status.HTTP_200_OK)
async def get_balance(
    account_number: str,
    db: Session = Depends(get_db),
):
    """Return current balance and metadata for a wallet."""
    if not account_number.isdigit() or len(account_number) != 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="account_number must be exactly 10 digits.",
        )

    wallet = db.query(WalletDB).filter(
        WalletDB.account_number == account_number
    ).first()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No wallet found for account {account_number}.",
        )

    return {
        "account_number": wallet.account_number,
        "balance":        wallet.balance,
        "bank_name":      wallet.bank_name,
        "email":          wallet.email,
    }
