export interface CaseItem {
  id: string;
  title: string;
  leadOfficer: string;
  agency: string;
  openedDate: string;
  status: 'ACTIVE TRACE' | 'SUBPOENA SERVED' | 'ESCALATED' | 'EVIDENTIARY FREEZE' | 'CLOSED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  totalExposureINR: string; // formatted in ₹
  exposureAmountRaw: number; // in INR
  walletsTracked: number;
  chains: string[];
  associatedVasp: string;
  riskScore: number;
  summary: string;
}

export interface WalletEntity {
  address: string;
  chain: 'ETHEREUM' | 'BITCOIN' | 'TRON' | 'SOLANA' | 'BSC' | 'POLYGON';
  clusterLabel: string;
  entityType: 'Darknet Mixer' | 'Unlicensed VASP' | 'High-Velocity Hawala' | 'FIU-Registered VASP' | 'Whale Node';
  riskScore: number;
  threatLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'VERIFIED';
  balanceINR: string;
  volume24hINR: string;
  fiuRegistration?: string;
  jurisdiction: string;
  firstSeen: string;
  lastActive: string;
  hopsToCashout: number;
  attributionConfidence: number;
}

export interface TransactionHop {
  txHash: string;
  chain: string;
  timestamp: string;
  fromAddress: string;
  fromLabel: string;
  toAddress: string;
  toLabel: string;
  amountCrypto: string;
  amountINR: string;
  feeINR: string;
  gasTelemetry: string;
  status: 'CONFIRMED' | 'FLAGGED_MIXER' | 'CROSS_CHAIN_HOP' | 'INTERCEPTED';
  riskCategory: 'High Velocity' | 'Tornado Cash Proxy' | 'P2P Hawala' | 'Regulated Off-Ramp';
}

export interface VaspNode {
  id: string;
  name: string;
  country: string;
  fiuStatus: 'REGISTERED' | 'NON_COMPLIANT' | 'NOTICE_SERVED' | 'UNDER_SANCTION';
  fiuRegNo: string;
  kycComplianceScore: number;
  totalSubpoenasActive: number;
  estimatedVolume24hINR: string;
  nodalOfficerContact: string;
  pmlaCompliant: boolean;
  activeGateways: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerBadge: string;
  officerName: string;
  action: string;
  targetResource: string;
  agencyBranch: string;
  ipAddress: string;
  integrityHash: string;
  legalAuthority: string;
}

export const CURRENT_OFFICER = {
  name: 'Insp. Vikramaditya Sharma',
  badgeId: 'DEL-CYBER-8842',
  designation: 'Senior Cyber Forensic Investigator',
  agency: 'Delhi Police Cyber Command & FIU-IND Liaison Enclave',
  clearance: 'LEVEL-4 // TOP SECRET // LEA SENSITIVE',
  sessionAuditId: 'AUD-2026-DEL-9941-X',
  activeDirective: 'CYBER INTELLIGENCE DIRECTIVE 88-B',
  clusterNode: 'New Delhi Cluster-04 (BLK-INDEXER-9)',
};

export const KPIS = {
  activeCases: 42,
  activeCasesTrend: '+6 this wk',
  walletsAnalyzed: '1,849',
  chainsActive: 6,
  highRiskTargets: 328,
  highRiskPercent: '17.7% of total',
  vaspAttributions: 512,
  vaspConfidence: '91.4% Conf.',
  totalSeizedINR: '₹48.25 Crore',
  totalFlaggedINR: '₹184.60 Crore',
  inboundRate: '18,420 TX/SEC',
};

