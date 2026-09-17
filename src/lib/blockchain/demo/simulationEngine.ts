/**
 * CHAINTRACE // Isolated Demonstration Simulation Engine
 * Smart India Hackathon 2026 Controlled Demonstration Environment
 * 
 * NOTE: This module is exclusively utilized when BLOCKCHAIN_DATA_MODE=demo.
 * In LIVE mode, this simulation engine is BYPASSED in favor of real providers.
 */

import {
  PRIMARY_DEMO_WALLET,
  TRON_HAWALA_WALLET,
  BTC_WASABI_WALLET,
  REFUSAL_PEEL_WALLET,
  REFUSAL_DORMANT_WALLET,
  REFUSAL_SOLANA_WALLET,
  DemoChain,
} from './demoData';

export interface ConfidenceSignalBreakdown {
  id: string;
  label: string;
  weightPercent: number;
  score: number; // 0 - 100
  contribution: number;
  evidenceText: string;
  verified: boolean;
}

export interface VaspAttributionCandidate {
  rank: number;
  vaspId: string;
  vaspName: string;
  legalEntity: string;
  country: string;
  fiuStatus: 'REGISTERED' | 'NOTICE_SERVED' | 'NON_COMPLIANT';
  fiuRegNo: string;
  confidenceScore: number;
  confidenceGrade: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';
  hopDistance: number;
  relationType: 'DIRECT DEPOSIT' | 'CONSOLIDATION CLUSTER' | 'BRIDGE PROXY' | 'MULTI-SIG CUSTODY' | 'INDIRECT TRANSIT';
  network: string;
  depositAddress: string;
  evidenceCount: number;
  pmlaCompliant: boolean;
}

export interface AttributionHop {
  hopNumber: number;
  address: string;
  label: string;
  entityType: string;
  amount: string;
  txHash: string;
  chain: string;
  timestamp: string;
}

export interface AttributionResult {
  suspectWallet: string;
  detectedChain: string;
  nearestVasp: VaspAttributionCandidate;
  candidates: VaspAttributionCandidate[];
  overallConfidence: number;
  confidenceClassification: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT';
  signals: ConfidenceSignalBreakdown[];
  evidenceTrail: string[];
  hopTrail: AttributionHop[];
  clusterSummary: {
    totalWalletsInCluster: number;
    totalBalanceINR: string;
    clusterTag: string;
    heuristicMethod: string;
  };
  crossChainActivity?: {
    detected: boolean;
    sourceChain: string;
    bridgeProtocol: string;
    targetChain: string;
    destinationDepositAddress: string;
  };
  riskSummary: {
    score: number;
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    flags: string[];
  };
  methodologyNotice: string;
  isDemonstrationData: boolean;
  mode: 'demo' | 'live';
  analyzedAt: string;
}

export function runVaspAttributionSimulation(
  walletInput: string,
  chainSelected: DemoChain = 'AUTO'
): AttributionResult {
  const cleanInput = (walletInput || '').trim();
  const lower = cleanInput.toLowerCase();

  // 1. Primary SIH Demo Target
  if (lower.includes('0x7a91') || cleanInput.length === 0 || lower === 'demo') {
    return generatePrimaryDemoAttribution();
  }

  // 2. Tron Hawala Target
  if (lower.startsWith('twk') || lower.includes('tron') || lower.includes('mule')) {
    return generateTronHawalaAttribution(cleanInput);
  }

  // 3. Bitcoin Wasabi Mixer Target
  if (lower.startsWith('bc1') || lower.includes('wasabi') || lower.includes('mixer')) {
    return generateMixerObfuscatedLowConfidence(cleanInput);
  }

  // 4. REFUSAL — Mixer Peel Obfuscation (Ethereum)
  if (lower.includes('0x0000dead') || lower.includes('0x0000') || lower.includes('beef') || lower.includes('peel')) {
    return generateRefusalPeelObfuscation(cleanInput);
  }

  // 5. REFUSAL — Dormant Isolated Wallet (Polygon)
  if (lower.includes('0x1111') || lower.includes('dormant') || lower.includes('isolated')) {
    return generateRefusalDormantWallet(cleanInput);
  }

  // 6. REFUSAL — Unattributed Burn/System Address (Solana)
  if (lower.startsWith('11111') || lower.includes('solana') || lower.includes('burn')) {
    return generateRefusalBurnAddress(cleanInput);
  }

  // 7. Dynamic Heuristic Generator for any other test input in DEMO mode
  return generateDynamicWalletAttribution(cleanInput, chainSelected);
}

