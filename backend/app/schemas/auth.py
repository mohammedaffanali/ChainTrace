from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

class LoginRequest(BaseModel):
    badge_id: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    badge_id: str
    email: str
    full_name: str
    designation: str
    agency: str
    role: str
    is_active: bool

class LoginResponse(BaseModel):
    success: bool
    user: UserResponse
    csrf_token: str
    message: str = "Forensic enclave session authenticated."

class TokenPayload(BaseModel):
    sub: str
    badge_id: str
    role: str
    type: str # "access" | "refresh"
    exp: int
