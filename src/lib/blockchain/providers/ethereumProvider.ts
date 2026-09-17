/**
 * CHAINTRACE // Ethereum Real Blockchain Provider
 * Connects to Etherscan API and Ethereum JSON-RPC endpoints.
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

interface EtherscanTxResponse {
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

export class EthereumProvider extends BaseBlockchainProvider {
  readonly id = 'ethereum-provider';
  readonly name = 'Ethereum Network (Etherscan / RPC)';
  readonly chain: NormalizedChain = 'ethereum';

  private apiKey: string;
  private rpcUrl: string;
  private apiUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.ETHEREUM_API_KEY || '';
    this.rpcUrl = process.env.ETHEREUM_RPC_URL || 'https://cloudflare-eth.com';
    this.apiUrl = 'https://api.etherscan.io/api';
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    const clean = address.trim();
    return /^0x[a-fA-F0-9]{40}$/.test(clean);
  }

  async getBalance(address: string): Promise<BalanceResult> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Ethereum address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    // Try Etherscan if API key is provided
    if (this.apiKey) {
      try {
        const url = `${this.apiUrl}?module=account&action=balance&address=${clean}&tag=latest&apikey=${this.apiKey}`;
        const data = await this.fetchWithRetry<{ status: string; message: string; result: string }>(url);
        if (data.status === '1' && data.result) {
          const wei = BigInt(data.result);
          const eth = Number(wei) / 1e18;
          return {
            raw: data.result,
            formatted: eth.toFixed(4),
            symbol: 'ETH',
          };
        }
      } catch (err) {
        if (err instanceof BlockchainError && err.code === 'RATE_LIMITED') throw err;
        // Fall back to JSON-RPC below
      }
    }

    // Public JSON-RPC fallback
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
        const eth = Number(wei) / 1e18;
        return {
          raw: wei.toString(),
          formatted: eth.toFixed(4),
          symbol: 'ETH',
        };
      }
    } catch (rpcErr) {
      if (rpcErr instanceof BlockchainError) throw rpcErr;
    }

    // If both failed and no API key configured
    if (!this.apiKey) {
      throw new BlockchainError(
        'API_CONFIGURATION_ERROR',
        'ETHEREUM_API_KEY is not configured and Ethereum RPC was unavailable.',
        { chain: this.chain, address }
      );
    }

    throw new BlockchainError('PROVIDER_UNAVAILABLE', 'Could not retrieve Ethereum balance from provider.', {
      chain: this.chain,
      address,
    });
  }

  async getTransactions(address: string, limit = 25): Promise<NormalizedTransaction[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Ethereum address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    if (!this.apiKey) {
      throw new BlockchainError(
        'API_CONFIGURATION_ERROR',
        'Live Ethereum transaction ledger indexing requires ETHEREUM_API_KEY. Configure this in your environment.',
        { chain: this.chain, address }
      );
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}?module=account&action=txlist&address=${clean}&startblock=0&endblock=99999999&page=1&offset=${clampedLimit}&sort=desc&apikey=${this.apiKey}`;

    const data = await this.fetchWithRetry<EtherscanTxResponse>(url);

    if (data.status === '0' && data.message.includes('No transactions found')) {
      return [];
    }

    if (data.status !== '1' || !Array.isArray(data.result)) {
      if (data.message && data.message.toLowerCase().includes('rate limit')) {
        throw new BlockchainError('RATE_LIMITED', 'Etherscan API rate limit reached.', {
          chain: this.chain,
          address,
        });
      }
      throw new BlockchainError(
        'PROVIDER_UNAVAILABLE',
        `Etherscan API query error: ${data.message || 'Unknown error'}`,
        { chain: this.chain, address }
      );
    }

    return data.result.map((tx) => this.normalizeTransaction(tx, clean));
  }

  async getTokenTransfers(address: string, limit = 25): Promise<NormalizedTokenTransfer[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Ethereum address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    if (!this.apiKey) {
      // Token transfer lookup requires explorer key
      return [];
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}?module=account&action=tokentx&address=${clean}&page=1&offset=${clampedLimit}&sort=desc&apikey=${this.apiKey}`;

    try {
      const data = await this.fetchWithRetry<EtherscanTxResponse>(url);
      if (data.status === '1' && Array.isArray(data.result)) {
        return data.result.map((tx) => {
          const decimals = parseInt(tx.tokenDecimal || '18', 10);
          const divisor = 10 ** Math.min(decimals, 18);
          const amountNum = Number(BigInt(tx.value || '0')) / divisor;

          return {
            transactionHash: tx.hash,
            chain: 'ethereum',
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
      // Non-fatal for token transfers
    }

    return [];
  }

  async getTransaction(hash: string): Promise<NormalizedTransaction | null> {
    const cleanHash = (hash || '').trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(cleanHash)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Ethereum transaction hash: ${hash}`, {
        chain: this.chain,
      });
    }

    // Try Etherscan if API key available
    if (this.apiKey) {
      const url = `${this.apiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${cleanHash}&apikey=${this.apiKey}`;
      const data = await this.fetchWithRetry<{ result?: { hash: string; from: string; to: string; value: string; blockNumber: string } }>(url);
      if (data.result && data.result.hash) {
        const raw = data.result;
        return {
          hash: raw.hash,
          chain: 'ethereum',
          timestamp: Math.floor(Date.now() / 1000),
          blockNumber: parseInt(raw.blockNumber, 16) || 0,
          from: raw.from,
          to: raw.to,
          asset: 'ETH',
          amount: (Number(BigInt(raw.value || '0')) / 1e18).toFixed(4),
          status: 'CONFIRMED',
        };
      }
    }

    // Public JSON-RPC
    const rpcPayload = {
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [cleanHash],
      id: 1,
    };

    const res = await this.fetchWithRetry<{ result?: { hash: string; from: string; to: string; value: string; blockNumber: string } }>(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayload),
    });

    if (res.result) {
      const raw = res.result;
      return {
        hash: raw.hash,
        chain: 'ethereum',
        timestamp: Math.floor(Date.now() / 1000),
        blockNumber: parseInt(raw.blockNumber, 16) || 0,
        from: raw.from,
        to: raw.to,
        asset: 'ETH',
        amount: (Number(BigInt(raw.value || '0')) / 1e18).toFixed(4),
        status: 'CONFIRMED',
      };
    }

    return null;
  }

  async getAddressActivity(address: string): Promise<AddressActivity> {
    const balance = await this.getBalance(address);
    let txs: NormalizedTransaction[] = [];
    try {
      txs = await this.getTransactions(address, 10);
    } catch {
      // Continue if history fails or requires key
    }

    const firstSeen = txs.length > 0 ? txs[txs.length - 1].timestamp : undefined;
    const lastActive = txs.length > 0 ? txs[0].timestamp : undefined;

    return {
      address,
      chain: 'ethereum',
      balance,
      totalTransactions: txs.length,
      firstSeenTimestamp: firstSeen,
      lastActiveTimestamp: lastActive,
    };
  }

  private normalizeTransaction(
    raw: EtherscanTxResponse['result'][0],
    targetAddress: string
  ): NormalizedTransaction {
    const valWei = BigInt(raw.value || '0');
    const ethAmount = (Number(valWei) / 1e18).toFixed(4);

    const gasUsed = BigInt(raw.gasUsed || '0');
    const gasPrice = BigInt(raw.gasPrice || '0');
    const feeEth = (Number(gasUsed * gasPrice) / 1e18).toFixed(6);

    const isOutgoing = raw.from.toLowerCase() === targetAddress.toLowerCase();
    const isIncoming = raw.to.toLowerCase() === targetAddress.toLowerCase();

    return {
      hash: raw.hash,
      chain: 'ethereum',
      timestamp: parseInt(raw.timeStamp, 10),
      blockNumber: parseInt(raw.blockNumber, 10),
      from: raw.from,
      to: raw.to,
      asset: 'ETH',
      amount: ethAmount,
      fee: `${feeEth} ETH`,
      status: raw.isError === '0' ? 'CONFIRMED' : 'FAILED',
      direction: isOutgoing && isIncoming ? 'SELF' : isOutgoing ? 'OUTGOING' : 'INCOMING',
      metadata: {
        gasUsed: raw.gasUsed,
        gasPrice: raw.gasPrice,
      },
    };
  }
}
