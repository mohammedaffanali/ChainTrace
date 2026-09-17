import uuid
import datetime
import logging
from typing import Dict, Any, Optional

from app.providers import get_provider, InvalidAddressError
from app.services.transaction_normalizer import transaction_normalizer
from app.services.graph.graph_service import graph_service
from app.services.attribution_service import attribution_service

logger = logging.getLogger("chaintrace.services.wallet_analysis")

class WalletAnalysisService:
    @classmethod
    async def run_analysis(
        cls,
        address: str,
        network: str = "ethereum",
        hops: int = 1,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        analysis_id = str(uuid.uuid4())
        norm_network = network.lower().strip()
        provider = get_provider(norm_network)

        # 1. Address Validation
        if not provider.validate_address(address):
            raise InvalidAddressError(
                f"Address '{address}' is not valid for network '{network}'",
                provider_id=provider.provider_id
            )

        queried_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 2. Query Live Blockchain Data
        logger.info(f"[{analysis_id}] Initiating on-chain analysis for {address} on {norm_network}")
        
        balance_info = await provider.get_native_balance(address)
        latest_block = await provider.get_latest_block()

        # Fetch native and token transfers
        raw_txs = await provider.get_transactions(address, limit=50)
        raw_tokens = await provider.get_token_transfers(address, limit=50)
        
        all_raw = raw_txs + raw_tokens

        # 3. Transaction Normalization
        normalized_txs = transaction_normalizer.normalize_batch(
            all_raw,
            network=norm_network,
            provider=provider.provider_id
        )

        # 4. Topological Graph Construction from Real Transactions
        graph_data = graph_service.build_flow_graph(
            starting_address=address,
            chain=norm_network,
            max_hops=hops,
            transactions=normalized_txs
        )

        # 5. Explainable VASP Attribution Engine
        attribution_data = attribution_service.attribute_wallet(
            target_address=address,
            network=norm_network,
            transactions=normalized_txs
        )

        # Compile comprehensive structured response
        return {
            "analysis_id": analysis_id,
            "address": address,
            "network": norm_network,
            "data_source": provider.provider_id,
            "is_live_data": True,
            "queried_at": queried_at,
            "latest_block": latest_block or balance_info.get("block_number", 0),
            "balance": balance_info,
            "transaction_count": len(normalized_txs),
            "transactions": [tx.model_dump() for tx in normalized_txs],
            "graph": graph_data,
            "attribution": attribution_data,
            "limitations": attribution_data.get("limitations", [])
        }

wallet_analysis_service = WalletAnalysisService()
