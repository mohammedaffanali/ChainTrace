/**
 * CHAINTRACE // Explainable VASP Attribution Scoring Engine Types
 * Seven-Signal Probabilistic Model and Anti-Overclaiming Evidence Schema
 */

import { VaspEntity, VaspAddressEntity, WalletClusterEntity } from '../vasp/types';
import { VaspPath, PathRelationshipType } from '../graph/types';

export type SignalType =
  | 'proximity'
  | 'deposit_match'
  | 'cluster'
  | 'registry'
  | 'cross_chain'
  | 'behavioral'
  | 'historical';

export type ConfidenceBand =
  | 'VERY_STRONG_CANDIDATE' // 90 - 100
  | 'STRONG_CANDIDATE'      // 75 - 89
  | 'MODERATE_CANDIDATE'    // 60 - 74
  | 'WEAK_CANDIDATE'        // 40 - 59
  | 'INSUFFICIENT_EVIDENCE'; // 0 - 39

export interface ScoringWeights {
  proximity: number;    // default 0.24 (24%)
  depositMatch: number; // default 0.22 (22%)
  cluster: number;      // default 0.18 (18%)
  registry: number;     // default 0.15 (15%)
  crossChain: number;   // default 0.10 (10%)
  behavioral: number;   // default 0.07 (7%)
  historical: number;   // default 0.04 (4%)
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  proximity: 0.24,
  depositMatch: 0.22,
  cluster: 0.18,
  registry: 0.15,
  crossChain: 0.10,
  behavioral: 0.07,
  historical: 0.04,
};

export interface ProximityHopMapping {
  1: number; // default 1.00
  2: number; // default 0.90
  3: number; // default 0.75
  4: number; // default 0.55
  5: number; // default 0.30
  [hop: number]: number;
}

export const DEFAULT_HOP_MAPPING: ProximityHopMapping = {
  1: 1.0,
  2: 0.9,
  3: 0.75,
  4: 0.55,
  5: 0.3,
};

export interface ExplainableEvidenceItem {
  type: string;
  score: number; // Normalized 0.0 to 1.0
  weight: number; // Configured weight
  weightedScore: number; // score * weight * 100
  transactionHash?: string;
  address?: string;
  source?: string;
  explanation: string;
}

export interface SignalResult {
  id: SignalType;
  label: string;
  weightPercent: number;
  rawScore: number; // 0.0 to 1.0
  scorePercent: number; // 0 to 100
  weightedContribution: number; // scorePercent * (weightPercent / 100)
  maxContribution: number; // weightPercent
  verified: boolean;
  evidence: ExplainableEvidenceItem;
  rationale: string;
}

export interface ScoredVaspCandidate {
  rank: number;
  vasp: VaspEntity;
  confidenceScore: number; // 0.0 to 100.0
  confidenceDecimal: number; // 0.00 to 1.00
  confidenceBand: ConfidenceBand;
  relationshipType: PathRelationshipType;
  hopDistance: number;
  path?: VaspPath;
  signals: SignalResult[];
  evidenceTrail: string[];
  depositAddress: string;
  depositAddressEntity?: VaspAddressEntity;
  cluster?: WalletClusterEntity;
}

export interface AttributionInvestigationResult {
  status: 'completed' | 'no_reliable_attribution' | 'insufficient_data';
  wallet: string;
  chain: string;
  topCandidate: ScoredVaspCandidate | null;
  candidates: ScoredVaspCandidate[];
  confidence: number; // 0.000 to 1.000
  confidencePercentage: number; // 0.0 to 100.0
  confidenceBand: ConfidenceBand;
  relationshipType: PathRelationshipType;
  hopDistance: number;
  path: VaspPath['path'];
  transactions: VaspPath['transactions'];
  evidence: ExplainableEvidenceItem[];
  scoreBreakdown: {
    transactionProximity: { score: number; max: number; raw: number };
    depositMatch: { score: number; max: number; raw: number };
    cluster: { score: number; max: number; raw: number };
    registry: { score: number; max: number; raw: number };
    crossChain: { score: number; max: number; raw: number };
    behavior: { score: number; max: number; raw: number };
    historical: { score: number; max: number; raw: number };
    totalScore: number;
  };
  whyThisVasp: string[];
  riskIndicators: string[];
  limitations: string[];
  noAttributionReason?: string;
  isDemonstrationData: boolean;
  mode: 'demo' | 'live';
  analyzedAt: string;
}
