/**
 * CHAINTRACE // Tron Real Blockchain Provider
 * Connects to TronGrid REST API / TronScan endpoints.
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

interface TronGridAccountResponse {
  data: Array<{
    address: string;
    balance?: number; // in SUN (1 TRX = 1e6 SUN)
    create_time?: number;
    latest_opration_time?: number;
    trc20?: Array<Record<string, string>>;
  }>;
  success: boolean;
}

interface TronGridTxResponse {
  data: Array<{
    txID: string;
    blockNumber: number;
    block_timestamp: number;
    ret?: Array<{ contractRet: string }>;
    raw_data: {
      contract: Array<{
        type: string;
        parameter: {
          value: {
            amount?: number;
            owner_address?: string;
            to_address?: string;
            contract_address?: string;
            data?: string;
          };
        };
      }>;
    };
  }>;
  success: boolean;
}

interface TronGridTrc20Response {
  data: Array<{
    transaction_id: string;
    token_info: {
      symbol: string;
      address: string;
      decimals: number;
      name: string;
    };
    block_timestamp: number;
    from: string;
    to: string;
    value: string;
  }>;
  success: boolean;
}

export class TronProvider extends BaseBlockchainProvider {
  readonly id = 'tron-provider';
  readonly name = 'Tron Network (TronGrid / TronScan)';
  readonly chain: NormalizedChain = 'tron';

  private apiKey: string;
  private apiUrl: string;

  constructor() {
    super();
    this.apiKey = process.env.TRON_API_KEY || '';
    this.apiUrl = process.env.TRON_API_URL || 'https://api.trongrid.io';
  }

  validateAddress(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    const clean = address.trim();
    // Base58Check Tron address starts with T and is 34 characters
    return /^T[1-9A-HJ-NP-za-km-z]{33}$/.test(clean);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (this.apiKey) {
      headers['TRON-PRO-API-KEY'] = this.apiKey;
    }
    return headers;
  }

  async getBalance(address: string): Promise<BalanceResult> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Tron address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    const url = `${this.apiUrl}/v1/accounts/${clean}`;
    try {
      const data = await this.fetchWithRetry<TronGridAccountResponse>(url, {
        headers: this.getHeaders(),
      });

      if (data && Array.isArray(data.data) && data.data.length > 0) {
        const account = data.data[0];
        const sun = account.balance || 0;
        const trx = sun / 1e6;
        return {
          raw: sun.toString(),
          formatted: trx.toFixed(2),
          symbol: 'TRX',
        };
      }

      // If account not yet activated on chain
      return {
        raw: '0',
        formatted: '0.00',
        symbol: 'TRX',
      };
    } catch (err) {
      if (err instanceof BlockchainError) throw err;
      throw new BlockchainError(
        'PROVIDER_UNAVAILABLE',
        `Could not retrieve Tron balance: ${(err as Error)?.message}`,
        { chain: this.chain, address }
      );
    }
  }

  async getTransactions(address: string, limit = 25): Promise<NormalizedTransaction[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Tron address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}/v1/accounts/${clean}/transactions?limit=${clampedLimit}`;

    try {
      const data = await this.fetchWithRetry<TronGridTxResponse>(url, {
        headers: this.getHeaders(),
      });

      if (!data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((tx) => this.normalizeTransaction(tx, clean));
    } catch (err) {
      if (err instanceof BlockchainError) throw err;
      throw new BlockchainError(
        'PROVIDER_UNAVAILABLE',
        `Error querying Tron transactions: ${(err as Error)?.message}`,
        { chain: this.chain, address }
      );
    }
  }

  async getTokenTransfers(address: string, limit = 25): Promise<NormalizedTokenTransfer[]> {
    const clean = address.trim();
    if (!this.validateAddress(clean)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Tron address: ${address}`, {
        chain: this.chain,
        address,
      });
    }

    const clampedLimit = this.clampLimit(limit);
    const url = `${this.apiUrl}/v1/accounts/${clean}/transactions/trc20?limit=${clampedLimit}`;

    try {
      const data = await this.fetchWithRetry<TronGridTrc20Response>(url, {
        headers: this.getHeaders(),
      });

      if (!data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((transfer) => {
        const decimals = transfer.token_info?.decimals || 6;
        const divisor = 10 ** decimals;
        const valNum = Number(BigInt(transfer.value || '0')) / divisor;

        return {
          transactionHash: transfer.transaction_id,
          chain: 'tron',
          token: transfer.token_info?.symbol || 'TRC20',
          tokenAddress: transfer.token_info?.address || '',
          from: transfer.from,
          to: transfer.to,
          amount: valNum.toFixed(2),
          timestamp: Math.floor(transfer.block_timestamp / 1000),
        };
      });
    } catch {
      return [];
    }
  }

  async getTransaction(hash: string): Promise<NormalizedTransaction | null> {
    const cleanHash = (hash || '').trim();
    if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
      throw new BlockchainError('INVALID_WALLET', `Invalid Tron transaction ID: ${hash}`, {
        chain: this.chain,
      });
    }

    const url = `${this.apiUrl}/wallet/gettransactionbyid`;
    try {
      const data = await this.fetchWithRetry<{
        txID?: string;
        raw_data?: {
          timestamp?: number;
          contract?: Array<{
            type: string;
            parameter: {
              value: {
                amount?: number;
                owner_address?: string;
                to_address?: string;
              };
            };
          }>;
        };
        ret?: Array<{ contractRet: string }>;
      }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getHeaders() },
        body: JSON.stringify({ value: cleanHash }),
      });

      if (data && data.txID) {
        const contract = data.raw_data?.contract?.[0];
        const val = contract?.parameter?.value;
        const amountSun = val?.amount || 0;
        return {
          hash: data.txID,
          chain: 'tron',
          timestamp: Math.floor((data.raw_data?.timestamp || Date.now()) / 1000),
          blockNumber: 0,
          from: val?.owner_address || '',
          to: val?.to_address || '',
          asset: 'TRX',
          amount: (amountSun / 1e6).toFixed(2),
          status: data.ret?.[0]?.contractRet === 'SUCCESS' ? 'CONFIRMED' : 'FAILED',
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
      // Continue if history fails
    }

    return {
      address,
      chain: 'tron',
      balance,
      totalTransactions: txs.length,
      firstSeenTimestamp: txs.length > 0 ? txs[txs.length - 1].timestamp : undefined,
      lastActiveTimestamp: txs.length > 0 ? txs[0].timestamp : undefined,
    };
  }

  private normalizeTransaction(
    raw: TronGridTxResponse['data'][0],
    targetAddress: string
  ): NormalizedTransaction {
    const contract = raw.raw_data?.contract?.[0];
    const val = contract?.parameter?.value;
    const amountSun = val?.amount || 0;
    const trxAmount = (amountSun / 1e6).toFixed(2);
    const fromAddr = val?.owner_address || '';
    const toAddr = val?.to_address || '';

    const isSuccess = raw.ret?.[0]?.contractRet === 'SUCCESS';

    return {
      hash: raw.txID,
      chain: 'tron',
      timestamp: Math.floor(raw.block_timestamp / 1000),
      blockNumber: raw.blockNumber || 0,
      from: fromAddr,
      to: toAddr,
      asset: 'TRX',
      amount: trxAmount,
      status: isSuccess ? 'CONFIRMED' : 'FAILED',
      direction:
        fromAddr.toLowerCase() === targetAddress.toLowerCase() ? 'OUTGOING' : 'INCOMING',
      metadata: {
        contractType: contract?.type,
      },
    };
  }
}
