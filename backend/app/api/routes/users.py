from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.db.session import get_db
from app.models.user import User
from app.core.security import get_password_hash
from app.api.deps import get_current_user, require_role
from app.schemas.user_admin import (
    UserCreateRequest,
    UserStatusUpdateRequest,
    UserRoleUpdateRequest,
    UserDetailResponse,
    UserListResponse
)

router = APIRouter()

VALID_ROLES = {"INVESTIGATOR", "ANALYST", "ADMINISTRATOR"}

@router.get("", response_model=UserListResponse)
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMINISTRATOR"]))
):
    """Lists all forensic officers in the platform. Restricted to ADMINISTRATOR."""
    res = await db.execute(select(User).order_by(User.role.asc(), User.full_name.asc()))
    users = res.scalars().all()
    return UserListResponse(
        total=len(users),
        users=[UserDetailResponse.model_validate(u) for u in users]
    )

@router.post("", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMINISTRATOR"]))
):
    """Provisions a new forensic officer account. Restricted to ADMINISTRATOR."""
    clean_badge = payload.badge_id.strip()
    clean_email = payload.email.strip().lower()
    clean_role = payload.role.strip().upper()

    if clean_role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{clean_role}'. Must be one of: {sorted(list(VALID_ROLES))}"
        )

    # Check for duplicate badge ID or email
    res = await db.execute(
        select(User).where(or_(User.badge_id == clean_badge, User.email == clean_email))
    )
    existing = res.scalars().first()
    if existing:
        if existing.badge_id == clean_badge:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Officer with Badge ID '{clean_badge}' is already registered."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Officer with email '{clean_email}' is already registered."
            )

    hashed_pwd = get_password_hash(payload.password)
    new_user = User(
        badge_id=clean_badge,
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=payload.full_name.strip(),
        designation=payload.designation.strip(),
        agency=payload.agency.strip(),
        role=clean_role,
        is_active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserDetailResponse.model_validate(new_user)

@router.patch("/{user_id}/status", response_model=UserDetailResponse)
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMINISTRATOR"]))
):
    """Activates or revokes an officer's security clearance. Restricted to ADMINISTRATOR."""
    if current_user.id == user_id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Security Policy Violation: Administrators cannot revoke their own active clearance."
        )

    res = await db.execute(select(User).where(User.id == user_id))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Officer account not found.")

    target_user.is_active = payload.is_active
    await db.commit()
    await db.refresh(target_user)
    return UserDetailResponse.model_validate(target_user)

@router.patch("/{user_id}/role", response_model=UserDetailResponse)
async def update_user_role(
    user_id: str,
    payload: UserRoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["ADMINISTRATOR"]))
):
    """Updates an officer's clearance tier or designation. Restricted to ADMINISTRATOR."""
    clean_role = payload.role.strip().upper()
    if clean_role not in VALID_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{clean_role}'. Must be one of: {sorted(list(VALID_ROLES))}"
        )

    res = await db.execute(select(User).where(User.id == user_id))
    target_user = res.scalars().first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Officer account not found.")

    target_user.role = clean_role
    if payload.designation:
        target_user.designation = payload.designation.strip()

    await db.commit()
    await db.refresh(target_user)
    return UserDetailResponse.model_validate(target_user)
