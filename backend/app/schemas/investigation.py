from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime

class InvestigationBase(BaseModel):
    title: str
    agency: str = "Delhi Police Cyber Command & FIU-IND Liaison"
    priority: str = "HIGH"
    total_exposure_inr: str = "₹15,00,00,000"
    summary: Optional[str] = None
    target_wallet: Optional[str] = None
    chain: Optional[str] = "Ethereum"

class InvestigationCreate(InvestigationBase):
    pass

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    total_exposure_inr: Optional[str] = None
    summary: Optional[str] = None

class InvestigationWalletSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    address: str
    chain: str
    cluster_label: Optional[str] = None
    balance_inr: Optional[str] = None
    threat_level: str = "HIGH"
    hops_to_exit: int = 1
    added_at: datetime

class InvestigationNoteSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    officer_badge_id: str
    officer_name: str
    note_type: str = "TACTICAL_LOG"
    content: str
    is_statutory: bool = True
    created_at: datetime

class InvestigationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    docket_number: str
    title: str
    agency: str
    lead_officer_id: Optional[str] = None
    lead_officer_name: Optional[str] = None
    priority: str
    status: str
    total_exposure_inr: str
    summary: Optional[str] = None
    target_wallet: Optional[str] = None
    chain: Optional[str] = None
    opened_date: datetime
    wallets: List[InvestigationWalletSchema] = []
    notes: List[InvestigationNoteSchema] = []

