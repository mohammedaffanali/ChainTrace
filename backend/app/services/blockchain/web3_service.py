from typing import Dict, Any, Optional, Tuple, List
from web3 import Web3
from app.core.config import settings

ETH_RPCS = [
    settings.ETH_RPC_URL,
    "https://eth.llamarpc.com",
    "https://rpc.ankr.com/eth",
    "https://cloudflare-eth.com"
]

POLYGON_RPCS = [
    settings.POLYGON_RPC_URL,
    "https://polygon-rpc.com",
    "https://rpc.ankr.com/polygon"
]

class Web3BlockchainService:
    def __init__(self):
        self.providers: Dict[str, List[Web3]] = {
            'ethereum': [Web3(Web3.HTTPProvider(url, request_kwargs={'timeout': 8})) for url in ETH_RPCS if url],
            'polygon': [Web3(Web3.HTTPProvider(url, request_kwargs={'timeout': 8})) for url in POLYGON_RPCS if url]
        }

    def get_web3(self, chain: str) -> Optional[Web3]:
        w3_list = self.get_web3_list(chain)
        return w3_list[0] if w3_list else None

    def get_web3_list(self, chain: str) -> List[Web3]:
        normalized = chain.lower().strip()
        if normalized in ['eth', 'ethereum', 'mainnet']:
            return self.providers.get('ethereum', [])
        if normalized in ['polygon', 'matic', 'polygon-pos']:
            return self.providers.get('polygon', [])
        return []

    def validate_and_checksum_address(self, address: str, chain: str = 'ethereum') -> Tuple[bool, Optional[str], Optional[str]]:
        if not address or not isinstance(address, str):
            return False, None, 'Address string is empty or invalid'
        try:
            if not Web3.is_address(address.strip()):
                return False, None, 'String is not a valid 20-byte hex address'
            checksum = Web3.to_checksum_address(address.strip())
            return True, checksum, None
        except Exception as e:
            return False, None, str(e)

    def get_balance(self, address: str, chain: str = 'ethereum') -> Dict[str, Any]:
        valid, checksum, err = self.validate_and_checksum_address(address, chain)
        if not valid or not checksum:
            raise ValueError(f'Invalid address: {err}')

        w3_list = self.get_web3_list(chain)
        symbol = 'MATIC' if 'polygon' in chain.lower() else 'ETH'
        
        last_err = None
        for w3 in w3_list:
            try:
                wei_balance = w3.eth.get_balance(checksum)
                ether_balance = float(Web3.from_wei(wei_balance, 'ether'))
                code = w3.eth.get_code(checksum)
                is_contract = len(code) > 0
                block_number = w3.eth.block_number

                return {
                    'address': checksum,
                    'chain': chain,
                    'balance_native': ether_balance,
                    'symbol': symbol,
                    'block_number': block_number,
                    'is_contract': is_contract,
                    'connected': True,
                    'source': 'web3.py'
                }
            except Exception as e:
                last_err = e
                continue

        return {
            'address': checksum,
            'chain': chain,
            'balance_native': 0.0,
            'symbol': symbol,
            'error': str(last_err),
            'is_contract': False,
            'connected': False,
            'source': 'web3.py (rpc failure)'
        }

web3_service = Web3BlockchainService()