function generatePrimaryDemoAttribution(): AttributionResult {
  const signals: ConfidenceSignalBreakdown[] = [
    {
      id: 'sig-1',
      label: 'Transaction proximity within 2 hops',
      weightPercent: 24,
      score: 100,
      contribution: 24.0,
      evidenceText: 'Funds traversed directly through intermediary mule node to candidate VASP deposit gateway within 2 ledger confirmations.',
      verified: true,
    },
    {
      id: 'sig-2',
      label: 'Deposit address heuristic match',
      weightPercent: 22,
      score: 98,
      contribution: 21.56,
      evidenceText: 'Identified designated hot-deposit contract matching CoinDCX custody cluster signature format (Neblio Technologies).',
      verified: true,
    },
    {
      id: 'sig-3',
      label: 'Wallet cluster correlation',
      weightPercent: 18,
      score: 96,
      contribution: 17.28,
      evidenceText: 'Co-spending clustering heuristic links suspect wallet to 14 correlated syndicate transit addresses.',
      verified: true,
    },
    {
      id: 'sig-4',
      label: 'Known VASP relationship registry',
      weightPercent: 15,
      score: 95,
      contribution: 14.25,
      evidenceText: 'Counterparty node is registered under FIU-IND Registry (FIU-IND-VDA-2023-0008) with active statutory compliance desk.',
      verified: true,
    },
    {
      id: 'sig-5',
      label: 'Cross-chain bridging correlation',
      weightPercent: 10,
      score: 92,
      contribution: 9.2,
      evidenceText: 'Stargate / LayerZero bridge transfer observed from Tron TRC20 into Polygon off-ramp cluster.',
      verified: true,
    },
    {
      id: 'sig-6',
      label: 'Behavioral similarity score',
      weightPercent: 7,
      score: 88,
      contribution: 6.16,
      evidenceText: 'Transaction velocity, gas pricing patterns, and round-amount conversions align with automated P2P liquidation sweeps.',
      verified: true,
    },
    {
      id: 'sig-7',
      label: 'Historical cluster signals',
      weightPercent: 4,
      score: 100,
      contribution: 4.0,
      evidenceText: '3 previous STR reports linked to adjacent nodes in the same address cluster during Q4 2025.',
      verified: true,
    },
  ];

  const candidates: VaspAttributionCandidate[] = [
    {
      rank: 1,
      vaspId: 'VASP-IN-01',
      vaspName: 'CoinDCX (Neblio Technologies)',
      legalEntity: 'Neblio Technologies Private Limited',
      country: 'India (Bangalore/Mumbai)',
      fiuStatus: 'REGISTERED',
      fiuRegNo: 'FIU-IND-VDA-2023-0008',
      confidenceScore: 96.8,
      confidenceGrade: 'VERY HIGH',
      hopDistance: 2,
      relationType: 'DIRECT DEPOSIT',
      network: 'TRON / POLYGON (BRIDGED)',
      depositAddress: '0x38b25A89d120B44e3bAc19777E576921319fe9A1',
      evidenceCount: 7,
      pmlaCompliant: true,
    },
    {
      rank: 2,
      vaspId: 'VASP-IN-02',
      vaspName: 'WazirX (Zanmai Labs)',
      legalEntity: 'Zanmai Labs Private Limited',
      country: 'India (Mumbai)',
      fiuStatus: 'REGISTERED',
      fiuRegNo: 'FIU-IND-VDA-2023-0012',
      confidenceScore: 82.4,
      confidenceGrade: 'HIGH',
      hopDistance: 3,
      relationType: 'CONSOLIDATION CLUSTER',
      network: 'ETHEREUM / ERC20',
      depositAddress: '0x71C8a77B280f9E0228372bF00000000000003aF9',
      evidenceCount: 5,
      pmlaCompliant: true,
    },
    {
      rank: 3,
      vaspId: 'VASP-IN-03',
      vaspName: 'CoinSwitch Kuber (Bitcipher)',
      legalEntity: 'Bitcipher Labs LLP',
      country: 'India (Bangalore)',
      fiuStatus: 'REGISTERED',
      fiuRegNo: 'FIU-IND-VDA-2023-0004',
      confidenceScore: 71.6,
      confidenceGrade: 'MODERATE',
      hopDistance: 4,
      relationType: 'INDIRECT TRANSIT',
      network: 'POLYGON',
      depositAddress: '0x44c9b21a890e01293810293810293810293811F8',
      evidenceCount: 4,
      pmlaCompliant: true,
    },
    {
      rank: 4,
      vaspId: 'VASP-GLOBAL-01',
      vaspName: 'Binance Global Enclave',
      legalEntity: 'Binance Holdings Limited',
      country: 'Offshore (Cayman Islands)',
      fiuStatus: 'NOTICE_SERVED',
      fiuRegNo: 'FIU-IND-SHOW-CAUSE-2023/88',
      confidenceScore: 54.2,
      confidenceGrade: 'MODERATE',
      hopDistance: 3,
      relationType: 'BRIDGE PROXY',
      network: 'BNB CHAIN (BSC)',
      depositAddress: '0x8849bCd0381099238491029381029381029355C2',
      evidenceCount: 3,
      pmlaCompliant: false,
    },
  ];

  const hopTrail: AttributionHop[] = [
    {
      hopNumber: 0,
      address: PRIMARY_DEMO_WALLET.address,
      label: 'Suspect Unknown Wallet (Investigation Seed)',
      entityType: 'Unidentified Syndicate Node',
      amount: '250,000 USDT',
      txHash: '0x8f3c4b9e2a1d7f6c5e8b4a3d2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
      chain: 'TRON (TRC20)',
      timestamp: '2026-09-10 18:42:19 IST',
    },
    {
      hopNumber: 1,
      address: 'TWz55mP8xK2Ls4998mP104928114qRt',
      label: 'Mule Aggregation Terminal (Surat Cell)',
      entityType: 'High-Velocity Hawala Mule',
      amount: '249,850 USDT',
      txHash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
      chain: 'TRON / STARGATE BRIDGE',
      timestamp: '2026-09-10 18:45:02 IST',
    },
    {
      hopNumber: 2,
      address: '0x38b25A89d120B44e3bAc19777E576921319fe9A1',
      label: 'CoinDCX Regulated Custody Cluster (Exit VASP)',
      entityType: 'FIU-Registered VASP Deposit Address',
      amount: '249,600 USD₮',
      txHash: '0x99a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
      chain: 'POLYGON (POS)',
      timestamp: '2026-09-10 18:49:15 IST',
    },
  ];

  return {
    suspectWallet: PRIMARY_DEMO_WALLET.address,
    detectedChain: 'TRON (TRC20) → POLYGON BRIDGE',
    nearestVasp: candidates[0],
    candidates,
    overallConfidence: 96.8,
    confidenceClassification: 'VERY HIGH',
    signals,
    evidenceTrail: [
      'Deposit address relationship identified (CoinDCX Custody Vault-04)',
      'Transaction path terminates at candidate VASP cluster within 2 hops',
      'Wallet belongs to associated address cluster #SYN-DEL-04 (14 nodes)',
      'Transaction proximity within configured forensic hop range (max 5 hops)',
      'Cross-chain LayerZero bridge relationship detected (Tron → Polygon)',
      'Behavioral velocity correlation identified with P2P mule cashouts',
      'Historical cluster signal matched against active FIU STR notifications',
    ],
    hopTrail,
    clusterSummary: {
      totalWalletsInCluster: 14,
      totalBalanceINR: '₹42,85,40,000',
      clusterTag: 'Operation DarkTide Transit Nexus',
      heuristicMethod: 'Multi-Input Aggregation + Change Address Prediction',
    },
    crossChainActivity: {
      detected: true,
      sourceChain: 'TRON (TRC20)',
      bridgeProtocol: 'Stargate Finance / LayerZero',
      targetChain: 'POLYGON (POS)',
      destinationDepositAddress: '0x38b25A89d120B44e3bAc19777E576921319fe9A1',
    },
    riskSummary: {
      score: 94,
      level: 'CRITICAL',
      flags: [
        'High-Velocity Hawala Pattern',
        'Cross-Chain Hop within 3 Minutes',
        'Rapid Off-Ramp to Regulated Exchange',
        'P2P Escrow Obfuscation',
      ],
    },
    methodologyNotice:
      'Attribution calculated via multi-variable Bayesian graph traversal evaluating topological proximity, deposit address entropy signatures, cluster co-spending heuristics, and cross-chain bridge relay receipts. Demonstration data for Smart India Hackathon 2026.',
    isDemonstrationData: true,
    mode: 'demo',
    analyzedAt: '2026-09-10 19:42:00 IST',
  };
}

