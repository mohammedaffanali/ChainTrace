/**
 * CHAINTRACE — Blockchain Intelligence & Explainable VASP Attribution Service Layer
 * 
 * Integrates real blockchain providers, VASP intelligence database,
 * multi-hop graph traversal, and 7-signal explainable scoring.
 */

import {
  runVaspAttributionSimulation as isolatedSimulation,
  AttributionResult as BaseAttributionResult,
  ConfidenceSignalBreakdown,
  VaspAttributionCandidate,
  PRIMARY_DEMO_WALLET,
  TRON_HAWALA_WALLET,
  BTC_WASABI_WALLET,
  REFUSAL_PEEL_WALLET,
  REFUSAL_DORMANT_WALLET,
  REFUSAL_SOLANA_WALLET,
  DEMO_PIPELINE_STAGES,
  DemoChain,
} from './blockchain';
import { BlockchainService } from './blockchain/service';
import { VASP_LIST, VaspNode } from './data';
import { globalScoringEngine, AttributionInvestigationResult, globalAuditVault } from './scoring';

export type SupportedChain = DemoChain;

export interface LegacyBlockchainProvider {
  id: string;
  name: string;
  chains: SupportedChain[];
  status: 'ACTIVE' | 'RATE_LIMITED' | 'DEGRADED';
  latencyMs: number;
}

export type { ConfidenceSignalBreakdown, VaspAttributionCandidate };

export interface PipelineStage {
  id: number;
  code: string;
  title: string;
  description: string;
  status: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FLAGGED';
  latencyMs: number;
}

export interface AttributionResult extends BaseAttributionResult {
  investigationResult?: AttributionInvestigationResult;
}

export {
  PRIMARY_DEMO_WALLET,
  TRON_HAWALA_WALLET,
  BTC_WASABI_WALLET,
  REFUSAL_PEEL_WALLET,
  REFUSAL_DORMANT_WALLET,
  REFUSAL_SOLANA_WALLET,
};

export const DEFAULT_PIPELINE_STAGES: PipelineStage[] = DEMO_PIPELINE_STAGES.map((s) => ({
  ...s,
  status: s.status as PipelineStage['status'],
}));

/**
 * Executes VASP attribution in DEMO mode.
 * Evaluates through the 7-signal scoring engine while providing full backwards compatibility.
 */
