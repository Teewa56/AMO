from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


class WalletDB(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    account_number = Column(String, unique=True, index=True)
    bank_name = Column(String, default="Wema Bank")
    balance = Column(Float, default=150000000.0)  # Default demo balance


class TransactionDB(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    sender_account = Column(String, index=True)
    recipient_account = Column(String)
    recipient_name = Column(String)
    amount = Column(Float)
    remark = Column(String)
    reference = Column(String)
    risk_score = Column(Float)
    decision = Column(String)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)