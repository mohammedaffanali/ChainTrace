/**
 * CHAINTRACE // Isolated Demonstration Datasets & Simulation Presets
 * Smart India Hackathon (SIH 2026) Demonstration Mode
 */

import { NormalizedTransaction, NormalizedTokenTransfer, BalanceResult, AddressActivity } from '../types';

export type DemoChain = 'AUTO' | 'BITCOIN' | 'ETHEREUM' | 'TRON' | 'BNB CHAIN' | 'SOLANA' | 'POLYGON';

export const PRIMARY_DEMO_WALLET = {
  address: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
  displayAddress: '0x7A91...4F82',
  chain: 'TRON' as DemoChain,
  label: 'Simulated Syndicate Transit Terminal (Demo Target)',
};

export const TRON_HAWALA_WALLET = {
  address: 'TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999',
  displayAddress: 'TWk93zM...9xLt',
  chain: 'TRON' as DemoChain,
  label: 'High-Velocity USDT Mule Wallet',
};

export const BTC_WASABI_WALLET = {
  address: 'bc1q9v8h2kmz34pp78qwlk4xx00124w98e',
  displayAddress: 'bc1q9v8...w98e',
  chain: 'BITCOIN' as DemoChain,
  label: 'Wasabi CoinJoin Peel Aggregator (Mixer Obfuscation)',
};

export const REFUSAL_PEEL_WALLET = {
  address: '0x0000dead0000000000000000000000000000beef',
  displayAddress: '0x0000...beef',
  chain: 'ETHEREUM' as DemoChain,
  label: 'Mixer Obfuscated Peel Chain (Insufficient Evidence)',
};

export const REFUSAL_DORMANT_WALLET = {
  address: '0x1111222233334444555566667777888899990000',
  displayAddress: '0x1111...0000',
  chain: 'POLYGON' as DemoChain,
  label: 'Dormant Isolated Wallet (No Reachable VASP)',
};

export const REFUSAL_SOLANA_WALLET = {
  address: '11111111111111111111111111111111',
  displayAddress: '111111...1111',
  chain: 'SOLANA' as DemoChain,
  label: 'Unattributed Burn / System Address (No VASP Attribution)',
};

export const DEMO_PIPELINE_STAGES = [
  { id: 1, code: '01', title: 'WALLET IDENTIFIED', description: 'Address syntax, checksum & protocol validation', status: 'COMPLETED', latencyMs: 120 },
  { id: 2, code: '02', title: 'BLOCKCHAIN TRANSACTIONS', description: 'Querying mempool indexers & block receipts', status: 'COMPLETED', latencyMs: 240 },
  { id: 3, code: '03', title: 'TRANSACTION PATHS', description: 'Directed acyclic graph traversal across hops', status: 'COMPLETED', latencyMs: 310 },
  { id: 4, code: '04', title: 'MULTI-HOP RELATIONSHIPS', description: 'Calculating shortest distance to known liquidity exits', status: 'COMPLETED', latencyMs: 280 },
  { id: 5, code: '05', title: 'WALLET CLUSTERS', description: 'Common-input & change-address heuristic expansion', status: 'COMPLETED', latencyMs: 400 },
  { id: 6, code: '06', title: 'DEPOSIT ADDRESSES', description: 'Matching static hot/cold deposit patterns of VASPs', status: 'COMPLETED', latencyMs: 350 },
  { id: 7, code: '07', title: 'VASP CANDIDATES', description: 'Ranking registered & offshore VASP counterparty nodes', status: 'COMPLETED', latencyMs: 220 },
  { id: 8, code: '08', title: 'CONFIDENCE ANALYSIS', description: 'Multi-variable probabilistic weight distribution', status: 'COMPLETED', latencyMs: 180 },
  { id: 9, code: '09', title: 'ATTRIBUTION COMPLETE', description: 'Evidentiary trail synthesized with tamper-proof checksum', status: 'COMPLETED', latencyMs: 110 },
];

