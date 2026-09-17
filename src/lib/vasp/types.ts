/**
 * CHAINTRACE // VASP Intelligence Data Models & Provenance Types
 */

export type VaspAddressType =
  | 'deposit'
  | 'hot_wallet'
  | 'cold_wallet'
  | 'withdrawal'
  | 'treasury'
  | 'operational'
  | 'unknown';

export type ProvenanceSourceType =
  | 'verified_public_source'
  | 'licensed_intelligence_provider'
  | 'investigator_verified'
  | 'internal_intelligence'
  | 'demo_dataset';

export type VerificationStatus =
  | 'verified'
  | 'unverified'
  | 'disputed'
  | 'deprecated';

export type VaspRegistrationStatus =
  | 'REGISTERED'
  | 'NOTICE_SERVED'
  | 'NON_COMPLIANT'
  | 'PENDING';

export type VaspOperationalStatus =
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  | 'UNDER_INVESTIGATION';

export type VaspRiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type AssociationType =
  | 'KNOWN_VASP_ADDRESS'
  | 'KNOWN_VASP_CLUSTER'
  | 'POSSIBLE_ASSOCIATION'
  | 'UNKNOWN';

export interface VaspEntity {
  id: string;
  name: string;
  legalName: string;
  country: string;
  jurisdiction: string;
  registrationStatus: VaspRegistrationStatus;
  regulatoryIdentifier: string;
  website?: string;
  status: VaspOperationalStatus;
  riskLevel: VaspRiskLevel;
  source: string;
  sourceType: ProvenanceSourceType;
  createdAt: string;
  updatedAt: string;
}

export interface WalletClusterEntity {
  id: string;
  vaspId: string;
  name: string;
  chain: string;
  confidence: number; // 0.0 - 1.0
  source: string;
  sourceType: ProvenanceSourceType;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VaspAddressEntity {
  id: string;
  vaspId: string;
  clusterId?: string | null;
  address: string;
  chain: string;
  addressType: VaspAddressType;
  confidence: number; // 0.0 - 1.0
  source: string;
  sourceType: ProvenanceSourceType;
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaspLookupResult {
  matched: boolean;
  associationType: AssociationType;
  vasp?: VaspEntity;
  address?: VaspAddressEntity;
  cluster?: WalletClusterEntity;
  addressType?: VaspAddressType;
  confidence?: number;
  source?: string;
  sourceType?: ProvenanceSourceType;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string | null;
  associationDescription: string;
  factualSummary?: string;
}

export interface ClusterLookupResult {
  matched: boolean;
  cluster?: WalletClusterEntity;
  vasp?: VaspEntity;
  confidence?: number;
  source?: string;
  sourceType?: ProvenanceSourceType;
  verificationStatus?: VerificationStatus;
  totalAddressesInCluster?: number;
}

export interface VaspImportRecord {
  vasp?: string; // VASP ID or Name
  vaspId?: string; // Optional alias for vasp
  chain: string;
  address: string;
  addressType: VaspAddressType;
  source: string;
  sourceType?: ProvenanceSourceType;
  confidence: number;
  verificationStatus?: VerificationStatus;
  clusterName?: string;
  notes?: string;
}

export interface ImportValidationError {
  rowNumber: number;
  field?: string;
  address?: string;
  error: string;
  reason?: string;
}

export interface ImportReport {
  success: boolean;
  totalSubmitted: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportValidationError[];
  importedAddresses: VaspAddressEntity[];
}

