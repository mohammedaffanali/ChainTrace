import re
import logging
from typing import Dict, Any, List, Optional

from app.core.config import settings
from app.providers.base import BlockchainProvider, ProviderError, InvalidAddressError

logger = logging.getLogger("chaintrace.providers.tron")

class TronGridProvider(BlockchainProvider):
    BASE58_REGEX = re.compile(r"^T[1-9A-HJ-NP-Za-km-z]{33}$")

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(provider_id="trongrid_tron", network="tron")
        self.api_url = settings.TRON_FULL_NODE_URL
        self.api_key = api_key or settings.TRONGRID_API_KEY or ""

    def validate_address(self, address: str) -> bool:
        if not address or not isinstance(address, str):
            return False
        return bool(self.BASE58_REGEX.match(address.strip()))

    def _headers(self) -> Dict[str, str]:
        headers = {"Accept": "application/json"}
        if self.api_key:
            headers["TRON-PRO-API-KEY"] = self.api_key
        return headers

    async def get_latest_block(self) -> int:
        try:
            resp = await self.execute_request("POST", f"{self.api_url}/wallet/getnowblock", headers=self._headers())
            data = resp.json()
            return int(data.get("block_header", {}).get("raw_data", {}).get("number", 0))
        except Exception as e:
            logger.warning(f"[{self.provider_id}] Failed to fetch latest block: {e}")
            return 0

    async def get_native_balance(self, address: str) -> Dict[str, Any]:
        clean = address.strip()
        if not self.validate_address(clean):
            raise InvalidAddressError(f"Address '{address}' is not a valid Tron Base58 address", self.provider_id)

        resp = await self.execute_request("GET", f"{self.api_url}/v1/accounts/{clean}", headers=self._headers())
        data = resp.json()
        
        balance_sun = 0
        if data.get("data") and len(data["data"]) > 0:
            balance_sun = data["data"][0].get("balance", 0)

        block = await self.get_latest_block()
        return {
            "address": clean,
            "balance": balance_sun / 1e6,
            "raw_balance": str(balance_sun),
            "symbol": "TRX",
            "block_number": block,
            "provider": self.provider_id
        }

    async def get_transactions(self, address: str, limit: int = 50, start_block: int = 0) -> List[Dict[str, Any]]:
        clean = address.strip()
        if not self.validate_address(clean):
            raise InvalidAddressError(f"Invalid Tron address: {address}", self.provider_id)

        params = {"limit": str(min(limit, 50))}
        url = f"{self.api_url}/v1/accounts/{clean}/transactions"
        resp = await self.execute_request("GET", url, headers=self._headers(), params=params)
        data = resp.json()

        txs = []
        for item in data.get("data", []):
            raw_data = item.get("raw_data", {})
            contract = raw_data.get("contract", [{}])[0]
            val_info = contract.get("parameter", {}).get("value", {})
            
            # Extract Sun value if transfer contract
            amount_sun = val_info.get("amount", 0)
            from_addr = val_info.get("owner_address", "")
            to_addr = val_info.get("to_address", "")

            txs.append({
                "raw_hash": item.get("txID"),
                "block_number": item.get("blockNumber", 0),
                "timestamp": int(raw_data.get("timestamp", 0) / 1000),
                "from": from_addr,
                "to": to_addr,
                "value_raw": str(amount_sun),
                "value_formatted": amount_sun / 1e6,
                "asset": "TRX",
                "status": "SUCCESS" if item.get("ret", [{}])[0].get("contractRet") == "SUCCESS" else "FAILED",
                "provider": self.provider_id,
                "type": "NATIVE_TRANSFER"
            })
        return txs

    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        clean = address.strip()
        if not self.validate_address(clean):
            raise InvalidAddressError(f"Invalid Tron address: {address}", self.provider_id)

        params = {"limit": str(min(limit, 50))}
        url = f"{self.api_url}/v1/accounts/{clean}/transactions/trc20"
        resp = await self.execute_request("GET", url, headers=self._headers(), params=params)
        data = resp.json()

        transfers = []
        for item in data.get("data", []):
            token_info = item.get("token_info", {})
            decimals = int(token_info.get("decimals", 6) or 6)
            val_raw = int(item.get("value", 0) or 0)

            transfers.append({
                "raw_hash": item.get("transaction_id"),
                "block_number": item.get("block_timestamp", 0), # Tron TRC20 returns timestamp
                "timestamp": int(item.get("block_timestamp", 0) / 1000),
                "from": item.get("from", ""),
                "to": item.get("to", ""),
                "value_raw": str(val_raw),
                "value_formatted": val_raw / (10 ** decimals),
                "asset": token_info.get("symbol", "USDT"),
                "token_name": token_info.get("name", "Tether USD"),
                "contract_address": token_info.get("address", ""),
                "provider": self.provider_id,
                "type": "TOKEN_TRANSFER"
            })
        return transfers
