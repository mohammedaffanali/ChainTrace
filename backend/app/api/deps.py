from typing import Optional, List, Callable
from fastapi import Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.security import decode_token, verify_csrf_token
from app.models.user import User

async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    # Check 1: HTTP-Only cookie 'chaintrace_access_token'
    token = request.cookies.get("chaintrace_access_token")

    # Check 2: Fallback to Authorization Header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        return None

    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = payload.get("sub")
        if not user_id:
            return None
    except Exception:
        return None

    res = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    return res.scalars().first()

async def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please authenticate with your forensic officer badge.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    return user

def require_role(allowed_roles: List[str]) -> Callable:
    """Dependency factory checking if authenticated user possesses one of the authorized roles."""
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Action requires one of clearance tiers {allowed_roles}. Current tier: {user.role}"
            )
        return user
    return role_checker

async def verify_csrf_protection(
    request: Request,
    x_csrf_token: Optional[str] = Header(None, alias="X-CSRF-Token")
):
    """Verifies double-submit CSRF token for state-mutating HTTP methods."""
    if request.method in ["POST", "PUT", "PATCH", "DELETE"]:
        cookie_csrf = request.cookies.get("chaintrace_csrf_token")
        # In testing or development curl requests where header is omitted, allow if bearer is used
        auth_header = request.headers.get("Authorization")
        if not cookie_csrf and auth_header:
            return # Bearer auth clients are immune to browser CSRF
        
        if not verify_csrf_token(cookie_csrf, x_csrf_token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF validation failed: Invalid or missing X-CSRF-Token header matching cookie."
            )
