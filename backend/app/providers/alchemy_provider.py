import hmac
import hashlib
import logging
from typing import Dict, Any, List, Optional
from web3 import Web3

from app.core.config import settings
from app.providers.base import BlockchainProvider, ProviderError, RateLimitError, InvalidAddressError

logger = logging.getLogger("chaintrace.providers.alchemy")

class AlchemyProvider(BlockchainProvider):
    def __init__(self, network: str = "ethereum", api_key: Optional[str] = None):
        super().__init__(provider_id=f"alchemy_{network}", network=network)
        self.network = network.lower().strip()
        self.api_key = api_key or settings.ALCHEMY_API_KEY or ""

        if self.network in ["polygon", "matic", "polygon-pos"]:
            base = settings.ALCHEMY_POLYGON_URL
            self.symbol = "MATIC"
        else:
            base = settings.ALCHEMY_ETH_URL
            self.symbol = "ETH"

        self.endpoint_url = f"{base}/{self.api_key}" if self.api_key else base

    def validate_address(self, address: str) -> bool:
        if not address or not isinstance(address, str):
            return False
        return Web3.is_address(address.strip())

    def _get_checksum(self, address: str) -> str:
        if not self.validate_address(address):
            raise InvalidAddressError(f"Address '{address}' is not a valid 20-byte EVM address", self.provider_id)
        return Web3.to_checksum_address(address.strip())

    @staticmethod
    def verify_webhook_signature(raw_body: bytes, signature_header: str, signing_key: str) -> bool:
        """
        Validates Alchemy webhook signature using HMAC-SHA256.
        """
        if not signature_header or not signing_key:
            return False
        try:
            expected = hmac.new(signing_key.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
            return hmac.compare_digest(expected.lower(), signature_header.lower())
        except Exception:
            return False

    async def get_latest_block(self) -> int:
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_blockNumber",
            "params": [],
            "id": 1
        }
        try:
            resp = await self.execute_request("POST", self.endpoint_url, json=payload)
            data = resp.json()
            if "result" in data and isinstance(data["result"], str):
                return int(data["result"], 16)
        except Exception as e:
            logger.warning(f"[{self.provider_id}] Failed to get block: {e}")
        return 0

    async def get_native_balance(self, address: str) -> Dict[str, Any]:
        checksum = self._get_checksum(address)
        payload = {
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [checksum, "latest"],
            "id": 1
        }
        try:
            resp = await self.execute_request("POST", self.endpoint_url, json=payload)
            data = resp.json()
            if "result" in data:
                wei = int(data["result"], 16)
                ether = wei / 1e18
                block = await self.get_latest_block()
                return {
                    "address": checksum,
                    "balance": ether,
                    "raw_balance": str(wei),
                    "symbol": self.symbol,
                    "block_number": block,
                    "provider": self.provider_id
                }
            if "error" in data:
                raise ProviderError(f"Alchemy RPC error: {data['error'].get('message')}", self.provider_id)
        except ProviderError:
            raise
        except Exception as e:
            raise ProviderError(f"Error connecting to {self.provider_id}: {str(e)}", self.provider_id)

        raise ProviderError("Failed to fetch balance from Alchemy", self.provider_id)

    async def get_transactions(self, address: str, limit: int = 50, start_block: int = 0) -> List[Dict[str, Any]]:
        """
        Fetches asset transfers (external and internal) for the target address.
        Queries both sent and received transfers.
        """
        checksum = self._get_checksum(address)
        hex_limit = hex(min(limit, 100))

        # Query outgoing transfers
        payload_from = {
            "jsonrpc": "2.0",
            "method": "alchemy_getAssetTransfers",
            "params": [{
                "fromBlock": hex(start_block) if start_block > 0 else "0x0",
                "toBlock": "latest",
                "fromAddress": checksum,
                "category": ["external", "internal", "erc20"],
                "maxCount": hex_limit,
                "withMetadata": True
            }],
            "id": 1
        }

        # Query incoming transfers
        payload_to = {
            "jsonrpc": "2.0",
            "method": "alchemy_getAssetTransfers",
            "params": [{
                "fromBlock": hex(start_block) if start_block > 0 else "0x0",
                "toBlock": "latest",
                "toAddress": checksum,
                "category": ["external", "internal", "erc20"],
                "maxCount": hex_limit,
                "withMetadata": True
            }],
            "id": 2
        }

        all_transfers = []
        for payload in [payload_from, payload_to]:
            try:
                resp = await self.execute_request("POST", self.endpoint_url, json=payload)
                data = resp.json()
                if "result" in data and "transfers" in data["result"]:
                    for item in data["result"]["transfers"]:
                        metadata = item.get("metadata", {})
                        block_hex = item.get("blockNum", "0x0")
                        block_num = int(block_hex, 16) if str(block_hex).startswith("0x") else int(block_hex or 0)
                        
                        # Timestamp ISO parsing
                        time_str = metadata.get("blockTimestamp", "")
                        timestamp_sec = 0
                        if time_str:
                            import datetime
                            try:
                                dt = datetime.datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                                timestamp_sec = int(dt.timestamp())
                            except Exception:
                                pass

                        val = item.get("value")
                        val_float = float(val) if val is not None else 0.0

                        all_transfers.append({
                            "raw_hash": item.get("hash"),
                            "block_number": block_num,
                            "timestamp": timestamp_sec,
                            "from": Web3.to_checksum_address(item.get("from")) if item.get("from") else "",
                            "to": Web3.to_checksum_address(item.get("to")) if item.get("to") else "",
                            "value_raw": str(item.get("rawContract", {}).get("value", "")),
                            "value_formatted": val_float,
                            "asset": item.get("asset") or self.symbol,
                            "category": item.get("category"),
                            "provider": self.provider_id,
                            "type": "TOKEN_TRANSFER" if item.get("category") == "erc20" else "NATIVE_TRANSFER"
                        })
            except Exception as e:
                logger.warning(f"[{self.provider_id}] Asset transfers call failed: {e}")

        # Deduplicate and sort descending by block number
        seen_keys = set()
        deduped = []
        for tx in sorted(all_transfers, key=lambda x: x["block_number"], reverse=True):
            key = f"{tx['raw_hash']}_{tx['from']}_{tx['to']}_{tx['asset']}"
            if key not in seen_keys:
                seen_keys.add(key)
                deduped.append(tx)
                if len(deduped) >= limit:
                    break

        return deduped

    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        # Handled uniformly in get_transactions via category filtering
        all_txs = await self.get_transactions(address, limit=limit)
        return [t for t in all_txs if t.get("type") == "TOKEN_TRANSFER"]
