import pytest
import httpx
from app.main import app
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token
from app.db.init_data import seed_database

@pytest.mark.asyncio
async def test_password_hashing():
    pwd = "OfficerPin8842!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

@pytest.mark.asyncio
async def test_jwt_token_flow():
    data = {"sub": "user_123", "badge_id": "DEL-CYBER-8842", "role": "INVESTIGATOR"}
    token = create_access_token(data)
    assert isinstance(token, str)
    payload = decode_token(token)
    assert payload["sub"] == "user_123"
    assert payload["badge_id"] == "DEL-CYBER-8842"
    assert payload["role"] == "INVESTIGATOR"
    assert payload["type"] == "access"

@pytest.mark.asyncio
async def test_auth_endpoints():
    # Ensure database is seeded
    await seed_database()

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check with telemetry headers
        health_res = await client.get("/health")
        assert health_res.status_code == 200
        assert "X-ChainTrace-Engine" in health_res.headers
        assert "X-ChainTrace-Evidentiary-Status" in health_res.headers
        health_data = health_res.json()
        assert health_data["status"] == "healthy"

        # 2. Login with valid credentials
        login_res = await client.post("/api/v1/auth/login", json={
            "badge_id": "DEL-CYBER-8842",
            "password": "OfficerPin8842!"
        })
        assert login_res.status_code == 200
        login_data = login_res.json()
        assert login_data["success"] is True
        assert login_data["user"]["badge_id"] == "DEL-CYBER-8842"
        assert login_data["user"]["role"] == "INVESTIGATOR"
        assert "csrf_token" in login_data

        # Verify cookies set
        cookies = login_res.cookies
        assert "chaintrace_access_token" in cookies
        assert "chaintrace_refresh_token" in cookies
        assert "chaintrace_csrf_token" in cookies

        # 3. Access protected route /me with cookie
        me_res = await client.get("/api/v1/auth/me", cookies=cookies)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["badge_id"] == "DEL-CYBER-8842"
        assert me_data["role"] == "INVESTIGATOR"

        # 4. Login with invalid password
        bad_login = await client.post("/api/v1/auth/login", json={
            "badge_id": "DEL-CYBER-8842",
            "password": "WrongPassword!"
        })
        assert bad_login.status_code == 401

        # 5. Logout
        logout_res = await client.post("/api/v1/auth/logout")
        assert logout_res.status_code == 200
