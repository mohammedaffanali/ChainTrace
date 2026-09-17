import pytest
import httpx
from app.main import app
from app.db.init_data import seed_database

@pytest.mark.asyncio
async def test_users_admin_endpoints():
    await seed_database()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Unauthenticated request should be rejected
        unauth_res = await client.get("/api/v1/users")
        assert unauth_res.status_code == 401

        # 2. Login as Investigator (non-admin)
        inv_login = await client.post("/api/v1/auth/login", json={
            "badge_id": "DEL-CYBER-8842",
            "password": "OfficerPin8842!"
        })
        assert inv_login.status_code == 200
        inv_cookies = inv_login.cookies

        # Investigator should be denied access to /api/v1/users (403)
        inv_res = await client.get("/api/v1/users", cookies=inv_cookies)
        assert inv_res.status_code == 403

        # 3. Login as Administrator
        admin_login = await client.post("/api/v1/auth/login", json={
            "badge_id": "ADMIN-LEA-001",
            "password": "AdminRoot2026!"
        })
        assert admin_login.status_code == 200
        admin_cookies = admin_login.cookies
        admin_id = admin_login.json()["user"]["id"]

        # Admin can list users
        list_res = await client.get("/api/v1/users", cookies=admin_cookies)
        assert list_res.status_code == 200
        list_data = list_res.json()
        assert list_data["total"] >= 3
        badge_ids = [u["badge_id"] for u in list_data["users"]]
        assert "ADMIN-LEA-001" in badge_ids

        # 4. Provision a new officer
        import uuid
        uid = uuid.uuid4().hex[:6].upper()
        new_badge = f"CBI-TEST-{uid}"
        create_payload = {
            "badge_id": new_badge,
            "email": f"test.officer{uid.lower()}@cbi.gov.in",
            "password": "TemporaryPin9901!",
            "full_name": "DySP Rajeshwari Sen",
            "designation": "Forensic Blockchain Investigator",
            "agency": "Central Bureau of Investigation (CBI)",
            "role": "ANALYST"
        }
        create_res = await client.post("/api/v1/users", json=create_payload, cookies=admin_cookies)
        assert create_res.status_code == 201
        created_user = create_res.json()
        assert created_user["badge_id"] == new_badge
        assert created_user["role"] == "ANALYST"
        assert created_user["is_active"] is True
        created_id = created_user["id"]

        # 5. Duplicate provisioning should fail
        dup_res = await client.post("/api/v1/users", json=create_payload, cookies=admin_cookies)
        assert dup_res.status_code == 400

        # 6. Admin deactivates created user
        deact_res = await client.patch(
            f"/api/v1/users/{created_id}/status",
            json={"is_active": False},
            cookies=admin_cookies
        )
        assert deact_res.status_code == 200
        assert deact_res.json()["is_active"] is False

        # 7. Admin cannot deactivate own account
        self_deact_res = await client.patch(
            f"/api/v1/users/{admin_id}/status",
            json={"is_active": False},
            cookies=admin_cookies
        )
        assert self_deact_res.status_code == 400
