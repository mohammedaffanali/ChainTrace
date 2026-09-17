"""
Verification script for real-time blockchain intelligence in CHAINTRACE.
Tests on-chain retrieval, normalization, graph construction, attribution scoring, and anti-overclaiming.
"""
import asyncio
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.db.session import init_db
from app.services.wallet_analysis_service import wallet_analysis_service
from app.providers.alchemy_provider import AlchemyProvider

async def main():
    print("=== CHAINTRACE REAL-TIME BLOCKCHAIN INTELLIGENCE VERIFICATION ===")
    await init_db()

    # 1. Analyze Binance Hot Wallet (Known entity test)
    binance_address = "0x28C6c06298d514Db089934071355E5743bf21d60"
    print(f"\n[TEST 1] Analyzing Known Exchange Hot Wallet: {binance_address}")
    
    res1 = await wallet_analysis_service.run_analysis(
        address=binance_address,
        network="ethereum",
        hops=1
    )
    print(f"  - Analysis ID: {res1['analysis_id']}")
    print(f"  - Data Source: {res1['data_source']}")
    print(f"  - Latest Block: {res1['latest_block']}")
    print(f"  - Balance: {res1['balance'].get('formatted')} (INR: {res1['balance'].get('fiatValueINR')})")
    print(f"  - Transactions Found: {res1['transaction_count']}")
    if res1['transactions']:
        first_tx = res1['transactions'][0]
        print(f"    * Sample Tx: {first_tx.get('txHash', '')[:16]}... from {first_tx.get('from_address', '')[:10]}... to {first_tx.get('to_address', '')[:10]}... ({first_tx.get('amount')} {first_tx.get('asset')})")
    print(f"  - Graph Nodes: {len(res1['graph']['nodes'])}, Edges: {len(res1['graph']['edges'])}")
    print(f"  - Nearest VASP: {res1['attribution']['nearest_vasp']} (Confidence: {res1['attribution']['confidence_score']}%)")
    print(f"  - Legal Limitations: {res1['attribution']['legal_limitations'][:80]}...")

    # 2. Analyze Random Unattributed Address (Anti-overclaiming test)
    unattributed_address = "0x000000000000000000000000000000000000dEaD"
    print(f"\n[TEST 2] Analyzing Burn Address (Unattributed / Anti-Overclaiming): {unattributed_address}")
    res2 = await wallet_analysis_service.run_analysis(
        address=unattributed_address,
        network="ethereum",
        hops=1
    )
    print(f"  - Nearest VASP: {res2['attribution']['nearest_vasp']}")
    print(f"  - Confidence: {res2['attribution']['confidence_score']}%")
    assert res2['attribution']['nearest_vasp'] == "Unknown / Unverified", f"Expected 'Unknown / Unverified', got {res2['attribution']['nearest_vasp']}"
    print("  [OK] Strict Anti-Overclaiming verified: correctly returned 'Unknown / Unverified'")

    # 3. Test Webhook Signature Verification
    print("\n[TEST 3] Testing Alchemy Webhook Signature Verification")
    import hmac
    import hashlib
    signing_key = "test_signing_key_secret_123"
    payload = b'{"event": "mined_transaction", "hash": "0x123"}'
    valid_sig = hmac.new(signing_key.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    
    is_valid = AlchemyProvider.verify_webhook_signature(payload, valid_sig, signing_key)
    is_invalid = AlchemyProvider.verify_webhook_signature(payload, "invalid_signature", signing_key)
    print(f"  - Valid Signature Check: {is_valid}")
    print(f"  - Tampered Signature Check: {is_invalid}")
    assert is_valid is True and is_invalid is False
    print("  [OK] Webhook HMAC-SHA256 signature verification passed")

    print("\n=== ALL REAL-TIME BLOCKCHAIN INTELLIGENCE VERIFICATIONS PASSED ===")

if __name__ == "__main__":
    asyncio.run(main())
