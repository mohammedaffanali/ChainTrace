# CHAINTRACE — PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Document ID**: CT-PRD-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Approved for Phase 2 Architecture  
**Product**: CHAINTRACE Cryptocurrency Forensic Intelligence Platform  

---

## 1. Document Scope & Overview

This document specifies the functional and non-functional requirements for the complete redevelopment of **CHAINTRACE**. The system enables authorized Law Enforcement Agencies (LEAs), financial intelligence analysts, and forensic investigators to automatically attribute unknown cryptocurrency wallet addresses to their nearest Virtual Asset Service Providers (VASPs), reconstruct multi-hop transaction graphs, calculate transparent explainable confidence scores, and generate court-admissible forensic dossiers.

---

## 2. Core Feature Requirements Matrix

---

### FEATURE GROUP 1: AUTHENTICATION & ACCESS CONTROL (AUTH)

#### [FR-AUTH-01] Secure Authentication & Session Management
- **Feature Name**: Multi-Factor User Authentication & JWT Session Enclave
- **User Problem**: Field investigators and analysts require secure, non-repudiable access without exposing credentials or investigation records to unauthorized actors.
- **Target Persona**: First-Time Investigator, Returning Investigator, Administrator.
- **User Story**:
  > *As an authorized investigator, I want to securely log in with my officer badge ID, email/username, and strong passphrase, so that my investigation activity is cryptographically bound to my identity.*
- **Acceptance Criteria**:
  1. User authenticates via username/email + password.
  2. Passwords hashed using bcrypt (cost factor >= 12).
  3. Server issues short-lived JWT access token (15m) + rotating HTTP-only secure refresh token (7d).
  4. Automatic session renewal without interrupting active graph traversals.
  5. Immediate session invalidation on explicit logout or credential revocation.
- **Required UI**: Login page (`/login`) with badge ID input, password visibility toggle, institutional clearance notice, and agency selection.
- **Required API**: `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`.
- **Required Data**: `users` table (`id`, `badge_id`, `email`, `hashed_password`, `role`, `agency`, `is_active`, `created_at`).
- **Dependencies**: PostgreSQL, FastAPI Auth dependency.
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Unit test password hashing; integration test token expiry, refresh token rotation, and invalid login rejection.

#### [FR-AUTH-02] Role-Based Access Control (RBAC) & Route Protection
- **Feature Name**: Granular Forensic RBAC Enforcement
- **User Problem**: Tier 1 field investigators must not be able to modify node infrastructure or wipe chain-of-custody audit logs.
- **Target Persona**: All Personas.
- **User Story**:
  > *As a system administrator, I want to assign distinct roles (Investigator, Analyst, Administrator) to users, so that critical administrative controls and raw data exports are restricted to qualified personnel.*
- **Acceptance Criteria**:
  1. Role definitions: `INVESTIGATOR`, `ANALYST`, `ADMINISTRATOR`.
  2. Server-side middleware validates roles on every protected endpoint.
  3. UI dynamically adapts visible navigation options based on officer clearance.
  4. Attempting to access unauthorized routes returns HTTP 403 with audit log recording.
- **Required UI**: Tactical sidebar navigation, route guard wrapper, permission error banner.
- **Required API**: Verified via FastAPI `Security(get_current_user_with_role)`.
- **Required Data**: Role enum bound to `users` entity.
- **Dependencies**: [FR-AUTH-01].
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: E2E tests verifying route blockage on role mismatch.

---

### FEATURE GROUP 2: INTELLIGENCE COMMAND DASHBOARD (DASH)

#### [FR-DASH-01] Operational Command Dashboard
- **Feature Name**: Real-Time Forensic Command Center
- **User Problem**: Investigators lack a unified operational hub showing ongoing traces, priority cases, and urgent cashout alerts.
- **Target Persona**: Returning Investigator, First-Time Investigator.
- **User Story**:
  > *As a returning investigator, I want to view my active cases, latest high-risk wallet detections, and background task progress on a unified dashboard, so that I can immediately triage critical investigative leads.*
