/**
 * CHAINTRACE // Polygon Real Blockchain Provider
 * Connects to Polygonscan API and Polygon JSON-RPC endpoints.
 */

import { BaseBlockchainProvider } from './baseProvider';
import {
  NormalizedChain,
  NormalizedTransaction,
  NormalizedTokenTransfer,
  BalanceResult,
  AddressActivity,
} from '../types';
import { BlockchainError } from '../errors';

interface PolygonscanTxResponse {
  status: string;
  message: string;
  result: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gas: string;
    gasPrice: string;
    gasUsed: string;
    isError: string;
    input: string;
    contractAddress?: string;
    tokenName?: string;
    tokenSymbol?: string;
    tokenDecimal?: string;
  }>;
}

export class PolygonProvider extends BaseBlockchainProvider {
  readonly id = 'polygon-provider';
  readonly name = 'Polygon PoS Network (Polygonscan / RPC)';
  readonly chain: NormalizedChain = 'polygon';

  private apiKey: string;
  private rpcUrl: string;
  private apiUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.POLYGON_API_KEY || '';
    this.rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    this.apiUrl = 'https://api.polygonscan.com/api';
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    const clean = address.trim();
    return /^0x[a-fA-F0-9]{40}$/.test(clean);
  }

  async getBalance(address: string): Promise<BalanceResult> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Polygon address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    // Try Polygonscan if API key provided
    if (this.apiKey) {
      try {
        const url = `${this.apiUrl}?module=account&action=balance&address=${clean}&tag=latest&apikey=${this.apiKey}`;
        const data = await this.fetchWithRetry<{ status: string; message: string; result: string }>(url);
        if (data.status === '1' && data.result) {
          const wei = BigInt(data.result);
          const matic = Number(wei) / 1e18;
          return {
            raw: data.result,
            formatted: matic.toFixed(4),
            symbol: 'POL',
          };
        }
      } catch (err) {
        if (err instanceof BlockchainError && err.code === 'RATE_LIMITED') throw err;
      }
    }

    // Public Polygon JSON-RPC fallback
    try {
      const rpcPayload = {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [clean, 'latest'],
        id: 1,
      };

      const res = await this.fetchWithRetry<{ result?: string; error?: { message: string } }>(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload),
      });

      if (res.result) {
        const wei = BigInt(res.result);
        const pol = Number(wei) / 1e18;
        return {
          raw: wei.toString(),
          formatted: pol.toFixed(4),
          symbol: 'POL',
        };
      }
    } catch (rpcErr) {
      if (rpcErr instanceof BlockchainError) throw rpcErr;
    }

    if (!this.apiKey) {
      throw new BlockchainError(
        'API_CONFIGURATION_ERROR',
        'POLYGON_API_KEY is not configured and Polygon RPC was unavailable.',
        { chain: this.chain, address }
      );
    }

    throw new BlockchainError('PROVIDER_UNAVAILABLE', 'Could not retrieve Polygon balance.', {
      chain: this.chain,
      address,
    });
  }

  async getTransactions(address: string, limit = 25): Promise<NormalizedTransaction[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Polygon address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    if (!this.apiKey) {
      throw new BlockchainError(
        'API_CONFIGURATION_ERROR',
        'Live Polygon transaction indexing requires POLYGON_API_KEY. Configure this in your environment.',
        { chain: this.chain, address }
      );
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}?module=account&action=txlist&address=${clean}&startblock=0&endblock=99999999&page=1&offset=${clampedLimit}&sort=desc&apikey=${this.apiKey}`;

    const data = await this.fetchWithRetry<PolygonscanTxResponse>(url);

    if (data.status === '0' && data.message.includes('No transactions found')) {
      return [];
    }

    if (data.status !== '1' || !Array.isArray(data.result)) {
      if (data.message && data.message.toLowerCase().includes('rate limit')) {
        throw new BlockchainError('RATE_LIMITED', 'Polygonscan API rate limit reached.', {
          chain: this.chain,
          address,
        });
      }
      throw new BlockchainError(
        'PROVIDER_UNAVAILABLE',
        `Polygonscan API error: ${data.message || 'Unknown error'}`,
        { chain: this.chain, address }
      );
    }

    return data.result.map((tx) => this.normalizeTransaction(tx, clean));
  }

  async getTokenTransfers(address: string, limit = 25): Promise<NormalizedTokenTransfer[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Polygon address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    if (!this.apiKey) {
      return [];
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}?module=account&action=tokentx&address=${clean}&page=1&offset=${clampedLimit}&sort=desc&apikey=${this.apiKey}`;

    try {
      const data = await this.fetchWithRetry<PolygonscanTxResponse>(url);
      if (data.status === '1' && Array.isArray(data.result)) {
        return data.result.map((tx) => {
          const decimals = parseInt(tx.tokenDecimal || '18', 10);
          const divisor = 10 ** Math.min(decimals, 18);
          const amountNum = Number(BigInt(tx.value || '0')) / divisor;

          return {
            transactionHash: tx.hash,
            chain: 'polygon',
            token: tx.tokenSymbol || 'ERC20',
            tokenAddress: tx.contractAddress || '',
            from: tx.from,
            to: tx.to,
            amount: amountNum.toFixed(4),
            timestamp: parseInt(tx.timeStamp, 10),
          };
        });
      }
    } catch {
      // Non-fatal
    }

    return [];
  }

  async getTransaction(hash: string): Promise<NormalizedTransaction | null> {
    const cleanHash = (hash || '').trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Polygon transaction hash: ${hash}`, {
        chain: this.chain,
      });
    }

    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [cleanHash],
      id: 1,
    };

    try {
      const res = await this.fetchWithRetry<{ result?: { hash: string; from: string; to: string; value: string; blockNumber: string } }>(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rpcPayload),
      });

      if (res.result) {
        const raw = res.result;
        return {
          hash: raw.hash,
          chain: 'polygon',
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: parseInt(raw.blockNumber, 16) || 0,
          from: raw.from,
          to: raw.to,
          asset: 'POL',
          amount: (Number(BigInt(raw.value || '0')) / 1e18).toFixed(4),
          status: 'CONFIRMED',
        };
      }
    } catch {
      // Return null if not found
    }

    return null;
  }

  async getAddressActivity(address: string): Promise<AddressActivity> {
    const balance = await this.getBalance(address);
    let txs: NormalizedTransaction[] = [];
    try {
      txs = await this.getTransactions(address, 10);
    } catch {
      // Non-fatal
    }

    return {
      address,
      chain: 'polygon',
      balance,
      totalTransactions: txs.length,
      firstSeenTimestamp: txs.length > 0 ? txs[txs.length - 1].timestamp : undefined,
      lastActiveTimestamp: txs.length > 0 ? txs[0].timestamp : undefined,
    };
  }

  private normalizeTransaction(
    raw: PolygonscanTxResponse['result'][0],
    targetAddress: string
  ): NormalizedTransaction {
    const valWei = BigInt(raw.value || '0');
    const polAmount = (Number(valWei) / 1e18).toFixed(4);

    const gasUsed = BigInt(raw.gasUsed || '0');
    const gasPrice = BigInt(raw.gasPrice || '0');
    const feePol = (Number(gasUsed * gasPrice) / 1e18).toFixed(6);

    const isOutgoing = raw.from.toLowerCase() === targetAddress.toLowerCase();
    const isIncoming = raw.to.toLowerCase() === targetAddress.toLowerCase();

    return {
      hash: raw.hash,
      chain: 'polygon',
      timestamp: parseInt(raw.timeStamp, 10),
      blockNumber: parseInt(raw.blockNumber, 10),
      from: raw.from,
      to: raw.to,
      asset: 'POL',
      amount: polAmount,
      fee: `${feePol} POL`,
      status: raw.isError === '0' ? 'CONFIRMED' : 'FAILED',
      direction: isOutgoing && isIncoming ? 'SELF' : isOutgoing ? 'OUTGOING' : 'INCOMING',
      metadata: {
        gasUsed: raw.gasUsed,
        gasPrice: raw.gasPrice,
      },
    };
  }
}
