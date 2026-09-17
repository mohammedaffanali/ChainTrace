import os
import sys
import asyncio
import argparse

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT_DIR, "backend"))

from sqlalchemy import select
from app.db.session import AsyncSessionLocal, init_db
from app.models.user import User
from app.core.security import get_password_hash

async def create_user(badge_id: str, email: str, password: str, full_name: str, designation: str, agency: str, role: str):
    await init_db()
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            select(User).where((User.badge_id == badge_id) | (User.email == email))
        )
        existing = res.scalars().first()
        if existing:
            print(f"\n[ERROR] User with badge ID '{badge_id}' or email '{email}' already exists!")
            return False

        hashed_pwd = get_password_hash(password)
        new_user = User(
            badge_id=badge_id.strip(),
            email=email.strip().lower(),
            hashed_password=hashed_pwd,
            full_name=full_name.strip(),
            designation=designation.strip(),
            agency=agency.strip(),
            role=role.strip().upper(),
            is_active=True
        )
        session.add(new_user)
        await session.commit()
        print(f"\n[SUCCESS] Officer Account Provisioned Successfully!")
        print(f"  * Name:        {new_user.full_name}")
        print(f"  * Badge ID:    {new_user.badge_id}")
        print(f"  * Email:       {new_user.email}")
        print(f"  * Role:        {new_user.role}")
        print(f"  * Agency:      {new_user.agency}")
        print(f"  * Designation: {new_user.designation}")
        return True

def main():
    parser = argparse.ArgumentParser(description="CHAINTRACE // Forensic User Provisioning CLI")
    parser.add_argument("--badge", help="Officer Badge ID (e.g. CBI-CYBER-101)")
    parser.add_argument("--email", help="Official Email (e.g. officer@cbi.gov.in)")
    parser.add_argument("--password", help="Enclave Security PIN / Password")
    parser.add_argument("--name", help="Full Name (e.g. Insp. Amit Verma)")
    parser.add_argument("--designation", default="Cyber Forensic Investigator", help="Official Designation")
    parser.add_argument("--agency", default="Central Bureau of Investigation (CBI)", help="Law Enforcement Agency")
    parser.add_argument("--role", choices=["INVESTIGATOR", "ANALYST", "ADMINISTRATOR"], default="INVESTIGATOR", help="Clearance Role")

    args = parser.parse_args()

    badge = args.badge or input("Enter Officer Badge ID (e.g. CBI-CYBER-101): ").strip()
    email = args.email or input("Enter Official Email (e.g. a.verma@cbi.gov.in): ").strip()
    password = args.password or input("Enter Enclave Security PIN / Password: ").strip()
    name = args.name or input("Enter Officer Full Name (e.g. Insp. Amit Verma): ").strip()
    designation = args.designation if args.badge else (input("Enter Designation [Cyber Forensic Investigator]: ").strip() or "Cyber Forensic Investigator")
    agency = args.agency if args.badge else (input("Enter Agency [Central Bureau of Investigation (CBI)]: ").strip() or "Central Bureau of Investigation (CBI)")
    role = args.role if args.badge else (input("Enter Role (INVESTIGATOR / ANALYST / ADMINISTRATOR) [INVESTIGATOR]: ").strip().upper() or "INVESTIGATOR")

    if not badge or not email or not password or not name:
        print("[ERROR] Badge ID, Email, Password, and Full Name are mandatory.")
        sys.exit(1)

    asyncio.run(create_user(badge, email, password, name, designation, agency, role))

if __name__ == "__main__":
    main()