- **Acceptance Criteria**:
  1. Summary KPI cards: Total Cases Tracked, Active Graph Queries, High-Risk Wallets Identified, Attributed VASPs.
  2. Active Investigations table with status badges (`ACTIVE TRACE`, `SUBPOENA SERVED`, `FROZEN`, `CLOSED`).
  3. Real-time background task monitor displaying Celery worker telemetry.
  4. Quick Launch Attribution bar embedded at the top for instant 1-click triage.
  5. Responsive layout adapting cleanly from mobile (<768px) to 4K displays.
- **Required UI**: Dashboard page (`/dashboard`), responsive widget grid, KPI cards, case shortcut table.
- **Required API**: `GET /api/v1/dashboard/stats`, `GET /api/v1/investigations/recent`, `GET /api/v1/tasks/active`.
- **Required Data**: Aggregated metrics from `investigations`, `wallets`, and `tasks` tables.
- **Dependencies**: [FR-AUTH-01], [FR-INV-01].
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Component render tests, responsive viewport checks, live data hook tests.

---

### FEATURE GROUP 3: WALLET ANALYSIS & BLOCKCHAIN RETRIEVAL (WALL)

#### [FR-WALL-01] Multi-Chain Wallet Address Validation & Ingestion
- **Feature Name**: Universal Cryptographic Address Validation Engine
- **User Problem**: Investigators frequently paste malformed, mistyped, or wrong-chain addresses, causing downstream query failures.
- **Target Persona**: First-Time Investigator, Experienced Analyst.
- **User Story**:
  > *As an investigator, I want the system to automatically validate address syntax, checksums, and detect the likely blockchain network, so that I don't initiate invalid queries.*
- **Acceptance Criteria**:
  1. Supports Ethereum (EIP-55 checksum validation), Polygon (EVM), Tron (Base58Check decode with prefix `T` and checksum validation), and Bitcoin/Solana stubs.
  2. "Auto-Detect Chain" heuristics identify network from address syntax.
  3. Visual feedback informs user of address validity, normalized checksum, and detected address type.
- **Required UI**: Quick Trace input bar, validation status badge, chain selector dropdown.
- **Required API**: `POST /api/v1/wallets/validate`.
- **Required Data**: Regular expressions and checksum algorithms for EVM (keccak256) and Tron (sha256 double hash).
- **Dependencies**: None.
- **Priority**: Must-Have (P0).
- **Complexity**: Low.
- **Testing Requirements**: Comprehensive unit test suite with 50+ valid/invalid address fixtures across EVM, Tron, BTC.

#### [FR-WALL-02] Wallet Intelligence Profiler & Asset Breakdown
- **Feature Name**: Wallet Financial Profile & Risk Telemetry
- **User Problem**: Analysts need to understand wallet balances, transaction volumes, active tokens, and first/last active timestamps before tracing.
- **Target Persona**: Experienced Analyst, Returning Investigator.
- **User Story**:
  > *As an analyst, I want to inspect a wallet's native balance, stablecoin holdings (USDT/USDC), and contract interaction profile, so that I can evaluate exposure amounts.*
- **Acceptance Criteria**:
  1. Retrieves native currency balance (ETH, TRX, MATIC) and major token contracts.
  2. Calculates fiat exposure equivalent in INR (Indian Rupee `₹`) and USD.
  3. Identifies smart contract bytecode vs EOA (Externally Owned Account).
  4. Marks known risk indicators (mixer interactions, OFAC sanctions, high velocity).
- **Required UI**: Wallet intelligence page (`/wallet-intelligence`), balance breakdown card, risk indicators pill bar.
- **Required API**: `GET /api/v1/wallets/{chain}/{address}/summary`, `GET /api/v1/wallets/{chain}/{address}/tokens`.
- **Required Data**: RPC provider client, price feed oracle cache.
- **Dependencies**: [FR-WALL-01].
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Integration tests with mocked and live Web3 RPC providers.

