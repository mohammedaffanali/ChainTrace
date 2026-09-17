from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class SignalBreakdownSchema(BaseModel):
    name: str
    weight: float
    raw_score: float
    weighted_score: float
    contribution_percent: float
    description: str
    status: str

class AttributionEvidenceSchema(BaseModel):
    signal: str
    title: str
    score: float
    weight: float
    description: str
    observed_facts: List[str]
    inferences: List[str]
    statutory_basis: str

class VaspCandidateSchema(BaseModel):
    vasp_id: str
    vasp_name: str
    overall_confidence: float
    confidence_band: str
    fiu_status: str
    jurisdiction: str
    nearest_hops: int
    relationship_type: str
    anti_overclaiming_statement: str
    signals: List[SignalBreakdownSchema]
    evidence_items: List[AttributionEvidenceSchema]

class AttributionRequest(BaseModel):
    wallet_address: str
    chain: str = "ethereum"
    max_hops: int = 3
    min_amount: float = 0.0
    direction: str = "all"
    force_demo: bool = False

class AttributionResponse(BaseModel):
    success: bool
    status: str
    investigated_wallet: str
    chain: str
    is_demonstration: bool
    candidates: List[VaspCandidateSchema]
    primary_candidate: Optional[VaspCandidateSchema] = None
    why_this_vasp: List[str] = []
    statutory_warning: str
    timestamp: str
