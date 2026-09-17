/**
 * CHAINTRACE // Simulated Demo Blockchain Provider
 * Implements BlockchainProvider for demonstration mode without making external network calls.
 */

import {
  BlockchainProvider,
  NormalizedChain,
  NormalizedTransaction,
  NormalizedTokenTransfer,
  BalanceResult,
  AddressActivity,
} from '../types';
import {
  DEMO_NORMALIZED_TRANSACTIONS,
  DEMO_NORMALIZED_TRANSFERS,
  getDemoBalance,
  getDemoActivity,
} from './demoData';

export class DemoBlockchainProvider implements BlockchainProvider {
  readonly id = 'demo-provider';
  readonly name = 'ChainTrace Controlled Demonstration Indexer';
  readonly chain: NormalizedChain;

  constructor(chain: NormalizedChain = 'ethereum') {
    this.chain = chain;
  }

  validateAddress(address: string): boolean {
    const clean = (address || '').trim();
    if (!clean) return false;
    // Lenient syntax validation in demo mode
    return (
      clean.startsWith('0x') ||
      clean.startsWith('T') ||
      clean.startsWith('bc1') ||
      clean.startsWith('1') ||
      clean.startsWith('3') ||
      clean.length >= 26
    );
  }

  async getBalance(address: string): Promise<BalanceResult> {
    return getDemoBalance(address, this.chain);
  }

  async getTransactions(address: string, limit = 25): Promise<NormalizedTransaction[]> {
    const lower = (address || '').trim().toLowerCase();
    const specific = DEMO_NORMALIZED_TRANSACTIONS[lower];
    if (specific) {
      return specific.slice(0, limit);
    }

    // Generate deterministic demo transactions for arbitrary input address
    const syntheticTxs: NormalizedTransaction[] = [
      {
        hash: `0x${Array.from({ length: 64 }, (_, i) => ((i * 7 + address.length) % 16).toString(16)).join('')}`,
        chain: this.chain,
        timestamp: Math.floor(Date.now() / 1000) - 1200,
        blockNumber: 19842100,
        from: address,
        to: '0x38b25A89d120B44e3bAc19777E576921319fe9A1',
        asset: this.chain === 'tron' ? 'USDT' : this.chain === 'polygon' ? 'POL' : 'ETH',
        amount: '12500.00',
        fiatValue: { currency: 'INR', amount: 1112500, formatted: '₹11,12,500' },
        fee: '0.0021 ETH',
        status: 'CONFIRMED',
        direction: 'OUTGOING',
        metadata: { demoTag: 'Synthetic Forensic Record', verifiedInSimulation: true },
      },
    ];

    return syntheticTxs.slice(0, limit);
  }

  async getTokenTransfers(address: string, limit = 25): Promise<NormalizedTokenTransfer[]> {
    const lower = (address || '').trim().toLowerCase();
    const specific = DEMO_NORMALIZED_TRANSFERS[lower];
    if (specific) {
      return specific.slice(0, limit);
    }
    return [];
  }

  async getTransaction(hash: string): Promise<NormalizedTransaction | null> {
    const cleanHash = (hash || '').trim().toLowerCase();
    for (const txList of Object.values(DEMO_NORMALIZED_TRANSACTIONS)) {
      const found = txList.find((t) => t.hash.toLowerCase() === cleanHash);
      if (found) return found;
    }
    return null;
  }

  async getAddressActivity(address: string): Promise<AddressActivity> {
    return getDemoActivity(address, this.chain);
  }
}
