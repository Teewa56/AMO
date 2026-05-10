import time
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

# --- INTERNAL IMPORTS ---
from app.schemas.transactions import SendMoneyRequest, ReceiveMoneyRequest
from app.services.squad_client import SquadClient
from app.services.fraud_engine import run_fraud_scan  # Ensure this file exists!
from app.core.database import get_db
from app.schemas.models import WalletDB

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
                "bank_name": "AOM Cloud"
            }
        
        # Trigger Squad to generate a virtual account
        res = await squad.setup_receiving_account(req.full_name, req.email)
        
        # We extract the account number from Squad's response
        acct_num = res.get("data", {}).get("account_number")
        bank_name = res.get("data", {}).get("bank_name", "Wema Bank")

        if not acct_num:
            raise HTTPException(status_code=500, detail="Failed to generate account number from gateway")

        # Save to our local SQLite database with the demo 150k balance
        new_wallet = WalletDB(
            email=req.email, 
            account_number=acct_num, 
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
    # Find the guy sending and the guy receiving
    sender = db.query(WalletDB).filter(WalletDB.account_number == req.sender_account).first()
    recipient = db.query(WalletDB).filter(WalletDB.account_number == req.account_number).first()

    # [B] PRE-FLIGHT CHECKS
    if not sender: 
        raise HTTPException(status_code=404, detail="Sender wallet not found in infrastructure.")
    if sender.balance < req.amount: 
        raise HTTPException(status_code=400, detail="Insufficient funds for this transaction.")

    # [C] AI FRAUD ANALYSIS
    # We pass the full request to the machine learning engine
    security = await run_fraud_scan(req.model_dump())
    if not security.get("is_safe", True): 
        raise HTTPException(status_code=403, detail="Transaction blocked by AI Fraud Shield.")

    # [D] SQUAD PAYOUT (External Gateway)
    # This sends the money to the bank network
    result = await squad.send_money_out(
        amount=req.amount, 
        nip=req.nip_code, 
        account=req.account_number, 
        name=req.account_name, 
        note=req.remark
    )
    
    # [E] ATOMIC BALANCE SYNC
    try:
        # Deduct from sender
        sender.balance -= req.amount

        # If the recipient is also one of our users, we credit them internally
        if recipient:
            recipient.balance += req.amount
            print(f"SUCCESS: Internal credit synced for {req.account_number}")

        db.commit()
        db.refresh(sender)
        
        # Calculate how fast our AI engine worked for the frontend metrics
        latency = (time.time() - start_time) * 1000 
        
        return {
            "status": "success", 
            "new_balance": sender.balance, 
            "reference": result.get("data", {}).get("transaction_reference", "AOM-INTERNAL"),
            "metrics": {
                "risk_score": round(security.get("risk_score", 0.0), 2), 
                "scan_time_ms": round(latency, 2)
            }
        }

    except Exception as e:
        db.rollback() # If the DB fails, we undo the balance deduction
        print(f"DATABASE ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Database atomic sync failed")