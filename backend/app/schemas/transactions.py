from pydantic import BaseModel, Field

# Schema for the 'Initialize Wallet' flow (The Receive logic)
class ReceiveMoneyRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str = Field(..., pattern=r"^\S+@\S+\.\S+$")

# Schema for the 'Payout' flow (The Send logic)
class SendMoneyRequest(BaseModel):
    amount: float = Field(..., gt=0)
    # The 'Source': Your account number to be debited
    sender_account: str = Field(..., min_length=10, max_length=10) 
    # The Bank's 6-digit NIP code (e.g., 000013 for GTB)
    nip_code: str = Field(..., min_length=6, max_length=6)        
    # The 'Destination': The 10-digit account of the recipient
    account_number: str = Field(..., min_length=10, max_length=10)
    # Recipient's legal name for verification
    account_name: str = Field(..., min_length=2)                 
    # The transaction note (mapped to 'remark' in the API)
    remark: str = "AOM Secure Transaction"