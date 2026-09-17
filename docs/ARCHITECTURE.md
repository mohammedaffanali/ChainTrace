# CHAINTRACE — SYSTEM ARCHITECTURE SPECIFICATION

**Document ID**: CT-ARCH-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Phase 4 Deliverable — Approved for Implementation Review  

---

## 1. Target Architecture Overview

CHAINTRACE is architected as a high-performance, decoupled forensic intelligence platform. The system separates user presentation and client-side graph interaction (Next.js 15 App Router + Cytoscape.js) from core forensic processing, cryptographic validation, Neo4j graph traversal, 7-signal scoring, and statutory reporting (Python FastAPI + Celery + PostgreSQL + Neo4j).

```mermaid
flowchart TB
    subgraph ClientLayer["Presentation & Interactive UI (Next.js 15)"]
        UI[Browser / Field Devices]
        NextApp[Next.js App Router]
        CytoCanvas[Cytoscape.js Canvas<br/>Hardware-Accelerated WebGL/2D]
        MobileFallback[Mobile List / Table Fallback]
        AuthContext[Auth Session & CSRF Client]
    end

    subgraph GatewayLayer["Secure API Gateway & BFF"]
        BFFRoute["/api/v1/* (Next.js Proxy / Reverse Proxy)"]
        CookieManager[HTTP-Only Cookie Handler<br/>SameSite=Lax, Secure]
    end

    subgraph CoreBackend["Authoritative Forensic Core (FastAPI Python 3.11)"]
        FastAPIApp[FastAPI Core Engine]
        AuthModule[OAuth2 / JWT / CSRF Engine]
        ScoringEngine[7-Signal Explainable Scoring]
        BlockchainAdapters[Multi-Chain Adapters<br/>EVM / Tron / Public RPCs]
        ReportService[Section 65B PDF Generator<br/>ReportLab Engine]
        AuditVault[Tamper-Evident SHA-256 Vault]
    end

    subgraph AsyncPipeline["Asynchronous Processing (Celery & Redis)"]
        CeleryWorker[Celery Background Workers]
        RedisBroker[(Redis 7<br/>Task Queue & Cache)]
    end

    subgraph StorageLayer["Data & Persistence Layer"]
        subgraph ProdStorage["Production Mode (Mandatory)"]
            PostgreSQL[(PostgreSQL 16<br/>asyncpg + SQLAlchemy 2.x)]
            Neo4jGraph[(Neo4j 5.27<br/>Cypher Traversal Engine)]
        end
        subgraph DevFallback["Development / Demo Fallback Mode"]
            SQLiteFallback[(SQLite 3 Embedded)]
            NetworkXFallback[NetworkX In-Memory Graph]
        end
    end

    UI --> NextApp
    NextApp --> CytoCanvas
    NextApp --> MobileFallback
    NextApp --> AuthContext
    NextApp --> BFFRoute
    BFFRoute --> CookieManager
    CookieManager --> FastAPIApp

    FastAPIApp --> AuthModule
    FastAPIApp --> ScoringEngine
    FastAPIApp --> ReportService
    FastAPIApp --> AuditVault
    FastAPIApp --> BlockchainAdapters

    FastAPIApp --> RedisBroker
    RedisBroker --> CeleryWorker
    CeleryWorker --> BlockchainAdapters
    CeleryWorker --> Neo4jGraph
    CeleryWorker --> PostgreSQL

    FastAPIApp --> PostgreSQL
    FastAPIApp --> Neo4jGraph

    FastAPIApp -.->|Dev / Fallback Only| SQLiteFallback
    FastAPIApp -.->|Dev / Fallback Only| NetworkXFallback
```

---

## 2. Frontend / Backend Responsibility Matrix

