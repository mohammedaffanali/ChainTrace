/**
 * CHAINTRACE // Explainable VASP Attribution Scoring Engine
 * Combines 7-signal analysis with strict anti-overclaiming and NO_RELIABLE_ATTRIBUTION cutoffs.
 */

import {
  ScoringWeights,
  ProximityHopMapping,
  ConfidenceBand,
  ScoredVaspCandidate,
  AttributionInvestigationResult,
  DEFAULT_SCORING_WEIGHTS,
  DEFAULT_HOP_MAPPING,
} from './types';
import {
  calculateProximitySignal,
  calculateDepositMatchSignal,
  calculateClusterSignal,
  calculateRegistrySignal,
  calculateCrossChainSignal,
  calculateBehavioralSignal,
  calculateHistoricalSignal,
} from './signals';
import { VaspEntity, VaspAddressEntity, WalletClusterEntity } from '../vasp/types';
import { VaspPath, PathRelationshipType } from '../graph/types';
import { NormalizedTransaction } from '../blockchain/types';

export interface EngineCandidateInput {
  vasp: VaspEntity;
  path?: VaspPath;
  matchedAddressEntity?: VaspAddressEntity;
  matchedCluster?: WalletClusterEntity;
  transactions?: NormalizedTransaction[];
  bridgeUsed?: string;
}

export interface ScoringEngineConfig {
  weights?: Partial<ScoringWeights>;
  hopMapping?: ProximityHopMapping;
  minConfidenceThreshold?: number; // default 40.0
}

export class VaspAttributionScoringEngine {
  private weights: ScoringWeights;
  private hopMapping: ProximityHopMapping;
  private minConfidenceThreshold: number;

  constructor(config?: ScoringEngineConfig) {
    this.weights = { ...DEFAULT_SCORING_WEIGHTS, ...config?.weights };
    this.hopMapping = { ...DEFAULT_HOP_MAPPING, ...config?.hopMapping };
    this.minConfidenceThreshold = config?.minConfidenceThreshold ?? 40.0;
  }

  /**
   * Evaluates and scores an individual VASP candidate against the 7-signal model.
   */
  public scoreCandidate(
    targetAddress: string,
    chain: string,
    input: EngineCandidateInput
  ): ScoredVaspCandidate {
    const ctx = {
      targetAddress,
      chain,
      candidateVasp: input.vasp,
      path: input.path,
      matchedAddressEntity: input.matchedAddressEntity,
      matchedCluster: input.matchedCluster,
      transactions: input.transactions,
      bridgeUsed: input.bridgeUsed,
      weights: this.weights,
      hopMapping: this.hopMapping,
    };

    const s1 = calculateProximitySignal(ctx);
    const s2 = calculateDepositMatchSignal(ctx);
    const s3 = calculateClusterSignal(ctx);
    const s4 = calculateRegistrySignal(ctx);
    const s5 = calculateCrossChainSignal(ctx);
    const s6 = calculateBehavioralSignal(ctx);
    const s7 = calculateHistoricalSignal(ctx);

    const signals = [s1, s2, s3, s4, s5, s6, s7];

    // Calculate final weighted confidence score: sum(signal.rawScore * signal.weight)
    let totalScore = 0;
    for (const sig of signals) {
      totalScore += sig.rawScore * (sig.weightPercent / 100);
    }

    const confidenceScore = Number((totalScore * 100).toFixed(1));
    const confidenceDecimal = Number(totalScore.toFixed(3));
    const confidenceBand = this.getConfidenceBand(confidenceScore);

    // Determine non-speculative relationship classification
    let relationshipType: PathRelationshipType = 'INSUFFICIENT_EVIDENCE';
    const hops = input.path?.hops ?? 0;

    if (hops === 1) {
      relationshipType = input.matchedCluster ? 'KNOWN_CLUSTER' : 'DIRECT_DEPOSIT';
    } else if (hops > 1 && confidenceScore >= 60) {
      relationshipType = 'INDIRECT_TRANSIT';
    } else if (confidenceScore >= 75) {
      relationshipType = 'LIKELY_ASSOCIATION';
    } else if (confidenceScore >= 40) {
      relationshipType = 'POSSIBLE_ASSOCIATION';
    }

    const evidenceTrail: string[] = [];
    if (s2.verified) evidenceTrail.push(s2.rationale);
    if (s1.verified) evidenceTrail.push(s1.rationale);
    if (s3.verified) evidenceTrail.push(s3.rationale);
    if (s4.verified) evidenceTrail.push(s4.rationale);
    if (s5.verified) evidenceTrail.push(s5.rationale);

    return {
      rank: 1, // updated during ranking
      vasp: input.vasp,
      confidenceScore,
      confidenceDecimal,
      confidenceBand,
      relationshipType,
      hopDistance: hops,
      path: input.path,
      signals,
      evidenceTrail,
      depositAddress:
        input.matchedAddressEntity?.address ||
        input.path?.targetVasp.depositAddress ||
        targetAddress,
      depositAddressEntity: input.matchedAddressEntity,
      cluster: input.matchedCluster,
    };
  }

