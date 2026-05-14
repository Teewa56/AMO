import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

# --- INTERNAL IMPORTS ---
from app.schemas.transactions import SendMoneyRequest, ReceiveMoneyRequest
from app.services.squad_client import SquadClient
from app.services.fraud_engine import run_fraud_scan
from app.core.database import get_db
from app.schemas.models import WalletDB, TransactionDB

router = APIRouter()
squad = SquadClient()

# --- 1. INITIALIZE / RECEIVE LOGIC ---
@router.post("/receive")
async def process_receive(req: ReceiveMoneyRequest, db: Session = Depends(get_db)):
    try:
        # Check if the user already exists to prevent duplicate accounts
        existing = db.query(WalletDB).filter(WalletDB.email == req.email).first()
        if existing:
            return {
                "status": "success",
                "account_number": existing.account_number,
                "balance": existing.balance,
                "bank_name": existing.bank_name or "AOM Cloud"
            }

        # Trigger Squad to generate a virtual account
        res = await squad.setup_receiving_account(req.full_name, req.email)

        # Extract the account number from Squad's response
        acct_num = res.get("data", {}).get("account_number")
        bank_name = res.get("data", {}).get("bank_name", "Wema Bank")

        if not acct_num:
            raise HTTPException(status_code=500, detail="Failed to generate account number from gateway")

        first_name, last_name = (req.full_name.strip().split(" ", 1) if " " in req.full_name.strip() else (req.full_name.strip(), ""))
        # Save to local SQLite database with demo 150k balance
        new_wallet = WalletDB(
            first_name=first_name,
            last_name=last_name,
            email=req.email,
            account_number=acct_num,
            bank_name=bank_name,
            balance=150000.0
        )
        db.add(new_wallet)
        db.commit()

        return {
            "status": "success",
            "account_number": acct_num,
            "bank_name": bank_name,
            "starting_balance": 150000.0
        }
    except Exception as e:
        print(f"CRITICAL RECEIVE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="System initialization failure")


# --- 2. SEND / PAYOUT LOGIC ---
@router.post("/send")
async def process_send(req: SendMoneyRequest, db: Session = Depends(get_db)):
    start_time = time.time()

    # [A] DATABASE LOOKUP
    # Lookup sender and recipient wallets by account number
    sender = db.query(WalletDB).filter(WalletDB.account_number == req.sender_account).first()
    recipient = db.query(WalletDB).filter(WalletDB.account_number == req.account_number).first()

    # [B] PRE-FLIGHT CHECKS
    if not sender:
        raise HTTPException(status_code=404, detail="Sender wallet not found in infrastructure.")
    if sender.balance < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient funds for this transaction.")

    # [C] AI FRAUD ANALYSIS
    security = await run_fraud_scan(req.model_dump())
    risk_score = round(security.get("risk_score", 0.0), 2)
    decision = str(security.get("decision", "APPROVED")).upper()
    explanation = security.get("explanation", "")
    modules = security.get("modules", {})

    # [D] RISK ROUTING
    if decision in {"RED", "BLOCK"} or risk_score >= 0.90:
        dispute_ref = f"AOM-DISPUTE-{int(time.time())}"
        dispute_result = await squad.trigger_dispute(
            account_number=req.account_number,
            amount=req.amount,
            reason=f"AI flagged transaction as RED with score {risk_score}",
            transaction_reference=dispute_ref,
        )
        tx_record = TransactionDB(
            sender_account=req.sender_account,
            recipient_account=req.account_number,
            recipient_name=req.account_name,
            amount=req.amount,
            remark=req.remark,
            reference=dispute_result.get("transaction_reference", dispute_ref),
            risk_score=risk_score,
            decision=decision,
            status="blocked",
        )
        db.add(tx_record)
        db.commit()
        raise HTTPException(status_code=403, detail=f"Transaction blocked by AI Fraud Shield. Score: {risk_score}")

    if decision in {"AMBER", "HOLD"} or 0.65 <= risk_score < 0.90:
        pending_ref = f"AOM-PENDING-{int(time.time())}"
        tx_record = TransactionDB(
            sender_account=req.sender_account,
            recipient_account=req.account_number,
            recipient_name=req.account_name,
            amount=req.amount,
            remark=req.remark,
            reference=pending_ref,
            risk_score=risk_score,
            decision=decision,
            status="pending",
        )
        db.add(tx_record)
        db.commit()

        return {
            "status": "pending",
            "message": "Transaction is on hold pending additional review.",
            "metrics": {
                "risk_score": risk_score,
                "decision": decision,
                "modules": modules,
                "explanation": explanation,
                "scan_time_ms": round((time.time() - start_time) * 1000, 2)
            }
        }

    # [E] SQUAD PAYOUT (External Gateway)
    result = await squad.send_money_out(
        amount=req.amount,
        nip=req.nip_code,
        account=req.account_number,
        name=req.account_name,
        note=req.remark
    )

    # [F] ATOMIC BALANCE SYNC
    try:
        # Deduct from sender
        sender.balance -= req.amount

        # If recipient is an internal AOM user, credit them directly
        if recipient:
            recipient.balance += req.amount
            print(f"SUCCESS: Internal credit synced for {req.account_number}")

        transaction_reference = result.get("data", {}).get("transaction_reference", "AOM-INTERNAL")
        tx_record = TransactionDB(
            sender_account=req.sender_account,
            recipient_account=req.account_number,
            recipient_name=req.account_name,
            amount=req.amount,
            remark=req.remark,
            reference=transaction_reference,
            risk_score=risk_score,
            decision=decision,
            status="success",
        )
        db.add(tx_record)
        db.commit()
        db.refresh(sender)

        # Calculate AI engine processing time for frontend metrics display
        latency = (time.time() - start_time) * 1000

        return {
            "status": "success",
            "new_balance": sender.balance,
            "reference": transaction_reference,
            "metrics": {
                "risk_score": risk_score,
                "decision": decision,
                "modules": modules,
                "explanation": explanation,
                "scan_time_ms": round(latency, 2)
            }
        }

    except Exception as e:
        db.rollback()  # Undo balance deduction if database sync fails
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Database atomic sync failed")


# --- 3. TRANSACTION HISTORY ---
@router.get("/history/{account_number}")
async def get_transaction_history(account_number: str, db: Session = Depends(get_db)):
    """Returns full transaction history for an account including fraud analysis scores."""
    transactions = db.query(TransactionDB)\
        .filter(TransactionDB.sender_account == account_number)\
        .order_by(TransactionDB.created_at.desc())\
        .limit(20)\
        .all()

    return {
        "account_number": account_number,
        "total": len(transactions),
        "transactions": [
            {
                "id": tx.id,
                "recipient_account": tx.recipient_account,
                "recipient_name": tx.recipient_name,
                "amount": tx.amount,
                "remark": tx.remark,
                "reference": tx.reference,
                "risk_score": tx.risk_score,
                "decision": tx.decision,
                "status": tx.status,
                "created_at": str(tx.created_at),
            }
            for tx in transactions
        ]
    }


# --- 4. WALLET BALANCE CHECK ---
@router.get("/balance/{account_number}")
async def get_balance(account_number: str, db: Session = Depends(get_db)):
    """Returns current balance for an account."""
    wallet = db.query(WalletDB).filter(WalletDB.account_number == account_number).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")
    return {
        "account_number": wallet.account_number,
        "balance": wallet.balance,
        "bank_name": wallet.bank_name or "AOM Cloud",
        "email": wallet.email,
    }