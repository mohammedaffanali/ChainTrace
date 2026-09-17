import os
import json
from typing import Dict, Any, List, Optional
from app.core.config import settings

class VaspDatabaseService:
    def __init__(self):
        self.data_path = settings.VASP_DATA_PATH
        self.vasps: Dict[str, Any] = {}
        self.addresses: Dict[str, Any] = {}
        self.clusters: Dict[str, Any] = {}
        self.load_data()

    def load_data(self):
        if not os.path.exists(self.data_path):
            self._load_fallback_seed()
            return
        
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                raw = json.load(f)
                self.vasps = {v['id']: v for v in raw.get('vasps', [])}
                self.clusters = {c['id']: c for c in raw.get('clusters', [])}
                self.addresses = {}
                for addr in raw.get('addresses', []):
                    c = addr.get('chain', 'ethereum').lower()
                    a = addr['address'].lower() if c in ['ethereum', 'polygon'] else addr['address']
                    self.addresses[f"{c}:{a}"] = addr
        except Exception:
            self._load_fallback_seed()

    def _load_fallback_seed(self):
        self.vasps = {
            'vasp_coindcx': {
                'id': 'vasp_coindcx',
                'name': 'CoinDCX (Neblio Technologies Pvt. Ltd.)',
                'legalName': 'Neblio Technologies Private Limited',
                'jurisdiction': 'IN',
                'fiuStatus': 'REGISTERED',
                'fiuRegistrationNumber': 'FIU-IND/2023/VASP-0021'
            },
            'vasp_wazirx': {
                'id': 'vasp_wazirx',
                'name': 'WazirX (Zanmai Labs Pvt. Ltd.)',
                'legalName': 'Zanmai Labs Private Limited',
                'jurisdiction': 'IN',
                'fiuStatus': 'REGISTERED',
                'fiuRegistrationNumber': 'FIU-IND/2023/VASP-0004'
            },
            'vasp_binance': {
                'id': 'vasp_binance',
                'name': 'Binance Services Holdings Ltd',
                'legalName': 'Binance Services Holdings Limited',
                'jurisdiction': 'KY',
                'fiuStatus': 'REGISTERED',
                'fiuRegistrationNumber': 'FIU-IND/2024/VASP-0048'
            }
        }
        self.addresses = {
            'ethereum:0x28c6c06298d514db089934071355e5743bf21d60': {
                'id': 'addr_binance_hot',
                'vaspId': 'vasp_binance',
                'address': '0x28c6c06298d514db089934071355e5743bf21d60',
                'chain': 'ethereum',
                'addressType': 'hot_wallet',
                'confidence': 0.98
            },
            'ethereum:0xa090e606e30bd747d4e6245a1517ebe430f0057e': {
                'id': 'addr_coindcx_dep',
                'vaspId': 'vasp_coindcx',
                'address': '0xa090e606e30bd747d4e6245a1517ebe430f0057e',
                'chain': 'ethereum',
                'addressType': 'deposit',
                'confidence': 0.95
            },
            'tron:tyd5h3vi1sz2rxxg7c1qwb69zdtgyfxzrq': {
                'id': 'addr_binance_tron',
                'vaspId': 'vasp_binance',
                'address': 'TYD5H3vi1sz2rXXg7c1QWB69zdtGYFxZRQ',
                'chain': 'tron',
                'addressType': 'hot_wallet',
                'confidence': 0.95
            }
        }

    def lookup_address(self, address: str, chain: str = 'ethereum') -> Dict[str, Any]:
        c = chain.lower()
        a = address.lower() if c in ['ethereum', 'polygon'] else address
        key = f"{c}:{a}"
        
        match = self.addresses.get(key)
        if match:
            vasp = self.vasps.get(match['vaspId'], {})
            return {
                'matched': True,
                'vasp': vasp,
                'address_info': match,
                'association_type': 'KNOWN_VASP_ADDRESS',
                'confidence': match.get('confidence', 0.95)
            }
        return {
            'matched': False,
            'vasp': None,
            'address_info': None,
            'association_type': 'UNKNOWN',
            'confidence': 0.0
        }

vasp_service = VaspDatabaseService()