export const CASES: CaseItem[] = [
  {
    id: 'CASE-2026-001',
    title: 'Operation DarkTide — Cross-Border Hawala & Bridge Mixer Nexus',
    leadOfficer: 'Insp. Vikramaditya Sharma',
    agency: 'Special Cell (Cyber) / FIU-IND Cell',
    openedDate: '14 Jan 2026',
    status: 'ACTIVE TRACE',
    priority: 'CRITICAL',
    totalExposureINR: '₹42,85,40,000 (₹42.8 Cr)',
    exposureAmountRaw: 428540000,
    walletsTracked: 184,
    chains: ['Ethereum', 'Tron', 'Bitcoin', 'Solana'],
    associatedVasp: 'Offshore Non-Compliant (Seychelles)',
    riskScore: 94,
    summary: 'Multi-hop layered laundering of syndicate extortion proceeds through obfuscated Tron/USDT hops and Thorchain cross-chain bridges into unlicensed P2P desks in NCR and Mumbai.',
  },
  {
    id: 'CASE-2026-004',
    title: 'Operation SagarSetu — VDA P2P Banking Mule Ring',
    leadOfficer: 'DSP Rajeshwari Pillai',
    agency: 'Enforcement Directorate (ED) PMLA Cell',
    openedDate: '02 Feb 2026',
    status: 'SUBPOENA SERVED',
    priority: 'HIGH',
    totalExposureINR: '₹18,40,20,000 (₹18.4 Cr)',
    exposureAmountRaw: 184020000,
    walletsTracked: 62,
    chains: ['Tron', 'Polygon', 'Ethereum'],
    associatedVasp: 'CoinDCX / WazirX (Compliant Indian VASPs)',
    riskScore: 82,
    summary: 'Coordinated siphoning of retail investor funds via fake task scams; routed into 400+ mule bank accounts in Surat and Jaipur, converted to USDT on P2P desks.',
  },
  {
    id: 'CASE-2026-009',
    title: 'Operation Garuda — Illegal Offshore Betting Crypto Liquidity',
    leadOfficer: 'ACP Amit Kulkarni',
    agency: 'CBI Cyber Crime Division',
    openedDate: '19 Feb 2026',
    status: 'EVIDENTIARY FREEZE',
    priority: 'CRITICAL',
    totalExposureINR: '₹76,15,00,000 (₹76.1 Cr)',
    exposureAmountRaw: 761500000,
    walletsTracked: 310,
    chains: ['Tron', 'BSC', 'Ethereum'],
    associatedVasp: 'Multiple Offshore Nodes',
    riskScore: 98,
    summary: 'Illegal Mahadev-style betting syndicate utilizing USDT-TRC20 automation scripts to off-ramp INR into Dubai and Cambodia escrow entities without PAN/FIU verification.',
  },
  {
    id: 'CASE-2026-012',
    title: 'Operation NetShield — AI Ransomware Extortion Attack on PSU Infrastructure',
    leadOfficer: 'Dr. Sanjay Mehta, Scientist-F',
    agency: 'CERT-In / Delhi Cyber Command',
    openedDate: '28 Feb 2026',
    status: 'ACTIVE TRACE',
    priority: 'HIGH',
    totalExposureINR: '₹9,80,00,000 (₹9.8 Cr)',
    exposureAmountRaw: 98000000,
    walletsTracked: 28,
    chains: ['Bitcoin', 'Monero'],
    associatedVasp: 'Wasabi Mixer / Railgun',
    riskScore: 89,
    summary: 'Targeted zero-day intrusion demanding ransom in BTC. Active coin-join transaction tracing utilizing clustering heuristics and timing analysis to identify peel chains.',
  },
  {
    id: 'CASE-2026-015',
    title: 'Operation Falcon — Narcotic Hawala Transit via Telegram Crypto Bots',
    leadOfficer: 'Insp. R. Ramanathan',
    agency: 'Narcotics Control Bureau (NCB) Cyber Matrix',
    openedDate: '04 Mar 2026',
    status: 'ESCALATED',
    priority: 'CRITICAL',
    totalExposureINR: '₹14,20,00,000 (₹14.2 Cr)',
    exposureAmountRaw: 142000000,
    walletsTracked: 95,
    chains: ['Solana', 'Tron'],
    associatedVasp: 'Bybit / Unregulated Telegram Bots',
    riskScore: 91,
    summary: 'Darknet vendor payments for contraband dispatched across southern states. Escrow settlement facilitated through ephemeral Solana smart contract swaps.',
  },
];