function generateTronHawalaAttribution(address: string): AttributionResult {
  const signals: ConfidenceSignalBreakdown[] = [
    {
      id: 'sig-1',
      label: 'Transaction proximity within 1 hop',
      weightPercent: 24,
      score: 95,
      contribution: 22.8,
      evidenceText: 'Direct sweep into non-compliant offshore liquidity gateway.',
      verified: true,
    },
    {
      id: 'sig-2',
      label: 'Deposit address heuristic match',
      weightPercent: 22,
      score: 85,
      contribution: 18.7,
      evidenceText: 'Matches known HTX/Huobi offshore omnibus deposit pool.',
      verified: true,
    },
    {
      id: 'sig-3',
      label: 'Wallet cluster correlation',
      weightPercent: 18,
      score: 80,
      contribution: 14.4,
      evidenceText: 'Part of 310-wallet Tron USDT betting syndicate cluster.',
      verified: true,
    },
    {
      id: 'sig-4',
      label: 'Known VASP relationship registry',
      weightPercent: 15,
      score: 70,
      contribution: 10.5,
      evidenceText: 'Offshore entity served statutory Section 69A IT Act show-cause notice.',
      verified: true,
    },
    {
      id: 'sig-5',
      label: 'Cross-chain bridging correlation',
      weightPercent: 10,
      score: 75,
      contribution: 7.5,
      evidenceText: 'Direct native TRC20 movement without external bridging.',
      verified: true,
    },
    {
      id: 'sig-6',
      label: 'Behavioral similarity score',
      weightPercent: 7,
      score: 90,
      contribution: 6.3,
      evidenceText: 'High frequency automated script transfers under ₹5,00,000 threshold.',
      verified: true,
    },
    {
      id: 'sig-7',
      label: 'Historical cluster signals',
      weightPercent: 4,
      score: 95,
      contribution: 3.8,
      evidenceText: 'Flagged in Operation Garuda cyber syndicate dossier.',
      verified: true,
    },
  ];

  const candidates: VaspAttributionCandidate[] = [
    {
      rank: 1,
      vaspId: 'VASP-GLOBAL-02',
      vaspName: 'HTX (Formerly Huobi)',
      legalEntity: 'HTX Global Limited (Seychelles)',
      country: 'Seychelles / Hong Kong',
      fiuStatus: 'NON_COMPLIANT',
      fiuRegNo: 'PENDING_STATUTORY_AUDIT',
      confidenceScore: 84.1,
      confidenceGrade: 'HIGH',
      hopDistance: 1,
      relationType: 'DIRECT DEPOSIT',
      network: 'TRON (TRC20)',
      depositAddress: 'TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999',
      evidenceCount: 6,
      pmlaCompliant: false,
    },
    {
      rank: 2,
      vaspId: 'VASP-GLOBAL-03',
      vaspName: 'Bybit Fintech Limited',
      legalEntity: 'Bybit Fintech BVI',
      country: 'Dubai (UAE) / BVI',
      fiuStatus: 'NOTICE_SERVED',
      fiuRegNo: 'FIU-NOTICE-VDA-2024-0019',
      confidenceScore: 68.3,
      confidenceGrade: 'MODERATE',
      hopDistance: 2,
      relationType: 'INDIRECT TRANSIT',
      network: 'TRON / BSC',
      depositAddress: 'TCx8892kmZ4419283109281144889922',
      evidenceCount: 4,
      pmlaCompliant: false,
    },
  ];

  const targetAddr = address || TRON_HAWALA_WALLET.address;

  return {
    suspectWallet: targetAddr,
    detectedChain: 'TRON (TRC20)',
    nearestVasp: candidates[0],
    candidates,
    overallConfidence: 84.1,
    confidenceClassification: 'HIGH',
    signals,
    evidenceTrail: [
      'Direct deposit into HTX offshore omnibus hot wallet identified',
      'Transaction hop count: 1 hop from monitored mule endpoint',
      'Unlicensed offshore jurisdiction operating without FIU-IND registration',
      'Syndicate cluster matches Mahadev-style betting escrow pattern',
    ],
    hopTrail: [
      {
        hopNumber: 0,
        address: targetAddr,
        label: 'Suspect Tron Mule Wallet',
        entityType: 'Mule Terminal',
        amount: '450,000 USDT',
        txHash: '0x8f3c4b9e2a1d7f6c5e8b4a3d2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
        chain: 'TRON',
        timestamp: '2026-09-10 18:12:00 IST',
      },
      {
        hopNumber: 1,
        address: 'TWk93zM2sK8Qp6V1nRt8LpX9xLt44zY999',
        label: 'HTX Offshore Hot Custody Deposit Pool',
        entityType: 'Offshore Exchange Terminal',
        amount: '449,850 USDT',
        txHash: '0x12a9c4d8e7f6b5a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
        chain: 'TRON',
        timestamp: '2026-09-10 18:15:30 IST',
      },
    ],
    clusterSummary: {
      totalWalletsInCluster: 310,
      totalBalanceINR: '₹76,15,00,000',
      clusterTag: 'Operation Garuda Offshore Transit Cluster',
      heuristicMethod: 'TRC20 Sweep Identification + Mempool Time Correlation',
    },
    riskSummary: {
      score: 92,
      level: 'CRITICAL',
      flags: ['Non-Compliant Offshore VASP', 'High Volume USDT Rapid Inflow', 'Unregistered PMLA Gateway'],
    },
    methodologyNotice:
      'Attribution generated based on known omnibus address signatures of offshore exchanges. Demonstration data.',
    isDemonstrationData: true,
    mode: 'demo',
    analyzedAt: '2026-09-10 19:35:00 IST',
  };
}

