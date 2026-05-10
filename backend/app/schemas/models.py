#this is for the users account.

from sqlalchemy import Column, Integer, String, Float
from app.core.database import Base

class WalletDB(Base):
    __tablename__ = "wallets"
    
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    account_number = Column(String, unique=True, index=True)
    balance = Column(Float, default=150000.0) # Everyone starts with 150k for the demo