export const DEMO_NORMALIZED_TRANSACTIONS: Record<string, NormalizedTransaction[]> = {
  // Primary Demo Wallet transactions
  '0x7a91bc84d2697e88b209eb0eac821639d4a44f82': [
    {
      hash: '0x8f3c4b9e2a1d7f6c5e8b4a3d2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
      chain: 'tron',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      blockNumber: 58291044,
      from: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
      to: 'TWz55mP8xK2Ls4998mP104928114qRt',
      asset: 'USDT',
      tokenAddress: 'TR7NHqJEKQxGTCi8q8ZY4pL8otSzgjLj6t',
      amount: '250000.00',
      fiatValue: { currency: 'INR', amount: 22250000, formatted: '₹2,22,50,000' },
      fee: '14.2 TRX',
      status: 'CONFIRMED',
      direction: 'OUTGOING',
      metadata: { simulatedHop: 1, tag: 'Mule Intercept Layer' },
    },
    {
      hash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
      chain: 'tron',
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      blockNumber: 58289800,
      from: '0x12a9c4d8e7f6b5a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      to: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
      asset: 'USDT',
      tokenAddress: 'TR7NHqJEKQxGTCi8q8ZY4pL8otSzgjLj6t',
      amount: '250000.00',
      fiatValue: { currency: 'INR', amount: 22250000, formatted: '₹2,22,50,000' },
      fee: '12.8 TRX',
      status: 'CONFIRMED',
      direction: 'INCOMING',
      metadata: { simulatedHop: 0, tag: 'Syndicate Funding Inflow' },
    },
  ],

  // Tron Hawala Mule transactions
  'twk93zm2sk8qp6v1nrt8lpx9xlt44zy999': [
    {
      hash: '0x12a9c4d8e7f6b5a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
      chain: 'tron',
      timestamp: Math.floor(Date.now() / 1000) - 1800,
      blockNumber: 58292410,
      from: 'TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999',
      to: '0x38b25A89d120B44e3bAc19777E576921319fe9A1',
      asset: 'USDT',
      tokenAddress: 'TR7NHqJEKQxGTCi8q8ZY4pL8otSzgjLj6t',
      amount: '450000.00',
      fiatValue: { currency: 'INR', amount: 40050000, formatted: '₹4,00,50,000' },
      fee: '18.4 TRX',
      status: 'CONFIRMED',
      direction: 'OUTGOING',
      metadata: { simulatedHop: 1, tag: 'HTX Offshore Hot Vault Sweep' },
    },
  ],
};

export const DEMO_NORMALIZED_TRANSFERS: Record<string, NormalizedTokenTransfer[]> = {
  '0x7a91bc84d2697e88b209eb0eac821639d4a44f82': [
    {
      transactionHash: '0x8f3c4b9e2a1d7f6c5e8b4a3d2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
      chain: 'tron',
      token: 'USDT',
      tokenAddress: 'TR7NHqJEKQxGTCi8q8ZY4pL8otSzgjLj6t',
      from: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
      to: 'TWz55mP8xK2Ls4998mP104928114qRt',
      amount: '250000.00',
      timestamp: Math.floor(Date.now() / 1000) - 3600,
    },
  ],
};

export function getDemoBalance(address: string, chain = 'ethereum'): BalanceResult {
  const lower = address.toLowerCase();
  if (lower.includes('0x7a91')) {
    return { raw: '2815400000000000000000', formatted: '2,815.40', symbol: 'USDT', fiatValueINR: '₹28,15,40,000' };
  }
  if (lower.startsWith('twk')) {
    return { raw: '3160000000000', formatted: '3,160.00', symbol: 'TRX', fiatValueINR: '₹28,15,40,000' };
  }
  if (lower.startsWith('bc1')) {
    return { raw: '385000000', formatted: '3.85', symbol: 'BTC', fiatValueINR: '₹16,90,00,000' };
  }

  // Dynamic fallback for any other address
  let seed = 0;
  for (let i = 0; i < address.length; i++) seed = (seed << 5) - seed + address.charCodeAt(i);
  const val = (Math.abs(seed) % 150 + 1.25).toFixed(4);
  return {
    raw: val,
    formatted: val,
    symbol: chain === 'tron' ? 'TRX' : chain === 'polygon' ? 'POL' : 'ETH',
    fiatValueINR: `₹${((Math.abs(seed) % 80) + 5).toFixed(2)} Lakh`,
  };
}

export function getDemoActivity(address: string, chain = 'ethereum'): AddressActivity {
  const balance = getDemoBalance(address, chain);
  const lower = address.toLowerCase();
  const txs = DEMO_NORMALIZED_TRANSACTIONS[lower] || [];

  return {
    address,
    chain,
    balance,
    totalTransactions: Math.max(txs.length, 14),
    firstSeenTimestamp: Math.floor(Date.now() / 1000) - 86400 * 45,
    lastActiveTimestamp: Math.floor(Date.now() / 1000) - 120,
    totalIncomingVolume: '₹42,85,40,000',
    totalOutgoingVolume: '₹38,20,10,000',
    isContract: address.startsWith('0x') && address.endsWith('0'),
  };
}