| Capability / Concern | Frontend Responsibility (Next.js + Cytoscape.js) | Backend Responsibility (FastAPI + Workers) |
|---|---|---|
| **Authentication** | Renders login UI, stores CSRF token in memory, redirects on 401/403. | Issues HTTP-only JWT cookies, rotates refresh tokens, validates passwords (bcrypt), enforces RBAC. |
| **Route Protection** | Middleware checks presence of non-sensitive session cookie for client navigation. | Server-side dependency checks cryptographically signed JWT and user clearance role on every single request. |
| **Address Validation** | Client-side immediate syntax validation (regex, length, basic checksum). | Authoritative EIP-55 keccak256 checksum and Tron Base58Check cryptographic validation. |
| **Blockchain Retrieval** | **Zero direct external API calls**. Never contacts Etherscan, TronGrid, or RPCs directly. | Centralized rate-limited adapters with circuit breakers, caching, and fallback endpoints. |
| **Graph Traversal** | Never performs graph BFS in client JavaScript; receives computed nodes and edges. | Executes Cypher queries in Neo4j (or bounded BFS in worker) and computes topological shortest paths. |
| **Graph Visualization** | Cytoscape.js canvas with drag/pan/zoom, bounding box controls, and mobile table fallback. | Returns normalized node and edge schemas with hop distances, weights, and entity classifications. |
| **Attribution Scoring** | Renders explainable score breakdown cards, radar charts, and statutory disclaimers. | Executes 7-signal mathematical formula, confidence bands, anti-overclaiming checks, and zero-guessing rules. |
| **Case Management** | Renders case dockets, timeline notes, evidence attachments, and creation modals. | Full ACID CRUD operations in PostgreSQL, transaction logging, and association joins. |
| **Report Generation** | Previews report metadata; triggers binary stream download. | Server-side PDF compilation (ReportLab), SHA-256 seal generation, and legal notice population. |
| **Audit Logging** | Passes client IP and officer session metadata. | Computes SHA-256 hash chaining, stores immutable records, and enforces non-repudiation. |

---

## 3. Production vs. Fallback Operational Modes

To ensure forensic validity while preserving rapid local developer onboarding:

```
+---------------------------------------------------------------------------------------------+
|                                    PLATFORM RUNTIME MODES                                   |
+---------------------------------------------------------------------------------------------+
| 1. PRODUCTION MODE (MANDATORY FOR PRODUCTION DEPLOYMENTS)                                  |
|    - Database: PostgreSQL 16 (via asyncpg and SQLAlchemy 2.x)                               |
|    - Graph DB: Neo4j 5.27 Enterprise / Community (via Cypher driver)                        |
|    - Queue/Cache: Redis 7 + Celery Workers                                                  |
|    - Evidentiary Status: PRODUCTION GRADE // COURT ADMISSIBLE                               |
|    - Fallback Behavior: Fail-closed; errors out if production services are unreachable.     |
+---------------------------------------------------------------------------------------------+
| 2. CONTROLLED DEVELOPMENT / DEMO FALLBACK MODE (LOCAL DEV ONLY)                             |
|    - Database: SQLite 3 (via aiosqlite + SQLAlchemy 2.x)                                     |
|    - Graph Engine: NetworkX In-Memory Traversal                                              |
|    - Evidentiary Status: EXPLICIT DEMO / NON-EVIDENTIARY (PROMINENT WARNING BANNER)         |
|    - Production Prohibition: NEVER silently active in production; checks ENVIRONMENT!=prod. |
+---------------------------------------------------------------------------------------------+
```

### Telemetry Header & Indicator Contract
Whenever fallback mode is active, the FastAPI backend returns:
- Header: `X-ChainTrace-Engine: FALLBACK-DEMO-SQLITE-NETWORKX`
- Header: `X-ChainTrace-Evidentiary-Status: NON_EVIDENTIARY_SIMULATION`
- Response Payload: `engine_mode: "fallback_simulation"`, `is_production_grade: false`.

The frontend renders a prominent amber alert:
> ⚠️ **DEMO / FALLBACK ENGINE ACTIVE**: Platform running on local in-memory storage (SQLite + NetworkX). Results are simulated demonstrations and must not be used as court-admissible forensic evidence.

---

## 4. External Blockchain API Adapter Design

All external blockchain data is accessed strictly through the backend adapter layer (`backend/app/services/blockchain/`):

