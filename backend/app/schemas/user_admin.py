import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserCreateRequest(BaseModel):
    badge_id: str = Field(..., min_length=3, max_length=64, description="Officer official badge ID")
    email: EmailStr = Field(..., description="Official government / agency email")
    password: str = Field(..., min_length=6, max_length=128, description="Enclave temporary PIN or password")
    full_name: str = Field(..., min_length=2, max_length=128, description="Officer full legal name")
    designation: str = Field(default="Forensic Investigator", max_length=128, description="Official rank or post")
    agency: str = Field(default="Cyber Crime Unit // FIU-IND Liaison", max_length=255, description="Agency name")
    role: str = Field(default="INVESTIGATOR", description="Clearance tier: INVESTIGATOR, ANALYST, or ADMINISTRATOR")

class UserStatusUpdateRequest(BaseModel):
    is_active: bool = Field(..., description="Active clearance status")

class UserRoleUpdateRequest(BaseModel):
    role: str = Field(..., description="Updated clearance tier")
    designation: Optional[str] = Field(None, description="Updated designation")

class UserDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    badge_id: str
    email: str
    full_name: str
    designation: str
    agency: str
    role: str
    is_active: bool
    created_at: Optional[datetime.datetime] = None
    last_login_at: Optional[datetime.datetime] = None

class UserListResponse(BaseModel):
    total: int
    users: List[UserDetailResponse]
