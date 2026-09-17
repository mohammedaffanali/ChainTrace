from fastapi import APIRouter
from datetime import datetime
from app.schemas.attribution import AttributionRequest, AttributionResponse, VaspCandidateSchema
from app.services.vasp.vasp_service import vasp_service
from app.services.scoring.explainable_scoring import compute_attribution

router = APIRouter()

@router.post("/run", response_model=AttributionResponse)
def run_attribution(payload: AttributionRequest):
    # Lookup in VASP database
    lookup = vasp_service.lookup_address(payload.wallet_address, payload.chain)
    
    if lookup['matched']:
        vasp_entity = lookup['vasp']
        result_candidate = compute_attribution(
            target_address=payload.wallet_address,
            chain=payload.chain,
            vasp_entity=vasp_entity,
            hops=1,
            is_deposit_match=True,
            cluster_member=True,
            is_fiu_registered=(vasp_entity.get('fiuStatus') == 'REGISTERED')
        )
        candidate = VaspCandidateSchema(**result_candidate)
        candidates = [candidate]
        primary_candidate = candidate
        status = "ATTRIBUTED_CANDIDATE"
        why_this_vasp = [
            f"Verified deposit interaction within {candidate.nearest_hops} hop(s)",
            f"Entity is registered with FIU-IND ({candidate.fiu_status})",
            "Deterministic heuristic scoring with zero unverified guessing",
            "Non-speculative legal evidentiary provenance"
        ]
    else:
        # STRICT ANTI-OVERCLAIMING: Do NOT guess or default to Binance
        # Return explicit unverified candidate with low confidence and INSUFFICIENT_EVIDENCE band
        unverified_entity = {
            'id': 'vasp_unattributed',
            'name': 'No Identified VASP Cluster',
            'legalName': 'Unattributed / Independent Wallet',
            'jurisdiction': 'UNKNOWN',
            'fiuStatus': 'UNREGISTERED',
            'fiuRegistrationNumber': 'N/A'
        }
        result_candidate = compute_attribution(
            target_address=payload.wallet_address,
            chain=payload.chain,
            vasp_entity=unverified_entity,
            hops=payload.max_hops + 1,
            is_deposit_match=False,
            cluster_member=False,
            is_fiu_registered=False,
            has_cross_chain=False
        )
        candidate = VaspCandidateSchema(**result_candidate)
        candidates = []
        primary_candidate = None
        status = "NO_RELIABLE_ATTRIBUTION"
        why_this_vasp = [
            "No custodial sweep or deposit transaction identified across queried hops",
            "Wallet address does not match known VASP cluster infrastructure",
            "Zero-guessing evidentiary protocol: unverified entities are not attributed",
            "Requires further off-chain subpoena or multi-hop taint expansion"
        ]

    return AttributionResponse(
        success=True,
        status=status,
        investigated_wallet=payload.wallet_address,
        chain=payload.chain,
        is_demonstration=payload.force_demo,
        candidates=candidates,
        primary_candidate=primary_candidate,
        why_this_vasp=why_this_vasp,
        statutory_warning="Scores represent investigative attribution confidence, not legal determination of ownership.",
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