```mermaid
flowchart LR
    FastAPICall[Internal Service Request] --> AdapterRouter[Blockchain Adapter Router]
    AdapterRouter --> CacheCheck{Redis Cache Hit?}
    CacheCheck -- Yes --> ReturnCache[Return Cached TXs]
    CacheCheck -- No --> CircuitBreaker{Circuit Breaker Open?}
    CircuitBreaker -- Yes --> ThrowDegraded[Return 503 Provider Degraded]
    CircuitBreaker -- No --> ProviderPool[Provider Pool]

    ProviderPool --> EthAdapter[Ethereum Adapter<br/>Etherscan + Cloudflare RPC]
    ProviderPool --> PolygonAdapter[Polygon Adapter<br/>Polygonscan + Polygon RPC]
    ProviderPool --> TronAdapter[Tron Adapter<br/>TronGrid + Shasta Node]

    EthAdapter --> RateLimiter[Token Bucket Rate Limiter]
    PolygonAdapter --> RateLimiter
    TronAdapter --> RateLimiter

    RateLimiter --> ExternalAPIs[Public Blockchain APIs / Nodes]
```

### Adapter Specifications:
1. **Resilience & Timeouts**: Strict 8.0s timeout per external RPC request with 2 retries and exponential backoff.
2. **Circuit Breaking**: If an external explorer fails 5 consecutive times, the adapter enters `OPEN` state for 60s, returning cached data or graceful degradation notices.
3. **Data Normalization**: Raw transactions from EVM JSON-RPC and TronGrid REST APIs are normalized into a unified `NormalizedTransaction` schema before graph insertion.

---

## 5. Migration Plan from Existing Implementation

```
+---------------------------------------------------------------------------------------+
|                                    MIGRATION STAGES                                   |
+---------------------------------------------------------------------------------------+
| STAGE 1: Dependency Modernization & Clean Dual Backend                                |
|   - Add SQLAlchemy 2.x, asyncpg, reportlab, python-jose to backend.                   |
|   - Add cytoscape, cytoscape-dagre, @types/cytoscape to frontend.                     |
+---------------------------------------------------------------------------------------+
| STAGE 2: Database Migration & Persistence Implementation                              |
|   - Execute Alembic migration creating PostgreSQL tables (users, cases, vasps, logs).|
|   - Ingest data/vasp_database.json into PostgreSQL vasps and addresses tables.        |
|   - Deprecate synchronous fs.writeFileSync in Next.js vasp repository.                |
+---------------------------------------------------------------------------------------+
| STAGE 3: Neo4j Graph Initialization & Cypher Implementation                           |
|   - Run Cypher constraint migration (indexes on Wallet.address, VASP.id).             |
|   - Connect graph_service.py to real Neo4j driver.                                    |
+---------------------------------------------------------------------------------------+
| STAGE 4: Frontend Cytoscape.js Integration                                            |
|   - Replace raw SVG canvas in fund-flow-graph with <CytoscapeGraph /> component.     |
|   - Wire Next.js API client to FastAPI /api/v1 endpoints.                             |
|   - Remove false default attribution to Binance in attribution.py.                    |
+---------------------------------------------------------------------------------------+
| STAGE 5: Security & Report Finalization                                               |
|   - Implement HTTP-only cookie authentication and CSRF token handling.                |
|   - Replace fake 1.2s timeout in reports with real ReportLab PDF streaming.          |
+---------------------------------------------------------------------------------------+
```

---

## 6. Phase 4 Acceptance Checklist

- [x] Target architecture diagram specified.
- [x] Frontend / backend responsibility matrix defined.
- [x] Production (PostgreSQL + Neo4j) vs Fallback (SQLite + NetworkX) defined.
- [x] Visible fallback telemetry indicator specified.
- [x] External blockchain API adapter and circuit breaker designed.
- [x] Incremental migration plan established.

---

## 7. Real-Time Blockchain Intelligence Implementation

### 7.1 Architecture & End-to-End Data Flow

```mermaid
sequenceDiagram
    autonumber
    participant UI as Next.js 15 Frontend
    participant API as FastAPI Backend (/api/v1/analysis/wallet)
    participant DB as Relational DB (PostgreSQL / SQLite)
    participant Prov as Blockchain Provider (Etherscan V2 / Alchemy / TronGrid)
    participant Norm as Transaction Normalizer
    participant Graph as Dynamic Graph Service
    participant Attr as Explainable Attribution Engine

    UI->>API: POST /api/v1/analysis/wallet { address, network, hops, limit }
    API->>Prov: Validate address syntax (EVM / Base58)
    API->>Prov: Query native balance & latest block
    API->>Prov: Fetch raw on-chain transactions & token transfers
    Prov-->>API: Raw provider transactions list
    API->>Norm: normalize_batch(raw_transactions)
    Norm-->>API: NormalizedTransaction models (deduplicated, sorted)
    API->>Graph: build_flow_graph(starting_address, network, hops, txs)
    Graph-->>API: Directed graph (nodes, edges, layout, stats)
    API->>Attr: attribute_wallet(target_address, network, txs)
    Attr-->>API: Attribution docket (VASP name, confidence, evidence, limitations)
    API->>DB: Persist WalletAnalysisRecord & audit trail
    API-->>UI: Complete analysis JSON payload
    UI->>UI: Render Cytoscape.js fund flow graph & live telemetry cards
```

