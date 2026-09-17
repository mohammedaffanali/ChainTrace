/**
 * CHAINTRACE // Normalized Blockchain Intelligence Data Models & Provider Contracts
 */

export type BlockchainMode = 'demo' | 'live';

export type NormalizedChain =
  | 'ethereum'
  | 'tron'
  | 'polygon'
  | 'bsc'
  | 'bitcoin'
  | 'solana';

export type TransactionStatus = 'CONFIRMED' | 'FAILED' | 'PENDING';

export type TransactionDirection = 'INCOMING' | 'OUTGOING' | 'SELF';

export interface FiatValue {
  currency: string;
  amount: number;
  formatted: string;
}

export interface NormalizedTransaction {
  hash: string;
  chain: NormalizedChain | string;
  timestamp: number; // Unix timestamp in seconds
  blockNumber: number;
  from: string;
  to: string;
  asset: string; // e.g., 'ETH', 'TRX', 'MATIC', 'USDT'
  tokenAddress?: string;
  amount: string; // formatted decimal string
  fiatValue?: FiatValue;
  fee?: string;
  status: TransactionStatus;
  direction?: TransactionDirection;
  metadata?: Record<string, unknown>;
}

export interface NormalizedTokenTransfer {
  transactionHash: string;
  chain: NormalizedChain | string;
  token: string;
  tokenAddress: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

export interface BalanceResult {
  raw: string;
  formatted: string;
  symbol: string;
  fiatValueINR?: string;
}

export interface AddressActivity {
  address: string;
  chain: NormalizedChain | string;
  balance: BalanceResult;
  totalTransactions: number;
  firstSeenTimestamp?: number;
  lastActiveTimestamp?: number;
  totalIncomingVolume?: string;
  totalOutgoingVolume?: string;
  isContract?: boolean;
}

export interface BlockchainProvider {
  readonly id: string;
  readonly name: string;
  readonly chain: NormalizedChain;

  validateAddress(address: string): boolean;
  getBalance(address: string): Promise<BalanceResult>;
  getTransactions(address: string, limit?: number): Promise<NormalizedTransaction[]>;
  getTokenTransfers(address: string, limit?: number): Promise<NormalizedTokenTransfer[]>;
  getTransaction(hash: string): Promise<NormalizedTransaction | null>;
  getAddressActivity(address: string): Promise<AddressActivity>;
}

export interface BlockchainQueryResult {
  mode: BlockchainMode;
  chain: string;
  address: string;
  balance: BalanceResult;
  activity: AddressActivity;
  transactions: NormalizedTransaction[];
  tokenTransfers: NormalizedTokenTransfer[];
  retrievedAt: string;
  isDemonstrationData: boolean;
  providerInfo: {
    id: string;
    name: string;
    live: boolean;
  };
}

export interface ProviderHealth {
  id: string;
  name: string;
  chain: string;
  status: 'ONLINE' | 'CONFIG_MISSING' | 'DEGRADED' | 'RATE_LIMITED';
  hasApiKey: boolean;
  latencyMs?: number;
  error?: string;
}
