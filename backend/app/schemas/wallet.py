from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class AddressValidationRequest(BaseModel):
    address: str
    chain: str = "ethereum"

class AddressValidationResponse(BaseModel):
    address: str
    chain: str
    valid: bool
    checksum_address: Optional[str] = None
    address_type: str = "eoa"
    message: Optional[str] = None

class WalletBalanceRequest(BaseModel):
    address: str
    chain: str = "ethereum"

class WalletBalanceResponse(BaseModel):
    address: str
    chain: str
    balance_native: float
    symbol: str
    block_number: Optional[int] = None
    is_contract: bool = False
    source: str = "web3.py"

class NormalizedTxSchema(BaseModel):
    tx_hash: str
    block_number: Optional[int] = None
    timestamp: int
    from_address: str
    to_address: str
    amount: float
    asset: str
    fee: Optional[float] = None
    chain: str
    status: str = "confirmed"
    direction: Optional[str] = None

class WalletActivityResponse(BaseModel):
    address: str
    chain: str
    balance: float
    symbol: str
    transaction_count: int
    transactions: List[NormalizedTxSchema] = []
    source: str = "web3.py"
