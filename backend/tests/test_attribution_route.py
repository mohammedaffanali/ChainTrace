import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_attribution_verified_vasp():
    response = client.post("/api/v1/attribution/run", json={
        "wallet_address": "0x28c6c06298d514db089934071355e5743bf21d60",
        "chain": "ethereum",
        "max_hops": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "ATTRIBUTED_CANDIDATE"
    assert data["primary_candidate"] is not None
    assert "Binance" in data["primary_candidate"]["vasp_name"]
    assert data["primary_candidate"]["overall_confidence"] >= 70.0
    assert len(data["candidates"]) == 1

def test_attribution_unverified_wallet_anti_overclaiming():
    response = client.post("/api/v1/attribution/run", json={
        "wallet_address": "0x000000000000000000000000000000000000dead",
        "chain": "ethereum",
        "max_hops": 3
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "NO_RELIABLE_ATTRIBUTION"
    assert data["primary_candidate"] is None
    assert len(data["candidates"]) == 0
    assert any("Zero-guessing" in reason for reason in data["why_this_vasp"])
