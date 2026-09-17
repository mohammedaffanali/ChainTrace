import asyncio
import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger("chaintrace.providers")

class ProviderError(Exception):
    def __init__(self, message: str, provider_id: str = "unknown", status_code: int = 500, raw: Optional[Any] = None):
        super().__init__(message)
        self.message = message
        self.provider_id = provider_id
        self.status_code = status_code
        self.raw = raw

    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": self.__class__.__name__,
            "message": self.message,
            "provider": self.provider_id,
            "status_code": self.status_code,
        }

class RateLimitError(ProviderError):
    def __init__(self, message: str = "Rate limit exceeded for provider", provider_id: str = "unknown", retry_after: int = 5):
        super().__init__(message=message, provider_id=provider_id, status_code=429)
        self.retry_after = retry_after

class InvalidAddressError(ProviderError):
    def __init__(self, message: str = "Invalid address format", provider_id: str = "unknown"):
        super().__init__(message=message, provider_id=provider_id, status_code=400)

class UnsupportedNetworkError(ProviderError):
    def __init__(self, message: str = "Unsupported network", provider_id: str = "unknown"):
        super().__init__(message=message, provider_id=provider_id, status_code=400)


class BlockchainProvider(ABC):
    def __init__(self, provider_id: str, network: str, timeout: float = 12.0, max_retries: int = 3):
        self.provider_id = provider_id
        self.network = network.lower().strip()
        self.timeout = timeout
        self.max_retries = max_retries

    @abstractmethod
    def validate_address(self, address: str) -> bool:
        """Validate address syntax for this provider and network."""
        pass

    @abstractmethod
    async def get_native_balance(self, address: str) -> Dict[str, Any]:
        """Fetch native balance, returns {'balance': float, 'symbol': str, 'block_number': int}."""
        pass

    @abstractmethod
    async def get_transactions(self, address: str, limit: int = 50, start_block: int = 0) -> List[Dict[str, Any]]:
        """Fetch raw transaction list for address."""
        pass

    @abstractmethod
    async def get_token_transfers(self, address: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Fetch token transfers (e.g. ERC-20 / TRC-20) for address."""
        pass

    @abstractmethod
    async def get_latest_block(self) -> int:
        """Fetch latest observed block number."""
        pass

    async def get_address_labels(self, address: str) -> Optional[Dict[str, Any]]:
        """Optional hook to fetch on-chain or provider tags if supported."""
        return None

    async def execute_request(self, method: str, url: str, **kwargs) -> httpx.Response:
        """
        Executes HTTP requests with retry handling, exponential backoff, and rate-limit detection.
        """
        retries = 0
        backoff = 0.5

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while True:
                try:
                    resp = await client.request(method, url, **kwargs)
                    
                    if resp.status_code == 429:
                        retry_after = int(resp.headers.get("Retry-After", 2))
                        if retries < self.max_retries:
                            retries += 1
                            logger.warning(f"[{self.provider_id}] Rate limit (429) hit, retrying in {retry_after}s...")
                            await asyncio.sleep(retry_after)
                            continue
                        raise RateLimitError(
                            message=f"Rate limit exceeded on {self.provider_id}",
                            provider_id=self.provider_id,
                            retry_after=retry_after
                        )

                    if resp.status_code >= 500 and retries < self.max_retries:
                        retries += 1
                        logger.warning(f"[{self.provider_id}] HTTP {resp.status_code}, retrying ({retries}/{self.max_retries}) in {backoff}s...")
                        await asyncio.sleep(backoff)
                        backoff *= 2
                        continue

                    return resp
                except httpx.TimeoutException:
                    if retries < self.max_retries:
                        retries += 1
                        await asyncio.sleep(backoff)
                        backoff *= 2
                        continue
                    raise ProviderError(
                        message=f"Request to {self.provider_id} timed out after {self.timeout}s",
                        provider_id=self.provider_id,
                        status_code=504
                    )
                except httpx.RequestError as exc:
                    if retries < self.max_retries:
                        retries += 1
                        await asyncio.sleep(backoff)
                        backoff *= 2
                        continue
                    raise ProviderError(
                        message=f"Network error contacting {self.provider_id}: {str(exc)}",
                        provider_id=self.provider_id,
                        status_code=502
                    )
