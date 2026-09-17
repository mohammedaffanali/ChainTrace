import logging
from typing import Dict, Any, List, Optional
from app.services.vasp.vasp_service import vasp_service
from app.services.transaction_normalizer import NormalizedTransaction

logger = logging.getLogger("chaintrace.services.attribution")

MANDATORY_LIMITATIONS = [
    "Address label does not prove beneficial ownership or legal identity of the individual initiating transfers.",
    "Exchange deposit sweep patterns and custodial architecture may alter without public disclosure.",
    "Attribution confidence represents an investigative analytical estimate, not a judicial finding of fact.",
    "Statutory Section 65B verification requires corroboration with official FIU-IND / CrPC 91 requisition responses."
]

class VaspAttributionService:
    @classmethod
    def attribute_wallet(
        cls,
        target_address: str,
        network: str,
        transactions: List[NormalizedTransaction]
    ) -> Dict[str, Any]:
        """
        Executes strict evidence-backed VASP attribution across real on-chain transactions.
        Enforces a strict zero-guessing policy: returns 'Unknown / Unverified' if no factual evidence exists.
        """
        target_clean = target_address.lower().strip()
        norm_network = network.lower().strip()

        # Check if the target itself is an exchange address
        target_lookup = vasp_service.lookup_address(target_address, norm_network)
        if target_lookup.get("matched"):
            vasp = target_lookup["vasp"]
            return {
                "attributed": True,
                "status": "DIRECT_VASP_NODE",
                "vasp_name": vasp.get("name"),
                "nearest_vasp": vasp.get("name"),
                "legal_name": vasp.get("legalName"),
                "fiu_status": vasp.get("fiuStatus", "REGISTERED"),
                "fiu_reg": vasp.get("fiuRegistrationNumber", "N/A"),
                "confidence": 0.98,
                "confidence_score": 98.0,
                "confidence_type": "verified_registry_direct_match",
                "evidence": [
                    {
                        "signal": "Target address directly registered to known VASP cluster",
                        "source": target_lookup.get("matchType", "FIU-IND Verified Registry"),
                        "verification_status": "VERIFIED",
                        "notes": "Address is an officially documented deposit / hot wallet cluster endpoint."
                    }
                ],
                "evidence_chain": [
                    {
                        "signal": "Target address directly registered to known VASP cluster",
                        "source": target_lookup.get("matchType", "FIU-IND Verified Registry"),
                        "verification_status": "VERIFIED",
                        "notes": "Address is an officially documented deposit / hot wallet cluster endpoint."
                    }
                ],
                "matched_transactions": [],
                "legal_limitations": "Evidence requires Section 65B Certificate under Bharatiya Sakshya Adhiniyam, 2023 for judicial admissibility.",
                "limitations": MANDATORY_LIMITATIONS
            }

        # Inspect transfer destinations for deposit interactions
        matched_candidates = {}
        for tx in transactions:
            # Check outgoing transfers from target
            if tx.from_address.lower() == target_clean:
                dest = tx.to_address
                dest_lookup = vasp_service.lookup_address(dest, norm_network)
                if dest_lookup.get("matched"):
                    v_name = dest_lookup["vasp"]["name"]
                    if v_name not in matched_candidates:
                        matched_candidates[v_name] = {
                            "vasp": dest_lookup["vasp"],
                            "match_type": dest_lookup.get("matchType"),
                            "transactions": []
                        }
                    matched_candidates[v_name]["transactions"].append(tx)

        if matched_candidates:
            # Pick highest activity candidate
            top_name, top_data = max(matched_candidates.items(), key=lambda item: len(item[1]["transactions"]))
            vasp = top_data["vasp"]
            evidence_list = []
            
            for tx in top_data["transactions"]:
                evidence_list.append({
                    "signal": f"Direct on-chain transfer to {vasp['name']} deposit cluster",
                    "transaction_hash": tx.transaction_hash,
                    "value": f"{tx.value} {tx.asset}",
                    "timestamp": tx.timestamp_iso,
                    "block_number": tx.block_number,
                    "source": top_data["match_type"] or "FIU-IND Statutory Registry",
                    "destination_address": tx.to_address
                })

            # Multi-signal weighted calculation: Base 0.70 + 0.05 per confirmed tx (max 0.92)
            tx_count = len(top_data["transactions"])
            calc_conf = min(0.70 + (tx_count * 0.04), 0.92)

            return {
                "attributed": True,
                "status": "ATTRIBUTED_CANDIDATE",
                "vasp_name": vasp.get("name"),
                "nearest_vasp": vasp.get("name"),
                "legal_name": vasp.get("legalName"),
                "fiu_status": vasp.get("fiuStatus", "REGISTERED"),
                "fiu_reg": vasp.get("fiuRegistrationNumber", "N/A"),
                "confidence": round(calc_conf, 2),
                "confidence_score": round(calc_conf * 100, 1),
                "confidence_type": "analytical_estimate",
                "evidence": evidence_list,
                "evidence_chain": evidence_list,
                "matched_transactions": [tx.model_dump() for tx in top_data["transactions"]],
                "legal_limitations": "Evidence requires Section 65B Certificate under Bharatiya Sakshya Adhiniyam, 2023 for judicial admissibility.",
                "limitations": MANDATORY_LIMITATIONS
            }

        # STRICT ZERO-GUESSING: No matched destination
        return {
            "attributed": False,
            "status": "NO_RELIABLE_ATTRIBUTION",
            "vasp_name": "Unknown / Unverified",
            "nearest_vasp": "Unknown / Unverified",
            "legal_name": "Unattributed Wallet Entity",
            "fiu_status": "NOT_APPLICABLE",
            "fiu_reg": "N/A",
            "confidence": 0.0,
            "confidence_score": 0.0,
            "confidence_type": "insufficient_evidence",
            "evidence": [
                {
                    "signal": "No direct or cluster interactions with documented VASPs found in inspected transactions",
                    "source": "Etherscan / Alchemy on-chain analysis",
                    "transactions_scanned": len(transactions),
                    "notes": "Anti-overclaiming rule active: zero speculative heuristics applied."
                }
            ],
            "evidence_chain": [],
            "matched_transactions": [],
            "legal_limitations": "Zero-speculation rule: Unattributed on-chain wallet cannot be definitively linked to a registered VASP without subpoena confirmation.",
            "limitations": [
                "Transfers may terminate at unhosted private wallets or unlisted foreign exchanges.",
                "Deeper multi-hop graph traversal may be required to detect peel-chains.",
                *MANDATORY_LIMITATIONS
            ]
        }

attribution_service = VaspAttributionService()
