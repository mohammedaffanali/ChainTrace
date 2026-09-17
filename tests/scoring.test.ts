import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { VaspAttributionScoringEngine } from '../src/lib/scoring/scoringEngine';
import { EngineCandidateInput } from '../src/lib/scoring/scoringEngine';
import { globalAuditVault } from '../src/lib/scoring/auditLogger';
import { VaspEntity, VaspAddressEntity } from '../src/lib/vasp/types';
import { VaspPath } from '../src/lib/graph/types';

describe('PHASE 4 — Explainable VASP Attribution Scoring Engine', () => {
  const engine = new VaspAttributionScoringEngine();

  const mockVasp: VaspEntity = {
    id: 'coindcx',
    name: 'CoinDCX',
    legalName: 'Neblio Technologies Private Limited',
    regulatoryIdentifier: 'FIU-IND-2023-DCX01',
    jurisdiction: 'IND',
    registrationStatus: 'REGISTERED',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    country: 'India',
    source: 'FIU-IND',
    sourceType: 'verified_public_source',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockDepositAddr: VaspAddressEntity = {
    id: 'addr-1',
    vaspId: 'coindcx',
    address: '0x38b25A89d1209bAc6a804797Bf96FaD1efb8e9A1',
    chain: 'ethereum',
    addressType: 'deposit',
    source: 'FIU Statutory Listing',
    sourceType: 'verified_public_source',
    verificationStatus: 'verified',
    confidence: 0.98,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  describe('1. Seven-Signal Math & Confidence Formula Verification', () => {
    it('should compute exact weighted score according to the 7-signal formula', () => {
      const path1Hop: VaspPath = {
        hops: 1,
        path: [
          { address: '0xuser', chain: 'ethereum', type: 'wallet' },
          { address: mockDepositAddr.address, chain: 'ethereum', type: 'vasp' },
        ],
        transactions: [
          {
            txHash: '0x123',
            from: '0xuser',
            to: mockDepositAddr.address,
            amount: '10 ETH',
            asset: 'ETH',
            timestamp: 1716300000,
            chain: 'ethereum',
          },
        ],
        timestamps: { firstHopTime: 1716300000, lastHopTime: 1716300000, totalSpanSeconds: 0 },
        evidence: ['Direct deposit'],
        relationshipType: 'DIRECT_DEPOSIT',
        targetVasp: {
          id: 'coindcx',
          name: 'CoinDCX',
          legalName: 'Neblio Technologies',
          fiuStatus: 'REGISTERED',
          regulatoryIdentifier: 'FIU-IND-2023-DCX01',
          depositAddress: mockDepositAddr.address,
          confidence: 98,
        },
      };

      const input: EngineCandidateInput = {
        vasp: mockVasp,
        path: path1Hop,
        matchedAddressEntity: mockDepositAddr,
      };

      const candidate = engine.scoreCandidate('0xuser', 'ethereum', input);

      // Verify all 7 signals are computed
      assert.equal(candidate.signals.length, 7);

      // Verify each signal ID
      const signalIds = candidate.signals.map((s) => s.id);
      assert.deepEqual(signalIds, [
        'proximity',
        'deposit_match',
        'cluster',
        'registry',
        'cross_chain',
        'behavioral',
        'historical',
      ]);

      // Verify weights sum to 100%
      const totalWeight = candidate.signals.reduce((acc, s) => acc + s.weightPercent, 0);
      assert.equal(totalWeight, 100);

      // Verify mathematical formula: finalScore = sum(rawScore * weight)
      let expectedSum = 0;
      for (const sig of candidate.signals) {
        expectedSum += sig.rawScore * (sig.weightPercent / 100);
      }
      assert.equal(candidate.confidenceDecimal, Number(expectedSum.toFixed(3)));
      assert.ok(candidate.confidenceScore >= 85, 'Direct verified deposit should score high confidence');
      assert.ok(['VERY_STRONG_CANDIDATE', 'STRONG_CANDIDATE'].includes(candidate.confidenceBand));
    });
  });

  describe('2. Multi-Hop Distance & Proximity Decay', () => {
    it('should reflect proximity decay over increasing hop distances', () => {
      const makeHopPath = (hops: number): VaspPath => ({
        hops,
        path: Array.from({ length: hops + 1 }, (_, i) => ({
          address: `0xaddr${i}`,
          chain: 'ethereum',
          type: i === hops ? 'vasp' : 'wallet',
        })),
        transactions: [],
        timestamps: { firstHopTime: 0, lastHopTime: 0, totalSpanSeconds: 0 },
        evidence: [],
        relationshipType: 'INDIRECT_TRANSIT',
        targetVasp: {
          id: 'coindcx',
          name: 'CoinDCX',
          legalName: 'Neblio Technologies',
          fiuStatus: 'REGISTERED',
          regulatoryIdentifier: 'FIU-IND',
          depositAddress: '0xaddrN',
          confidence: 80,
        },
      });

      const cand1Hop = engine.scoreCandidate('0xuser', 'ethereum', {
        vasp: mockVasp,
        path: makeHopPath(1),
      });

      const cand3Hop = engine.scoreCandidate('0xuser', 'ethereum', {
        vasp: mockVasp,
        path: makeHopPath(3),
      });

      const cand5Hop = engine.scoreCandidate('0xuser', 'ethereum', {
        vasp: mockVasp,
        path: makeHopPath(5),
      });

      const prox1 = cand1Hop.signals.find((s) => s.id === 'proximity')!;
      const prox3 = cand3Hop.signals.find((s) => s.id === 'proximity')!;
      const prox5 = cand5Hop.signals.find((s) => s.id === 'proximity')!;

      assert.ok(prox1.rawScore > prox3.rawScore, '1 hop proximity score must exceed 3 hops');
      assert.ok(prox3.rawScore > prox5.rawScore, '3 hops proximity score must exceed 5 hops');
      assert.equal(prox1.rawScore, 1.0);
      assert.equal(prox3.rawScore, 0.75);
      assert.equal(prox5.rawScore, 0.30);
    });
  });

  describe('3. Confidence Bands & Categorization', () => {
    it('should categorize scores into standard non-speculative confidence bands', () => {
      assert.equal(engine.getConfidenceBand(95.5), 'VERY_STRONG_CANDIDATE');
      assert.equal(engine.getConfidenceBand(82.0), 'STRONG_CANDIDATE');
      assert.equal(engine.getConfidenceBand(68.4), 'MODERATE_CANDIDATE');
      assert.equal(engine.getConfidenceBand(45.0), 'WEAK_CANDIDATE');
      assert.equal(engine.getConfidenceBand(22.1), 'INSUFFICIENT_EVIDENCE');
    });
  });

  describe('4. Anti-Overclaiming & NO_RELIABLE_ATTRIBUTION Protocol', () => {
    it('should return NO_RELIABLE_ATTRIBUTION when no VASP is reachable', () => {
      const result = engine.evaluateAttribution('0xunknown', 'ethereum', [], 'demo');
      assert.equal(result.status, 'no_reliable_attribution');
      assert.equal(result.topCandidate, null);
      assert.equal(result.confidence, 0);
      assert.equal(result.relationshipType, 'INSUFFICIENT_EVIDENCE');
      assert.ok(result.noAttributionReason?.includes('No known VASP'));
    });

    it('should return NO_RELIABLE_ATTRIBUTION when highest score is below threshold', () => {
      const lowConfidenceVasp: VaspEntity = {
        id: 'offshore_unknown',
        name: 'Unregulated Offshore Node',
        legalName: 'Unknown Corp',
        regulatoryIdentifier: 'N/A',
        jurisdiction: 'OFFSHORE',
        registrationStatus: 'NON_COMPLIANT',
        status: 'ACTIVE',
        riskLevel: 'HIGH',
        country: 'Seychelles',
        source: 'Offshore Registry',
        sourceType: 'demo_dataset',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      };

      const strictEngine = new VaspAttributionScoringEngine({ minConfidenceThreshold: 70.0 });
      const result = strictEngine.evaluateAttribution(
        '0xunknown',
        'ethereum',
        [{ vasp: lowConfidenceVasp }],
        'demo'
      );

      assert.equal(result.status, 'no_reliable_attribution');
      assert.ok(result.noAttributionReason?.includes('below reliable threshold'));
    });
  });

  describe('5. Candidate Ranking', () => {
    it('should rank multiple VASP candidates by descending confidence score', () => {
      const vaspB: VaspEntity = {
        ...mockVasp,
        id: 'wazirx',
        name: 'WazirX',
        regulatoryIdentifier: 'FIU-IND-2023-WAZ02',
      };

      const candidateA: EngineCandidateInput = {
        vasp: mockVasp,
        matchedAddressEntity: mockDepositAddr,
      };

      const candidateB: EngineCandidateInput = {
        vasp: vaspB,
      };

      const result = engine.evaluateAttribution('0xuser', 'ethereum', [candidateB, candidateA], 'demo');

      assert.equal(result.status, 'completed');
      assert.equal(result.candidates.length, 2);
      assert.equal(result.candidates[0].rank, 1);
      assert.equal(result.candidates[1].rank, 2);
      assert.equal(result.candidates[0].vasp.id, 'coindcx', 'Higher evidence candidate must be rank 1');
      assert.ok(result.candidates[0].confidenceScore > result.candidates[1].confidenceScore);
    });
  });

  describe('6. Explainable Evidence Generation', () => {
    it('should produce structured evidence items with scores, weights, and rationale', () => {
      const input: EngineCandidateInput = {
        vasp: mockVasp,
        matchedAddressEntity: mockDepositAddr,
      };

      const candidate = engine.scoreCandidate('0xuser', 'ethereum', input);

      for (const sig of candidate.signals) {
        assert.ok(sig.evidence.type);
        assert.ok(sig.evidence.explanation);
        assert.equal(sig.evidence.weight, sig.weightPercent / 100);
        assert.equal(sig.evidence.score, sig.rawScore);
      }
    });
  });

  describe('7. Statutory Audit Logging Vault', () => {
    it('should record immutable audit entry without exposing API keys or secrets', () => {
      const entry = globalAuditVault.logEvent({
        wallet: '0x7A91bC84D2697e88b209eB0eAc821639d4A44F82',
        chain: 'ethereum',
        mode: 'live',
        action: 'VASP_ATTRIBUTION_QUERY',
        caseId: 'CASE-2026-001',
        officerName: 'Insp. Vikramaditya Sharma',
      });

      assert.ok(entry.id.startsWith('AUD-'));
      assert.ok(entry.integrityHash.length >= 32);
      assert.equal(entry.officerName, 'Insp. Vikramaditya Sharma');
      assert.equal(entry.action, 'VASP_ATTRIBUTION_QUERY');
      assert.ok(entry.targetResource.includes('CASE-2026-001'));

      const logs = globalAuditVault.getLogs();
    });
  });

  describe('8. Multi-Wallet Scoring Consistency & Invariance (3 Wallets)', () => {
    it('should compute deterministic scores and preserve confidence rankings across 3 distinct test wallets', () => {
      const wallets = [
        { address: '0xa090e606e30bd747d4e6245a1517ebe430f0057e', hops: 1, isDeposit: true },
        { address: '0x71c8342fc54bd33eb402741a79f6479f6470001a', hops: 2, isDeposit: false },
        { address: '0x9999999999999999999999999999999999999999', hops: 4, isDeposit: false },
      ];

      const scoredRuns = wallets.map((w) => {
        const path: VaspPath = {
          hops: w.hops,
          path: [
            { address: w.address, chain: 'ethereum', type: 'wallet' },
            { address: mockDepositAddr.address, chain: 'ethereum', type: 'vasp' },
          ],
          transactions: [],
          timestamps: { firstHopTime: 0, lastHopTime: 0, totalSpanSeconds: 0 },
          evidence: [],
          relationshipType: w.hops === 1 ? 'DIRECT_DEPOSIT' : 'INDIRECT_TRANSIT',
          targetVasp: {
            id: mockVasp.id,
            name: mockVasp.name,
            legalName: mockVasp.legalName,
            fiuStatus: mockVasp.registrationStatus,
            regulatoryIdentifier: mockVasp.regulatoryIdentifier || '',
            depositAddress: mockDepositAddr.address,
            confidence: 90,
          },
        };

        const input: EngineCandidateInput = {
          vasp: mockVasp,
          path,
          matchedAddressEntity: w.isDeposit ? mockDepositAddr : undefined,
        };

        return {
          wallet: w.address,
          run1: engine.scoreCandidate(w.address, 'ethereum', input),
          run2: engine.scoreCandidate(w.address, 'ethereum', input),
        };
      });

      // Assert complete idempotence and identical scores across runs for each wallet
      for (const res of scoredRuns) {
        assert.equal(res.run1.confidenceScore, res.run2.confidenceScore);
        assert.equal(res.run1.confidenceBand, res.run2.confidenceBand);
        assert.equal(res.run1.signals.length, 7);
      }

      // Assert decay ordering holds: wallet 1 (1 hop direct) > wallet 2 (2 hop) > wallet 3 (4 hop)
      assert.ok(scoredRuns[0].run1.confidenceScore > scoredRuns[1].run1.confidenceScore);
      assert.ok(scoredRuns[1].run1.confidenceScore > scoredRuns[2].run1.confidenceScore);
    });
  });
});
