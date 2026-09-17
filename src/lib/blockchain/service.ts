/**
 * CHAINTRACE // Blockchain Service Orchestrator
 * Coordinates mode selection (DEMO vs LIVE), provider routing, caching, and rate limiting.
 */

import {
  BlockchainMode,
  BlockchainQueryResult,
  NormalizedChain,
  ProviderHealth,
} from './types';
import { BlockchainError } from './errors';
import { globalBlockchainCache } from './cache';
import {
  getBlockchainProvider,
  normalizeChainName,
  SUPPORTED_LIVE_CHAINS,
} from './registry';

export class BlockchainService {
  /**
   * Resolves the configured blockchain data mode.
   * Defaults to 'demo' unless explicitly configured as 'live'.
   */
  static getSystemMode(): BlockchainMode {
    const envMode = (process.env.BLOCKCHAIN_DATA_MODE || 'demo').toLowerCase().trim();
    return envMode === 'live' ? 'live' : 'demo';
  }

  /**
   * Health & configuration status of all blockchain providers.
   */
  static getProviderStatuses(): ProviderHealth[] {
    return [
      {
        id: 'ethereum-provider',
        name: 'Ethereum Network (Etherscan / RPC)',
        chain: 'ethereum',
        status: process.env.ETHEREUM_API_KEY ? 'ONLINE' : 'CONFIG_MISSING',
        hasApiKey: Boolean(process.env.ETHEREUM_API_KEY),
      },
      {
        id: 'tron-provider',
        name: 'Tron Network (TronGrid)',
        chain: 'tron',
        status: process.env.TRON_API_KEY ? 'ONLINE' : 'ONLINE', // TronGrid free tier is public
        hasApiKey: Boolean(process.env.TRON_API_KEY),
      },
      {
        id: 'polygon-provider',
        name: 'Polygon PoS Network (Polygonscan / RPC)',
        chain: 'polygon',
        status: process.env.POLYGON_API_KEY ? 'ONLINE' : 'CONFIG_MISSING',
        hasApiKey: Boolean(process.env.POLYGON_API_KEY),
      },
    ];
  }

  /**
   * Fetches normalized blockchain intelligence for a target wallet address.
   */
  static async queryAddress(params: {
    address: string;
    chain: string;
    mode?: BlockchainMode;
    limit?: number;
    skipCache?: boolean;
  }): Promise<BlockchainQueryResult> {
    const { address, chain, skipCache = false } = params;
    const cleanAddr = (address || '').trim();

    if (!cleanAddr) {
      throw new BlockchainError('INVALID_WALLET', 'Wallet address cannot be empty.', {
        address: cleanAddr,
        chain,
      });
    }

    const normalizedChain = normalizeChainName(chain);
    if (!normalizedChain) {
      throw new BlockchainError(
        'UNSUPPORTED_CHAIN',
        `Unsupported blockchain '${chain}'. Supported networks: ${SUPPORTED_LIVE_CHAINS.join(', ')}`,
        { chain, address: cleanAddr }
      );
    }

    // Determine effective mode: explicit query mode override or system environment mode
    const systemMode = this.getSystemMode();
    const effectiveMode: BlockchainMode = params.mode || systemMode;

    // Rate-limiting check (per address)
    const rateLimitKey = `rate:${cleanAddr}`;
    if (!globalBlockchainCache.checkRateLimit(rateLimitKey, 30, 60000)) {
      throw new BlockchainError(
        'RATE_LIMITED',
        `Too many requests for address ${cleanAddr}. Please wait a moment.`,
        { chain: normalizedChain, address: cleanAddr }
      );
    }

    // Check cache
    const cacheKey = `query:${effectiveMode}:${normalizedChain}:${cleanAddr.toLowerCase()}:${params.limit || 25}`;
    if (!skipCache) {
      const cached = globalBlockchainCache.get<BlockchainQueryResult>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Retrieve provider
    const isDemo = effectiveMode === 'demo';
    const provider = getBlockchainProvider(normalizedChain, isDemo);

    // Validate wallet address syntax
    if (!provider.validateAddress(cleanAddr)) {
      throw new BlockchainError(
        'INVALID_WALLET',
        `Address '${cleanAddr}' is not a valid ${normalizedChain.toUpperCase()} address.`,
        { chain: normalizedChain, address: cleanAddr }
      );
    }

    // Query balance, activity, transactions, and token transfers in parallel
    const [balance, transactions, tokenTransfers, activity] = await Promise.all([
      provider.getBalance(cleanAddr),
      provider.getTransactions(cleanAddr, params.limit),
      provider.getTokenTransfers(cleanAddr, params.limit),
      provider.getAddressActivity(cleanAddr),
    ]);

    const result: BlockchainQueryResult = {
      mode: effectiveMode,
      chain: normalizedChain,
      address: cleanAddr,
      balance,
      activity,
      transactions,
      tokenTransfers,
      retrievedAt: new Date().toISOString(),
      isDemonstrationData: isDemo,
      providerInfo: {
        id: provider.id,
        name: provider.name,
        live: !isDemo,
      },
    };

    // Cache result
    globalBlockchainCache.set(cacheKey, result);

    return result;
  }
}
