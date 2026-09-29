# CHAINTRACE: Automated Cryptocurrency Intelligence & VASP Attribution Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-chain--trace--jade.vercel.app-155EEF?style=for-the-badge&logo=vercel&logoColor=white)](https://chain-trace-jade.vercel.app/)
[![Build Status](https://img.shields.io/badge/Build-Passing-emerald?style=flat-square)](/)
[![Tests Frontend](https://img.shields.io/badge/Tests_Frontend-64%2F64_Passing-brightgreen?style=flat-square)](/)
[![Tests Backend](https://img.shields.io/badge/Tests_Backend-24%2F24_Passing-brightgreen?style=flat-square)](/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8_Strict-blue?style=flat-square)](/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Evidence Act](https://img.shields.io/badge/Evidence_Act-Sec_65B_Compliant-gold?style=flat-square)](/)

> **High-performance forensic cryptocurrency intelligence and Virtual Asset Service Provider (VASP) attribution platform engineered for Indian Law Enforcement Agencies (LEAs), the Enforcement Directorate (ED), and the Financial Intelligence Unit (FIU-IND) for Smart India Hackathon (SIH 2026).**

---

## Live Demo / Deployed Application

**Live Demo:** https://chain-trace-jade.vercel.app/

The production web interface is deployed on Vercel and runs with self-contained in-memory fallback stores and Next.js serverless route handlers, allowing full exploration of the multi-hop graph, wallet intelligence, 7-signal attribution engine, and Section 65B reporting workflows without requiring external infrastructure.

---

## Overview

### The Problem
Illicit actors launder proceeds of crime across decentralized networks by splitting transactions into complex mule networks, peeling chains, and cross-chain bridge protocols before cashing out through custodial exchanges. Existing forensic tools often rely on proprietary "black-box" heuristics or speculate on unattributed intermediary wallets, generating unverified guesses that fail judicial admissibility standards under the **Indian Evidence Act (Section 65B)** and the **Bharatiya Sakshya Adhiniyam (BSA)**.

### What ChainTrace Does
**ChainTrace** transforms raw, obfuscated multi-chain ledger activity into transparent, court-admissible forensic intelligence. It traverses transaction graphs across multiple hops, matches deposit sweep patterns against a verified repository of domestic and global VASPs, evaluates confidence using a mathematically weighted 7-signal formula, enforces an uncompromising anti-overclaiming protocol, and produces cryptographically sealed Section 65B digital evidence dossiers.

### How It Works
1. **Multi-Chain Ledger Ingestion**: Normalizes transaction records from EVM networks (Ethereum, Polygon) and TRON (TRC-20), with syntax verification for Bitcoin and Solana.
2. **Multi-Hop Graph Traversal**: Applies bounded Breadth-First Search (BFS) with cycle deduplication up to 4 hops to map fund flow topology without infinite loops or performance bottlenecks.
3. **Cluster & Entity Resolution**: Connects intermediary and deposit addresses to curated clusters of 46+ FIU-IND registered and international custodial platforms.
4. **Explainable 7-Signal Scoring**: Evaluates proximity decay, volume proportion, deposit signatures, temporal velocity, counterparty purity, multi-hop continuity, and behavioral patterns.
5. **Anti-Overclaiming Guarantee**: Rejects speculative matching; unverified or weak evidence (< 30% score) explicitly yields `NO_RELIABLE_ATTRIBUTION`.
6. **Section 65B Dossier Generation**: Generates official PDF certificates containing SHA-256 chain-of-custody seals, officer credentials, and statutory legal disclosures.

---

## Key Features

- **Explainable 7-Signal Attribution Engine**: Transparent, mathematically grounded confidence scoring with discrete weights:
  - *Proximity & Hop Distance* ($w = 0.24$): Distance attenuation over multi-hop paths.
  - *Deposit Address Correlation* ($w = 0.22$): Direct interaction with known exchange sweep contracts.
  - *Wallet Cluster Association* ($w = 0.18$): Co-spending and common-input heuristic correlation.
  - *Regulatory Registry Status* ($w = 0.15$): Statutory compliance check against FIU-IND registrations.
  - *Cross-Chain Fund Trail* ($w = 0.10$): LayerZero, Stargate, and bridge event tracking.
  - *Behavioral Heuristics* ($w = 0.07$): Consolidation velocity, peeling structure, and timing patterns.
  - *Historical Intelligence* ($w = 0.04$): Correlation with previous LEA inquiries and flagged addresses.
- **Strict Anti-Overclaiming & Zero-Guessing Protocol**: Rejects false-positive attributions. If a wallet cannot be rigorously attributed with high confidence, the system refuses to guess and outputs `NO_RELIABLE_ATTRIBUTION` / `INSUFFICIENT_EVIDENCE`.
- **Interactive Cytoscape.js Fund Flow Studio**: Hardware-accelerated DAG visualization featuring interactive node dragging, bounding box fitting, hop depth adjustments, cycle guards, and node dossier inspection.
- **Court-Admissible Section 65B Electronic Dossiers**: Instant server-side PDF generation (via ReportLab) with SHA-256 digital seals, case registration metadata, and statutory certifications required by Indian courts.
- **Verified VASP & Cluster Registry**: Curated intelligence repository containing 46+ domestic entities (e.g., CoinDCX, WazirX, CoinSwitch) and global exchanges (e.g., Binance, OKX, Bybit).
- **Dual-Mode Resilient Architecture**:
  - *Production Grade*: PostgreSQL 16 + Neo4j 5.20 + Redis 7 + Celery asynchronous workers.
  - *Controlled Demo / Fallback*: In-memory SQLite (`chaintrace_fallback.db`) + NetworkX graph traversal for zero-dependency offline evaluations.
- **Role-Based Access Control (RBAC)**: Secure access tailored for Indian law enforcement with roles for `INVESTIGATOR`, `ANALYST`, and `ADMINISTRATOR` backed by HTTP-only JWT cookies.
- **Real-Time Job Telemetry**: WebSocket and task polling pipelines providing live progress updates as blockchain records are indexed and scored.

---

## Architecture & How It Works

```mermaid
flowchart TB
    subgraph ClientLayer["Presentation & Interactive UI (Next.js 15 + React 19)"]
        Browser[Officer Browser / Workstation]
        UI[Next.js App Router UI]
        CytoCanvas[Cytoscape.js DAG Canvas<br/>Hardware-Accelerated WebGL/2D]
        AuthContext[Enclave Auth & Session State]
    end

    subgraph GatewayLayer["API Routing & Security"]
        NextProxy["Next.js Route Handlers (/api/*)"]
        SecCookies[HTTP-Only JWT Cookie & Security Headers]
    end

    subgraph BackendCore["FastAPI Forensic Core (Python 3.11)"]
        FastAPIEngine[FastAPI Application Server (:8000)]
        ScoringCore[7-Signal Attribution Scoring Engine]
        AntiOverclaim[Anti-Overclaiming & Zero-Guessing Guard]
        ReportLabPDF[Section 65B PDF Generator & SHA-256 Seal]
        GraphService[Graph Traversal & Shortest Path Resolver]
    end

    subgraph AsyncPipeline["Asynchronous Processing (Celery & Redis)"]
        CeleryWorker[Celery Background Task Workers]
        RedisBroker[(Redis 7<br/>Broker & Result Backend)]
    end

    subgraph PersistenceLayer["Persistence & Forensic Stores"]
        subgraph ProductionMode["Production Stack"]
            PostgreSQL[(PostgreSQL 16<br/>Relational Cases & Audit Logs)]
            Neo4j[(Neo4j 5.20<br/>Cypher Traversal Engine)]
        end
        subgraph FallbackMode["Fallback / Demo Stack"]
            SQLite[(SQLite 3 Embedded<br/>chaintrace_fallback.db)]
            NetworkX[NetworkX In-Memory Graph]
        end
    end

    subgraph BlockchainLayer["Blockchain Provider Network"]
        EVMProvider[Ethereum / Polygon RPC & Explorers]
        TronProvider[TronGrid REST API & Full Node]
        CrossChain[Bridge Protocol Heuristics]
    end

    Browser --> UI
    UI --> CytoCanvas
    UI --> AuthContext
    UI --> NextProxy
    NextProxy --> SecCookies
    SecCookies --> FastAPIEngine

    FastAPIEngine --> ScoringCore
    FastAPIEngine --> AntiOverclaim
    FastAPIEngine --> ReportLabPDF
    FastAPIEngine --> GraphService

    FastAPIEngine --> RedisBroker
    RedisBroker --> CeleryWorker
    CeleryWorker --> BlockchainLayer
    CeleryWorker --> Neo4j
    CeleryWorker --> PostgreSQL

    FastAPIEngine --> PostgreSQL
    FastAPIEngine --> Neo4j
    FastAPIEngine -.->|Fallback Mode| SQLite
    FastAPIEngine -.->|Fallback Mode| NetworkX

    GraphService --> BlockchainLayer
```

### Component Flow

1. **Authentication**: The officer logs in using an authorized Badge ID and PIN. An HTTP-only JWT cookie (`chaintrace_access_token`) is issued with `SameSite=Lax`.
2. **Query Dispatch**: An unknown suspect address is submitted for tracing. The request flows to `POST /api/v1/wallets/trace` or is enqueued as an async Celery task via `POST /api/v1/tasks/trace`.
3. **Ledger Ingestion & Graph Expansion**: Multi-hop transactions are pulled via Web3.py RPCs/explorers or demo datasets, filtered by direction and minimum value, and traversed up to the specified hop limit.
4. **VASP Cluster Matching**: Addresses across the graph are cross-referenced with the VASP directory. If an address matches an exchange hot wallet or deposit sweep structure, it is marked as a candidate.
5. **7-Signal Scoring & Validation**: The 7-signal formula calculates the composite score. If the score is below threshold or no VASP is reachable, the anti-overclaiming protocol returns `NO_RELIABLE_ATTRIBUTION`.
6. **Visualization & Court Dossier**: The frontend renders the topological graph in Cytoscape.js, while the backend generates an official Section 65B PDF with an embedded SHA-256 seal.

---

## Tech Stack

| Domain | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend Framework** | [Next.js](https://nextjs.org/) | 15.2.0 | React App Router, Server Components & BFF API routes |
| **Frontend UI Library** | [React](https://react.dev/) | 19.0.0 | Component rendering and reactive state |
| **Language (Frontend)** | [TypeScript](https://www.typescriptlang.org/) | 5.8.2 | End-to-end static type safety |
| **Graph Visualization** | [Cytoscape.js](https://js.cytoscape.org/) & `cytoscape-dagre` | 3.34.3 | Interactive, hardware-accelerated topological graph layouts |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 3.4.17 | High-contrast cyber-forensic design system |
| **Animation & Icons** | [GSAP](https://gsap.com/) & [Lucide React](https://lucide.dev/) | 3.15 / 1.16 | Smooth transitions and forensic status iconography |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) | 0.115.6 | High-throughput asynchronous Python REST API gateway |
| **Server Engine** | [Uvicorn](https://www.uvicorn.org/) | 0.34.0 | ASGI web server |
| **Language (Backend)** | [Python](https://www.python.org/) | 3.11+ | Forensic analysis, Web3 scripting, and data pipelines |
| **Blockchain Client** | [Web3.py](https://web3py.readthedocs.io/) | 7.6.1 | EVM RPC interaction, EIP-55 checksumming, bytecode inspection |
| **Graph Algorithms** | [NetworkX](https://networkx.org/) | 3.4.2 | In-memory DAG traversal, cycle detection, and fallback paths |
| **Relational ORM** | [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0.36+ | Async ORM supporting PostgreSQL (`asyncpg`) & SQLite (`aiosqlite`) |
| **Database Migrations**| [Alembic](https://alembic.sqlalchemy.org/) | 1.14.0+ | Relational schema migration management |
| **Relational Database** | [PostgreSQL](https://www.postgresql.org/) | 16-alpine | Production ACID storage for investigations, users, and audit logs |
| **Graph Database** | [Neo4j](https://neo4j.com/) | 5.20-community | Enterprise Cypher graph storage with APOC extensions |
| **Task Queue & Cache** | [Celery](https://docs.celeryq.dev/) & [Redis](https://redis.io/) | 5.4.0 / 7.0 | Asynchronous forensic scraping and transaction caching |
| **PDF Dossier Engine** | [ReportLab](https://www.reportlab.com/) | 4.2.5+ | Court-admissible Section 65B electronic certificate compilation |
| **Security & Auth** | `python-jose` & `passlib[bcrypt]` | 3.3.0 / 1.7.4 | JWT token encoding, decoding, and bcrypt password hashing |
| **Containerization** | [Docker](https://www.docker.com/) & Docker Compose | Compose 3.8 | 6-service production container orchestration |
| **Cloud Deployment** | [Vercel](https://vercel.com/) | Edge/Serverless | Live deployment for interactive web dashboard |

---

## Project Structure

```
.
├── backend/                        # FastAPI backend application
│   ├── alembic/                    # Alembic migration scripts and environment
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/             # API route handlers (auth, attribution, wallets, etc.)
│   │   ├── core/                   # Global configuration, security, and Celery setup
│   │   ├── db/                     # SQLAlchemy async session and database seeders
│   │   ├── models/                 # Relational database models (User, Vasp, Investigation, etc.)
│   │   ├── providers/              # Multi-chain blockchain data providers (ETH, Polygon, TRON)
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── services/               # Core business logic (scoring, graph, reports, Web3)
│   │   └── tasks/                  # Celery background tasks (multi-hop traversal, PDF generation)
│   ├── data/                       # Fallback SQLite database storage
│   ├── tests/                      # Pytest backend test suite (24 tests)
│   ├── Dockerfile                  # Backend production Dockerfile
│   └── requirements.txt            # Python dependencies
├── data/
│   ├── vasp_database.json          # Curated statutory VASP registry & cluster database
│   └── CHAINTRACE_DEMO_SEC65B_REPORT.pdf # Sample compiled Section 65B evidentiary PDF
├── db/
│   └── migrations/                 # Raw SQL DDL schema files (001_create_vasp_tables.sql)
├── docs/                           # Architectural, database, and API specifications
│   ├── API_SPECIFICATION.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── GRAPH_SCHEMA.md
├── public/                         # Static web assets (logos, manifests, SVGs)
├── scripts/
│   ├── create_user.py              # CLI utility to register forensic officers
│   ├── demo_walkthrough.py         # Automated SIH 2026 6-step jury inspection walkthrough
│   ├── expand_vasp_db.py           # Registry expansion utility
│   └── migrate.ts                  # TypeScript schema migration and seeder script
├── src/                            # Next.js 15 frontend application
│   ├── app/                        # App Router pages and internal API route handlers
│   │   ├── administration/         # VASP registry & user management admin desk
│   │   ├── api/                    # Serverless API routes (auth, attribution, vasp, etc.)
│   │   ├── audit-logs/             # Immutable audit trail viewer
│   │   ├── cross-chain-analysis/   # Bridge tracking (LayerZero, Stargate, Wormhole)
│   │   ├── dashboard/              # Main investigation overview workbench
│   │   ├── fund-flow-graph/        # Cytoscape.js interactive graph studio
│   │   ├── investigations/         # Case docket and FIR management
│   │   ├── login/                  # Officer authentication portal
│   │   ├── reports/                # Section 65B PDF generation and export
│   │   ├── risk-intelligence/      # Wallet risk scoring and threat metrics
│   │   ├── transaction-explorer/   # Multi-chain transaction ledger table
│   │   ├── vasp-attribution/       # 7-signal explainable attribution desk
│   │   └── wallet-intelligence/    # Address profiling and counterparty analysis
│   ├── components/                 # Reusable React components (Navbar, Graph, Modals)
│   ├── context/                    # React Context providers (AuthContext)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Client libraries, scoring logic, and standalone store
│   └── middleware.ts               # Next.js route protection & session verification
├── tests/                          # Frontend & TypeScript integration tests (64 tests)
├── docker-compose.yml              # Complete 6-service production Docker orchestration
├── Dockerfile                      # Frontend production multi-stage Dockerfile
├── package.json                    # Node.js dependencies and project scripts
└── tsconfig.json                   # Strict TypeScript compiler configuration
```

---

## Prerequisites

Before running the project locally, ensure you have the following installed:

- **Node.js**: `v20.x` or later (LTS recommended)
- **npm**: `v10.x` or later
- **Python**: `3.11.x` or later
- **Git**: Installed and configured on your system PATH
- *(Optional for full production stack)*: **Docker Engine** `v24+` and **Docker Compose** `v2+`

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mohammedaffanali/ChainTrace.git
cd ChainTrace
```

### 2. Frontend Setup

Install the Node.js dependencies:

```bash
npm install
```

### 3. Backend Setup

Create and activate a Python virtual environment, then install the required Python packages:

**On Windows (PowerShell / Command Prompt):**
```powershell
python -m venv backend\venv
backend\venv\Scripts\activate
pip install -r backend\requirements.txt
```

**On Linux / macOS:**
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Database Setup & Seeding

ChainTrace features zero-friction initialization:
- **Development / Demo Mode (Default)**: On first startup, the backend automatically initializes an embedded SQLite database (`backend/data/chaintrace_fallback.db`), runs metadata schemas, and seeds authorized forensic officers and statutory VASP entities.
- **VASP Registry Seeding**: You can optionally execute the migration seeder directly:
  ```bash
  npm run db:migrate
  ```

---

## Environment Variables

ChainTrace maintains clean segregation between frontend and backend configuration.

### Frontend Environment (`.env.example` / `.env`)

Create a `.env` file in the project root:

```ini
# Data Mode: 'demo' (simulated forensic datasets) or 'live' (real blockchain providers)
BLOCKCHAIN_DATA_MODE=demo

# Server-Side Blockchain Explorer API Keys (Never prefixed with NEXT_PUBLIC_)
ETHEREUM_API_KEY=your_etherscan_api_key_here
POLYGON_API_KEY=your_polygonscan_api_key_here
TRON_API_KEY=your_trongrid_api_key_here

# Blockchain RPC & REST Endpoints
ETHEREUM_RPC_URL=https://cloudflare-eth.com
POLYGON_RPC_URL=https://polygon-rpc.com
TRON_API_URL=https://api.trongrid.io

# Cache & Ingestion Limits
BLOCKCHAIN_CACHE_TTL_MS=60000
BLOCKCHAIN_TX_LIMIT=25

# Public FastAPI Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend & Production Environment (`.env.production`)

Used when operating with Docker Compose or connecting to production databases:

| Variable | Required | Default / Example | Purpose |
|:---|:---:|:---|:---|
| `ENVIRONMENT` | Yes | `production` or `development` | Dictates database engine and strictness |
| `SECRET_KEY` | Yes | `CHANGE_ME_secret_key` | Secret key for signing JWT tokens |
| `COOKIE_SECURE` | No | `false` (dev) / `true` (prod) | Enforce Secure flag on session cookies |
| `USE_POSTGRES` | No | `false` (uses SQLite fallback) | Enable PostgreSQL instead of SQLite |
| `POSTGRES_SERVER` | If Postgres | `localhost` or `postgres` | PostgreSQL hostname |
| `POSTGRES_PORT` | If Postgres | `5432` | PostgreSQL port |
| `POSTGRES_USER` | If Postgres | `postgres` | Database username |
| `POSTGRES_PASSWORD`| If Postgres | `chaintrace_secure_postgres_pass` | Database password |
| `POSTGRES_DB` | If Postgres | `chaintrace` | Database name |
| `NEO4J_URI` | If Neo4j | `bolt://localhost:7687` | Neo4j Bolt protocol connection URI |
| `NEO4J_USER` | If Neo4j | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | If Neo4j | `chaintrace_secure_neo4j_pass` | Neo4j password |
| `REDIS_URL` | If Celery | `redis://localhost:6379/0` | Redis caching and broker connection URI |
| `CELERY_BROKER_URL`| If Celery | `redis://localhost:6379/0` | Celery message broker endpoint |
| `ETH_RPC_URL` | No | `https://cloudflare-eth.com` | Ethereum mainnet RPC |
| `POLYGON_RPC_URL` | No | `https://polygon-rpc.com` | Polygon PoS mainnet RPC |
| `TRON_FULL_NODE_URL`| No | `https://api.trongrid.io` | TronGrid REST endpoint |

> [!CAUTION]
> Never commit `.env` or production credentials to source control. In `LIVE` mode, valid blockchain explorer keys are required to query real mainnet ledgers.

---

## Running the Project

### Running in Development (Two Terminals)

**Terminal 1 — Backend API Gateway:**
```bash
# From project root
cd backend
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend Web Dashboard:**
```bash
# From project root
npm run dev
```

### Access URLs & Endpoints

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Interactive OpenAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### Default Demonstration Credentials

The platform is pre-seeded with forensic officers spanning key agencies:

| Badge ID | Password / PIN | Officer Name | Agency | Role |
|:---|:---|:---|:---|:---|
| `ADMIN-LEA-001` | `AdminRoot2026!` | Rajesh Kumar | National Cyber Security Enclave | **ADMINISTRATOR** |
| `DEL-CYBER-8842` | `OfficerPin8842!` | Insp. Vikramaditya Sharma | Delhi Police Cyber Command / FIU-IND | **INVESTIGATOR** |
| `ED-FORENSIC-007` | `AnalystSecret2026!` | Dr. Meera Nambiar | Directorate of Enforcement (ED) | **ANALYST** |

---

## Usage & Automated Walkthrough

### Typical Investigation Workflow

1. **Officer Login**: Authenticate at `/login` with an authorized Badge ID to receive an encrypted forensic session token.
2. **Wallet Ingestion**: Navigate to **VASP Attribution** (`/vasp-attribution`) or **Fund Flow Graph** (`/fund-flow-graph`). Enter a target wallet address (e.g., `0x71C63F51a02611B1072f95080516461c2CE34397` or `0x7A91bC84D2697e88b209eB0eAc821639d4A44F82`).
3. **Graph Inspection**: Analyze transaction branches, identify intermediary peel chains or cross-chain bridge hops, and inspect counterparty node dossiers in the Cytoscape.js canvas.
4. **Attribution Evaluation**: Inspect the 7-signal score breakdown. Review proximity decay, deposit matching, and the anti-overclaiming check.
5. **Section 65B Dossier Export**: Generate and download the official court-admissible PDF certificate from the **Reports** desk (`/reports`).

### Automated SIH 2026 Jury Demonstration

Execute the built-in automated end-to-end evaluation script:

```bash
npm run demo
# or: python scripts/demo_walkthrough.py
```

The script executes 6 automated evaluation phases:
1. **Health & Mode Verification**: Validates API operational state, active engine (`FALLBACK-DEMO-SQLITE-NETWORKX` or `PRODUCTION-POSTGRES-NEO4J`), and security telemetry headers.
2. **Officer Authentication**: Authenticates an LEA investigator and verifies cookie issuance.
3. **Multi-Hop Traversal**: Discovers transaction edges, detects cycles, and builds DAG topology for a suspect address.
4. **7-Signal Explainable Attribution**: Computes attribution for a verified VASP deposit address and verifies composite score breakdown.
5. **Anti-Overclaiming Refusal Test**: Submits an unattributed address (`0x000000000000000000000000000000000000dead`) and verifies that the system refuses to guess, returning `NO_RELIABLE_ATTRIBUTION`.
6. **Section 65B PDF Compilation**: Generates a tamper-evident Section 65B electronic certificate PDF with SHA-256 seal at `data/CHAINTRACE_DEMO_SEC65B_REPORT.pdf`.

---

## API Documentation

ChainTrace provides a RESTful API with automated OpenAPI specifications accessible at `/docs`.

### Key Endpoints

#### 1. System Health
- **`GET /health`**
  - **Purpose**: System health, active database engine, and evidentiary status.
  - **Auth**: None.
  - **Response**:
    ```json
    {
      "status": "healthy",
      "project": "CHAINTRACE Backend Intelligence API",
      "version": "1.0.0",
      "runtime_mode": "FALLBACK_DEMO",
      "engine": "FALLBACK-DEMO-SQLITE-NETWORKX",
      "evidentiary_status": "NON_EVIDENTIARY_SIMULATION",
      "services": {
        "database": "CONNECTED_SQLITE_FALLBACK",
        "neo4j": "FALLBACK_NETWORKX_STUB",
        "redis": "CONFIGURED"
      }
    }
    ```

#### 2. Authentication (`/api/v1/auth`)
- **`POST /api/v1/auth/login`**: Authenticate an officer with `badge_id` and `password`. Sets HTTP-only `chaintrace_access_token` cookie.
- **`POST /api/v1/auth/logout`**: Terminate session and invalidate cookie.
- **`GET /api/v1/auth/me`**: Return currently authenticated officer's identity and agency profile.

#### 3. Attribution & Scoring (`/api/v1/attribution`)
- **`POST /api/v1/attribution/run`**
  - **Purpose**: Execute 7-signal explainable VASP attribution.
  - **Body**:
    ```json
    {
      "wallet_address": "0x28c6c06298d514db089934071355e5743bf21d60",
      "chain": "ethereum",
      "max_hops": 3
    }
    ```
  - **Response (Candidate Found)**: Returns `status: "ATTRIBUTED_CANDIDATE"`, `overall_confidence`, signal scores with weights, and evidentiary rationale.
  - **Response (Unattributed / Anti-Overclaiming)**: Returns `status: "NO_RELIABLE_ATTRIBUTION"`, `primary_candidate: null`, and zero-guessing explanations.

#### 4. Wallet & Graph Tracing (`/api/v1/wallets`)
- **`POST /api/v1/wallets/trace`**
  - **Purpose**: Execute multi-hop bounded BFS graph traversal.
  - **Body**: `{"address": "0x7A91...", "chain": "ethereum", "max_hops": 3, "min_amount_usd": 100.0}`
  - **Response**: Graph schema containing `nodes` (type, risk score, cluster) and `edges` (tx hash, value, token, timestamp).
- **`GET /api/v1/wallets/{address}/profile`**: Retrieve wallet metadata, chain, balance, and risk indicators.

#### 5. Case Investigations (`/api/v1/investigations`)
- **`GET /api/v1/investigations`**: List active case dockets, lead officers, and financial exposure.
- **`POST /api/v1/investigations`**: Open a new case docket with FIR number, title, and initial seed wallets.
- **`GET /api/v1/investigations/{id}`**: Detailed case dossier including tracked wallets and investigation notes.

#### 6. Evidentiary Reports (`/api/v1/reports`)
- **`POST /api/v1/reports/export-pdf`**
  - **Purpose**: Compiles a Section 65B Indian Evidence Act compliant PDF certificate.
  - **Body**: `{"case_id": "...", "case_name": "...", "primary_address": "...", "chain": "ethereum", "attributed_vasp": "...", "confidence_score": 88.7}`
  - **Response**: Binary stream (`application/pdf`) with embedded SHA-256 seal.

#### 7. Asynchronous Task Queue (`/api/v1/tasks`)
- **`POST /api/v1/tasks/trace`**: Enqueue an asynchronous multi-hop traversal task. Returns HTTP 202 Accepted with a `task_id`.
- **`GET /api/v1/tasks/{task_id}/status`**: Query task lifecycle status (`QUEUED`, `INDEXING_BLOCKCHAIN`, `TRAVERSING_TOPOLOGY`, `COMPLETED`).

#### 8. VASP Admin & Registry (`/api/v1/vasp`)
- **`GET /api/v1/vasp/registry`**: List registered VASPs and FIU-IND compliance statuses.
- **`GET /api/v1/vasp/addresses/lookup?address=0x...&chain=ethereum`**: Direct registry lookup for known addresses.

---

## Database

### Relational Entities (PostgreSQL / SQLite Fallback)

- **`users`**: Authorized LEA personnel, credentials (bcrypt), agency affiliation, and RBAC roles (`INVESTIGATOR`, `ANALYST`, `ADMINISTRATOR`).
- **`investigations`**: Master case register (case number, priority, status, total exposure INR).
- **`investigation_wallets`**: Seed and discovered wallets associated with active investigations.
- **`investigation_notes`**: Timestamped case log entries authored by investigators.
- **`vasps`**: Regulated exchanges, legal entities, jurisdictions, and FIU-IND registration numbers.
- **`wallet_clusters`**: Groups of addresses identified as belonging to a common VASP entity.
- **`vasp_addresses`**: Known exchange deposit, hot wallet, cold storage, and sweeping addresses.
- **`attribution_results`**: Historical attribution runs, status classifications, and scores.
- **`evidence_records`**: Granular 7-signal breakdowns and reasoning behind attributions.
- **`audit_logs`**: Immutable, non-repudiable audit logs recording every investigative action.
- **`task_records`**: State and results of background Celery/async tasks.

### Graph Database (Neo4j / NetworkX Fallback)

- **Nodes**: `(:Wallet {address, chain, risk_score, entity_type})`, `(:VASP {name, fiu_status, jurisdiction})`, `(:Cluster {cluster_id, vasp_id})`.
- **Relationships**: `[:TRANSFERRED {tx_hash, amount, timestamp, token}]`, `[:DEPOSITED_TO]`, `[:BELONGS_TO_CLUSTER]`, `[:CONTROLLED_BY]`.

---

## Testing

ChainTrace maintains comprehensive test coverage across both frontend and backend systems:

```bash
# Run frontend test suite (64 tests)
npm test

# Run backend pytest suite (24 tests)
npm run test:backend

# Run complete test suite (88 tests total)
npm run test:all

# Run strict TypeScript compiler verification (0 errors)
npx tsc --noEmit

# Run ESLint check
npm run lint
```

### Verification Status

| Suite | Runner / Framework | Tests | Status | Scope |
|:---|:---|:---:|:---:|:---|
| **Frontend & Lib** | `tsx --test` (Node.js Test Runner) | **64 / 64** | **100% Passing** | Auth protection, multi-chain providers, graph BFS, 7-signal formula, anti-overclaiming, VASP repo |
| **Backend API** | `pytest` + `pytest-asyncio` | **24 / 24** | **100% Passing** | Auth & DB, attribution routes, provider adapters, reports, Celery tasks, Web3, WebSocket |
| **Type Integrity** | `npx tsc --noEmit` | — | **0 Errors** | Strict TypeScript check across entire `src/` codebase |
| **SIH Evaluation** | `python scripts/demo_walkthrough.py`| **6 / 6** | **100% Passing** | End-to-end automated jury demonstration walkthrough |

---

## Build & Production

### Frontend Production Build

```bash
npm run build
npm run start
```
Compiles optimized static and server-rendered assets with Next.js 15 and starts the production server on port 3000.

### Backend Production Server

Run the production ASGI server with multi-worker scaling:

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Docker & Deployment

### Production Docker Compose Stack

The repository provides a complete 6-service orchestration configuration (`docker-compose.yml`):

```bash
docker compose up --build
```

### Orchestrated Services

1. **`frontend`** (Port `3000`): Next.js 15 multi-stage production container.
2. **`api`** (Port `8000`): FastAPI Python 3.11 core intelligence engine.
3. **`worker`**: Celery asynchronous background worker executing forensic graph traversal.
4. **`postgres`** (Port `5432`): PostgreSQL 16 Alpine with persistent volume storage.
5. **`neo4j`** (Ports `7474`, `7687`): Neo4j 5.20 Community with APOC plugin for multi-hop Cypher queries.
6. **`redis`** (Port `6379`): Redis 7.0 Alpine in-memory broker and cache.

### Vercel Deployment

ChainTrace is deployed live at:

**https://chain-trace-jade.vercel.app/**

On Vercel, the Next.js frontend utilizes internal serverless route handlers and the in-memory fallback layer (`src/lib/standaloneStore.ts`), ensuring all platform features, visualizer tools, and attribution engines remain fully functional in serverless cloud environments.

---

## Contributing

1. **Fork the Repository**: Create your personal branch (`git checkout -b feature/forensic-enhancement`).
2. **Follow Coding Standards**: Ensure code adheres to strict TypeScript rules and PEP 8 standards.
3. **Validate Test Suites**: Ensure all 64 frontend tests and 24 backend tests pass before committing:
   ```bash
   npm run test:all
   npx tsc --noEmit
   ```
4. **Open a Pull Request**: Submit a clear PR describing changes and evidentiary impact.

---

## License

No explicit open-source license file is currently present in the repository. All rights are reserved by the authors and contributors under the **Smart India Hackathon (SIH 2026)** project initiative.