### 7.2 Provider Layer Specifications

| Provider | Supported Networks | Primary APIs / Protocols | Authentication & Rate Limits |
| :--- | :--- | :--- | :--- |
| `EtherscanProvider` | Ethereum (Chain ID: 1), Polygon (Chain ID: 137) | Etherscan API V2 (`/v2/api?chainid=...`), account `txlist`, `tokentx`, `balance` | `ETHERSCAN_API_KEY`, exponential backoff with retry on 429 |
| `AlchemyProvider` | Ethereum, Polygon | JSON-RPC 2.0 (`alchemy_getAssetTransfers`, `eth_blockNumber`, `eth_getBalance`) | `ALCHEMY_API_KEY`, Webhook HMAC-SHA256 signature verification |
| `TronProvider` | Tron (Mainnet) | TronGrid REST (`/v1/accounts/.../transactions`, `/wallet/getaccount`) | `TRONGRID_API_KEY` (or public rate limit), Base58 decoding |
| `Web3Service` | EVM fallback | Resilient multi-RPC list (`llama`, `ankr`, `cloudflare`) | Public RPC load-balancing, auto-failover on JSON-RPC error |

### 7.3 Anti-Overclaiming & Zero-Speculation Design
1. **Factual Evidence Requirement**: An address is only attributed to a VASP if there is direct documented registry evidence (deposit hot wallet, cluster registration, or confirmed on-chain deposit transaction).
2. **Explicit Fallback**: If no VASP match is proven, the engine strictly outputs:
   - `nearest_vasp: "Unknown / Unverified"`
   - `confidence_score: 0.0`
   - `status: "NO_RELIABLE_ATTRIBUTION"`
   - `legal_limitations: "Zero-speculation rule: Unattributed on-chain wallet cannot be definitively linked to a registered VASP without subpoena confirmation."`
3. **BSA 2023 Statutory Compliance**: All attribution dockets output mandatory legal disclaimer text specifying that forensic findings require a Section 65B Certificate under the Bharatiya Sakshya Adhiniyam, 2023 for judicial court admissibility.

### 7.4 Webhook Receiver Pipeline
- **Endpoint**: `POST /api/v1/webhooks/alchemy`
- **Security**: Validates `x-alchemy-signature` header using HMAC-SHA256 against `ALCHEMY_WEBHOOK_SIGNING_KEY`.
- **Deduplication & Storage**: Computes SHA-256 hash of event payload, checks for duplicate webhook ID, and stores raw event in `webhook_events` database table.

### 7.5 Verification & Testing Instructions
- **Backend Test Suite**:
  ```bash
  cd backend
  .\venv\Scripts\python -m pytest tests -v
  ```
  Runs 24 automated unit and integration tests covering providers, normalizer, dynamic graph, attribution engine, routes, and authentication.
- **Frontend Test Suite**:
  ```bash
  npm test
  ```
  Runs 64 frontend test suites validating provider registry, caching, graph layout, attribution scoring formulas, and anti-overclaiming protocols.
- **End-to-End On-Chain Verification**:
  ```bash
  backend\venv\Scripts\python scripts/verify_realtime_pipeline.py
  ```
  Queries live on-chain mainnet data via Etherscan API V2 for Binance (`0x28C6c06298d514Db089934071355E5743bf21d60`), verifies anti-overclaiming on burn address (`0x000...dEaD`), and checks webhook signature verification.
- **Production Build**:
  ```bash
  npm run build
  ```
  Compiles all Next.js static pages, dynamic server routes, and API proxies.

---

*Architecture specification approved for Phase 4 design gate review.*