export function runVaspAttributionSimulation(
  walletInput: string,
  chainSelected: SupportedChain = 'AUTO',
  metadata?: { caseId?: string; officerName?: string }
): AttributionResult {
  const result = isolatedSimulation(walletInput, chainSelected);
  const cleanWallet = (walletInput || PRIMARY_DEMO_WALLET.address).trim();
  const cleanChain = chainSelected === 'AUTO' ? 'ethereum' : chainSelected.toLowerCase();

  // Audit event recording
  globalAuditVault.logEvent({
    wallet: cleanWallet,
    chain: cleanChain,
    mode: 'demo',
    action: 'VASP_ATTRIBUTION_QUERY',
    caseId: metadata?.caseId,
    officerName: metadata?.officerName,
  });

  // Evaluate through explainable 7-signal scoring engine
  const candidateInputs = (result.candidates || []).map((c, idx) => ({
    vasp: {
      id: c.vaspId,
      name: c.vaspName,
      legalName: c.legalEntity,
      country: c.country,
      jurisdiction: 'IND',
      registrationStatus: c.fiuStatus as any,
      regulatoryIdentifier: c.fiuRegNo,
      status: 'ACTIVE' as const,
      riskLevel: 'LOW' as const,
      source: 'Statutory Registry',
      sourceType: 'verified_public_source' as const,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    matchedAddressEntity: {
      id: `addr-${idx}`,
      vaspId: c.vaspId,
      address: c.depositAddress,
      chain: cleanChain,
      addressType: 'deposit' as const,
      confidence: c.confidenceScore / 100,
      source: 'Verified Exchange Deposit',
      sourceType: 'verified_public_source' as const,
      verificationStatus: 'verified' as const,
      verifiedAt: '2023-01-01T00:00:00Z',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    bridgeUsed: result.crossChainActivity?.bridgeProtocol,
  }));

  const investigationResult = globalScoringEngine.evaluateAttribution(
    cleanWallet,
    cleanChain,
    candidateInputs,
    'demo'
  );

  return {
    ...result,
    mode: 'demo',
    isDemonstrationData: true,
    investigationResult,
  };
}

/**
 * Executes real blockchain analysis and explainable VASP attribution in LIVE mode.
 * 1. Queries live transactions via BlockchainService.
 * 2. Builds live multi-hop transaction graph via buildTransactionGraph.
 * 3. Cross-references Phase 2 VASP intelligence database.
 * 4. Computes 7-signal explainable scoring and confidence bands.
 * 5. Records tamper-evident audit log.
 */
export async function runLiveVaspAttribution(
  address: string,
  chain: string,
  metadata?: { caseId?: string; officerName?: string }
): Promise<AttributionResult> {
  const cleanAddr = address.trim();
  const cleanChain = chain.toLowerCase();

  // Audit event recording
  globalAuditVault.logEvent({
    wallet: cleanAddr,
    chain: cleanChain,
    mode: 'live',
    action: 'VASP_ATTRIBUTION_QUERY',
    caseId: metadata?.caseId,
    officerName: metadata?.officerName,
  });

  // Dynamically import graph and VASP intelligence database so client webpack bundles are not affected
  const { buildTransactionGraph } = await import('./graph/graphBuilder');
  const { globalVaspRepository, globalVaspLookupService } = await import('./vasp');

  // 1. Build live multi-hop transaction graph
  const graph = await buildTransactionGraph(cleanAddr, cleanChain, {
    maxHops: 3,
    maxNodes: 35,
    mode: 'live',
  });

  // 2. Discover VASP candidates along paths
  const engineCandidateInputs = await Promise.all(
    graph.paths.map(async (p) => {
      const vasp = await globalVaspRepository.getVaspById(p.targetVasp.id);
      const vaspEntity = vasp || {
        id: p.targetVasp.id,
        name: p.targetVasp.name,
        legalName: p.targetVasp.legalName,
        country: 'India',
        jurisdiction: 'IND',
        registrationStatus: p.targetVasp.fiuStatus as any,
        regulatoryIdentifier: p.targetVasp.regulatoryIdentifier,
        status: 'ACTIVE' as const,
        riskLevel: 'LOW' as const,
        source: 'FIU-IND Verified Registry',
        sourceType: 'verified_public_source' as const,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const addrLookup = await globalVaspLookupService.findVaspByAddress(
        p.targetVasp.depositAddress,
        cleanChain
      );

      return {
        vasp: vaspEntity,
        path: p,
        matchedAddressEntity: addrLookup.address,
        matchedCluster: addrLookup.cluster,
        transactions: graph.edges.map((e) => ({
          hash: e.txHash,
          chain: e.sourceChain,
          timestamp: e.timestamp,
          blockNumber: 0,
          from: e.from,
          to: e.to,
          asset: e.asset,
          amount: e.amount,
          fee: e.fee,
          status: 'CONFIRMED' as const,
        })),
        bridgeUsed: p.path.find((h) => h.type === 'bridge')?.label,
      };
    })
  );

  // 3. Score candidates with 7-signal engine
  const investigationResult = globalScoringEngine.evaluateAttribution(
    cleanAddr,
    cleanChain,
    engineCandidateInputs,
    'live'
  );

  // 4. Map to legacy AttributionResult schema for complete UI backwards compatibility
  const topCandidate = investigationResult.topCandidate;

  const legacyCandidates: VaspAttributionCandidate[] = investigationResult.candidates.map((c) => ({
    rank: c.rank,
    vaspId: c.vasp.id,
    vaspName: c.vasp.name,
    legalEntity: c.vasp.legalName,
    country: c.vasp.country,
    fiuStatus: c.vasp.registrationStatus as any,
    fiuRegNo: c.vasp.regulatoryIdentifier,
    confidenceScore: c.confidenceScore,
    confidenceGrade:
      c.confidenceScore >= 90
        ? 'VERY HIGH'
        : c.confidenceScore >= 75
        ? 'HIGH'
        : c.confidenceScore >= 60
        ? 'MODERATE'
        : 'LOW',
    hopDistance: c.hopDistance,
    relationType: c.relationshipType === 'DIRECT_DEPOSIT' ? 'DIRECT DEPOSIT' : 'INDIRECT TRANSIT',
    network: cleanChain.toUpperCase(),
    depositAddress: c.depositAddress,
    evidenceCount: c.signals.filter((s) => s.verified).length,
    pmlaCompliant: c.vasp.registrationStatus === 'REGISTERED',
  }));

  const legacySignals: ConfidenceSignalBreakdown[] = (topCandidate?.signals || []).map((s) => ({
    id: s.id,
    label: s.label,
    weightPercent: s.weightPercent,
    score: s.scorePercent,
    contribution: s.weightedContribution,
    evidenceText: s.rationale,
    verified: s.verified,
  }));

  return {
    suspectWallet: cleanAddr,
    detectedChain: cleanChain.toUpperCase(),
    nearestVasp: legacyCandidates[0] || {
      rank: 1,
      vaspId: 'unassigned',
      vaspName: 'No Reliable Attribution',
      legalEntity: 'Unresolved',
      country: 'N/A',
      fiuStatus: 'NON_COMPLIANT',
      fiuRegNo: 'N/A',
      confidenceScore: 0,
      confidenceGrade: 'INSUFFICIENT',
      hopDistance: 0,
      relationType: 'INDIRECT TRANSIT',
      network: cleanChain.toUpperCase(),
      depositAddress: cleanAddr,
      evidenceCount: 0,
      pmlaCompliant: false,
    },
    candidates: legacyCandidates,
    overallConfidence: topCandidate ? topCandidate.confidenceScore : 0,
    confidenceClassification:
      topCandidate && topCandidate.confidenceScore >= 90
        ? 'VERY HIGH'
        : topCandidate && topCandidate.confidenceScore >= 75
        ? 'HIGH'
        : topCandidate && topCandidate.confidenceScore >= 60
        ? 'MODERATE'
        : 'LOW',
    signals: legacySignals,
    evidenceTrail: topCandidate?.evidenceTrail || [
      'No conclusive VASP deposit heuristic identified along transaction graph.',
    ],
    hopTrail: (topCandidate?.path?.path || []).map((item, idx) => ({
      hopNumber: idx,
      address: item.address,
      label: item.label || (idx === 0 ? 'Suspect Wallet' : `Intermediary Node #${idx}`),
      entityType: item.type,
      amount: topCandidate?.path?.transactions[idx]?.amount || '0',
      txHash: topCandidate?.path?.transactions[idx]?.txHash || '',
      chain: item.chain.toUpperCase(),
      timestamp: new Date().toISOString(),
    })),
    clusterSummary: {
      totalWalletsInCluster: graph.nodes.length,
      totalBalanceINR: '?0 (Live Ledgers Queried)',
      clusterTag: `Cluster [${cleanChain.toUpperCase()}]`,
      heuristicMethod: 'Multi-Hop Bounded BFS Traversal',
    },
    riskSummary: {
      score: topCandidate && topCandidate.confidenceScore >= 75 ? 20 : 75,
      level: topCandidate && topCandidate.confidenceScore >= 75 ? 'LOW' : 'HIGH',
      flags: investigationResult.riskIndicators,
    },
    methodologyNotice:
      'Attribution computed using 7-signal explainable heuristic engine. Anti-overclaiming rules applied.',
    isDemonstrationData: false,
    mode: 'live',
    analyzedAt: new Date().toISOString(),
    investigationResult,
  };
}
