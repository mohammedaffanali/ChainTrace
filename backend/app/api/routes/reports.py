from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.reports.pdf_generator import generate_evidentiary_pdf

router = APIRouter()

class ReportExportRequest(BaseModel):
    case_number: str = "CASE-2026-001"
    title: str = "Operation NetSweep — Hawala Bridge Cluster"
    agency: str = "Delhi Police Cyber Command & FIU-IND Liaison"
    officer_name: str = "Insp. Vikramaditya Sharma"
    officer_badge: str = "DEL-CYBER-8842"
    target_wallet: str = "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82"
    attributed_vasp: str = "CoinDCX (Neblio Technologies Pvt Ltd)"
    fiu_reg: str = "FIU-IND-VDA-2023-0008"
    confidence_score: float = 96.8
    total_exposure_inr: str = "₹28,15,40,000"
    court_name: str = "Special Cyber & PMLA Adjudicating Authority, New Delhi"

@router.post("/export-pdf")
def export_pdf_report(payload: ReportExportRequest):
    try:
        pdf_content = generate_evidentiary_pdf(
            case_number=payload.case_number,
            title=payload.title,
            agency=payload.agency,
            officer_name=payload.officer_name,
            officer_badge=payload.officer_badge,
            target_wallet=payload.target_wallet,
            attributed_vasp=payload.attributed_vasp,
            fiu_reg=payload.fiu_reg,
            confidence_score=payload.confidence_score,
            total_exposure_inr=payload.total_exposure_inr,
            court_name=payload.court_name
        )
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=ChainTrace_Section65B_{payload.case_number}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF compilation failed: {str(e)}")
