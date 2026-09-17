import uuid
import pytest
import httpx
from unittest.mock import patch
from app.main import app
from app.db.session import init_db

@pytest.mark.asyncio
async def test_wallet_analysis_validation_errors():
    await init_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Invalid address format
        res_bad_addr = await client.post("/api/v1/analysis/wallet", json={
            "address": "not_an_ethereum_address",
            "network": "ethereum"
        })
        assert res_bad_addr.status_code == 400
        assert "not valid" in res_bad_addr.json()["detail"].lower()

        # 2. Unsupported network
        res_bad_net = await client.post("/api/v1/analysis/wallet", json={
            "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            "network": "avalanche"
        })
        assert res_bad_net.status_code == 400
        assert "not currently supported" in res_bad_net.json()["detail"].lower()

@pytest.mark.asyncio
async def test_wallet_analysis_live_pipeline_with_mocked_provider():
    await init_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        target = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        
        sample_txs = [
            {
                "raw_hash": "0x5a183ff1098234ea71b293810283719028371920381023810238102839d81",
                "block_number": 19400210,
                "timestamp": 1716300000,
                "from": target,
                "to": "0x28C6c06298d514Db089934071355E5743bf21d60", # Known Binance deposit cluster
                "value_formatted": 2.5,
                "asset": "ETH",
                "provider": "etherscan_ethereum",
                "type": "NATIVE_TRANSFER"
            }
        ]

        with patch("app.providers.etherscan_provider.EtherscanProvider.get_transactions", return_value=sample_txs), \
             patch("app.providers.etherscan_provider.EtherscanProvider.get_token_transfers", return_value=[]), \
             patch("app.providers.etherscan_provider.EtherscanProvider.get_latest_block", return_value=19400250):

            res = await client.post("/api/v1/analysis/wallet", json={
                "address": target,
                "network": "ethereum",
                "hops": 1
            })
            assert res.status_code == 200
            data = res.json()

            # Evidentiary & response schema verification
            assert "analysis_id" in data
            assert data["address"] == target
            assert data["network"] == "ethereum"
            assert data["is_live_data"] is True
            assert data["latest_block"] == 19400250
            assert "balance" in data
            assert data["balance"]["symbol"] == "ETH"
            assert "graph" in data
            assert len(data["graph"]["nodes"]) >= 2
            assert len(data["graph"]["edges"]) >= 1
            assert "attribution" in data
            assert data["attribution"]["attributed"] is True
            assert "limitations" in data
            assert len(data["limitations"]) > 0

            # Verify historical retrieval endpoint
            analysis_id = data["analysis_id"]
            get_res = await client.get(f"/api/v1/analysis/{analysis_id}")
            assert get_res.status_code == 200
            get_data = get_res.json()
            assert get_data["analysis_id"] == analysis_id
            assert get_data["address"] == target

@pytest.mark.asyncio
async def test_alchemy_webhook_receiver():
    await init_db()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        evt_id = f"evt_test_{uuid.uuid4().hex[:12]}"
        payload = {
            "webhookId": "wh_test_12345",
            "id": evt_id,
            "createdAt": "2026-09-17T06:00:00.000Z",
            "type": "ADDRESS_ACTIVITY",
            "network": "ETH_MAINNET",
            "activity": []
        }

        # 1. Post webhook event
        res = await client.post("/api/v1/webhooks/alchemy", json=payload)
        assert res.status_code == 200
        assert res.json()["status"] == "received"
        assert res.json()["event_id"] == evt_id

        # 2. Post duplicate event (should be safely ignored)
        res_dup = await client.post("/api/v1/webhooks/alchemy", json=payload)
        assert res_dup.status_code == 200
        assert res_dup.json()["status"] == "ignored"
        assert res_dup.json()["reason"] == "duplicate_event"
