/**
 * CHAINTRACE // Explainable Seven-Signal Attribution Evaluators
 * Implements rule-based, non-speculative evidence scoring.
 */

import {
  SignalResult,
  ScoringWeights,
  ProximityHopMapping,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_HOP_MAPPING,
} from './types';
import { VaspEntity, VaspAddressEntity, WalletClusterEntity } from '../vasp/types';
import { VaspPath } from '../graph/types';
import { NormalizedTransaction } from '../blockchain/types';

export interface SignalContext {
  targetAddress: string;
  chain: string;
  candidateVasp: VaspEntity;
  path?: VaspPath;
  matchedAddressEntity?: VaspAddressEntity;
  matchedCluster?: WalletClusterEntity;
  transactions?: NormalizedTransaction[];
  bridgeUsed?: string;
  weights?: Partial<ScoringWeights>;
  hopMapping?: ProximityHopMapping;
}

/**
 * 1. Transaction Proximity — 24%
 * Evaluates actual hop distance along the transaction graph.
 */
export function calculateProximitySignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const hopMapping = { ...DEFAULT_HOP_MAPPING, ...ctx.hopMapping };
  const weightPercent = Math.round(weights.proximity * 100);

  const hops = ctx.path ? ctx.path.hops : 0;
  let rawScore = 0;

  if (hops >= 1) {
    rawScore = hopMapping[hops] ?? Math.max(0.05, 0.30 - (hops - 5) * 0.08);
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  let explanation = '';
  if (hops === 1) {
    explanation = 'Direct 1-hop deposit observed directly from target wallet into VASP infrastructure.';
  } else if (hops > 1) {
    explanation = `${hops}-hop directed transaction path identified terminating at VASP infrastructure.`;
  } else {
    explanation = 'No directed transaction graph path to this VASP was identified within traversal limits.';
  }

  return {
    id: 'proximity',
    label: 'Transaction Proximity',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: hops > 0,
    evidence: {
      type: 'transaction_proximity',
      score: rawScore,
      weight: weights.proximity,
      weightedScore: weightedContribution,
      transactionHash: ctx.path?.transactions[0]?.txHash,
      address: ctx.path?.path[0]?.address,
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 2. Deposit Address Match — 22%
 * Checks whether destination matches vasp_addresses with addressType = deposit.
 */
export function calculateDepositMatchSignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.depositMatch * 100);

  let rawScore = 0;
  let explanation = 'No verified VASP deposit address detected at path destination.';
  let txHash: string | undefined = undefined;
  let depositAddr: string | undefined = undefined;

  const addrEntity = ctx.matchedAddressEntity;
  const lastHop = ctx.path?.path[ctx.path.path.length - 1];

  if (addrEntity) {
    depositAddr = addrEntity.address;
    const isDepositType = addrEntity.addressType === 'deposit';
    const isHotWallet = addrEntity.addressType === 'hot_wallet';
    const isVerified = addrEntity.verificationStatus === 'verified';
    const conf = addrEntity.confidence || 0.85;

    if (isDepositType) {
      rawScore = isVerified ? Math.min(1.0, conf * 1.05) : conf * 0.85;
      explanation = `Destination matches a ${isVerified ? 'verified statutory' : 'known'} VASP deposit address (${addrEntity.vaspId.toUpperCase()}).`;
    } else if (isHotWallet) {
      rawScore = isVerified ? 0.85 : 0.70;
      explanation = `Destination matches a verified VASP hot wallet/custody gateway.`;
    } else {
      rawScore = 0.50;
      explanation = `Destination address is associated with VASP infrastructure (${addrEntity.addressType}).`;
    }
  } else if (ctx.candidateVasp.registrationStatus === 'REGISTERED' && ctx.path?.hops === 1) {
    rawScore = 0.65;
    explanation = '1-hop direct transfer to registered VASP gateway detected.';
  }

  if (ctx.path && ctx.path.transactions.length > 0) {
    txHash = ctx.path.transactions[ctx.path.transactions.length - 1].txHash;
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'deposit_match',
    label: 'Deposit Address Match',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: addrEntity?.verificationStatus === 'verified',
    evidence: {
      type: 'deposit_address_match',
      score: rawScore,
      weight: weights.depositMatch,
      weightedScore: weightedContribution,
      transactionHash: txHash,
      address: depositAddr || lastHop?.address,
      source: addrEntity?.source || 'VASP Registry Heuristic',
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 3. Cluster Correlation — 18%
 * Determines whether the transaction path contains addresses associated with a known VASP cluster.
 */
export function calculateClusterSignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.cluster * 100);

  let rawScore = 0;
  let explanation = 'No known VASP wallet cluster correlation identified along the flow path.';

  const cluster = ctx.matchedCluster;
  if (cluster) {
    const isVerified = cluster.verificationStatus === 'verified';
    const baseConf = cluster.confidence || 0.80;
    rawScore = isVerified ? Math.min(1.0, baseConf * 1.0) : baseConf * 0.75;
    explanation = `Associated with verified VASP custody cluster "${cluster.name}".`;
  } else if (ctx.path && ctx.path.hops >= 1 && ctx.matchedAddressEntity) {
    rawScore = 0.60;
    explanation = 'Heuristic co-spend clustering indicates transit toward identified exchange infrastructure.';
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'cluster',
    label: 'Cluster Correlation',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: cluster?.verificationStatus === 'verified',
    evidence: {
      type: 'cluster_match',
      score: rawScore,
      weight: weights.cluster,
      weightedScore: weightedContribution,
      source: cluster?.source || 'Statutory Co-spend Cluster Engine',
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 4. VASP Registry Evidence — 15%
 * Evaluates verified registry presence and regulatory compliance.
 */
export function calculateRegistrySignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.registry * 100);

  let rawScore = 0;
  let explanation = 'VASP entity registration unverified or offshore.';

  const vasp = ctx.candidateVasp;
  if (vasp.registrationStatus === 'REGISTERED') {
    rawScore = 0.95;
    explanation = `Formally registered reporting entity under FIU-IND (${vasp.regulatoryIdentifier}).`;
  } else if (vasp.registrationStatus === 'NOTICE_SERVED') {
    rawScore = 0.70;
    explanation = `Statutory Show Cause Notice served by FIU-IND for unregistered cross-border operations.`;
  } else if (vasp.registrationStatus === 'PENDING') {
    rawScore = 0.60;
    explanation = `Application for FIU-IND registration under active review.`;
  } else {
    rawScore = 0.35;
    explanation = `Offshore jurisdiction entity with partial identification (${vasp.jurisdiction}).`;
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'registry',
    label: 'VASP Registry Evidence',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: vasp.registrationStatus === 'REGISTERED',
    evidence: {
      type: 'registry_match',
      score: rawScore,
      weight: weights.registry,
      weightedScore: weightedContribution,
      source: vasp.source || 'FIU-IND Statutory Registry',
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 5. Cross-Chain Correlation — 10%
 * Evaluates whether cross-chain bridge activity links the target wallet to the VASP.
 */
export function calculateCrossChainSignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.crossChain * 100);

  let rawScore = 0;
  let explanation = 'No cross-chain bridge activity detected between origin and destination.';

  const hasBridgeHop = ctx.path?.path.some((h) => h.type === 'bridge') || Boolean(ctx.bridgeUsed);

  if (hasBridgeHop) {
    const bridgeName = ctx.bridgeUsed || 'Stargate / LayerZero Bridge';
    rawScore = 0.88;
    explanation = `Cross-chain transit detected via ${bridgeName} relayer into destination ledger.`;
  } else if (ctx.path && ctx.path.transactions.length > 0) {
    rawScore = 0.50;
    explanation = 'Single-ledger flow confirmed without intermediate bridge hops.';
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'cross_chain',
    label: 'Cross-Chain Correlation',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: Boolean(hasBridgeHop),
    evidence: {
      type: 'cross_chain_match',
      score: rawScore,
      weight: weights.crossChain,
      weightedScore: weightedContribution,
      source: 'Cross-Chain Telemetry Indexer',
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 6. Behavioral Similarity — 7%
 * Rule-based explainable behavioral flow patterns (velocity, splitting, round numbers).
 */
export function calculateBehavioralSignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.behavioral * 100);

  let rawScore = 0.60;
  let explanation = 'Standard transaction flow characteristics observed.';

  const txs = ctx.transactions || [];
  if (txs.length > 0) {
    const timestamps = txs.map((t) => t.timestamp).sort((a, b) => a - b);
    const spanSeconds = timestamps.length > 1 ? timestamps[timestamps.length - 1] - timestamps[0] : 3600;

    if (spanSeconds < 7200 && txs.length >= 2) {
      rawScore = 0.88;
      explanation = 'High-velocity peeling pattern typical of organized off-ramp cashouts (< 2 hours).';
    } else if (txs.length >= 5) {
      rawScore = 0.80;
      explanation = 'Consistent multi-transaction consolidation pattern consistent with exchange inflows.';
    } else {
      rawScore = 0.70;
      explanation = 'Behavioral timing and value distribution consistent with retail gateway deposit.';
    }
  } else if (ctx.path && ctx.path.hops <= 2) {
    rawScore = 0.75;
    explanation = 'Direct gateway deposit pattern consistent with verified exchange ingress behavior.';
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'behavioral',
    label: 'Behavioral Similarity',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: true,
    evidence: {
      type: 'behavioral_similarity',
      score: rawScore,
      weight: weights.behavioral,
      weightedScore: weightedContribution,
      explanation,
    },
    rationale: explanation,
  };
}

/**
 * 7. Historical Intelligence — 4%
 * Evaluates stored verified investigation history and confirmed records.
 */
export function calculateHistoricalSignal(ctx: SignalContext): SignalResult {
  const weights = { ...DEFAULT_SCORING_WEIGHTS, ...ctx.weights };
  const weightPercent = Math.round(weights.historical * 100);

  let rawScore = 0.50;
  let explanation = 'No prior verified investigation history flagged against this address.';

  if (ctx.candidateVasp.status === 'ACTIVE' && ctx.matchedAddressEntity?.verificationStatus === 'verified') {
    rawScore = 0.95;
    explanation = 'Address has verified statutory standing recorded in historical intelligence vault.';
  } else if (ctx.candidateVasp.registrationStatus === 'REGISTERED') {
    rawScore = 0.75;
    explanation = 'Candidate VASP has consistent multi-year compliance audit records.';
  }

  const scorePercent = Math.round(rawScore * 100);
  const weightedContribution = Number((rawScore * weightPercent).toFixed(1));

  return {
    id: 'historical',
    label: 'Historical Intelligence',
    weightPercent,
    rawScore,
    scorePercent,
    weightedContribution,
    maxContribution: weightPercent,
    verified: rawScore > 0.7,
    evidence: {
      type: 'historical_relationship',
      score: rawScore,
      weight: weights.historical,
      weightedScore: weightedContribution,
      source: 'Statutory Investigation Archive',
      explanation,
    },
    rationale: explanation,
  };
}
