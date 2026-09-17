/**
 * CHAINTRACE // Blockchain Provider Registry & Factory
 */

import { BlockchainProvider, NormalizedChain } from './types';
import { BlockchainError } from './errors';
import { EthereumProvider } from './providers/ethereumProvider';
import { TronProvider } from './providers/tronProvider';
import { PolygonProvider } from './providers/polygonProvider';
import { BscProvider, BitcoinProvider, SolanaProvider } from './providers/stubs';
import { DemoBlockchainProvider } from './demo/demoProvider';

const CHAIN_ALIASES: Record<string, NormalizedChain> = {
  ethereum: 'ethereum',
  eth: 'ethereum',
  erc20: 'ethereum',
  tron: 'tron',
  trx: 'tron',
  trc20: 'tron',
  polygon: 'polygon',
  matic: 'polygon',
  pol: 'polygon',
  bsc: 'bsc',
  bnb: 'bsc',
  'bnb chain': 'bsc',
  bitcoin: 'bitcoin',
  btc: 'bitcoin',
  solana: 'solana',
  sol: 'solana',
};

export const SUPPORTED_LIVE_CHAINS: ReadonlyArray<NormalizedChain> = [
  'ethereum',
  'tron',
  'polygon',
];

export const SCHEDULED_FUTURE_CHAINS: ReadonlyArray<NormalizedChain> = [
  'bsc',
  'bitcoin',
  'solana',
];

/**
 * Normalizes input string to canonical NormalizedChain identifier.
 */
export function normalizeChainName(chain: string): NormalizedChain | null {
  if (!chain || typeof chain !== 'string') return null;
  const clean = chain.trim().toLowerCase();
  return CHAIN_ALIASES[clean] || null;
}

/**
 * Factory to retrieve provider for the specified chain.
 * Throws UNSUPPORTED_CHAIN if chain is unknown or not supported in live mode.
 */
export function getBlockchainProvider(
  chainInput: string,
  forceDemo = false
): BlockchainProvider {
  const normalized = normalizeChainName(chainInput);

  if (!normalized) {
    throw new BlockchainError(
      'UNSUPPORTED_CHAIN',
      `Unsupported blockchain network '${chainInput}'. Supported live networks: ${SUPPORTED_LIVE_CHAINS.join(', ')}.`,
      { chain: chainInput }
    );
  }

  if (forceDemo) {
    return new DemoBlockchainProvider(normalized);
  }

  switch (normalized) {
    case 'ethereum':
      return new EthereumProvider();
    case 'tron':
      return new TronProvider();
    case 'polygon':
      return new PolygonProvider();
    case 'bsc':
      return new BscProvider();
    case 'bitcoin':
      return new BitcoinProvider();
    case 'solana':
      return new SolanaProvider();
    default:
      throw new BlockchainError(
        'UNSUPPORTED_CHAIN',
        `Unsupported blockchain network: ${chainInput}`,
        { chain: chainInput }
      );
  }
}
