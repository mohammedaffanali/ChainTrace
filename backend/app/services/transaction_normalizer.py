import datetime
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("chaintrace.services.normalizer")

class NormalizedTransaction(BaseModel):
    transaction_hash: str = Field(..., description="Unique transaction hash on ledger")
    block_number: int = Field(..., description="Block height containing transaction")
    timestamp: int = Field(..., description="Unix epoch timestamp in seconds")
    timestamp_iso: str = Field(..., description="ISO 8601 UTC timestamp")
    from_address: str = Field(..., description="Sender account address")
    to_address: str = Field(..., description="Recipient or target contract address")
    value: float = Field(default=0.0, description="Formatted decimal transfer value")
    asset: str = Field(default="ETH", description="Asset ticker symbol, e.g. ETH, USDT, TRX")
    network: str = Field(..., description="Originating blockchain network")
    transaction_type: str = Field(default="NATIVE_TRANSFER", description="NATIVE_TRANSFER | TOKEN_TRANSFER | INTERNAL_TRANSFER")
    status: str = Field(default="SUCCESS", description="SUCCESS | FAILED | PENDING")
    provider: str = Field(..., description="Data provider source, e.g. etherscan, alchemy, trongrid")
    raw_reference: Optional[Dict[str, Any]] = Field(default=None, description="Preserved raw payload for evidentiary audit")

class TransactionNormalizer:
    @staticmethod
    def normalize_single(raw_tx: Dict[str, Any], network: str, provider: str) -> Optional[NormalizedTransaction]:
        try:
            tx_hash = (
                raw_tx.get("raw_hash") or 
                raw_tx.get("hash") or 
                raw_tx.get("txID") or 
                raw_tx.get("transaction_hash") or 
                ""
            ).strip()

            if not tx_hash:
                return None

            block_num = int(raw_tx.get("block_number") or raw_tx.get("blockNumber") or 0)
            
            raw_ts = raw_tx.get("timestamp") or raw_tx.get("timeStamp") or 0
            ts_int = int(raw_ts)
            # If timestamp in milliseconds (e.g. Tron)
            if ts_int > 1e11:
                ts_int = int(ts_int / 1000)

            iso_time = datetime.datetime.fromtimestamp(ts_int, tz=datetime.timezone.utc).isoformat() if ts_int > 0 else datetime.datetime.now(datetime.timezone.utc).isoformat()

            from_addr = (raw_tx.get("from") or raw_tx.get("from_address") or raw_tx.get("owner_address") or "").strip()
            to_addr = (raw_tx.get("to") or raw_tx.get("to_address") or raw_tx.get("to_address") or "").strip()

            val = raw_tx.get("value_formatted")
            if val is None:
                val = raw_tx.get("value", 0.0)
            try:
                val_float = float(val)
            except Exception:
                val_float = 0.0

            asset = (raw_tx.get("asset") or raw_tx.get("tokenSymbol") or ("TRX" if network == "tron" else "ETH")).upper()

            tx_type = raw_tx.get("type") or raw_tx.get("transaction_type") or "NATIVE_TRANSFER"
            
            # Status check
            is_err = raw_tx.get("is_error")
            status = "FAILED" if is_err is True or raw_tx.get("status") == "FAILED" else "SUCCESS"

            return NormalizedTransaction(
                transaction_hash=tx_hash,
                block_number=block_num,
                timestamp=ts_int,
                timestamp_iso=iso_time,
                from_address=from_addr,
                to_address=to_addr,
                value=val_float,
                asset=asset,
                network=network.lower().strip(),
                transaction_type=tx_type,
                status=status,
                provider=provider,
                raw_reference={k: v for k, v in raw_tx.items() if k not in ["raw_reference"]}
            )
        except Exception as e:
            logger.warning(f"Error normalizing raw transaction: {e}")
            return None

    @classmethod
    def normalize_batch(cls, raw_list: List[Dict[str, Any]], network: str, provider: str) -> List[NormalizedTransaction]:
        normalized = []
        seen = set()

        for item in raw_list:
            res = cls.normalize_single(item, network, provider)
            if res:
                key = f"{res.transaction_hash}_{res.from_address}_{res.to_address}_{res.asset}"
                if key not in seen:
                    seen.add(key)
                    normalized.append(res)

        return sorted(normalized, key=lambda x: x.timestamp or x.block_number, reverse=True)

transaction_normalizer = TransactionNormalizer()