export const WALLETS: WalletEntity[] = [
  {
    address: '0x71C8a77B280f9...3aF9',
    chain: 'ETHEREUM',
    clusterLabel: 'Syndicate Primary Escrow Node',
    entityType: 'High-Velocity Hawala',
    riskScore: 96,
    threatLevel: 'CRITICAL',
    balanceINR: '₹12,45,80,000',
    volume24hINR: '₹3,84,10,000',
    jurisdiction: 'Offshore / Unregistered',
    firstSeen: '12 Nov 2025',
    lastActive: '2 mins ago',
    hopsToCashout: 1,
    attributionConfidence: 98.4,
  },
  {
    address: 'TWk93zM2sK8Qp...9xLt',
    chain: 'TRON',
    clusterLabel: 'USDT-TRC20 High Volume Mule Terminal',
    entityType: 'High-Velocity Hawala',
    riskScore: 92,
    threatLevel: 'CRITICAL',
    balanceINR: '₹28,15,40,000',
    volume24hINR: '₹9,45,00,000',
    jurisdiction: 'Cambodia / Dubai Gateway',
    firstSeen: '04 Dec 2025',
    lastActive: '14 secs ago',
    hopsToCashout: 2,
    attributionConfidence: 94.2,
  },
  {
    address: 'bc1q9v8h2kmz34...w98e',
    chain: 'BITCOIN',
    clusterLabel: 'Wasabi CoinJoin Peel Chain Aggregator',
    entityType: 'Darknet Mixer',
    riskScore: 98,
    threatLevel: 'CRITICAL',
    balanceINR: '₹16,90,00,000',
    volume24hINR: '₹1,20,50,000',
    jurisdiction: 'Autonomous / Decentralized',
    firstSeen: '18 Jan 2026',
    lastActive: '1 hr ago',
    hopsToCashout: 3,
    attributionConfidence: 91.8,
  },
  {
    address: '0x38b25A89d120...e9A1',
    chain: 'POLYGON',
    clusterLabel: 'CoinDCX Regulated Custody Cluster',
    entityType: 'FIU-Registered VASP',
    riskScore: 14,
    threatLevel: 'VERIFIED',
    balanceINR: '₹84,20,00,000',
    volume24hINR: '₹22,10,00,000',
    fiuRegistration: 'FIU-IND-VDA-2023-0012',
    jurisdiction: 'India (Mumbai / PMLA Compliant)',
    firstSeen: '01 Aug 2023',
    lastActive: 'Live Node',
    hopsToCashout: 0,
    attributionConfidence: 99.9,
  },
  {
    address: '0x8849bCd03810...55C2',
    chain: 'ETHEREUM',
    clusterLabel: 'Thorchain Cross-Chain Liquidity Router',
    entityType: 'Unlicensed VASP',
    riskScore: 78,
    threatLevel: 'HIGH',
    balanceINR: '₹4,95,00,000',
    volume24hINR: '₹18,40,00,000',
    jurisdiction: 'Decentralized Cross-Chain Protocol',
    firstSeen: '10 Feb 2026',
    lastActive: '8 mins ago',
    hopsToCashout: 2,
    attributionConfidence: 87.5,
  },
  {
    address: '9xWk6mNq2L5k8P...3v1B',
    chain: 'SOLANA',
    clusterLabel: 'Raydium Ephemeral Swap Pool Node',
    entityType: 'Whale Node',
    riskScore: 68,
    threatLevel: 'MEDIUM',
    balanceINR: '₹2,84,00,000',
    volume24hINR: '₹5,12,00,000',
    jurisdiction: 'Decentralized AMM',
    firstSeen: '22 Feb 2026',
    lastActive: '45 mins ago',
    hopsToCashout: 3,
    attributionConfidence: 83.1,
  },
];

