/**
 * CHAINTRACE // Transaction Graph & VASP Path Data Models
 */

import { NormalizedTransaction } from '../blockchain/types';
import { VaspEntity, WalletClusterEntity, VaspAddressEntity } from '../vasp/types';

export type GraphNodeType =
  | 'wallet'
  | 'vasp'
  | 'cluster'
  | 'bridge'
  | 'dex'
  | 'mixer'
  | 'contract'
  | 'transaction';

export type GraphEdgeType =
  | 'TRANSFERRED_TO'
  | 'DEPOSITED_TO'
  | 'WITHDREW_FROM'
  | 'BELONGS_TO_CLUSTER'
  | 'BRIDGED_TO'
  | 'INTERACTED_WITH'
  | 'POSSIBLY_ASSOCIATED_WITH';

export type PathRelationshipType =
  | 'DIRECT_DEPOSIT'
  | 'KNOWN_CLUSTER'
  | 'INDIRECT_TRANSIT'
  | 'LIKELY_ASSOCIATION'
  | 'POSSIBLE_ASSOCIATION'
  | 'INSUFFICIENT_EVIDENCE';

export interface GraphNode {
  id: string;
  address: string;
  chain: string;
  type: GraphNodeType;
  label: string;
  balanceINR?: string;
  riskScore?: number;
  threatLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vaspAssociation?: {
    vasp: VaspEntity;
    addressEntity?: VaspAddressEntity;
    associationType: string;
    confidence: number;
    factualSummary: string;
  };
  cluster?: WalletClusterEntity;
  hopDistance: number;
  isNearestVasp?: boolean;
  isStartingWallet?: boolean;
  // Computed canvas coordinates
  x: number;
  y: number;
  color: string;
}

export interface GraphEdge {
  id: string;
  from: string; // Node ID
  to: string; // Node ID
  type: GraphEdgeType;
  txHash: string;
  timestamp: number;
  asset: string;
  amount: string;
  amountFormatted: string;
  amountINR: string;
  fee?: string;
  sourceChain: string;
  destinationChain: string;
  isAttributionPath?: boolean;
  label: string;
}

export interface PathHopItem {
  address: string;
  chain: string;
  type: GraphNodeType | 'vasp_deposit' | 'vasp_hot_wallet' | 'vasp_cold_wallet';
  label?: string;
}

export interface VaspPath {
  hops: number;
  path: PathHopItem[];
  transactions: {
    txHash: string;
    from: string;
    to: string;
    amount: string;
    asset: string;
    timestamp: number;
    fee?: string;
    chain: string;
  }[];
  timestamps: {
    firstHopTime: number;
    lastHopTime: number;
    totalSpanSeconds: number;
  };
  evidence: string[];
  relationshipType: PathRelationshipType;
  targetVasp: {
    id: string;
    name: string;
    legalName: string;
    fiuStatus: string;
    regulatoryIdentifier: string;
    depositAddress: string;
    confidence: number;
  };
}

export interface GraphTraversalOptions {
  maxHops?: number;
  maxNodes?: number;
  transactionLimit?: number;
  direction?: 'all' | 'outgoing' | 'incoming';
  minAmount?: number;
  asset?: string;
  timeRange?: {
    start?: number; // unix timestamp
    end?: number; // unix timestamp
  };
  includeContractInteractions?: boolean;
  mode?: 'demo' | 'live';
  timeoutMs?: number;
  cancelSignal?: AbortSignal;
}

export interface TransactionGraph {
  mode: 'demo' | 'live';
  startingAddress: string;
  chain: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  paths: VaspPath[];
  vaspCandidates: {
    vasp: VaspEntity;
    hopDistance: number;
    relationshipType: PathRelationshipType;
    confidence: number;
  }[];
  stats: {
    totalNodes: number;
    totalEdges: number;
    maxHopReached: number;
    elapsedMs: number;
    truncated: boolean;
  };
}
