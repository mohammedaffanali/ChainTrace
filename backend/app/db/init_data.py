import os
import json
import logging
from sqlalchemy import select
from app.db.session import AsyncSessionLocal, init_db
from app.core.config import settings
from app.models.user import User
from app.models.vasp import Vasp, WalletCluster, VaspAddress
from app.models.investigation import Investigation, InvestigationWallet
from app.core.security import get_password_hash

logger = logging.getLogger("chaintrace.seed")

async def seed_database():
    await init_db()
    async with AsyncSessionLocal() as session:
        # 1. Seed Users
        user_res = await session.execute(select(User).limit(1))
        existing_user = user_res.scalars().first()
        
        investigator_user_id = None

        if not existing_user:
            logger.info("[SEED] Seeding authorized forensic users...")
            users = [
                User(
                    badge_id="DEL-CYBER-8842",
                    email="v.sharma@cybercrime.gov.in",
                    hashed_password=get_password_hash("OfficerPin8842!"),
                    full_name="Insp. Vikramaditya Sharma",
                    designation="Senior Cyber Forensic Investigator",
                    agency="Delhi Police Cyber Command & FIU-IND Liaison",
                    role="INVESTIGATOR",
                    is_active=True
                ),
                User(
                    badge_id="ED-FORENSIC-007",
                    email="m.nambiar@ed.gov.in",
                    hashed_password=get_password_hash("AnalystSecret2026!"),
                    full_name="Dr. Meera Nambiar",
                    designation="Principal Blockchain Forensic Specialist",
                    agency="Directorate of Enforcement (ED)",
                    role="ANALYST",
                    is_active=True
                ),
                User(
                    badge_id="ADMIN-LEA-001",
                    email="r.kumar@nic.in",
                    hashed_password=get_password_hash("AdminRoot2026!"),
                    full_name="Rajesh Kumar",
                    designation="Forensic Enclave Systems Administrator",
                    agency="National Cyber Security Operations Enclave",
                    role="ADMINISTRATOR",
                    is_active=True
                )
            ]
            session.add_all(users)
            await session.commit()
            investigator_user_id = users[0].id
            logger.info(f"[SEED] Successfully created 3 forensic users.")
        else:
            investigator_user_id = existing_user.id

        # 2. Seed VASPs from data/vasp_database.json
        vasp_res = await session.execute(select(Vasp).limit(1))
        if not vasp_res.scalars().first():
            logger.info("[SEED] Seeding statutory VASPs and cluster registries...")
            json_path = settings.VASP_DATA_PATH
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Seed VASPs
                for v in data.get('vasps', []):
                    vasp_obj = Vasp(
                        id=v['id'],
                        name=v['name'],
                        legal_name=v.get('legalName', v['name']),
                        country=v.get('country', 'India'),
                        jurisdiction=v.get('jurisdiction', 'IN'),
                        fiu_status=v.get('fiuStatus', 'REGISTERED'),
                        fiu_registration_number=v.get('fiuRegistrationNumber'),
                        website=v.get('website'),
                        status=v.get('status', 'ACTIVE'),
                        risk_level=v.get('riskLevel', 'LOW')
                    )
                    session.add(vasp_obj)

                # Seed Clusters
                for c in data.get('clusters', []):
                    cluster_obj = WalletCluster(
                        id=c['id'],
                        vasp_id=c['vaspId'],
                        name=c['name'],
                        chain=c['chain'],
                        cluster_type=c.get('clusterType', 'DEPOSIT_SWEEP'),
                        confidence=c.get('confidence', 0.95),
                        source=c.get('source', 'FIU-IND Verified Registry'),
                        verification_status=c.get('verificationStatus', 'VERIFIED')
                    )
                    session.add(cluster_obj)

                # Seed Addresses
                for a in data.get('addresses', []):
                    addr_obj = VaspAddress(
                        id=a['id'],
                        vasp_id=a['vaspId'],
                        cluster_id=a.get('clusterId'),
                        address=a['address'],
                        chain=a['chain'],
                        address_type=a.get('addressType', 'deposit'),
                        confidence=a.get('confidence', 0.95),
                        source=a.get('source', 'Exchange Deposit Sweep Pattern'),
                        verification_status=a.get('verificationStatus', 'VERIFIED')
                    )
                    session.add(addr_obj)

                await session.commit()
                logger.info("[SEED] Seeded statutory VASPs, clusters, and addresses.")

        # 3. Seed Initial Investigations
        inv_res = await session.execute(select(Investigation).limit(1))
        if not inv_res.scalars().first() and investigator_user_id:
            logger.info("[SEED] Seeding baseline investigations dockets...")
            invs = [
                Investigation(
                    case_number="CASE-2026-001",
                    title="Operation Hawala Nexus — Surat Gateway Fund Flow",
                    summary="Investigation into multi-hop USDT layering originating from unhosted wallet 0x7A91... and terminating at CoinDCX custody.",
                    created_by_user_id=investigator_user_id,
                    agency="Delhi Police Cyber Command & FIU-IND Liaison",
                    status="ACTIVE_TRACE",
                    priority="HIGH",
                    total_exposure_inr=124580000.00
                ),
                Investigation(
                    case_number="CASE-2026-002",
                    title="Darknet Mixer Obfuscation — Tornado.Cash Cashout",
                    summary="Syndicate laundering Ethereum via proxy routers with bridge transit to Polygon POS.",
                    created_by_user_id=investigator_user_id,
                    agency="Directorate of Enforcement (ED)",
                    status="SUBPOENA_SERVED",
                    priority="CRITICAL",
                    total_exposure_inr=88000000.00
                )
            ]
            session.add_all(invs)
            await session.commit()

            # Add seed wallets
            w1 = InvestigationWallet(
                investigation_id=invs[0].id,
                address="0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
                chain="ethereum",
                label="Suspect Seed Wallet",
                is_seed_target=True,
                risk_score=92.5
            )
            w2 = InvestigationWallet(
                investigation_id=invs[1].id,
                address="0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b",
                chain="ethereum",
                label="Mixer Proxy Router",
                is_seed_target=True,
                risk_score=99.0
            )
            session.add_all([w1, w2])
            await session.commit()
            logger.info("[SEED] Seeded active investigation dockets.")

if __name__ == "__main__":
    import asyncio
    logging.basicConfig(level=logging.INFO)
    asyncio.run(seed_database())
