from typing import Optional
from app.core.config import settings
from app.providers.base import (
    BlockchainProvider,
    ProviderError,
    RateLimitError,
    InvalidAddressError,
    UnsupportedNetworkError,
)
from app.providers.etherscan_provider import EtherscanProvider
from app.providers.alchemy_provider import AlchemyProvider
from app.providers.tron_provider import TronGridProvider

SUPPORTED_NETWORKS = ["ethereum", "polygon", "tron"]

def get_provider(network: str, preferred_source: Optional[str] = None) -> BlockchainProvider:
    norm = (network or "").lower().strip()
    
    if norm in ["ethereum", "eth", "mainnet"]:
        if (preferred_source == "alchemy" or not settings.ETHERSCAN_API_KEY) and settings.ALCHEMY_API_KEY:
            return AlchemyProvider(network="ethereum")
        return EtherscanProvider(network="ethereum")

    if norm in ["polygon", "matic", "polygon-pos"]:
        if (preferred_source == "alchemy" or not settings.POLYGONSCAN_API_KEY) and settings.ALCHEMY_API_KEY:
            return AlchemyProvider(network="polygon")
        return EtherscanProvider(network="polygon")

    if norm in ["tron", "trx"]:
        return TronGridProvider()

    raise UnsupportedNetworkError(
        f"Network '{network}' is not currently supported. Supported networks: {', '.join(SUPPORTED_NETWORKS)}",
        provider_id="system"
    )

__all__ = [
    "BlockchainProvider",
    "ProviderError",
    "RateLimitError",
    "InvalidAddressError",
    "UnsupportedNetworkError",
    "EtherscanProvider",
    "AlchemyProvider",
    "TronGridProvider",
    "get_provider",
    "SUPPORTED_NETWORKS",
]
