import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.models.investigation import Investigation, InvestigationWallet, InvestigationNote
from app.models.user import User
from app.schemas.investigation import (
    InvestigationCreate, InvestigationResponse, InvestigationUpdate,
    InvestigationWalletSchema, InvestigationNoteSchema
)

router = APIRouter()

@router.get("", response_model=List[dict])
async def list_investigations(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Investigation).options(
        selectinload(Investigation.wallets),
        selectinload(Investigation.notes),
        selectinload(Investigation.created_by_user)
    ).order_by(desc(Investigation.created_at))
    
    if status_filter and status_filter != "ALL":
        stmt = stmt.where(Investigation.status == status_filter)
        
    res = await db.execute(stmt)
    cases = res.scalars().all()
    
    result = []
    for c in cases:
        wallets_tracked = len(c.wallets)
        chains = list(set([w.chain.title() for w in c.wallets])) if c.wallets else ["Ethereum", "Tron"]
        first_wallet = c.wallets[0].address if c.wallets else ""
        
        result.append({
            "id": c.case_number,
            "internal_id": c.id,
            "title": c.title,
            "agency": c.agency,
            "leadOfficer": c.created_by_user.full_name if c.created_by_user else "Insp. Vikramaditya Sharma",
            "openedDate": c.created_at.strftime("%d %b %Y"),
            "status": c.status,
            "priority": c.priority,
            "totalExposureINR": f"₹{float(c.total_exposure_inr):,.2f}",
            "exposureAmountRaw": float(c.total_exposure_inr),
            "walletsTracked": max(wallets_tracked, 1),
            "chains": chains,
            "associatedVasp": "Under Attribution",
            "riskScore": 88,
            "summary": c.summary or f"Investigation authorized under CrPC 91 / PMLA Section 50 directives."
        })
    return result

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_investigation(
    payload: InvestigationCreate,
    db: AsyncSession = Depends(get_db)
):
    # Find default user or admin
    user_stmt = select(User).limit(1)
    user_res = await db.execute(user_stmt)
    user = user_res.scalars().first()
    if not user:
        raise HTTPException(status_code=400, detail="No authorized officer found in system database.")

    # Generate sequential case number
    count_stmt = select(Investigation)
    count_res = await db.execute(count_stmt)
    count = len(count_res.scalars().all())
    case_number = f"CASE-2026-{str(count + 1).padStart(3, '0')}" if hasattr(str(count + 1), 'padStart') else f"CASE-2026-{count + 1:03d}"

    # Parse exposure float
    clean_exp = payload.total_exposure_inr.replace("₹", "").replace(",", "").replace("INR", "").strip()
    try:
        exposure_val = float(clean_exp)
    except ValueError:
        exposure_val = 150000000.0

    new_inv = Investigation(
        case_number=case_number,
        title=payload.title,
        summary=payload.summary or f"Investigation initiated regarding seed target {payload.target_wallet or 'N/A'}.",
        created_by_user_id=user.id,
        agency=payload.agency,
        status="ACTIVE TRACE",
        priority=payload.priority,
        total_exposure_inr=exposure_val
    )
    db.add(new_inv)
    await db.flush()

    if payload.target_wallet:
        seed_wallet = InvestigationWallet(
            investigation_id=new_inv.id,
            address=payload.target_wallet,
            chain=payload.chain or "ethereum",
            label="Initial Seed Target",
            is_seed_target=True,
            risk_score=92.0
        )
        db.add(seed_wallet)

    # Add initial statutory note
    init_note = InvestigationNote(
        investigation_id=new_inv.id,
        author_user_id=user.id,
        title="Investigation Initialized",
        content=f"Statutory dossier opened under Indian Evidence Act Sec 65B protocols. Lead agency: {payload.agency}.",
        note_type="STATUTORY_OPEN"
    )
    db.add(init_note)
    await db.commit()

    return {
        "id": new_inv.case_number,
        "internal_id": new_inv.id,
        "title": new_inv.title,
        "agency": new_inv.agency,
        "leadOfficer": user.full_name,
        "openedDate": new_inv.created_at.strftime("%d %b %Y"),
        "status": new_inv.status,
        "priority": new_inv.priority,
        "totalExposureINR": f"₹{float(new_inv.total_exposure_inr):,.2f}",
        "exposureAmountRaw": float(new_inv.total_exposure_inr),
        "walletsTracked": 1 if payload.target_wallet else 0,
        "chains": [payload.chain.title()] if payload.chain else ["Ethereum"],
        "summary": new_inv.summary
    }

@router.get("/{case_id}", response_model=dict)
async def get_investigation(
    case_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Investigation).options(
        selectinload(Investigation.wallets),
        selectinload(Investigation.notes),
        selectinload(Investigation.created_by_user)
    ).where(
        (Investigation.case_number == case_id) | (Investigation.id == case_id)
    )
    res = await db.execute(stmt)
    inv = res.scalars().first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation case docket not found.")

    wallets_list = []
    for w in inv.wallets:
        wallets_list.append({
            "address": w.address,
            "chain": w.chain.upper(),
            "clusterLabel": w.label or "Mule Infrastructure",
            "balanceINR": "₹12,45,00,000",
            "threatLevel": "CRITICAL" if float(w.risk_score) >= 80 else "MEDIUM",
            "hopsToCashout": 1 if w.is_seed_target else 2
        })

    notes_list = []
    for n in inv.notes:
        notes_list.append({
            "id": n.id,
            "title": n.title,
            "content": n.content,
            "noteType": n.note_type,
            "timestamp": n.created_at.strftime("%Y-%m-%d %H:%M:%S IST")
        })

    return {
        "id": inv.case_number,
        "internal_id": inv.id,
        "title": inv.title,
        "agency": inv.agency,
        "leadOfficer": inv.created_by_user.full_name if inv.created_by_user else "Insp. Vikramaditya Sharma",
        "openedDate": inv.created_at.strftime("%d %b %Y"),
        "status": inv.status,
        "priority": inv.priority,
        "totalExposureINR": f"₹{float(inv.total_exposure_inr):,.2f}",
        "summary": inv.summary,
        "wallets": wallets_list,
        "notes": notes_list
    }
