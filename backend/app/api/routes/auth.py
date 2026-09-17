import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.core.config import settings
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, 
    decode_token, generate_csrf_token
)
from app.models.user import User
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    clean_badge = payload.badge_id.strip()
    res = await db.execute(select(User).where(User.badge_id == clean_badge))
    user = res.scalars().first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed. Invalid officer badge ID or security PIN."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Officer clearance revoked or deactivated."
        )

    # Update last login timestamp
    user.last_login_at = datetime.datetime.utcnow()
    await db.commit()

    # Generate JWT tokens
    token_data = {
        "sub": user.id,
        "badge_id": user.badge_id,
        "role": user.role
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    csrf_token = generate_csrf_token()

    # Inject HTTP-only Access Cookie
    response.set_cookie(
        key="chaintrace_access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    # Inject HTTP-only Refresh Cookie
    response.set_cookie(
        key="chaintrace_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth"
    )

    # Inject CSRF Cookie (readable by JS for double-submit header)
    response.set_cookie(
        key="chaintrace_csrf_token",
        value=csrf_token,
        httponly=False,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return LoginResponse(
        success=True,
        user=UserResponse.model_validate(user),
        csrf_token=csrf_token,
        message="Forensic enclave session authenticated successfully."
    )

@router.post("/refresh")
async def refresh_session(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("chaintrace_refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing. Please re-authenticate."
        )

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError("Not a refresh token")
        user_id = payload.get("sub")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired refresh token: {str(e)}"
        )

    res = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    token_data = {"sub": user.id, "badge_id": user.badge_id, "role": user.role}
    new_access_token = create_access_token(token_data)
    new_csrf_token = generate_csrf_token()

    response.set_cookie(
        key="chaintrace_access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    response.set_cookie(
        key="chaintrace_csrf_token",
        value=new_csrf_token,
        httponly=False,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    return {
        "success": True,
        "csrf_token": new_csrf_token,
        "message": "Enclave session refreshed."
    }

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="chaintrace_access_token", path="/")
    response.delete_cookie(key="chaintrace_refresh_token", path="/api/v1/auth")
    response.delete_cookie(key="chaintrace_csrf_token", path="/")
    return {
        "success": True,
        "message": "Officer session terminated and secure cookies purged."
    }

@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