  /**
   * Maps a numerical score (0 to 100) to standard Confidence Bands.
   */
  public getConfidenceBand(score: number): ConfidenceBand {
    if (score >= 90) return 'VERY_STRONG_CANDIDATE';
    if (score >= 75) return 'STRONG_CANDIDATE';
    if (score >= 60) return 'MODERATE_CANDIDATE';
    if (score >= 40) return 'WEAK_CANDIDATE';
    return 'INSUFFICIENT_EVIDENCE';
  }

  /**
   * Scores and ranks all discovered candidates, producing a complete Section 16 investigation result.
   */
  public evaluateAttribution(
    targetAddress: string,
    chain: string,
    candidates: EngineCandidateInput[],
    mode: 'demo' | 'live' = 'demo'
  ): AttributionInvestigationResult {
    const scoredCandidates: ScoredVaspCandidate[] = candidates
      .map((c) => this.scoreCandidate(targetAddress, chain, c))
      .sort((a, b) => b.confidenceScore - a.confidenceScore);

    // Assign sequential ranks
    scoredCandidates.forEach((c, idx) => {
      c.rank = idx + 1;
    });

    const top = scoredCandidates[0] ?? null;

    // Check for "No reliable attribution" conditions
    const isBelowThreshold = !top || top.confidenceScore < this.minConfidenceThreshold;
    const isAmbiguous =
      scoredCandidates.length >= 2 &&
      Math.abs(scoredCandidates[0].confidenceScore - scoredCandidates[1].confidenceScore) < 2.0 &&
      top.confidenceScore < 65;

    let status: AttributionInvestigationResult['status'] = 'completed';
    let noAttributionReason: string | undefined = undefined;

    if (candidates.length === 0) {
      status = 'no_reliable_attribution';
      noAttributionReason = 'No known VASP infrastructure reachable within graph traversal limits.';
    } else if (isBelowThreshold) {
      status = 'no_reliable_attribution';
      noAttributionReason = `Highest attribution score (${top?.confidenceScore ?? 0}%) is below reliable threshold (${this.minConfidenceThreshold}%).`;
    } else if (isAmbiguous) {
      status = 'no_reliable_attribution';
      noAttributionReason = 'Multiple equidistant VASP candidates identified with insufficient differentiating evidence.';
    }

    // Assemble Score Breakdown for top candidate
    const topSignals = top ? top.signals : [];
    const getSigScore = (id: string) => {
      const s = topSignals.find((x) => x.id === id);
      return {
        score: s ? s.weightedContribution : 0,
        max: s ? s.maxContribution : 0,
        raw: s ? s.rawScore : 0,
      };
    };

    const whyThisVasp: string[] = [];
    if (top) {
      const depositSig = topSignals.find((s) => s.id === 'deposit_match');
      const clusterSig = topSignals.find((s) => s.id === 'cluster');
      const proxSig = topSignals.find((s) => s.id === 'proximity');
      const regSig = topSignals.find((s) => s.id === 'registry');
      const crossSig = topSignals.find((s) => s.id === 'cross_chain');

      if (depositSig?.verified) whyThisVasp.push('Known deposit address associated with VASP infrastructure');
      if (clusterSig?.verified) whyThisVasp.push('Strong cluster correlation with exchange co-spend activity');
      if (proxSig?.verified) whyThisVasp.push(`${top.hopDistance}-hop directed transaction path identified`);
      if (regSig?.verified) whyThisVasp.push('Verified statutory registration with FIU-IND compliance records');
      if (crossSig?.verified) whyThisVasp.push('Cross-chain bridge relay correlation confirmed');
    }

    const limitations: string[] = [
      'Attribution score reflects evidentiary confidence, NOT definitive legal proof of beneficial ownership.',
      'Intermediary wallets on multi-hop paths are not presumed to be owned by the destination VASP.',
      'Unindexed private clusters and offshore mixers may obscure intermediate hops.',
    ];

    const riskIndicators: string[] = [];
    if (top && top.hopDistance > 2) {
      riskIndicators.push('Multi-hop layering detected (> 2 intermediary hops)');
    }
    if (top && top.confidenceScore < 60) {
      riskIndicators.push('Elevated uncertainty due to weak deposit heuristics');
    }

    return {
      status,
      wallet: targetAddress,
      chain,
      topCandidate: top,
      candidates: scoredCandidates,
      confidence: top ? top.confidenceDecimal : 0,
      confidencePercentage: top ? top.confidenceScore : 0,
      confidenceBand: top ? top.confidenceBand : 'INSUFFICIENT_EVIDENCE',
      relationshipType: top ? top.relationshipType : 'INSUFFICIENT_EVIDENCE',
      hopDistance: top ? top.hopDistance : 0,
      path: top?.path?.path ?? [],
      transactions: top?.path?.transactions ?? [],
      evidence: top ? top.signals.map((s) => s.evidence) : [],
      scoreBreakdown: {
        transactionProximity: getSigScore('proximity'),
        depositMatch: getSigScore('deposit_match'),
        cluster: getSigScore('cluster'),
        registry: getSigScore('registry'),
        crossChain: getSigScore('cross_chain'),
        behavior: getSigScore('behavioral'),
        historical: getSigScore('historical'),
        totalScore: top ? top.confidenceScore : 0,
      },
      whyThisVasp,
      riskIndicators,
      limitations,
      noAttributionReason,
      isDemonstrationData: mode === 'demo',
      mode,
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const globalScoringEngine = new VaspAttributionScoringEngine();
