-- ==============================================================================
-- CHAINTRACE // MIGRATION 001: REAL VASP INTELLIGENCE DATABASE SCHEMA
-- Relational DDL for Virtual Asset Service Providers, Addresses, and Clusters
-- ==============================================================================

-- 1. Virtual Asset Service Providers (VASPs)
CREATE TABLE IF NOT EXISTS vasps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  country TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  registration_status TEXT NOT NULL CHECK (registration_status IN ('REGISTERED', 'NOTICE_SERVED', 'NON_COMPLIANT', 'PENDING')),
  regulatory_identifier TEXT NOT NULL,
  website TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'REVOKED', 'UNDER_INVESTIGATION')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Wallet Clusters
CREATE TABLE IF NOT EXISTS wallet_clusters (
  id TEXT PRIMARY KEY,
  vasp_id TEXT NOT NULL REFERENCES vasps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('verified_public_source', 'licensed_intelligence_provider', 'investigator_verified', 'internal_intelligence', 'demo_dataset')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'deprecated')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. VASP Addresses
CREATE TABLE IF NOT EXISTS vasp_addresses (
  id TEXT PRIMARY KEY,
  vasp_id TEXT NOT NULL REFERENCES vasps(id) ON DELETE CASCADE,
  cluster_id TEXT REFERENCES wallet_clusters(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  chain TEXT NOT NULL,
  address_type TEXT NOT NULL CHECK (address_type IN ('deposit', 'hot_wallet', 'cold_wallet', 'withdrawal', 'treasury', 'operational', 'unknown')),
  confidence REAL NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('verified_public_source', 'licensed_intelligence_provider', 'investigator_verified', 'internal_intelligence', 'demo_dataset')),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'unverified', 'disputed', 'deprecated')),
  verified_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(chain, address)
);

-- 4. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_lookup ON vasp_addresses(chain, address);
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_vasp ON vasp_addresses(vasp_id);
CREATE INDEX IF NOT EXISTS idx_vasp_addresses_cluster ON vasp_addresses(cluster_id);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_vasp ON wallet_clusters(vasp_id);
CREATE INDEX IF NOT EXISTS idx_wallet_clusters_chain ON wallet_clusters(chain);
