/**
 * CHAINTRACE // Extensibility Provider Stubs
 * Architecture placeholders for BscProvider, BitcoinProvider, and SolanaProvider.
 * Scheduled for subsequent implementation phases.
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

export class BscProvider implements BlockchainProvider {
  readonly id = 'bsc-provider';
  readonly name = 'BNB Smart Chain Provider (Scheduled Phase)';
  readonly chain: NormalizedChain = 'bsc';

  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test((address || '').trim());
  }

  async getBalance(): Promise<BalanceResult> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'BSC live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTransactions(): Promise<NormalizedTransaction[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'BSC live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTokenTransfers(): Promise<NormalizedTokenTransfer[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'BSC live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTransaction(): Promise<NormalizedTransaction | null> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'BSC live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getAddressActivity(): Promise<AddressActivity> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'BSC live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }
}

export class BitcoinProvider implements BlockchainProvider {
  readonly id = 'bitcoin-provider';
  readonly name = 'Bitcoin UTXO Provider (Scheduled Phase)';
  readonly chain: NormalizedChain = 'bitcoin';

  validateAddress(address: string): boolean {
    const clean = (address || '').trim();
    return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(clean);
  }

  async getBalance(): Promise<BalanceResult> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Bitcoin live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTransactions(): Promise<NormalizedTransaction[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Bitcoin live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTokenTransfers(): Promise<NormalizedTokenTransfer[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Bitcoin does not utilize token contracts.', {
      chain: this.chain,
    });
  }

  async getTransaction(): Promise<NormalizedTransaction | null> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Bitcoin live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getAddressActivity(): Promise<AddressActivity> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Bitcoin live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }
}

export class SolanaProvider implements BlockchainProvider {
  readonly id = 'solana-provider';
  readonly name = 'Solana Provider (Scheduled Phase)';
  readonly chain: NormalizedChain = 'solana';

  validateAddress(address: string): boolean {
    const clean = (address || '').trim();
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
  }

  async getBalance(): Promise<BalanceResult> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Solana live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTransactions(): Promise<NormalizedTransaction[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Solana live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTokenTransfers(): Promise<NormalizedTokenTransfer[]> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Solana live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getTransaction(): Promise<NormalizedTransaction | null> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Solana live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }

  async getAddressActivity(): Promise<AddressActivity> {
    throw new BlockchainError('UNSUPPORTED_CHAIN', 'Solana live blockchain provider is scheduled for Phase 2.', {
      chain: this.chain,
    });
  }
}