function generateMixerObfuscatedLowConfidence(address: string): AttributionResult {
  const signals: ConfidenceSignalBreakdown[] = [
    {
      id: 'sig-1',
      label: 'Transaction proximity within hop range',
      weightPercent: 24,
      score: 40,
      contribution: 9.6,
      evidenceText: 'Transaction trail broken by Wasabi CoinJoin / Tornado Cash mixer pool.',
      verified: false,
    },
    {
      id: 'sig-2',
      label: 'Deposit address heuristic match',
      weightPercent: 22,
      score: 35,
      contribution: 7.7,
      evidenceText: 'No deterministic exchange deposit address identified past mixer exit hops.',
      verified: false,
    },
    {
      id: 'sig-3',
      label: 'Wallet cluster correlation',
      weightPercent: 18,
      score: 55,
      contribution: 9.9,
      evidenceText: 'Peel chain analysis identified 4 tentative counterparty outputs.',
      verified: true,
    },
    {
      id: 'sig-4',
      label: 'Known VASP relationship registry',
      weightPercent: 15,
      score: 30,
      contribution: 4.5,
      evidenceText: 'Candidate VASPs cannot be attributed beyond threshold confidence.',
      verified: false,
    },
    {
      id: 'sig-5',
      label: 'Cross-chain bridging correlation',
      weightPercent: 10,
      score: 50,
      contribution: 5.0,
      evidenceText: 'Possible Thorchain or Railgun hop suspected; relayer proof unconfirmed.',
      verified: false,
    },
    {
      id: 'sig-6',
      label: 'Behavioral similarity score',
      weightPercent: 7,
      score: 50,
      contribution: 3.5,
      evidenceText: 'CoinJoin equal-output entropy prevents clear behavioral signature matching.',
      verified: false,
    },
    {
      id: 'sig-7',
      label: 'Historical cluster signals',
      weightPercent: 4,
      score: 60,
      contribution: 2.4,
      evidenceText: 'Address previously cited in CERT-In ransomware advisory NetShield.',
      verified: true,
    },
  ];

  const candidates: VaspAttributionCandidate[] = [
    {
      rank: 1,
      vaspId: 'VASP-GLOBAL-01',
      vaspName: 'Binance Global (Tentative Relayer)',
      legalEntity: 'Binance Holdings Limited',
      country: 'Offshore',
      fiuStatus: 'NOTICE_SERVED',
      fiuRegNo: 'FIU-IND-SHOW-CAUSE-2023/88',
      confidenceScore: 42.6,
      confidenceGrade: 'LOW',
      hopDistance: 5,
      relationType: 'INDIRECT TRANSIT',
      network: 'BITCOIN',
      depositAddress: 'bc1q9v8h2kmz34...w98e',
      evidenceCount: 2,
      pmlaCompliant: false,
    },
    {
      rank: 2,
      vaspId: 'VASP-IN-01',
      vaspName: 'CoinDCX (Unconfirmed Peel)',
      legalEntity: 'Neblio Technologies',
      country: 'India',
      fiuStatus: 'REGISTERED',
      fiuRegNo: 'FIU-IND-VDA-2023-0008',
      confidenceScore: 28.4,
      confidenceGrade: 'INSUFFICIENT',
      hopDistance: 6,
      relationType: 'INDIRECT TRANSIT',
      network: 'BITCOIN',
      depositAddress: 'bc1q44z88k22mm...99lx',
      evidenceCount: 1,
      pmlaCompliant: true,
    },
  ];

  const targetAddr = address || BTC_WASABI_WALLET.address;

  return {
    suspectWallet: targetAddr,
    detectedChain: 'BITCOIN (SEGWIT)',
    nearestVasp: candidates[0],
    candidates,
    overallConfidence: 42.6,
    confidenceClassification: 'LOW',
    signals,
    evidenceTrail: [
      'Low confidence: transaction trail passes through high-entropy CoinJoin mixer',
      'No sufficiently strong deposit-address relationship confirmed within 5 hops',
      'Recommended action: Expand analysis depth to 8 hops or utilize timing de-anonymization',
    ],
    hopTrail: [
      {
        hopNumber: 0,
        address: targetAddr,
        label: 'Suspect Ransomware Wallet',
        entityType: 'CoinJoin Aggregator',
        amount: '3.85 BTC',
        txHash: '0x5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
        chain: 'BITCOIN',
        timestamp: '2026-09-10 18:15:42 IST',
      },
      {
        hopNumber: 1,
        address: 'bc1q44z88k22mm98102938102938102938102938102938199lx',
        label: 'Wasabi Peel Output Node',
        entityType: 'Mixer Obfuscation Hop',
        amount: '0.10 BTC (Equal Output)',
        txHash: '0x99a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        chain: 'BITCOIN',
        timestamp: '2026-09-10 18:22:10 IST',
      },
    ],
    clusterSummary: {
      totalWalletsInCluster: 28,
      totalBalanceINR: '₹16,90,00,000',
      clusterTag: 'Operation NetShield Ransomware Cluster',
      heuristicMethod: 'CoinJoin Peel Unrolling (Low Certainty)',
    },
    riskSummary: {
      score: 98,
      level: 'CRITICAL',
      flags: ['Active CoinJoin Mixer Obfuscation', 'Ransomware Proceeds Indicator', 'High Entropy Dissipation'],
    },
    methodologyNotice:
      'Low Confidence Alert: No deterministic VASP relationship identified above the 60% confidence baseline. Demonstration data.',
    isDemonstrationData: true,
    mode: 'demo',
    analyzedAt: '2026-09-10 19:30:00 IST',
  };
}