export const TRANSACTIONS: TransactionHop[] = [
  {
    txHash: '0x8f3c4b9e2a1d7f6c5e8b4a3d2c1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3',
    chain: 'TRON (TRC20)',
    timestamp: '2026-09-10 18:42:19 IST',
    fromAddress: 'TWk93zM2sK8Qp...9xLt',
    fromLabel: 'Syndicate Cold Wallet 04',
    toAddress: 'TWz55mP8xK2Ls...4qRt',
    toLabel: 'Mule Layer-1 Terminal (Surat)',
    amountCrypto: '250,000 USDT',
    amountINR: '₹2,22,50,000',
    feeINR: '₹142.50',
    gasTelemetry: '28,400 Energy // Zero Bandwidth Burn',
    status: 'INTERCEPTED',
    riskCategory: 'High Velocity',
  },
  {
    txHash: '0x12a9c4d8e7f6b5a3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    chain: 'ETHEREUM',
    timestamp: '2026-09-10 18:38:05 IST',
    fromAddress: '0x71C8a77B280f9...3aF9',
    fromLabel: 'Primary Escrow Node',
    toAddress: '0xd90e2f925DA72...75B4',
    toLabel: 'Tornado.Cash Proxy Router',
    amountCrypto: '65.40 ETH',
    amountINR: '₹1,89,66,000',
    feeINR: '₹3,420.00',
    gasTelemetry: '42.8 Gwei // EIP-1559 Standard',
    status: 'FLAGGED_MIXER',
    riskCategory: 'Tornado Cash Proxy',
  },
  {
    txHash: '0x5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
    chain: 'BITCOIN',
    timestamp: '2026-09-10 18:15:42 IST',
    fromAddress: 'bc1q9v8h2kmz34...w98e',
    fromLabel: 'CoinJoin Aggregator Cluster',
    toAddress: 'bc1q44z88k22mm...99lx',
    toLabel: 'Peel Address Hop-3',
    amountCrypto: '3.85 BTC',
    amountINR: '₹2,73,35,000',
    feeINR: '₹1,240.00',
    gasTelemetry: '18 sat/vB // SegWit Witness',
    status: 'CONFIRMED',
    riskCategory: 'High Velocity',
  },
  {
    txHash: '0x99a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
    chain: 'POLYGON',
    timestamp: '2026-09-10 17:59:11 IST',
    fromAddress: '0x44c9b21a890e...11F8',
    fromLabel: 'Flagged P2P Trader Wallet',
    toAddress: '0x38b25A89d120...e9A1',
    toLabel: 'CoinDCX User Hot Wallet',
    amountCrypto: '85,000 MATIC',
    amountINR: '₹48,45,000',
    feeINR: '₹2.80',
    gasTelemetry: '85 Gwei // Fast',
    status: 'CONFIRMED',
    riskCategory: 'Regulated Off-Ramp',
  },
  {
    txHash: '0x4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3',
    chain: 'CROSS-CHAIN (WORMHOLE)',
    timestamp: '2026-09-10 17:41:28 IST',
    fromAddress: '0x8849bCd03810...55C2',
    fromLabel: 'Ethereum Bridge Contract',
    toAddress: '9xWk6mNq2L5k8P...3v1B',
    toLabel: 'Solana Custody Account',
    amountCrypto: '120,000 USDC',
    amountINR: '₹1,06,80,000',
    feeINR: '₹480.00',
    gasTelemetry: 'Multi-Sig Relayer Verified',
    status: 'CROSS_CHAIN_HOP',
    riskCategory: 'P2P Hawala',
  },
];

