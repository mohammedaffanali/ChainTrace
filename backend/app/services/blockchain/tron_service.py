import re
from typing import Dict, Any, Optional, Tuple
import httpx
from app.core.config import settings

class TronBlockchainService:
    BASE58_REGEX = re.compile(r'^T[1-9A-HJ-NP-Za-km-z]{33}$')

    def __init__(self):
        self.api_url = settings.TRON_FULL_NODE_URL
        self.api_key = settings.TRONGRID_API_KEY

    def validate_address(self, address: str) -> Tuple[bool, Optional[str]]:
        if not address:
            return False, 'Address cannot be empty'
        if not self.BASE58_REGEX.match(address):
            return False, 'Invalid Tron Base58 address format'
        return True, None

    async def get_account(self, address: str) -> Dict[str, Any]:
        valid, err = self.validate_address(address)
        if not valid:
            raise ValueError(f'Invalid Tron address: {err}')

        headers = {'Accept': 'application/json'}
        if self.api_key:
            headers['TRON-PRO-API-KEY'] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(f'{self.api_url}/v1/accounts/{address}', headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get('data') and len(data['data']) > 0:
                        acc = data['data'][0]
                        balance_sun = acc.get('balance', 0)
                        return {
                            'address': address,
                            'chain': 'tron',
                            'balance_native': balance_sun / 1000000.0,
                            'symbol': 'TRX',
                            'connected': True,
                            'source': 'trongrid'
                        }
        except Exception:
            pass

        return {
            'address': address,
            'chain': 'tron',
            'balance_native': 0.0,
            'symbol': 'TRX',
            'connected': False,
            'source': 'trongrid fallback'
        }

tron_service = TronBlockchainService()