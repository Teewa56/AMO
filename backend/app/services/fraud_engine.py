#Boiler plate code for the Fraud Engine microservice. This simulates an AI model that checks transactions for fraud before money moves. The actual logic is simplified for demonstration purposes.

import asyncio
import random

async def run_fraud_scan(transaction_data: dict) -> dict:
    """Simulates the AI Model checking the transaction before money moves."""
    
    # 1.2 second delay so the judges see the 'Scanning' UI
    await asyncio.sleep(1.2) 
    
    risk_score = random.uniform(0.05, 0.25)
    is_safe = risk_score < 0.7
    
    return {
        "is_safe": is_safe,
        "risk_score": risk_score
    }