export const VASP_LIST: VaspNode[] = [
  {
    id: 'VASP-IN-01',
    name: 'CoinDCX (Neblio Technologies Pvt Ltd)',
    country: 'India (Bangalore/Mumbai)',
    fiuStatus: 'REGISTERED',
    fiuRegNo: 'FIU-IND-VDA-2023-0008',
    kycComplianceScore: 98,
    totalSubpoenasActive: 14,
    estimatedVolume24hINR: '₹142.50 Crore',
    nodalOfficerContact: 'nodal.lea@coindcx.com // +91-80-4920-XXXX',
    pmlaCompliant: true,
    activeGateways: 8,
  },
  {
    id: 'VASP-IN-02',
    name: 'WazirX (Zanmai Labs Pvt Ltd)',
    country: 'India (Mumbai)',
    fiuStatus: 'REGISTERED',
    fiuRegNo: 'FIU-IND-VDA-2023-0012',
    kycComplianceScore: 92,
    totalSubpoenasActive: 28,
    estimatedVolume24hINR: '₹88.40 Crore',
    nodalOfficerContact: 'law-enforcement@wazirx.com // +91-22-6842-XXXX',
    pmlaCompliant: true,
    activeGateways: 6,
  },
  {
    id: 'VASP-IN-03',
    name: 'CoinSwitch Kuber (Bitcipher Labs)',
    country: 'India (Bangalore)',
    fiuStatus: 'REGISTERED',
    fiuRegNo: 'FIU-IND-VDA-2023-0004',
    kycComplianceScore: 96,
    totalSubpoenasActive: 9,
    estimatedVolume24hINR: '₹110.20 Crore',
    nodalOfficerContact: 'compliance.in@coinswitch.co // +91-80-6190-XXXX',
    pmlaCompliant: true,
    activeGateways: 7,
  },
  {
    id: 'VASP-GLOBAL-01',
    name: 'Binance Global Enclave',
    country: 'Offshore (Cayman / Global)',
    fiuStatus: 'NOTICE_SERVED',
    fiuRegNo: 'FIU-IND-SHOW-CAUSE-2023/88',
    kycComplianceScore: 54,
    totalSubpoenasActive: 184,
    estimatedVolume24hINR: '₹1,480.00 Crore',
    nodalOfficerContact: 'lea-desk@binance.com (Portal Only)',
    pmlaCompliant: false,
    activeGateways: 24,
  },
  {
    id: 'VASP-GLOBAL-02',
    name: 'HTX (Formerly Huobi)',
    country: 'Seychelles / Hong Kong',
    fiuStatus: 'NON_COMPLIANT',
    fiuRegNo: 'PENDING_STATUTORY_AUDIT',
    kycComplianceScore: 38,
    totalSubpoenasActive: 62,
    estimatedVolume24hINR: '₹410.00 Crore',
    nodalOfficerContact: 'unresponsive@htx-offshore.net',
    pmlaCompliant: false,
    activeGateways: 11,
  },
  {
    id: 'VASP-GLOBAL-03',
    name: 'Bybit Fintech Limited',
    country: 'Dubai (UAE) / BVI',
    fiuStatus: 'NOTICE_SERVED',
    fiuRegNo: 'FIU-NOTICE-VDA-2024-0019',
    kycComplianceScore: 61,
    totalSubpoenasActive: 47,
    estimatedVolume24hINR: '₹620.00 Crore',
    nodalOfficerContact: 'compliance-in@bybit.com',
    pmlaCompliant: false,
    activeGateways: 15,
  },
];

export const AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-994101',
    timestamp: '2026-09-10 18:49:02 IST',
    officerBadge: 'DEL-CYBER-8842',
    officerName: 'Insp. Vikramaditya Sharma',
    action: 'AFFIDAVIT_EXPORT_SEC_65B',
    targetResource: 'CASE-2026-001 (Affidavit Ex. 4A)',
    agencyBranch: 'Delhi Police Cyber Command',
    ipAddress: '10.24.8.192 (Enclave Gateway)',
    integrityHash: '9e8c4a1b5d2f6e7c8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
    legalAuthority: 'CrPC Sec 91 / BSA Sec 63 Mandate',
  },
  {
    id: 'AUD-994098',
    timestamp: '2026-09-10 18:32:15 IST',
    officerBadge: 'ED-PMLA-1109',
    officerName: 'DSP Rajeshwari Pillai',
    action: 'VASP_SUBPOENA_GENERATION',
    targetResource: 'CoinDCX (FIU-IND-VDA-2023-0008)',
    agencyBranch: 'Enforcement Directorate, HQ',
    ipAddress: '10.18.2.44 (NIC VPN GovNet)',
    integrityHash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    legalAuthority: 'PMLA 2002 Section 50(2)',
  },
  {
    id: 'AUD-994085',
    timestamp: '2026-09-10 18:04:41 IST',
    officerBadge: 'CBI-CYBER-409',
    officerName: 'ACP Amit Kulkarni',
    action: 'DE_ANONYMIZATION_CLUSTER_EXPANSION',
    targetResource: 'Cluster #TWk93zM (310 Wallets)',
    agencyBranch: 'CBI Anti-Corruption & Cyber Enclave',
    ipAddress: '10.12.105.8 (CGO Complex)',
    integrityHash: '3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
    legalAuthority: 'CBI Special Court FIR-42/2026',
  },
  {
    id: 'AUD-994072',
    timestamp: '2026-09-10 17:28:19 IST',
    officerBadge: 'CERT-IN-902',
    officerName: 'Dr. Sanjay Mehta',
    action: 'MEMPOOL_ZERO_DAY_INGESTION_SYNC',
    targetResource: 'Ethereum & Bitcoin RPC Cluster-09',
    agencyBranch: 'CERT-In National Threat Defense',
    ipAddress: '10.100.1.5 (National Cyber Grid)',
    integrityHash: 'c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
    legalAuthority: 'IT Act 2000 Section 70B Directives',
  },
];
