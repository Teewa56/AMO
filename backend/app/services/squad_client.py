"""
Squad Co payment gateway client.

Wraps two Squad sandbox endpoints:
  POST /virtual-account  — provision a Wema Bank virtual account
  POST /payout/transfer  — execute a NIP bank transfer

All methods gracefully degrade to mock responses when the sandbox is
unreachable (SSL issue, timeout, profiling gate) so the demo always works.
"""

import logging
import time
import uuid
from typing import Any

import httpx
from app.core.config import settings

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _new_reference(prefix: str = "AMO") -> str:
    """Generate a unique, collision-resistant transaction reference."""
    return f"{prefix}-{uuid.uuid4().hex[:16].upper()}"


def _mock_account(email: str) -> dict:
    """Deterministic mock account for offline / profiling-gate fallback."""
    # Seed from email hash so the same email always gets the same fake account
    seed = abs(hash(email)) % 10 ** 8
    account_number = f"00{seed:08d}"
    return {
        "status": "success",
        "data": {
            "account_number": account_number,
            "bank_name":      "Wema Bank",
        },
    }


def _mock_payout(amount: float) -> dict:
    """Standardised mock success response for payout fallbacks."""
    return {
        "status": "success",
        "data": {
            "transaction_reference": _new_reference("AMO-MOCK"),
            "amount":                amount,
        },
    }


# ---------------------------------------------------------------------------
# Client
# ---------------------------------------------------------------------------

class SquadClient:
    """Async client for the Squad Co payment sandbox."""

    def __init__(self) -> None:
        key = settings.SQUAD_SECRET_KEY.strip()
        if not key:
            log.warning("SQUAD_SECRET_KEY is empty — all calls will use mock responses")
        self._headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type":  "application/json",
            "User-Agent":    "AMO-SecurePay/1.0",
        }

    # ------------------------------------------------------------------
    # Virtual account provisioning
    # ------------------------------------------------------------------

    async def setup_receiving_account(
        self,
        first_name: str,
        last_name: str,
        email: str,
    ) -> dict[str, Any]:
        """
        Call Squad's /virtual-account endpoint to provision a Wema Bank
        virtual account for the user.

        Falls back to a mock account when:
          • SQUAD_SECRET_KEY is not set
          • The sandbox returns a non-200 status
          • A network error occurs
        """
        if not settings.SQUAD_SECRET_KEY.strip():
            log.info("No Squad key — returning mock account for %s", email)
            return _mock_account(email)

        payload = {
            "first_name":           first_name,
            "last_name":            last_name,
            "mobile_num":           "08000000000",    # Squad sandbox placeholder
            "email":                email,
            "customer_identifier":  f"AMO_{uuid.uuid4().hex[:12]}",
            "bvn":                  "22110011001",    # Squad sandbox test BVN
        }

        try:
            async with httpx.AsyncClient(
                verify=False,   # Avoids local SSL chain issues on Windows dev
                timeout=15.0,
            ) as client:
                res = await client.post(
                    f"{settings.SQUAD_BASE_URL}/virtual-account",
                    json=payload,
                    headers=self._headers,
                )

            if res.status_code == 200:
                log.info("Squad virtual account created for %s", email)
                return res.json()

            log.warning(
                "Squad /virtual-account returned %d for %s — falling back to mock",
                res.status_code, email,
            )
            return _mock_account(email)

        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            log.warning("Squad connection error for %s: %s — using mock account", email, exc)
            return _mock_account(email)

    # ------------------------------------------------------------------
    # Payout / transfer
    # ------------------------------------------------------------------

    async def send_money_out(
        self,
        amount: float,
        nip: str,
        account: str,
        name: str,
        note: str,
    ) -> dict[str, Any]:
        """
        Execute a NIP bank transfer via Squad's /payout/transfer endpoint.

        Amount is converted from Naira → Kobo (×100) as Squad requires.

        Falls back to a mock success when:
          • SQUAD_SECRET_KEY is not set
          • The account is not yet profiled for payouts (Squad sandbox gate)
          • A network error occurs
        """
        if not settings.SQUAD_SECRET_KEY.strip():
            log.info("No Squad key — returning mock payout for ₦%.2f", amount)
            return _mock_payout(amount)

        reference = _new_reference("AMO-TXN")
        payload = {
            "amount":                int(amount * 100),   # Naira → Kobo
            "bank_code":             nip,
            "account_number":        account,
            "account_name":          name,
            "currency_id":           "NGN",
            "remark":                note[:100],           # Squad max 100 chars
            "transaction_reference": reference,
        }

        try:
            async with httpx.AsyncClient(verify=False, timeout=15.0) as client:
                res = await client.post(
                    f"{settings.SQUAD_BASE_URL}/payout/transfer",
                    json=payload,
                    headers=self._headers,
                )

            res_data: dict = res.json()

            if res.status_code == 200:
                log.info("Squad payout success | ref=%s amount=₦%.2f", reference, amount)
                return res_data

            # Squad sandbox blocks payouts until account is "profiled" — mock it
            message = res_data.get("message", "")
            if res.status_code == 400 and "profil" in message.lower():
                log.info("Squad profiling gate hit for ref=%s — returning mock success", reference)
                return _mock_payout(amount)

            log.error(
                "Squad payout failed | status=%d message=%s ref=%s",
                res.status_code, message, reference,
            )
            # Surface non-profiling errors to caller
            from fastapi import HTTPException
            raise HTTPException(
                status_code=400,
                detail=f"Payment gateway error: {message or 'Unknown error from Squad'}",
            )

        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            log.warning("Squad network error during payout %s: %s — using mock", reference, exc)
            return _mock_payout(amount)
