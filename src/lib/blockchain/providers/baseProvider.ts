/**
 * CHAINTRACE // Abstract Base Blockchain Provider
 * Handles HTTP requests, exponential backoff retries, timeouts, and error mapping.
 */

import {
  BlockchainProvider,
  NormalizedChain,
  NormalizedTransaction,
  NormalizedTokenTransfer,
  BalanceResult,
  AddressActivity,
} from '../types';
import { BlockchainError } from '../errors';

export abstract class BaseBlockchainProvider implements BlockchainProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly chain: NormalizedChain;

  protected timeoutMs: number;
  protected maxRetries: number;

  constructor(options?: { timeoutMs?: number; maxRetries?: number }) {
    this.timeoutMs = options?.timeoutMs ?? 10000; // 10s default timeout
    this.maxRetries = options?.maxRetries ?? 2;
  }

  abstract validateAddress(address: string): boolean;
  abstract getBalance(address: string): Promise<BalanceResult>;
  abstract getTransactions(address: string, limit?: number): Promise<NormalizedTransaction[]>;
  abstract getTokenTransfers(address: string, limit?: number): Promise<NormalizedTokenTransfer[]>;
  abstract getTransaction(hash: string): Promise<NormalizedTransaction | null>;
  abstract getAddressActivity(address: string): Promise<AddressActivity>;

  /**
   * Resilient HTTP fetch with timeout and exponential backoff retry.
   */
  protected async fetchWithRetry<T>(
    url: string,
    init?: RequestInit,
    retries = this.maxRetries
  ): Promise<T> {
    let attempt = 0;
    let delay = 500;

    while (attempt <= retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ChainTrace-Forensics/2.6',
            ...(init?.headers || {}),
          },
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          if (attempt < retries) {
            await this.sleep(delay);
            delay *= 2;
            attempt++;
            continue;
          }
          throw new BlockchainError(
            'RATE_LIMITED',
            `Rate limit exceeded on provider ${this.name}. Please wait before retrying.`,
            { chain: this.chain, statusCode: 429 }
          );
        }

        if (!response.ok) {
          const status = response.status;
          if (status >= 500 && attempt < retries) {
            await this.sleep(delay);
            delay *= 2;
            attempt++;
            continue;
          }
          const text = await response.text().catch(() => '');
          throw new BlockchainError(
            'PROVIDER_UNAVAILABLE',
            `Provider ${this.name} returned HTTP ${status}: ${text.slice(0, 200)}`,
            { chain: this.chain, statusCode: status >= 500 ? 502 : status }
          );
        }

        const data = await response.json();
        return data as T;
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof BlockchainError) {
          throw err;
        }

        const isAbort = (err as { name?: string })?.name === 'AbortError';
        if (attempt < retries) {
          await this.sleep(delay);
          delay *= 2;
          attempt++;
          continue;
        }

        throw new BlockchainError(
          'PROVIDER_UNAVAILABLE',
          isAbort
            ? `Request to provider ${this.name} timed out after ${this.timeoutMs}ms.`
            : `Network error reaching ${this.name}: ${(err as Error)?.message || 'Unknown network error'}`,
          { chain: this.chain, statusCode: 504 }
        );
      }
    }

    throw new BlockchainError(
      'PROVIDER_UNAVAILABLE',
      `Exhausted retries connecting to ${this.name}`,
      { chain: this.chain, statusCode: 502 }
    );
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  protected clampLimit(limit?: number, defaultLimit = 25, maxLimit = 100): number {
    if (!limit || limit <= 0) return defaultLimit;
    return Math.min(limit, maxLimit);
  }
}
