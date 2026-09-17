from typing import Dict, Any, Optional, Tuple
from web3 import Web3
from app.core.config import settings

class Web3BlockchainService:
    def __init__(self):
        self.providers: Dict[str, Web3] = {
            'ethereum': Web3(Web3.HTTPProvider(settings.ETH_RPC_URL, request_kwargs={'timeout': 10})),
            'polygon': Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL, request_kwargs={'timeout': 10}))
        }

    def get_web3(self, chain: str) -> Optional[Web3]:
        normalized = chain.lower().strip()
        if normalized in ['eth', 'ethereum', 'mainnet']:
            return self.providers['ethereum']
        if normalized in ['polygon', 'matic', 'polygon-pos']:
            return self.providers['polygon']
        return None

    def validate_and_checksum_address(self, address: str, chain: str = 'ethereum') -> Tuple[bool, Optional[str], Optional[str]]:
        w3 = self.get_web3(chain)
        if not w3:
            return False, None, f'Unsupported chain {chain} for Web3.py validation'
        
        try:
            if not Web3.is_address(address):
                return False, None, 'String is not a valid 20-byte hex address'
            
            checksum = Web3.to_checksum_address(address)
            return True, checksum, None
        except Exception as e:
            return False, None, str(e)

    def get_balance(self, address: str, chain: str = 'ethereum') -> Dict[str, Any]:
        valid, checksum, err = self.validate_and_checksum_address(address, chain)
        if not valid or not checksum:
            raise ValueError(f'Invalid address: {err}')

        w3 = self.get_web3(chain)
        symbol = 'MATIC' if 'polygon' in chain.lower() else 'ETH'
        
        try:
            if not w3.is_connected():
                return {
                    'address': checksum,
                    'chain': chain,
                    'balance_native': 0.0,
                    'symbol': symbol,
                    'connected': False,
                    'is_contract': False,
                    'source': 'web3.py (offline fallback)'
                }

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
            return {
                'address': checksum,
                'chain': chain,
                'balance_native': 0.0,
                'symbol': symbol,
                'error': str(e),
                'is_contract': False,
                'connected': False,
                'source': 'web3.py (error fallback)'
            }

web3_service = Web3BlockchainService()
