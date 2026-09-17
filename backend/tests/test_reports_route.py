import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_export_pdf_report():
    payload = {
        "case_number": "CASE-2026-001",
        "title": "Operation NetSweep — Hawala Bridge Cluster",
        "agency": "Delhi Police Cyber Command & FIU-IND Liaison",
        "officer_name": "Insp. Vikramaditya Sharma",
        "officer_badge": "DEL-CYBER-8842",
        "target_wallet": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
        "attributed_vasp": "CoinDCX (Neblio Technologies Pvt Ltd)",
        "fiu_reg": "FIU-IND-VDA-2023-0008",
        "confidence_score": 96.8,
        "total_exposure_inr": "₹28,15,40,000",
        "court_name": "Special Cyber & PMLA Adjudicating Authority, New Delhi"
    }
    response = client.post("/api/v1/reports/export-pdf", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "attachment; filename=ChainTrace_Section65B_CASE-2026-001.pdf" in response.headers["content-disposition"]
    # Verify PDF magic bytes
    assert response.content.startswith(b"%PDF-")
    assert len(response.content) > 1000
