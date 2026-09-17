import json
import csv
import io
import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.vasp import Vasp, VaspAddress

router = APIRouter()

class VaspRecordInput(BaseModel):
    id: str
    name: str
    legalName: str
    jurisdiction: str
    fiuStatus: str = "REGISTERED"
    fiuRegistrationNumber: str
    addresses: List[Dict[str, str]] = []

@router.post("/import", status_code=status.HTTP_200_OK)
async def import_vasp_directory(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    filename = file.filename.lower() if file.filename else ""
    
    imported_vasps = 0
    imported_addrs = 0
    errors = []

    try:
        if filename.endswith(".json") or file.content_type == "application/json":
            data = json.loads(content.decode("utf-8"))
            records = data if isinstance(data, list) else data.get("vasps", [])
        elif filename.endswith(".csv") or "csv" in (file.content_type or ""):
            text = content.decode("utf-8")
            reader = csv.DictReader(io.StringIO(text))
            records = []
            for row in reader:
                records.append({
                    "id": row.get("id", f"vasp_{row.get('name', 'unknown').lower().replace(' ', '_')}"),
                    "name": row.get("name", ""),
                    "legalName": row.get("legal_name", row.get("legalName", "")),
                    "jurisdiction": row.get("jurisdiction", "IN"),
                    "fiuStatus": row.get("fiu_status", row.get("fiuStatus", "REGISTERED")),
                    "fiuRegistrationNumber": row.get("fiu_reg", row.get("fiuRegistrationNumber", "FIU-IND/2026")),
                    "addresses": [
                        {"address": row.get("address", ""), "chain": row.get("chain", "ethereum")}
                    ] if row.get("address") else []
                })
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .json or .csv.")

        for r in records:
            vasp_id = r.get("id")
            if not vasp_id or not r.get("name"):
                continue

            # Check if exists
            stmt = select(Vasp).where(Vasp.id == vasp_id)
            res = await db.execute(stmt)
            existing = res.scalars().first()

            if not existing:
                new_vasp = Vasp(
                    id=vasp_id,
                    name=r["name"],
                    legal_name=r.get("legalName", r["name"]),
                    country=r.get("country", "India"),
                    jurisdiction=r.get("jurisdiction", "IN"),
                    fiu_status=r.get("fiuStatus", "REGISTERED"),
                    fiu_registration_number=r.get("fiuRegistrationNumber", "FIU-IND/2026"),
                    status="ACTIVE",
                    risk_level="LOW"
                )
                db.add(new_vasp)
                await db.flush()
                imported_vasps += 1

            for addr_info in r.get("addresses", []):
                addr_val = addr_info.get("address")
                chain_val = addr_info.get("chain", "ethereum").lower()
                if addr_val:
                    addr_stmt = select(VaspAddress).where(VaspAddress.address == addr_val)
                    addr_res = await db.execute(addr_stmt)
                    if not addr_res.scalars().first():
                        new_addr = VaspAddress(
                            id=f"vaddr_{uuid.uuid4().hex[:12]}",
                            vasp_id=vasp_id,
                            address=addr_val,
                            chain=chain_val,
                            address_type="deposit",
                            confidence=0.95,
                            source="Admin Bulk Ingestion",
                            verification_status="VERIFIED"
                        )
                        db.add(new_addr)
                        imported_addrs += 1

        await db.commit()

        return {
            "success": True,
            "filename": file.filename,
            "imported_vasps_count": imported_vasps,
            "imported_addresses_count": imported_addrs,
            "message": f"Successfully ingested {imported_vasps} VASPs and {imported_addrs} deposit sweep addresses into compliance registry."
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"VASP import failed: {str(e)}")