function generateDynamicWalletAttribution(
  address: string,
  chain: DemoChain
): AttributionResult {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = (hash << 5) - hash + address.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  const isEvm = address.startsWith('0x') || chain === 'ETHEREUM' || chain === 'POLYGON' || chain === 'BNB CHAIN';
  const isTron = address.startsWith('T') || chain === 'TRON';
  const isBtc = address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1') || chain === 'BITCOIN';
  const isSol = (!isEvm && !isTron && !isBtc) || chain === 'SOLANA';

  const detectedChain = isTron ? 'TRON (TRC20)' : isBtc ? 'BITCOIN' : isSol ? 'SOLANA' : isEvm ? 'ETHEREUM / ERC20' : 'MULTI-CHAIN';
  const hops = 2 + (absHash % 3);
  const confidenceScore = 78.5 + ((absHash % 200) / 10);
  const roundedConfidence = Math.min(98.4, Math.round(confidenceScore * 10) / 10);

  const vaspOptions = [
    { name: 'CoinDCX (Neblio Technologies)', reg: 'FIU-IND-VDA-2023-0008', country: 'India', fiu: 'REGISTERED' as const, pmla: true },
    { name: 'WazirX (Zanmai Labs)', reg: 'FIU-IND-VDA-2023-0012', country: 'India', fiu: 'REGISTERED' as const, pmla: true },
    { name: 'CoinSwitch Kuber (Bitcipher Labs)', reg: 'FIU-IND-VDA-2023-0004', country: 'India', fiu: 'REGISTERED' as const, pmla: true },
    { name: 'Binance Global Enclave', reg: 'FIU-IND-SHOW-CAUSE-2023/88', country: 'Offshore', fiu: 'NOTICE_SERVED' as const, pmla: false },
  ];

  const primaryVasp = vaspOptions[absHash % vaspOptions.length];
  const secondVasp = vaspOptions[(absHash + 1) % vaspOptions.length];

  const candidates: VaspAttributionCandidate[] = [
    {
      rank: 1,
      vaspId: `VASP-DYNAMIC-${absHash % 99}`,
      vaspName: primaryVasp.name,
      legalEntity: primaryVasp.name,
      country: primaryVasp.country,
      fiuStatus: primaryVasp.fiu,
      fiuRegNo: primaryVasp.reg,
      confidenceScore: roundedConfidence,
      confidenceGrade: roundedConfidence >= 90 ? 'VERY HIGH' : 'HIGH',
      hopDistance: hops,
      relationType: hops <= 2 ? 'DIRECT DEPOSIT' : 'CONSOLIDATION CLUSTER',
      network: detectedChain,
      depositAddress: `0x${absHash.toString(16).padStart(8, '0')}...${(absHash + 999).toString(16).slice(-4)}`,
      evidenceCount: 6,
      pmlaCompliant: primaryVasp.pmla,
    },
    {
      rank: 2,
      vaspId: `VASP-DYNAMIC-${(absHash + 1) % 99}`,
      vaspName: secondVasp.name,
      legalEntity: secondVasp.name,
      country: secondVasp.country,
      fiuStatus: secondVasp.fiu,
      fiuRegNo: secondVasp.reg,
      confidenceScore: Math.round((roundedConfidence - 14.5) * 10) / 10,
      confidenceGrade: 'MODERATE',
      hopDistance: hops + 1,
      relationType: 'INDIRECT TRANSIT',
      network: detectedChain,
      depositAddress: `0x${(absHash + 1234).toString(16).padStart(8, '0')}...e9B2`,
      evidenceCount: 4,
      pmlaCompliant: secondVasp.pmla,
    },
  ];

  const signals: ConfidenceSignalBreakdown[] = [
    {
      id: 'sig-1',
      label: `Transaction proximity within ${hops} hops`,
      weightPercent: 24,
      score: 95,
      contribution: 22.8,
      evidenceText: `Identified direct ledger transition within ${hops} confirmations.`,
      verified: true,
    },
    {
      id: 'sig-2',
      label: 'Deposit address match heuristic',
      weightPercent: 22,
      score: 92,
      contribution: 20.24,
      evidenceText: `Correlated with candidate VASP ${primaryVasp.name} hot wallet topology.`,
      verified: true,
    },
    {
      id: 'sig-3',
      label: 'Wallet cluster correlation',
      weightPercent: 18,
      score: 85,
      contribution: 15.3,
      evidenceText: 'Multi-input clustering heuristics revealed 8 correlated transit accounts.',
      verified: true,
    },
    {
      id: 'sig-4',
      label: 'Known VASP relationship registry',
      weightPercent: 15,
      score: 90,
      contribution: 13.5,
      evidenceText: `Registered under statutory ledger directory ${primaryVasp.reg}.`,
      verified: true,
    },
    {
      id: 'sig-5',
      label: 'Cross-chain correlation',
      weightPercent: 10,
      score: 80,
      contribution: 8.0,
      evidenceText: 'Mempool timing correlation verified with relayer bridge telemetry.',
      verified: true,
    },
    {
      id: 'sig-6',
      label: 'Behavioral similarity score',
      weightPercent: 7,
      score: 85,
      contribution: 5.95,
      evidenceText: 'Liquidation timing consistent with automated off-ramp batching.',
      verified: true,
    },
    {
      id: 'sig-7',
      label: 'Historical cluster signals',
      weightPercent: 4,
      score: 80,
      contribution: 3.2,
      evidenceText: 'Prior heuristic records confirmed in demonstration intelligence cache.',
      verified: true,
    },
  ];

  return {
    suspectWallet: address,
    detectedChain,
    nearestVasp: candidates[0],
    candidates,
    overallConfidence: roundedConfidence,
    confidenceClassification: roundedConfidence >= 90 ? 'VERY HIGH' : 'HIGH',
    signals,
    evidenceTrail: [
      `Attributed to ${primaryVasp.name} via ${hops}-hop path analysis`,
      `Verified deposit pattern on ${detectedChain}`,
      'Wallet address clustering confirmed correlated transit nodes',
      'Signal consistency confirmed across multi-chain API adapters',
    ],
    hopTrail: [
      {
        hopNumber: 0,
        address,
        label: 'Suspect Target Wallet (Input Address)',
        entityType: 'Unidentified Node',
        amount: '185,000 USDT equiv.',
        txHash: `0x${absHash.toString(16).padEnd(64, '0')}`,
        chain: detectedChain,
        timestamp: '2026-09-10 18:30:00 IST',
      },
      {
        hopNumber: hops,
        address: candidates[0].depositAddress,
        label: `${primaryVasp.name} Attributed Gateway`,
        entityType: 'VASP Custody Node',
        amount: '184,820 USDT equiv.',
        txHash: `0x${(absHash + 999).toString(16).padEnd(64, 'a')}`,
        chain: detectedChain,
        timestamp: '2026-09-10 18:38:22 IST',
      },
    ],
    clusterSummary: {
      totalWalletsInCluster: 8 + (absHash % 12),
      totalBalanceINR: `₹${((absHash % 50) + 12).toFixed(2)} Crore`,
      clusterTag: `Dynamic Target Cluster #${absHash % 999}`,
      heuristicMethod: 'Common-Input Spending + Gas Oracle Correlation',
    },
    riskSummary: {
      score: 75 + (absHash % 20),
      level: 'HIGH',
      flags: ['Rapid Hop Velocity', 'Automated Liquidation Profile', 'Threshold Transaction Sizing'],
    },
    methodologyNotice:
      'Dynamic heuristic attribution generated via simulated blockchain intelligence API abstraction. Demonstration data for SIH 2026.',
    isDemonstrationData: true,
    mode: 'demo',
    analyzedAt: '2026-09-10 19:40:00 IST',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REFUSAL GENERATORS — Anti-Overclaiming Protocol
// These functions demonstrate the NO_RELIABLE_ATTRIBUTION / INSUFFICIENT_EVIDENCE
// enforcement. The system refuses to attribute rather than guess.
// ─────────────────────────────────────────────────────────────────────────────

function generateRefusalPeelObfuscation(address: string): AttributionResult {
  const targetAddr = address || REFUSAL_PEEL_WALLET.address;
  const signals: ConfidenceSignalBreakdown[] = [
    { id: 'sig-1', label: 'Transaction proximity within hop range', weightPercent: 24, score: 12, contribution: 2.88,
      evidenceText: 'Trail fragmented across 7+ CoinJoin rounds; origin-destination linkage severed.', verified: false },
    { id: 'sig-2', label: 'Deposit address heuristic match', weightPercent: 22, score: 8, contribution: 1.76,
      evidenceText: 'No deterministic VASP deposit address identifiable post-mixer exit.', verified: false },
    { id: 'sig-3', label: 'Wallet cluster correlation', weightPercent: 18, score: 15, contribution: 2.70,
      evidenceText: 'Equal-output entropy from mixer pool prevents common-input clustering.', verified: false },
    { id: 'sig-4', label: 'Known VASP relationship registry', weightPercent: 15, score: 10, contribution: 1.50,
      evidenceText: 'Zero matching entries in statutory VASP ledger directory.', verified: false },
    { id: 'sig-5', label: 'Cross-chain bridging correlation', weightPercent: 10, score: 20, contribution: 2.00,
      evidenceText: 'Possible Tornado Cash V3 / Railgun relay detected; relayer proof unconfirmed.', verified: false },
    { id: 'sig-6', label: 'Behavioral similarity score', weightPercent: 7, score: 18, contribution: 1.26,
      evidenceText: 'Mixing behaviour prevents timing-based liquidation profile matching.', verified: false },
    { id: 'sig-7', label: 'Historical cluster signals', weightPercent: 4, score: 22, contribution: 0.88,
      evidenceText: 'No prior LEA intelligence cache entry for this address or cluster.', verified: false },
  ];
  const refusalCandidate: VaspAttributionCandidate = {
    rank: 1, vaspId: 'NO_RELIABLE_ATTRIBUTION', vaspName: 'NO_RELIABLE_ATTRIBUTION',
    legalEntity: 'INSUFFICIENT_EVIDENCE', country: 'UNKNOWN', fiuStatus: 'NON_COMPLIANT',
    fiuRegNo: 'N/A', confidenceScore: 12.98, confidenceGrade: 'INSUFFICIENT',
    hopDistance: 99, relationType: 'INDIRECT TRANSIT', network: 'ETHEREUM',
    depositAddress: 'UNRESOLVABLE', evidenceCount: 0, pmlaCompliant: false,
  };
  return {
    suspectWallet: targetAddr, detectedChain: 'ETHEREUM (ERC-20)',
    nearestVasp: refusalCandidate, candidates: [refusalCandidate],
    overallConfidence: 12.98, confidenceClassification: 'INSUFFICIENT', signals,
    evidenceTrail: [
      'REFUSAL: Transaction trail destroyed by Ethereum mixer pool (CoinJoin / Tornado Cash variant)',
      'ANTI-OVERCLAIM: Confidence score 12.98% is below 30% minimum attribution threshold',
      'SYSTEM FINDING: NO_RELIABLE_ATTRIBUTION — Insufficient evidence to name a VASP',
      'RECOMMENDED ACTION: Obtain court order for blockchain analytics provider (Chainalysis / Elliptic) level-2 tracing',
    ],
    hopTrail: [
      { hopNumber: 0, address: targetAddr, label: 'Suspect Peel Chain Wallet', entityType: 'Mixer Input Node',
        amount: 'UNKNOWN (obfuscated)', txHash: '0x0000dead...', chain: 'ETHEREUM', timestamp: '2026-09-10 18:00:00 IST' },
    ],
    clusterSummary: { totalWalletsInCluster: 0, totalBalanceINR: 'UNDETERMINED',
      clusterTag: 'Mixer Pool — Attribution Severed', heuristicMethod: 'N/A — Entropy prevents clustering' },
    riskSummary: { score: 88, level: 'CRITICAL',
      flags: ['Active Mixer Obfuscation', 'No Attribution Possible', 'Anti-Forensics Confirmed'] },
    methodologyNotice: 'ANTI-OVERCLAIMING PROTOCOL ACTIVE: Score 12.98% < 30% threshold. System refuses to attribute. Demonstration of NO_RELIABLE_ATTRIBUTION enforcement.',
    isDemonstrationData: true, mode: 'demo', analyzedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
}

function generateRefusalDormantWallet(address: string): AttributionResult {
  const targetAddr = address || REFUSAL_DORMANT_WALLET.address;
  const signals: ConfidenceSignalBreakdown[] = [
    { id: 'sig-1', label: 'Transaction proximity within hop range', weightPercent: 24, score: 5, contribution: 1.20,
      evidenceText: 'Wallet has had zero outbound transactions in 14+ months. No hop path discoverable.', verified: false },
    { id: 'sig-2', label: 'Deposit address heuristic match', weightPercent: 22, score: 0, contribution: 0.00,
      evidenceText: 'No deposit address pattern matches any VASP in the statutory registry.', verified: false },
    { id: 'sig-3', label: 'Wallet cluster correlation', weightPercent: 18, score: 8, contribution: 1.44,
      evidenceText: 'Address appears in isolation; no correlated inputs or outputs in graph.', verified: false },
    { id: 'sig-4', label: 'Known VASP relationship registry', weightPercent: 15, score: 0, contribution: 0.00,
      evidenceText: 'Address not present in any indexed VASP ledger, cluster, or hot wallet list.', verified: false },
    { id: 'sig-5', label: 'Cross-chain bridging correlation', weightPercent: 10, score: 0, contribution: 0.00,
      evidenceText: 'No cross-chain bridge events detected on Ethereum, Polygon, or Solana.', verified: false },
    { id: 'sig-6', label: 'Behavioral similarity score', weightPercent: 7, score: 10, contribution: 0.70,
      evidenceText: 'Dormant accumulation pattern — insufficient activity to build behavioral fingerprint.', verified: false },
    { id: 'sig-7', label: 'Historical cluster signals', weightPercent: 4, score: 0, contribution: 0.00,
      evidenceText: 'No historical LEA intelligence entries exist for this address.', verified: false },
  ];
  const refusalCandidate: VaspAttributionCandidate = {
    rank: 1, vaspId: 'NO_RELIABLE_ATTRIBUTION', vaspName: 'NO_RELIABLE_ATTRIBUTION',
    legalEntity: 'INSUFFICIENT_EVIDENCE', country: 'UNKNOWN', fiuStatus: 'NON_COMPLIANT',
    fiuRegNo: 'N/A', confidenceScore: 3.34, confidenceGrade: 'INSUFFICIENT',
    hopDistance: 99, relationType: 'INDIRECT TRANSIT', network: 'POLYGON',
    depositAddress: 'UNRESOLVABLE', evidenceCount: 0, pmlaCompliant: false,
  };
  return {
    suspectWallet: targetAddr, detectedChain: 'POLYGON (MATIC/POL)',
    nearestVasp: refusalCandidate, candidates: [refusalCandidate],
    overallConfidence: 3.34, confidenceClassification: 'INSUFFICIENT', signals,
    evidenceTrail: [
      'REFUSAL: Wallet is dormant with no outbound transaction graph path discoverable',
      'ANTI-OVERCLAIM: Confidence score 3.34% is below 30% minimum attribution threshold',
      'SYSTEM FINDING: NO_RELIABLE_ATTRIBUTION — Wallet isolated, no reachable VASP node',
      'RECOMMENDED ACTION: Initiate a Section 91 CrPC production order to the platform holding the wallet',
    ],
    hopTrail: [
      { hopNumber: 0, address: targetAddr, label: 'Dormant Isolated Wallet', entityType: 'Dormant Node',
        amount: 'UNKNOWN (no activity)', txHash: 'N/A', chain: 'POLYGON', timestamp: 'Last active: ~14 months ago' },
    ],
    clusterSummary: { totalWalletsInCluster: 0, totalBalanceINR: 'UNDETERMINED',
      clusterTag: 'Isolated — No Cluster Identified', heuristicMethod: 'N/A — Insufficient transaction graph' },
    riskSummary: { score: 72, level: 'HIGH',
      flags: ['Dormant Accumulation Pattern', 'No Attribution Possible', 'Surveillance Recommended'] },
    methodologyNotice: 'ANTI-OVERCLAIMING PROTOCOL ACTIVE: Score 3.34% < 30% threshold. System refuses to attribute. Demonstration of NO_RELIABLE_ATTRIBUTION enforcement for isolated wallets.',
    isDemonstrationData: true, mode: 'demo', analyzedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
}

function generateRefusalBurnAddress(address: string): AttributionResult {
  const targetAddr = address || REFUSAL_SOLANA_WALLET.address;
  const signals: ConfidenceSignalBreakdown[] = [
    { id: 'sig-1', label: 'Transaction proximity within hop range', weightPercent: 24, score: 0, contribution: 0.00,
      evidenceText: 'Verified system / burn address: transactions are one-way inbound only.', verified: false },
    { id: 'sig-2', label: 'Deposit address heuristic match', weightPercent: 22, score: 0, contribution: 0.00,
      evidenceText: 'System program addresses do not correspond to any exchange deposit pattern.', verified: false },
    { id: 'sig-3', label: 'Wallet cluster correlation', weightPercent: 18, score: 0, contribution: 0.00,
      evidenceText: 'Burn addresses by protocol design have no spending outputs; clustering impossible.', verified: false },
    { id: 'sig-4', label: 'Known VASP relationship registry', weightPercent: 15, score: 0, contribution: 0.00,
      evidenceText: 'System program address explicitly excluded from VASP attribution registry.', verified: false },
    { id: 'sig-5', label: 'Cross-chain bridging correlation', weightPercent: 10, score: 0, contribution: 0.00,
      evidenceText: 'No cross-chain bridge events; funds sent here are permanently unrecoverable.', verified: false },
    { id: 'sig-6', label: 'Behavioral similarity score', weightPercent: 7, score: 0, contribution: 0.00,
      evidenceText: 'Burn destination — no behavioral pattern for comparison.', verified: false },
    { id: 'sig-7', label: 'Historical cluster signals', weightPercent: 4, score: 0, contribution: 0.00,
      evidenceText: 'Well-known burn address; not in criminal ledger intelligence.', verified: false },
  ];
  const refusalCandidate: VaspAttributionCandidate = {
    rank: 1, vaspId: 'NO_RELIABLE_ATTRIBUTION', vaspName: 'NO_RELIABLE_ATTRIBUTION',
    legalEntity: 'INSUFFICIENT_EVIDENCE', country: 'N/A', fiuStatus: 'NON_COMPLIANT',
    fiuRegNo: 'N/A', confidenceScore: 0.00, confidenceGrade: 'INSUFFICIENT',
    hopDistance: 99, relationType: 'INDIRECT TRANSIT', network: 'SOLANA',
    depositAddress: 'UNRESOLVABLE', evidenceCount: 0, pmlaCompliant: false,
  };
  return {
    suspectWallet: targetAddr, detectedChain: 'SOLANA (SOL)',
    nearestVasp: refusalCandidate, candidates: [refusalCandidate],
    overallConfidence: 0.00, confidenceClassification: 'INSUFFICIENT', signals,
    evidenceTrail: [
      'REFUSAL: Address is a Solana System Program / Burn address — VASP attribution is structurally impossible',
      'ANTI-OVERCLAIM: Confidence score 0.00% is below 30% minimum attribution threshold',
      'SYSTEM FINDING: NO_RELIABLE_ATTRIBUTION — Funds sent to this address are permanently unrecoverable',
      'RECOMMENDED ACTION: Investigate origin addresses that funded this burn — not this destination',
    ],
    hopTrail: [
      { hopNumber: 0, address: targetAddr, label: 'Solana Burn / System Program Address', entityType: 'Burn Destination',
        amount: 'UNRECOVERABLE', txHash: 'N/A', chain: 'SOLANA', timestamp: 'N/A' },
    ],
    clusterSummary: { totalWalletsInCluster: 0, totalBalanceINR: '₹0 (Burned / Permanently Locked)',
      clusterTag: 'Burn Address — Attribution Impossible', heuristicMethod: 'N/A — Burn destination, no spendable outputs' },
    riskSummary: { score: 0, level: 'LOW',
      flags: ['Burn / System Address', 'No VASP Attribution Possible', 'Investigate Funding Source Instead'] },
    methodologyNotice: 'ANTI-OVERCLAIMING PROTOCOL ACTIVE: Score 0.00%. System program / burn address. NO_RELIABLE_ATTRIBUTION enforced. Demonstration of correct refusal for known unattributable addresses.',
    isDemonstrationData: true, mode: 'demo', analyzedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  };
}
