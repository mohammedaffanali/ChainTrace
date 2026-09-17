import pytest
from app.services.scoring.explainable_scoring import compute_attribution, get_confidence_band

def test_scoring_weights_and_confidence_band():
    vasp = {
        "id": "vasp_coindcx",
        "name": "CoinDCX",
        "fiuStatus": "REGISTERED",
        "jurisdiction": "IN"
    }
    result = compute_attribution(
        target_address="0xa090e606e30bd747d4e6245a1517ebe430f0057e",
        chain="ethereum",
        vasp_entity=vasp,
        hops=1,
        is_deposit_match=True,
        cluster_member=True,
        is_fiu_registered=True
    )
    assert result["overall_confidence"] > 85.0
    assert result["confidence_band"] in ["STRONG_CANDIDATE", "VERY_STRONG_CANDIDATE"]
    assert len(result["signals"]) == 7
    assert sum(s["weight"] for s in result["signals"]) == pytest.approx(1.0, 0.01)
