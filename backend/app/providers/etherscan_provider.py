import logging
from typing import Dict, Any, List, Optional
from web3 import Web3

from app.core.config import settings
from app.providers.base import BlockchainProvider, ProviderError, RateLimitError, InvalidAddressError

logger = logging.getLogger("chaintrace.providers.etherscan")

class EtherscanProvider(BlockchainProvider):
    def __init__(self, network: str = "ethereum", api_key: Optional[str] = None):
        super().__init__(provider_id=f"etherscan_{network}", network=network)
        self.network = network.lower().strip()
        
        self.base_url = "https://api.etherscan.io/v2/api"
        if self.network in ["polygon", "matic", "polygon-pos"]:
            self.chain_id = "137"
            self.api_key = api_key or settings.POLYGONSCAN_API_KEY or settings.ETHERSCAN_API_KEY or ""
            self.symbol = "MATIC"
        else:
            self.chain_id = "1"
            self.api_key = api_key or settings.ETHERSCAN_API_KEY or ""
            self.symbol = "ETH"

    def validate_address(self, address: str) -> bool:
        if not address or not isinstance(address, str):
            return False
        clean = address.strip()
        return Web3.is_address(clean)

    def _get_checksum(self, address: str) -> str:
        if not self.validate_address(address):
            raise InvalidAddressError(f"Address '{address}' is not a valid 20-byte EVM hex address", self.provider_id)
        return Web3.to_checksum_address(address.strip())

    async def get_latest_block(self) -> int:
        params = {
            "chainid": self.chain_id,
            "module": "proxy",
            "action": "eth_blockNumber",
        }
        if self.api_key:
            params["apikey"] = self.api_key

        try:
            resp = await self.execute_request("GET", self.base_url, params=params)
            data = resp.json()
            if "result" in data and isinstance(data["result"], str) and data["result"].startswith("0x"):
                return int(data["result"], 16)
        except Exception as e:
            logger.warning(f"[{self.provider_id}] Failed to get block via API proxy: {e}")

        # Fallback to Web3 RPC
        try:
            from app.services.blockchain.web3_service import web3_service
            w3 = web3_service.get_web3(self.network)
            if w3 and w3.is_connected():
                return w3.eth.block_number
        except Exception:
            pass

        return 0

    async def get_native_balance(self, address: str) -> Dict[str, Any]:
        checksum = self._get_checksum(address)
        params = {
            "chainid": self.chain_id,
            "module": "account",
            "action": "balance",
            "address": checksum,
            "tag": "latest"
        }
        if self.api_key:
            params["apikey"] = self.api_key

        try:
            resp = await self.execute_request("GET", self.base_url, params=params)
            data = resp.json()
            if data.get("status") == "1" and "result" in data:
                wei = int(data["result"])
                ether = wei / 1e18
                block = await self.get_latest_block()
                return {
                    "address": checksum,
                    "balance": ether,
                    "raw_balance": data["result"],
                    "symbol": self.symbol,
                    "block_number": block,
                    "provider": self.provider_id
                }
            elif "rate limit" in str(data.get("message", "")).lower():
                raise RateLimitError(data.get("result", "Etherscan rate limit"), self.provider_id)
        except RateLimitError:
            raise
        except Exception as e:
            logger.warning(f"[{self.provider_id}] API balance query failed: {e}")

        # Fallback to Web3 RPC
        from app.services.blockchain.web3_service import web3_service
        w3_res = web3_service.get_balance(checksum, self.network)
        if w3_res.get("connected"):
            return {
                "address": checksum,
                "balance": w3_res.get("balance_native", 0.0),
                "raw_balance": str(w3_res.get("balance_native", 0.0)),
                "symbol": self.symbol,
                "block_number": w3_res.get("block_number", 0),
                "provider": f"{self.provider_id}_web3_rpc"
            }

        return {
            "address": checksum,
            "balance": 0.0,
            "raw_balance": "0",
            "symbol": self.symbol,
            "block_number": 0,
            "provider": f"{self.provider_id}_unreachable"
        }

    async def get_transactions(self, address: str, limit: int = 50, start_block: int = 0) -> List[Dict[str, Any]]:
        checksum = self._get_checksum(address)
        params = {
            "chainid": self.chain_id,
            "module": "account",
            "action": "txlist",
            "address": checksum,
            "startblock": str(start_block),
            "endblock": "99999999",
            "page": "1",
            "offset": str(min(limit, 100)),
            "sort": "desc"
        }
        if self.api_key:
            params["apikey"] = self.api_key

        resp = await self.execute_request("GET", self.base_url, params=params)
        data = resp.json()

        if data.get("status") == "0" and "No transactions found" in data.get("message", ""):
            return []

        if data.get("status") == "1" and isinstance(data.get("result"), list):
            txs = []
            for item in data["result"]:
                txs.append({
                    "raw_hash": item.get("hash"),
                    "block_number": int(item.get("blockNumber", 0)),
                    "timestamp": int(item.get("timeStamp", 0)),
                    "from": Web3.to_checksum_address(item.get("from")) if item.get("from") else "",
                    "to": Web3.to_checksum_address(item.get("to")) if item.get("to") else "",
                    "value_raw": item.get("value", "0"),
                    "value_formatted": int(item.get("value", "0")) / 1e18,
                    "asset": self.symbol,
                    "gas_used": item.get("gasUsed"),
                    "gas_price": item.get("gasPrice"),
                    "is_error": item.get("isError") == "1",
                    "input_data": item.get("input"),
                    "provider": self.provider_id,
                    "type": "NATIVE_TRANSFER"
                })
            return txs

        msg = data.get("result") or data.get("message") or "Unknown error"
        if "rate limit" in str(msg).lower():
            raise RateLimitError(str(msg), self.provider_id)
        
        # If API key is missing or not authorized, fail with clear diagnostic
        if "invalid api key" in str(msg).lower() or not self.api_key:
            raise ProviderError(f"Etherscan API key missing or invalid: {msg}", self.provider_id, status_code=401)

        raise ProviderError(f"Failed to fetch transactions from {self.provider_id}: {msg}", self.provider_id, raw=data)

    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        checksum = self._get_checksum(address)
        params = {
            "chainid": self.chain_id,
            "module": "account",
            "action": "tokentx",
            "address": checksum,
            "page": "1",
            "offset": str(min(limit, 100)),
            "sort": "desc"
        }
        if self.api_key:
            params["apikey"] = self.api_key

        resp = await self.execute_request("GET", self.base_url, params=params)
        data = resp.json()

        if data.get("status") == "0" and ("No transactions found" in data.get("message", "") or "No records found" in data.get("message", "")):
            return []

        if data.get("status") == "1" and isinstance(data.get("result"), list):
            transfers = []
            for item in data["result"]:
                decimals = int(item.get("tokenDecimal", 18) or 18)
                val_raw = int(item.get("value", "0") or "0")
                transfers.append({
                    "raw_hash": item.get("hash"),
                    "block_number": int(item.get("blockNumber", 0)),
                    "timestamp": int(item.get("timeStamp", 0)),
                    "from": Web3.to_checksum_address(item.get("from")) if item.get("from") else "",
                    "to": Web3.to_checksum_address(item.get("to")) if item.get("to") else "",
                    "value_raw": item.get("value", "0"),
                    "value_formatted": val_raw / (10 ** decimals) if decimals >= 0 else 0.0,
                    "asset": item.get("tokenSymbol", "UNKNOWN_TOKEN"),
                    "contract_address": item.get("contractAddress"),
                    "token_name": item.get("tokenName"),
                    "provider": self.provider_id,
                    "type": "TOKEN_TRANSFER"
                })
            return transfers

        return []