---

### FEATURE GROUP 4: INTERACTIVE GRAPH INTELLIGENCE (GRAPH)

#### [FR-GRAPH-01] Cytoscape.js Interactive Fund Flow Workspace
- **Feature Name**: Dynamic Cytoscape.js Multi-Hop Transaction Graph
- **User Problem**: Static SVG diagrams do not permit multi-hop navigation, node filtering, or dynamic layout restructuring across large transaction networks.
- **Target Persona**: Experienced Analyst, Returning Investigator.
- **User Story**:
  > *As a blockchain forensic specialist, I want an interactive Cytoscape.js canvas to zoom, pan, rearrange nodes, filter by asset, and highlight the path to the VASP, so that I can uncover complex money laundering structures.*
- **Acceptance Criteria**:
  1. Render nodes: Wallets (suspect, mule, unlabelled), VASP Custody Nodes, Mixers, Bridges, Smart Contracts.
  2. Render directed edges: Transactions with amount, asset (USDT, ETH, TRX), timestamp, and hash.
  3. Interactive layout engine: Breadthfirst (DAG), CoSE (force-directed), Dagre (hierarchical), Circle.
  4. Search & Filter: Filter by minimum amount, asset token, transaction direction (incoming/outgoing/both).
  5. 1-Click "Highlight Attribution Path": Highlights the golden evidentiary trail connecting suspect to nearest VASP.
  6. Smooth 60fps performance up to 200 nodes; box multi-selection support.
- **Required UI**: Fund flow graph workspace (`/fund-flow-graph`), layout controls floating toolbar, asset filter pill bar, minimap navigator.
- **Required API**: `POST /api/v1/graph/traverse`, `GET /api/v1/graph/paths`.
- **Required Data**: Cytoscape element schema (`nodes: [{ data: { id, label, type, risk } }]`, `edges: [{ data: { id, source, target, txHash, amount } }]`).
- **Dependencies**: Cytoscape.js NPM package.
- **Priority**: Must-Have (P0).
- **Complexity**: High.
- **Testing Requirements**: Canvas render tests, layout algorithm switching tests, filter state verification.

#### [FR-GRAPH-02] Neo4j Cypher Traversal & Multi-Hop Shortest Path
- **Feature Name**: Neo4j Graph Database Multi-Hop Traversal Engine
- **User Problem**: Processing deep multi-hop paths (>3 hops) in Python/Node memory causes timeouts and high memory consumption.
- **Target Persona**: Experienced Analyst.
- **User Story**:
  > *As an analyst, I want the backend to query a dedicated Neo4j graph database using parameterized Cypher, so that multi-hop paths to known VASP clusters are retrieved in sub-second time.*
- **Acceptance Criteria**:
  1. Graph Schema: `(:Wallet)`, `(:Transaction)`, `(:VASP)`, `(:Cluster)`.
  2. Relationships: `(:Wallet)-[:SENT]->(:Transaction)-[:RECEIVED_BY]->(:Wallet)`, `(:Wallet)-[:MEMBER_OF]->(:Cluster)-[:OWNED_BY]->(:VASP)`.
  3. Parameterized Cypher BFS shortest-path queries finding paths up to 5 hops.
  4. Fallback in-memory graph processor when Neo4j is offline in local dev mode.
- **Required UI**: Graph depth selector (1–5 hops) on traversal toolbar.
- **Required API**: `POST /api/v1/graph/cypher/shortest-path`.
- **Required Data**: Neo4j Bolt connection, node and edge indices.
- **Dependencies**: Neo4j Community/Enterprise instance.
- **Priority**: Must-Have (P0).
- **Complexity**: High.
- **Testing Requirements**: Cypher parameterized query unit tests, Neo4j connection pool integration tests.

---

### FEATURE GROUP 5: EXPLAINABLE VASP ATTRIBUTION & SCORING (ATTR)

