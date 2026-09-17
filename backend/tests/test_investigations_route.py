import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_investigations():
    response = client.get("/api/v1/investigations")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "CASE-2026-" in data[0]["id"]

def test_create_and_fetch_investigation():
    payload = {
        "title": "Operation Hawala Sentinel Test",
        "agency": "Enforcement Directorate (ED) PMLA Cell",
        "priority": "CRITICAL",
        "total_exposure_inr": "₹45,00,00,000",
        "target_wallet": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
        "chain": "Ethereum",
        "summary": "Automated forensic test case verification."
    }
    create_res = client.post("/api/v1/investigations", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    case_id = created["id"]
    assert "CASE-2026-" in case_id

    # Fetch detail
    detail_res = client.get(f"/api/v1/investigations/{case_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["title"] == payload["title"]
    assert detail["priority"] == "CRITICAL"
    assert len(detail["wallets"]) >= 1
    assert detail["wallets"][0]["address"] == payload["target_wallet"]
