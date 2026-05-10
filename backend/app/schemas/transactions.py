"""
Pydantic v2 request / response schemas for the transactions router.
"""

import re
from typing import Any
from pydantic import BaseModel, Field, field_validator, model_validator

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


# ---------------------------------------------------------------------------
# Wallet initialisation (POST /transactions/receive)
# ---------------------------------------------------------------------------

class ReceiveMoneyRequest(BaseModel):
    """Create a Squad virtual account for a new user."""

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=128,
        description="User's full legal name (first + last).",
        examples=["Demo User"],
    )
    email: str = Field(
        ...,
        description="Unique email address — used as the wallet identifier.",
        examples=["demo@gmail.com"],
    )

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Invalid email address format.")
        return v

    @field_validator("full_name")
    @classmethod
    def name_has_space(cls, v: str) -> str:
        """Require at least a first and last name separated by whitespace."""
        parts = v.strip().split()
        if len(parts) < 2:
            raise ValueError("full_name must contain at least a first and last name.")
        return " ".join(parts)  # normalise multiple spaces


class ReceiveMoneyResponse(BaseModel):
    status: str
    account_number: str
    bank_name: str
    starting_balance: float


# ---------------------------------------------------------------------------
# Payout (POST /transactions/send)
# ---------------------------------------------------------------------------

class SendMoneyRequest(BaseModel):
    """Send money via Squad NIP payout after AI fraud screening."""

    amount: float = Field(
        ...,
        gt=0,
        le=5_000_000,
        description="Transfer amount in Naira (not Kobo).",
        examples=[5000.00],
    )
    sender_account: str = Field(
        ...,
        min_length=10,
        max_length=10,
        description="10-digit NUBAN of the sender (must exist in AMO).",
    )
    # Nigerian bank NIP codes are 3–9 chars (e.g. "057" GTB, "000013" GTB NIP)
    nip_code: str = Field(
        ...,
        min_length=3,
        max_length=9,
        description="Bank sort-code / NIP code of recipient's bank.",
        examples=["057"],
    )
    account_number: str = Field(
        ...,
        min_length=10,
        max_length=10,
        description="10-digit NUBAN of the recipient.",
    )
    account_name: str = Field(
        ...,
        min_length=2,
        max_length=128,
        description="Legal name on the recipient account (for verification).",
    )
    remark: str = Field(
        default="AMO SecurePay Transfer",
        max_length=100,
        description="Transaction narration visible on bank statement.",
    )

    @field_validator("sender_account", "account_number")
    @classmethod
    def must_be_digits(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("Account numbers must contain only digits.")
        return v

    @field_validator("nip_code")
    @classmethod
    def nip_digits_only(cls, v: str) -> str:
        if not v.isdigit():
            raise ValueError("NIP code must contain only digits.")
        return v.zfill(6)  # Normalise to 6-digit format (Squad requirement)

    @model_validator(mode="after")
    def sender_not_same_as_recipient(self) -> "SendMoneyRequest":
        if self.sender_account == self.account_number:
            raise ValueError("Sender and recipient account numbers must differ.")
        return self


class FraudModule(BaseModel):
    score: float
    verdict: str
    detail: str


class SendMoneyResponse(BaseModel):
    status: str
    new_balance: float
    reference: str
    metrics: dict[str, Any]


# ---------------------------------------------------------------------------
# Balance / history helpers
# ---------------------------------------------------------------------------

class BalanceResponse(BaseModel):
    account_number: str
    balance: float
    bank_name: str
    email: str


class TransactionRecord(BaseModel):
    id: int
    recipient_account: str
    recipient_name: str
    bank_code: str | None
    amount: float
    remark: str
    reference: str
    risk_score: float
    decision: str
    explanation: str
    status: str
    created_at: str


class HistoryResponse(BaseModel):
    account_number: str
    total: int
    transactions: list[TransactionRecord]
