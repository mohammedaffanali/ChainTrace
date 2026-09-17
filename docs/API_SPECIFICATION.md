# CHAINTRACE — REST API SPECIFICATION & CONTRACTS

**Document ID**: CT-API-SPEC-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Phase 4 Deliverable — Approved for Implementation Review  
**Framework**: FastAPI 0.115+ (OpenAPI 3.1 Standard)  

---

## 1. Global API Standards & Conventions

- **Base URL**: `/api/v1`
- **Protocol**: HTTPS in production; strict JSON request and response payloads.
- **Authentication**: Secure HTTP-only cookies (`chaintrace_access_token` and `chaintrace_refresh_token`) paired with a double-submit CSRF cookie (`chaintrace_csrf_token`).
- **Standard Header**: All responses include:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-ChainTrace-Engine: PRODUCTION-POSTGRES-NEO4J` (or `FALLBACK-DEMO-SQLITE-NETWORKX`)
  - `X-ChainTrace-Evidentiary-Status: PRODUCTION_GRADE` (or `NON_EVIDENTIARY_SIMULATION`)

### Standard Error Response Schema
```json
{
  "success": false,
  "code": "INVALID_ADDRESS_SYNTAX",
  "message": "The provided address does not conform to EIP-55 EVM checksum specifications.",
  "status_code": 400,
  "details": {
    "field": "address",
    "received": "0xinvalid"
  },
  "timestamp": "2026-09-14T06:50:00.000Z"
}
```

---

## 2. API Endpoint Catalog

---

### GROUP 1: AUTHENTICATION (`/api/v1/auth`)

#### 1. `POST /api/v1/auth/login`
- **Purpose**: Authenticate forensic officer and establish secure HTTP-only cookies.
- **Auth**: None (Public).
- **Request Body**:
  ```json
  {
    "badge_id": "DEL-CYBER-8842",
    "password": "SecureOfficerPassword123!"
  }
  ```
- **Response** (HTTP 200 OK + Sets `chaintrace_access_token` and `chaintrace_csrf_token` Cookies):
  ```json
  {
    "success": true,
    "user": {
      "id": "c1f7a4e2-...",
      "badge_id": "DEL-CYBER-8842",
      "full_name": "Insp. Vikramaditya Sharma",
      "designation": "Senior Cyber Forensic Investigator",
      "agency": "Delhi Police Cyber Command",
      "role": "INVESTIGATOR"
    },
    "csrf_token": "a8f19c4d2e7b..."
  }
  ```

#### 2. `POST /api/v1/auth/refresh`
- **Purpose**: Rotate expired access token using HTTP-only refresh token.
- **Auth**: Valid refresh token cookie.
- **Response**: HTTP 200 OK with new access token cookie and CSRF token.

#### 3. `POST /api/v1/auth/logout`
- **Purpose**: Invalidate current session and clear cookies.
- **Response**: HTTP 200 OK (clears cookies with `Max-Age=0`).

#### 4. `GET /api/v1/auth/me`
- **Purpose**: Retrieve current authenticated officer dossier.
- **Auth**: Bearer / Cookie required.

---

### GROUP 2: WALLET FORENSICS (`/api/v1/wallets`)

#### 1. `POST /api/v1/wallets/validate`
- **Purpose**: Cryptographically validate and normalize cryptocurrency addresses.
- **Request Body**:
  ```json
  {
    "address": "0x28c6c06298d514db089934071355e5743bf21d60",
    "chain": "AUTO"
  }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "address": "0x28c6c06298d514db089934071355e5743bf21d60",
    "detected_chain": "ethereum",
    "is_valid": true,
    "checksum_address": "0x28C6c06298d514Db089934071355E5743bf21d60",
    "address_type": "evm_account",
    "message": "Valid EIP-55 EVM address."
  }
  ```

#### 2. `GET /api/v1/wallets/{chain}/{address}/summary`
- **Purpose**: Retrieve financial profile, native balance, and fiat valuation in INR.
- **Response** (HTTP 200):
  ```json
  {
    "address": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    "chain": "ethereum",
    "balance_native": 14.52,
    "native_symbol": "ETH",
    "fiat_value_inr": 4152720.00,
    "fiat_formatted_inr": "₹41.52 Lakh",
    "is_contract": false,
    "tx_count": 142,
    "risk_score": 92.5,
    "threat_level": "CRITICAL",
    "risk_tags": ["HIGH_VELOCITY_PEELING", "MIXER_EXPOSURE"]
  }
  ```

---

### GROUP 3: GRAPH TRAVERSAL (`/api/v1/graph`)

#### 1. `POST /api/v1/graph/traverse`
- **Purpose**: Execute bounded multi-hop BFS traversal for Cytoscape.js canvas rendering.
- **Request Body**:
  ```json
  {
    "starting_address": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    "chain": "ethereum",
    "max_hops": 3,
    "max_nodes": 50,
    "direction": "outgoing",
    "min_amount": 0.0
  }
  ```
- **Response** (HTTP 200 — Cytoscape Compatible Elements):
  ```json
  {
    "elements": {
      "nodes": [
        {
          "data": {
            "id": "node-eth-0x7a91...",
            "label": "Suspect Target (0x7A91...4F82)",
            "address": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
            "chain": "ethereum",
            "type": "suspect",
            "risk_score": 92.5,
            "hop_distance": 0,
            "is_seed": true
          }
        },
        {
          "data": {
            "id": "node-eth-0x28c6...",
            "label": "Binance Ingestion Hot Wallet",
            "address": "0x28c6c06298d514db089934071355e5743bf21d60",
            "chain": "ethereum",
            "type": "vasp",
            "risk_score": 14.0,
            "hop_distance": 2,
            "is_nearest_vasp": true,
            "vasp_id": "vasp_binance"
          }
        }
      ],
      "edges": [
        {
          "data": {
            "id": "tx-0x9f18...",
            "source": "node-eth-0x7a91...",
            "target": "node-eth-0x28c6...",
            "tx_hash": "0x9f18a47b2c019d67812984ea",
            "amount": 12.45,
            "asset": "ETH",
            "timestamp": "2026-09-10T14:20:00Z",
            "is_attribution_path": true
          }
        }
      ]
    },
    "statistics": {
      "total_nodes": 2,
      "total_edges": 1,
      "max_hop_reached": 2,
      "traversal_time_ms": 184
    }
  }
  ```

---

### GROUP 4: EXPLAINABLE ATTRIBUTION & SCORING (`/api/v1/attribution`)

#### 1. `POST /api/v1/attribution/evaluate`
- **Purpose**: Compute explainable 7-signal VASP attribution with zero guessing and anti-overclaiming checks.
- **Request Body**:
  ```json
  {
    "wallet_address": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    "chain": "ethereum",
    "case_id": "c1f7a4e2-...",
    "max_hops": 3
  }
  ```

#### Attribution Scoring Contract Specification
- **Response Format (Attributed Candidate)**:
  ```json
  {
    "success": true,
    "status": "ATTRIBUTED_CANDIDATE",
    "investigated_wallet": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    "chain": "ethereum",
    "is_production_grade": true,
    "evaluated_at": "2026-09-14T06:55:00.000Z",
    "primary_candidate": {
      "vasp_id": "vasp_coindcx",
      "vasp_name": "CoinDCX (Neblio Technologies Pvt. Ltd.)",
      "legal_name": "Neblio Technologies Private Limited",
      "jurisdiction": "IN",
      "fiu_status": "REGISTERED",
      "fiu_registration_number": "FIU-IND/2023/VASP-0021",
      "deposit_address": "0xa090e606e30bd747d4e6245a1517ebe430f0057e",
      "nearest_hops": 2,
      "relationship_type": "INDIRECT_TRANSIT",
      "overall_confidence": 88.4,
      "confidence_band": "STRONG_CANDIDATE",
      "anti_overclaiming_statement": "Candidate association: CoinDCX. Score represents investigative attribution confidence, not legal determination of ownership."
    },
    "signal_decomposition": [
      {
        "signal_id": "proximity",
        "name": "Proximity & Hop Distance",
        "weight": 0.24,
        "raw_score": 90.0,
        "weighted_score": 21.6,
        "contribution_percentage": 24.4,
        "description": "2-hop fund flow path identified to known VASP cluster.",
        "status": "optimal"
      },
      {
        "signal_id": "deposit_match",
        "name": "Deposit Address Sweep Correlation",
        "weight": 0.22,
        "raw_score": 95.0,
        "weighted_score": 20.9,
        "contribution_percentage": 23.6,
        "description": "Matches verified custodial exchange deposit consolidation.",
        "status": "verified"
      },
      {
        "signal_id": "cluster",
        "name": "Wallet Cluster Association",
        "weight": 0.18,
        "raw_score": 92.0,
        "weighted_score": 16.56,
        "contribution_percentage": 18.7,
        "description": "Co-spend and common-input heuristic verification.",
        "status": "cluster_confirmed"
      },
      {
        "signal_id": "registry",
        "name": "Regulatory Registry Status",
        "weight": 0.15,
        "raw_score": 100.0,
        "weighted_score": 15.0,
        "contribution_percentage": 17.0,
        "description": "Entity holds statutory registration (FIU-IND/2023/VASP-0021).",
        "status": "registered"
      },
      {
        "signal_id": "cross_chain",
        "name": "Cross-Chain Fund Trail",
        "weight": 0.10,
        "raw_score": 85.0,
        "weighted_score": 8.5,
        "contribution_percentage": 9.6,
        "description": "Bridge deposit continuity detected via Stargate Router.",
        "status": "bridge_relayed"
      },
      {
        "signal_id": "behavioral",
        "name": "Behavioral Sweep Heuristics",
        "weight": 0.07,
        "raw_score": 78.0,
        "weighted_score": 5.46,
        "contribution_percentage": 6.2,
        "description": "Consolidated into cold pool within 12 minutes of deposit.",
        "status": "custodial_sweep"
      },
      {
        "signal_id": "historical",
        "name": "Historical Intelligence Record",
        "weight": 0.04,
        "raw_score": 70.0,
        "weighted_score": 2.8,
        "contribution_percentage": 3.2,
        "description": "Prior law enforcement inquiry correlation confirmed.",
        "status": "prior_record"
      }
    ],
    "evidence_items": [
      {
        "signal": "Proximity",
        "title": "2-Hop Multi-Chain Path",
        "observed_facts": [
          "Target 0x7A91... sent 12.45 ETH to intermediary 0x71C8...",
          "Intermediary 0x71C8... deposited 150,000 USDT to 0xa090..."
        ],
        "inferences": [
          "Funds consolidated into CoinDCX custodial infrastructure."
        ],
        "statutory_basis": "PMLA 2002 Section 12 Forensic Record"
      }
    ],
    "statutory_warning": "Scores represent investigative attribution confidence, not legal determination of ownership."
  }
  ```

- **Response Format (Unattributed / Anti-Overclaiming Triggered)**:
  ```json
  {
    "success": true,
    "status": "NO_RELIABLE_ATTRIBUTION",
    "investigated_wallet": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "chain": "ethereum",
    "is_production_grade": true,
    "primary_candidate": null,
    "signal_decomposition": [],
    "evidence_items": [],
    "anti_overclaiming_statement": "NO CANDIDATE VASP DETECTED: Zero verifiable paths connect this wallet to known statutory exchange clusters within 3 hops.",
    "statutory_warning": "Strict zero-guessing policy enforced. Inconclusive findings must not be treated as exchange ownership."
  }
  ```

---

### GROUP 5: CASE & INVESTIGATION DOCKETS (`/api/v1/investigations`)

#### 1. `GET /api/v1/investigations`
- **Purpose**: Paginated list of persistent cases with search and filter.
- **Query Params**: `status`, `priority`, `search`, `page`, `page_size`.

#### 2. `POST /api/v1/investigations`
- **Purpose**: Create a new persistent investigation docket.
- **Request Body**:
  ```json
  {
    "case_number": "CASE-2026-DEL-043",
    "title": "Operation Hawala Sweep — Target Cluster",
    "summary": "Inquiry into cyber fraud syndicate layering funds via USDT.",
    "priority": "HIGH",
    "total_exposure_inr": 15000000.00,
    "initial_wallet": "0x7A91bC84D2697e88b209eB0eAc821639d4A44F82",
    "initial_chain": "ethereum"
  }
  ```

#### 3. `GET /api/v1/investigations/{id}`
- **Purpose**: Retrieve full case dossier including attached wallets, timeline notes, and prior attribution evaluations.

#### 4. `POST /api/v1/investigations/{id}/notes`
- **Purpose**: Append formal investigator note or CrPC 91 notice memo.

---

### GROUP 6: COURT-ADMISSIBLE REPORTS (`/api/v1/reports`)

#### 1. `POST /api/v1/reports/generate`
- **Purpose**: Server-side generation of authenticated PDF and JSON forensic dossiers.
- **Request Body**:
  ```json
  {
    "investigation_id": "c1f7a4e2-...",
    "template_type": "SEC_65B_CERTIFICATE",
    "adjudicating_authority": "Special Cyber & PMLA Adjudicating Authority, New Delhi",
    "certifying_officer_name": "Insp. Vikramaditya Sharma",
    "certifying_officer_badge": "DEL-CYBER-8842"
  }
  ```
- **Response**: HTTP 200 OK returning download metadata:
  ```json
  {
    "report_id": "rep_99182a4c",
    "download_url": "/api/v1/reports/rep_99182a4c/download",
    "sha256_checksum": "9b12a84c2e6d...",
    "page_count": 4,
    "generated_at": "2026-09-14T06:58:00Z"
  }
  ```

#### 2. `GET /api/v1/reports/{id}/download`
- **Purpose**: Direct binary download of the generated PDF (`Content-Type: application/pdf`).

---

### GROUP 7: BACKGROUND TASKS (`/api/v1/tasks`)

#### 1. `GET /api/v1/tasks/{id}/status`
- **Purpose**: Poll Celery background task state and progress percentage.
- **Response**:
  ```json
  {
    "task_id": "9b81-4f21-...",
    "status": "BUILDING_GRAPH",
    "progress_percent": 65,
    "message": "Traversing 2-hop transaction flows...",
    "error": null
  }
  ```

---

### GROUP 8: SYSTEM HEALTH & AUDIT (`/api/v1/health`, `/api/v1/audit-logs`)

#### 1. `GET /api/v1/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "runtime_mode": "PRODUCTION",
    "services": {
      "postgresql": "CONNECTED",
      "neo4j": "CONNECTED",
      "redis": "CONNECTED",
      "celery_workers": "ACTIVE (4 workers)"
    }
  }
  ```

#### 2. `GET /api/v1/audit-logs`
- **Purpose**: Read-only chronological stream of tamper-evident SHA-256 audit events.

---

*API Specification approved for Phase 4 design gate review.*