#### [FR-ATTR-01] Seven-Signal Explainable Attribution Formula
- **Feature Name**: Transparent 7-Signal Attribution Scoring Engine
- **User Problem**: "Black-box" AI systems are inadmissible in court; judges and defense counsel require mathematically explainable decomposition of attribution confidence.
- **Target Persona**: Returning Investigator, Experienced Analyst.
- **User Story**:
  > *As an investigating officer submitting evidence to court, I want the attribution score decomposed into 7 explainable signals with exact mathematical weights, so that I can defend the conclusion under cross-examination.*
- **Acceptance Criteria**:
  1. Decomposes confidence across 7 weighted signals:
     - Signal 1: Proximity & Hop Distance (Weight: 24%)
     - Signal 2: Deposit Address Sweep Pattern (Weight: 22%)
     - Signal 3: Wallet Cluster Co-Spend Association (Weight: 18%)
     - Signal 4: Statutory Registry / FIU-IND Status (Weight: 15%)
     - Signal 5: Cross-Chain Bridge Relay Continuity (Weight: 10%)
     - Signal 6: Behavioral Sweep Timing Heuristics (Weight: 7%)
     - Signal 7: Historical Inquiry / LEA Record (Weight: 4%)
  2. Categorizes composite score into statutory confidence bands:
     - `90–100%`: VERY_STRONG_CANDIDATE
     - `75–89%`: STRONG_CANDIDATE
     - `60–74%`: MODERATE_CANDIDATE
     - `40–59%`: WEAK_CANDIDATE
     - `< 40%`: INSUFFICIENT_EVIDENCE
  3. Ranks multiple candidate VASPs in descending order of composite confidence.
- **Required UI**: VASP attribution page (`/vasp-attribution`), 7-signal radar chart, weight contribution bar chart, candidate comparison table.
- **Required API**: `POST /api/v1/attribution/evaluate`.
- **Required Data**: VASP entity registry, deposit patterns, scoring weights config.
- **Dependencies**: [FR-GRAPH-01], [FR-VASP-01].
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Unit test mathematical precision, boundary tests (0%, 100%), signal weight sum validation (= 1.00).

#### [FR-ATTR-02] Strict Anti-Overclaiming & Zero-Guessing Safety Protocol
- **Feature Name**: Legal Anti-Overclaiming Guardrail Engine
- **User Problem**: Mistakenly attributing an unknown wallet to an exchange (such as Binance) when no transaction link exists exposes investigators to defamation and case dismissal.
- **Target Persona**: All Personas.
- **User Story**:
  > *As a forensic officer, I want the system to explicitly return NO_RELIABLE_ATTRIBUTION when no verifiable links exist, rather than guessing or defaulting to a large exchange.*
- **Acceptance Criteria**:
  1. When no path or cluster link connects the target wallet to a known VASP within max hops, system outputs `status: "NO_RELIABLE_ATTRIBUTION"`.
  2. Primary candidate is returned as `null` with explicit warning banner.
  3. Every attribution card displays statutory evidentiary caveat: *"Scores represent investigative attribution confidence, not legal determination of ownership."*
  4. Zero hardcoded fallbacks to Binance or any other entity.
- **Required UI**: Unattributed warning card, evidentiary disclaimer banner, zero-guessing badge.
- **Required API**: Response schema enforcement in `POST /api/v1/attribution/evaluate`.
- **Required Data**: Validation thresholds (`MIN_ATTRIBUTION_THRESHOLD = 30.0`).
- **Dependencies**: [FR-ATTR-01].
- **Priority**: Must-Have (P0).
- **Complexity**: Low.
- **Testing Requirements**: Regression test asserting unmatched wallet returns `NO_RELIABLE_ATTRIBUTION` and never defaults to Binance.

---

### FEATURE GROUP 6: STATUTORY VASP INTELLIGENCE DIRECTORY (VASP)

