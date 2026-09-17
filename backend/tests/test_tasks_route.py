import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dispatch_and_poll_task():
    payload = {
        "wallet_address": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
        "chain": "ethereum",
        "max_hops": 2
    }
    dispatch_res = client.post("/api/v1/tasks/trace", json=payload)
    assert dispatch_res.status_code == 202
    dispatch_data = dispatch_res.json()
    assert "task_id" in dispatch_data
    task_id = dispatch_data["task_id"]

    # Poll task status
    poll_res = client.get(f"/api/v1/tasks/{task_id}/status")
    assert poll_res.status_code == 200
    poll_data = poll_res.json()
    assert poll_data["task_id"] == task_id
    assert poll_data["status"] in ["COMPLETED", "QUEUED", "INDEXING_BLOCKCHAIN"]
    if poll_data["status"] == "COMPLETED":
        assert poll_data["progress_percent"] == 100
        assert "graph" in poll_data["result"]
