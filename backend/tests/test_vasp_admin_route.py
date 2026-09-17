import pytest
import uuid
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_vasp_import_json():
    unique_id = f"vasp_test_{uuid.uuid4().hex[:8]}"
    json_payload = {
        "vasps": [
            {
                "id": unique_id,
                "name": "Test Regulated Exchange Ltd",
                "legalName": "Test Regulated Exchange India Pvt Ltd",
                "jurisdiction": "IN",
                "fiuStatus": "REGISTERED",
                "fiuRegistrationNumber": "FIU-IND/2026/VASP-9999",
                "addresses": [
                    {"address": f"0x{uuid.uuid4().hex[:40]}", "chain": "ethereum"}
                ]
            }
        ]
    }
    files = {"file": ("test_vasp.json", json.dumps(json_payload), "application/json")}
    res = client.post("/api/v1/vasp/import", files=files)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["imported_vasps_count"] >= 1