#### [FR-VASP-01] Statutory VASP Directory & Cluster Management
- **Feature Name**: FIU-IND & International VASP Intelligence Directory
- **User Problem**: Investigators need immediate access to verified VASP legal names, FIU-IND registration numbers, nodal officer contacts, and known deposit clusters.
- **Target Persona**: Returning Investigator, First-Time Investigator.
- **User Story**:
  > *As an investigator serving a statutory notice, I want to look up an exchange's verified legal entity name, jurisdiction, and official compliance desk contact, so that my CrPC 91 notice is served correctly.*
- **Acceptance Criteria**:
  1. Directory lists registered VASPs (e.g. CoinDCX, WazirX, Binance, ZebPay, Mudrex, CoinSwitch).
  2. Displays regulatory status: `REGISTERED`, `NOTICE_SERVED`, `NON_COMPLIANT`.
  3. Stores nodal compliance officer contacts, physical corporate address, and legal entity names.
  4. Stores associated hot wallets, deposit sweeps, and cold storage addresses with provenance tags.
- **Required UI**: VASP directory tab on attribution page, entity dossier modal, search filter.
- **Required API**: `GET /api/v1/vasps`, `GET /api/v1/vasps/{id}`, `GET /api/v1/vasps/{id}/clusters`.
- **Required Data**: `vasps`, `wallet_clusters`, `vasp_addresses` tables in PostgreSQL.
- **Dependencies**: PostgreSQL database.
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Repository CRUD tests, address normalization tests.

---

### FEATURE GROUP 7: INVESTIGATION & CASE MANAGEMENT (INV)

#### [FR-INV-01] Persistent Investigation Docket & Case Management
- **Feature Name**: Relational Case Management System
- **User Problem**: In the legacy application, cases created by investigators disappeared on page reload because they existed only in browser memory.
- **Target Persona**: Returning Investigator.
- **User Story**:
  > *As an investigator, I want to create, update, and manage persistent investigation case dockets, so that all wallets, notes, and legal notices are permanently stored and retrievable.*
- **Acceptance Criteria**:
  1. Create investigation with Title, FIR/Inquiry Number, Lead Officer, Priority, Total Exposure.
  2. Associate multiple suspect wallets and target chains with a case docket.
  3. Case status tracking: `ACTIVE TRACE`, `SUBPOENA SERVED`, `EVIDENTIARY FREEZE`, `ESCALATED`, `CLOSED`.
  4. Complete timeline of case actions and notes stored in PostgreSQL.
  5. Search and filter cases by ID, officer, agency, or priority.
- **Required UI**: Case register page (`/investigations`), case creation modal, case dossier view (`/investigations/[id]`).
- **Required API**: `POST /api/v1/investigations`, `GET /api/v1/investigations`, `GET /api/v1/investigations/{id}`, `PATCH /api/v1/investigations/{id}`.
- **Required Data**: `investigations`, `investigation_wallets`, `investigation_notes` tables.
- **Dependencies**: [FR-AUTH-01], PostgreSQL.
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Database integration test verifying persistence across server restarts; case search tests.

---

### FEATURE GROUP 8: STRUCTURED FORENSIC REPORT GENERATION (REP)

#### [FR-REP-01] Court-Admissible Forensic Dossier & Section 65B Generator
- **Feature Name**: Server-Side Certified Forensic Report Generator
- **User Problem**: The legacy application had a fake download button that ran a `setTimeout` without generating any file; investigators cannot present fake downloads to magistrates.
- **Target Persona**: First-Time Investigator, Returning Investigator.
- **User Story**:
  > *As an investigator, I want to click 'Generate Investigation Report' and download a certified PDF containing the Section 65B Evidence Act certificate, graph snapshot, and VASP candidate breakdown, so that I can submit it as legal evidence.*
- **Acceptance Criteria**:
  1. Generates authentic PDF and structured JSON downloads.
  2. Report templates:
     - Template 1: *Section 65B Indian Evidence Act Electronic Certificate* (with SHA-256 integrity seal).
     - Template 2: *VASP Attribution & Forensic Intelligence Dossier* (executive summary, candidate scoring, multi-hop path details).
     - Template 3: *CrPC Section 91 Production Notice Request Memo*.
  3. PDF includes cryptographic SHA-256 document checksum and verification QR code.
  4. Real-time binary stream download without timeout errors.
