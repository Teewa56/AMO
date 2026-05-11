"""
SQLAlchemy ORM models for the AMO SecurePay database.

Tables
------
wallets       — one row per virtual account (GTBank via Squad)
transactions  — one row per debit sent through the fraud engine + Squad payout
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base


def _utcnow() -> datetime:
    """Return the current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)


class WalletDB(Base):
    __tablename__ = "wallets"

    id             = Column(Integer, primary_key=True, index=True)
    first_name     = Column(String(64),  nullable=False, index=True)
    last_name      = Column(String(64),  nullable=False, index=True)
    email          = Column(String(255), unique=True, nullable=False, index=True)
    account_number = Column(String(10),  unique=True, nullable=False, index=True)
    bank_name      = Column(String(128), nullable=False, default="GTBank")
    balance        = Column(Float,       nullable=False, default=150_000.0)
    created_at     = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    def __repr__(self) -> str:
        return (
            f"<WalletDB id={self.id} email={self.email!r} "
            f"acct={self.account_number} balance={self.balance:.2f}>"
        )


class TransactionDB(Base):
    __tablename__ = "transactions"

    id                = Column(Integer, primary_key=True, index=True)
    sender_account    = Column(String(10),  nullable=False, index=True)
    recipient_account = Column(String(10),  nullable=False)
    recipient_name    = Column(String(128), nullable=False)
    bank_code         = Column(String(10),  nullable=True)   # NIP/sort-code
    amount            = Column(Float,       nullable=False)
    remark            = Column(String(255), nullable=True, default="")
    reference         = Column(String(128), nullable=False, index=True)

    # Fraud engine output
    risk_score   = Column(Float,   nullable=False, default=0.0)
    decision     = Column(String(16), nullable=False, default="APPROVED")
    explanation  = Column(Text,    nullable=True, default="")
    modules_json = Column(Text,    nullable=True, default="{}")  # JSON-serialised dict

    status     = Column(String(16), nullable=False, default="success")
    created_at = Column(DateTime(timezone=True), nullable=False, default=_utcnow)

    def __repr__(self) -> str:
        return (
            f"<TransactionDB id={self.id} ref={self.reference!r} "
            f"amount={self.amount:.2f} decision={self.decision}>"
        )
