import pytest
from starlette.testclient import TestClient
from app.main import app

def test_websocket_handshake():
    client = TestClient(app)
    with client.websocket_connect("/api/v1/ws/telemetry") as websocket:
        data = websocket.receive_json()
        assert data["type"] == "CONNECTION_ESTABLISHED"
        assert data["status"] == "LIVE_STREAM_ACTIVE"
        
        # Test ping pong
        websocket.send_json({"action": "ping"})
        response = websocket.receive_json()
        assert response["type"] == "PONG"
        
        # Test subscription
        websocket.send_json({"action": "subscribe_wallet", "address": "0x71C63F51a02611B1072f95080516461c2CE34397"})
        sub_resp = websocket.receive_json()
        assert sub_resp["type"] == "SUBSCRIPTION_CONFIRMED"
        assert sub_resp["address"] == "0x71C63F51a02611B1072f95080516461c2CE34397"