- **Required UI**: Reports page (`/reports`), template selector, adjudicating authority input, live PDF download button.
- **Required API**: `POST /api/v1/reports/generate`, `GET /api/v1/reports/{id}/download`.
- **Required Data**: Investigation details, candidate attribution results, officer credentials.
- **Dependencies**: [FR-INV-01], [FR-ATTR-01], Python report generation library (WeasyPrint / ReportLab).
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: PDF generation test verifying valid PDF headers (`%PDF`), checksum integrity, and correct case data insertion.

---

### FEATURE GROUP 9: AUDIT LOGGING & NON-REPUDIATION (AUD)

#### [FR-AUD-01] Cryptographic Chain-of-Custody Audit Ledger
- **Feature Name**: Tamper-Evident SHA-256 Forensic Audit Vault
- **User Problem**: In court, defense counsel routinely challenges digital evidence by claiming investigator tampering or unauthorized retrospective queries.
- **Target Persona**: Administrator, Returning Investigator.
- **User Story**:
  > *As an agency administrator, I want every wallet query, attribution run, and report export recorded with a cryptographic SHA-256 hash chaining mechanism, so that non-repudiation is legally guaranteed.*
- **Acceptance Criteria**:
  1. Records event: Officer Badge, Timestamp (ISO-8601 UTC), Action Type, Target Resource (Wallet/Case), IP Address.
  2. Computes `integrity_hash = SHA256(prev_hash + officer + action + target + timestamp)`.
  3. Read-only ledger view with search and hash verification tool.
  4. Exportable audit ledger for statutory oversight.
- **Required UI**: Audit logs page (`/audit-logs`), cryptographic integrity verify badge, search bar.
- **Required API**: `GET /api/v1/audit-logs`, `POST /api/v1/audit-logs/verify`.
- **Required Data**: `audit_logs` table with previous hash pointers.
- **Dependencies**: PostgreSQL.
- **Priority**: Must-Have (P0).
- **Complexity**: Medium.
- **Testing Requirements**: Hash chain verification test detecting simulated record tampering.

---

### FEATURE GROUP 10: ASYNCHRONOUS PROCESSING & WORKERS (ASYNC)

#### [FR-ASYNC-01] Celery & Redis Asynchronous Task Pipeline
- **Feature Name**: Long-Running Background Trace Queue
- **User Problem**: Multi-hop transaction scraping and deep graph construction can take 10–30 seconds, which would block synchronous HTTP requests and cause 504 gateway timeouts.
- **Target Persona**: All Personas.
- **User Story**:
  > *As a user querying a deep 4-hop wallet graph, I want the task executed in the background with real-time status updates, so that my browser doesn't freeze or time out.*
- **Acceptance Criteria**:
  1. Asynchronous tasks dispatched to Celery via Redis broker.
  2. Tasks track granular stages: `QUEUED`, `VALIDATING`, `FETCHING_BLOCKCHAIN`, `BUILDING_GRAPH`, `SCORING_VASPS`, `COMPLETED`, `FAILED`.
  3. Frontend polls or receives WebSocket updates on task state.
  4. Idempotency: Duplicate analysis requests within 5 minutes return cached task results.
- **Required UI**: Analysis progress bar, background task status indicator pill.
- **Required API**: `POST /api/v1/tasks/trace`, `GET /api/v1/tasks/{id}/status`.
- **Required Data**: Redis task state, Celery result backend.
- **Dependencies**: Redis, Celery.
- **Priority**: Must-Have (P0).
- **Complexity**: High.
- **Testing Requirements**: Celery task unit tests, mock worker execution, timeout and retry handling tests.

---

*Product Requirements Document approved for Phase 2 review.*
