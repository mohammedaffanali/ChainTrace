# CHAINTRACE — COMPREHENSIVE PROJECT AUDIT & DISCOVERY REPORT

**Document ID**: CT-AUDIT-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Auditor**: Senior Architecture, Security & Forensics Engineering Team  
**Status**: Completed — Phase 1 Decision Gate Deliverable  

---

## 1. Project Overview

**CHAINTRACE** is designed as a specialized cryptocurrency intelligence and forensic investigation platform for Law Enforcement Agencies (LEAs), financial intelligence units (such as FIU-IND), and authorized blockchain forensic analysts.

### Core Problem Statement
*Automated Attribution of Unknown Cryptocurrency Wallets to Nearest Virtual Asset Service Providers (VASPs) through Blockchain Intelligence APIs.*

The system’s primary operational purpose is to ingest an unlabelled suspect cryptocurrency wallet address, traverse multi-hop transaction graphs across diverse blockchain networks (e.g., Ethereum, Tron, Polygon), correlate custodial patterns and wallet clusters against known statutory VASP registries, compute an explainable attribution confidence score with mathematical decomposition, and produce court-admissible forensic dossiers.

---

## 2. Current Technology Stack

### 2.1 Frontend
- **Framework**: Next.js 15.2.0 (App Router), React 19.0.0, React DOM 19.0.0.
- **Language**: TypeScript 5.8.2 (`strict: true` in `tsconfig.json`).
- **Styling**: Tailwind CSS 3.4.17 with CSS variable theme tokens (`--bg`, `--surface`, `--primary`, etc.).
- **Animation**: GSAP 3.15.0 (used for background canvas particle ticker).
- **Icons**: Lucide React 1.16.0 + Material Symbols Outlined (loaded via CDN webfont).
- **Graph Visualization**: **NOT Cytoscape.js**. Currently rendered using raw React SVG `<svg>` elements with a basic manual coordinate layout computer in `src/lib/graph/layout.ts`.

### 2.2 Backend (Dual Implementations Detected)
1. **Next.js Internal Route Handlers**:
   - Located in `src/app/api/` (`/attribution`, `/blockchain/mode`, `/graph`, `/transactions`, `/vasp`, `/vasp/import`, `/vasp/lookup`).
   - Pure TypeScript in-memory simulation and provider wrappers.
2. **Python FastAPI Backend**:
   - Framework: FastAPI 0.115.6, Uvicorn 0.34.0, Pydantic 2.10.4, Pydantic-Settings 2.7.0.
   - Web3: `web3.py` 7.6.1, `httpx` 0.28.1, `networkx` 3.4.2.
   - Background Workers: `celery` 5.4.0, `redis` 5.2.1.
   - Graph Driver: `neo4j` 5.27.0.
   - Testing: `pytest` 8.3.4, `pytest-asyncio` 0.25.0.
   - Status: Partially implemented, isolated from the Next.js frontend, and not invoked by the UI pages.

### 2.3 Database & Storage
- **Relational Storage**: Relational SQL migrations drafted in `db/migrations/001_create_vasp_tables.sql`, but no PostgreSQL or SQLite engine is connected.
- **In-Memory/File Storage**: `data/vasp_database.json` read/written synchronously via Node.js `fs` in `src/lib/vasp/repository.ts` and `backend/app/services/vasp/vasp_service.py`.
- **Graph Database**: Neo4j connector instantiated in `backend/app/db/neo4j.py`, but queries in `backend/app/services/graph/graph_service.py` bypass Neo4j and return hardcoded NetworkX stubs.

### 2.4 Infrastructure & Tooling
- **Local Dev**: Node.js `tsx`, Python virtual environment (`backend/venv`).
- **Docker**: `backend/Dockerfile` and `backend/docker-compose.yml` (corrupted syntax in YAML escaping).
- **Build**: Passes `next build` (Next.js 15.5.25), `npm test` (63 unit tests passed), and `pytest` (3 backend tests passed).

---

## 3. Existing Feature Inventory

| Feature | Location | Status | Operational Reality |
|---|---|---|---|
| **Command Dashboard** | `src/app/dashboard/page.tsx` | Functional UI | Displays KPIs, recent transactions, quick launch attribution bar. Data is static demo data from `src/lib/data.ts`. |
| **VASP Attribution Engine** | `src/app/vasp-attribution/page.tsx` | Functional UI / Simulation | 1,373 lines of code. Runs 7-signal formula in simulation; can query `/api/attribution`. Default fallback hardcodes Binance. |
| **Fund Flow Graph** | `src/app/fund-flow-graph/page.tsx` | Functional SVG Canvas | Renders hardcoded nodes/edges via raw SVG `<circle>` and `<line>`. Lacks Cytoscape.js interactive physics, multi-hop expansion, or node grouping. |
| **Wallet Intelligence** | `src/app/wallet-intelligence/page.tsx` | Functional UI | Displays wallet balance, risk breakdown, token balances from demo constants or Web3 provider. |
| **Transaction Explorer** | `src/app/transaction-explorer/page.tsx` | Functional UI | Filterable transaction table with hash inspection, risk flags, and token breakdowns. |
| **Cross-Chain Analysis** | `src/app/cross-chain-analysis/page.tsx` | Functional UI | Visualizes bridge hops (Stargate, Hop Protocol, etc.) between EVM and Tron. |
| **Risk Intelligence** | `src/app/risk-intelligence/page.tsx` | Functional UI | Threat ranking table, sanctions indicator, OFAC/PMLA flags. |
| **Case Register** | `src/app/investigations/page.tsx` | Client State Only | Allows creating new cases into in-memory React state (`CASES`). Disappears on page refresh. |
| **Case Dossier Details** | `src/app/investigations/[id]/page.tsx` | Functional UI | Shows case tabs (hops, wallets, subpoenas, evidence). Unknown IDs default to `CASES[0]`. |
| **Investigation Reports** | `src/app/reports/page.tsx` | Pseudo-Feature | Button "Generate Investigation Report" executes `setTimeout` (1.2s) without generating any file download. |
| **Audit Logs** | `src/app/audit-logs/page.tsx` | Functional UI | Displays tamper-evident SHA-256 event hashes from `src/lib/scoring/auditLogger.ts`. |
| **Node Administration** | `src/app/administration/page.tsx` | Functional UI | Shows cluster status, RPC endpoints, and cache toggle controls. |
| **Authentication** | `src/context/AuthContext.tsx` | Mock Client-Side | Saves badgeId/PIN to `localStorage`. Bypasses any real credential or role verification. |
| **Theme Engine** | `src/components/common/ThemeToggle.tsx` | Functional | Full Light / Dark / System theme switching with anti-FOUC script. |

---

## 4. Current Architecture

```
[Browser / User Interface]
    ├── Next.js App Router (React 19, Tailwind CSS)
    ├── Local Storage Auth Session (No JWT, No Server Cookies)
    └── Raw SVG Canvas (Not Cytoscape.js)
            │
            ▼
    [Next.js Internal API Routes (/src/app/api)]
    ├── /api/attribution  ───► src/lib/attributionService.ts ──► In-Memory Scoring Engine
    ├── /api/graph        ───► src/lib/graph/graphBuilder.ts ──► In-Process BFS
    ├── /api/vasp         ───► src/lib/vasp/repository.ts   ──► data/vasp_database.json (Disk Sync)
    └── /api/blockchain   ──► src/lib/blockchain/service.ts  ──► Public RPCs / Etherscan
            │
            ✕ (Completely Disconnected from UI)
            │
    [Python FastAPI Backend (/backend/app)] (PORT 8000)
    ├── /api/v1/wallets       ──► Web3 / Tron Service
    ├── /api/v1/attribution   ──► Heuristic scoring
    ├── Celery Worker         ──► tasks.trace_wallet_async (Stubbed)
    ├── Redis                 ──► Broker (Not running in dev)
    └── Neo4j Driver          ──► GraphDatabase.driver (Hardcoded bypass in graph_service.py)
```

---

## 5. Route Inventory

| Route Path | Type | Protected? | Description |
|---|---|---|---|
| `/` | Page (Public) | No | Landing page with hero banner, architecture highlights, and CTA. |
| `/login` | Page (Public) | No | Login portal (badge ID, agency dropdown, security PIN). |
| `/dashboard` | Page | Client Only | Operational overview with KPIs, live feed, quick launch bar. |
| `/vasp-attribution` | Page | Client Only | Multi-tab attribution suite, candidate ranking, 7-signal radar. |
| `/fund-flow-graph` | Page | Client Only | SVG fund flow graph with node inspector and path highlighter. |
| `/wallet-intelligence` | Page | Client Only | Wallet risk profiler, asset breakdown, cluster metadata. |
| `/transaction-explorer` | Page | Client Only | Granular transaction hop explorer with filters and pagination. |
| `/cross-chain-analysis` | Page | Client Only | Cross-chain bridge hop tracer. |
| `/risk-intelligence` | Page | Client Only | Threat taxonomy table and mixer detection list. |
| `/investigations` | Page | Client Only | Case register table with creation modal. |
| `/investigations/[id]` | Page | Client Only | Detailed case dossier (timeline, legal notices, evidence). |
| `/reports` | Page | Client Only | Section 65B and court dossier preview (fake download button). |
| `/audit-logs` | Page | Client Only | Cryptographic chain-of-custody log ledger. |
| `/administration` | Page | Client Only | Cluster nodes, RPC status, telemetry toggles. |
| `/api/attribution` | Next.js API | No | Executes attribution pipeline (POST/GET). |
| `/api/blockchain/mode` | Next.js API | No | Toggles or reads DEMO vs LIVE blockchain telemetry mode. |
| `/api/graph` | Next.js API | No | In-process BFS graph traversal API. |
| `/api/transactions` | Next.js API | No | Retrieves normalized transactions for a wallet. |
| `/api/vasp` | Next.js API | No | Returns list of registered VASPs from JSON. |
| `/api/vasp/lookup` | Next.js API | No | Direct address lookup against known VASP addresses. |
| `/api/vasp/import` | Next.js API | No | Bulk ingestion endpoint for CSV/JSON VASP records. |

---

## 6. Component Inventory

- **Layout Components**:
  - `src/components/layout/DashboardLayout.tsx`: Shell container with sidebar padding and auth check.
  - `src/components/layout/TacticalSidebar.tsx`: Fixed 64-width desktop sidebar.
  - `src/components/layout/CommandHeader.tsx`: Top bar with search trigger and officer profile.
  - `src/components/layout/ClassificationHeader.tsx`: Security clearance classification banner.
- **Common Components**:
  - `src/components/common/ChainTraceLogo.tsx`: SVG brand monogram.
  - `src/components/common/ChainTraceBackground.tsx`: GSAP canvas background.
  - `src/components/common/CommandPalette.tsx`: Global modal search (Ctrl+K).
  - `src/components/common/CopyBadge.tsx`: Copy-to-clipboard badge.
  - `src/components/common/ThemeToggle.tsx`: Dark/Light/System switcher.
- **Graph Components**:
  - Currently embedded directly inside `src/app/fund-flow-graph/page.tsx` as raw inline SVG elements. No reusable `<WalletGraph />`, `<GraphControls />`, or `<CytoscapeCanvas />` component exists.

---

## 7. API Inventory (FastAPI vs Next.js)

### Next.js Internal Endpoints
- `POST /api/attribution`: Validates wallet and executes `runVaspAttributionSimulation` or `runLiveVaspAttribution`.
- `GET /api/blockchain/mode`: Returns `{ mode: "demo" | "live" }`.
- `POST /api/graph`: Returns nodes, edges, and paths computed via in-process BFS.
- `GET /api/vasp`: Returns all VASPs from `data/vasp_database.json`.
- `POST /api/vasp/lookup`: Direct lookup of a single address.
- `POST /api/vasp/import`: Ingests CSV or JSON VASP data.

### FastAPI Endpoints (`backend/app/main.py`)
- `GET /health`: Returns `{ status: "healthy", project: "...", version: "1.0.0" }`.
- `POST /api/v1/wallets/validate`: Address checksum and validation for EVM and Tron.
- `POST /api/v1/wallets/balance`: Retrieves native balance via Web3.py.
- `POST /api/v1/attribution/run`: Runs Python 7-signal formula. **Critical issue: Defaults unmatched wallets to Binance!**
- **Missing FastAPI Endpoints**:
  - `/api/v1/auth/*` (Login, Register, Session)
  - `/api/v1/users/*` (User Management, Roles)
  - `/api/v1/investigations/*` (Case CRUD)
  - `/api/v1/graph/*` (Neo4j Cypher queries & multi-hop paths)
  - `/api/v1/reports/*` (PDF/JSON dossier generation)
  - `/api/v1/tasks/*` (Celery background task polling)

---

## 8. Database Inventory

1. **`db/migrations/001_create_vasp_tables.sql`**:
   - Tables drafted: `vasps`, `wallet_clusters`, `vasp_addresses`.
   - Engine: Not bound to PostgreSQL or SQLite. The migration runner `scripts/migrate.ts` reads the file as text and writes to JSON instead.
2. **`data/vasp_database.json`**:
   - Size: 10.4 KB. Contains 5 VASPs (CoinDCX, WazirX, Binance, ZebPay, Mudrex) and 12 known custodial addresses.
   - Concurrency: Unsafe synchronous file writes (`fs.writeFileSync`). No ACID transactions or multi-user locking.
3. **Neo4j**:
   - `backend/app/db/neo4j.py` has basic bolt connection code, but no schema constraints, indexes, migrations, or Cypher queries exist.

---

## 9. Authentication Flow

- **Current Implementation**: Purely client-side in `src/context/AuthContext.tsx`.
- **Validation**:
  - Checks if `badgeId` is non-empty and `tokenPin.length >= 4`.
  - Saves `{ badgeId, agency, officerName: 'Insp. Vikramaditya Sharma', authenticatedAt }` into browser `localStorage`.
- **Route Protection**:
  - Handled via `useEffect` in `DashboardLayout.tsx`: `if (!isAuthenticated) router.push('/login')`.
- **Vulnerabilities**:
  - No server-side session, JWT, or cookie verification.
  - Direct API routes (`/api/*`) are completely unauthenticated.
  - Anyone can forge any identity in `localStorage` or send direct curl requests to the backend.

---

## 10. Technical Debt Register

| Issue ID | Category | Description | Evidence | Severity | Recommended Solution | Complexity | Dependencies |
|---|---|---|---|---|---|---|---|
| **TD-01** | Architecture | Split dual-backend architecture: Next.js API routes and FastAPI backend are completely uncoupled and duplicate scoring logic. | `src/lib/scoring/scoringEngine.ts` vs `backend/app/services/scoring/explainable_scoring.py` | Critical | Consolidate backend processing into FastAPI; Next.js serves UI and acts as clean BFF. | High | FastAPI, Docker |
| **TD-02** | Database | No real relational database. All entities and investigations are in volatile JSON or React state. | `scripts/migrate.ts`, `src/lib/vasp/repository.ts` | Critical | Implement PostgreSQL with SQLAlchemy/Alembic for structured entities. | High | PostgreSQL |
| **TD-03** | Graph | Cytoscape.js is completely missing from `package.json` and UI. Graph rendered using static SVG. | `package.json`, `src/app/fund-flow-graph/page.tsx:491` | Critical | Install `cytoscape` and build an interactive, high-performance canvas component. | High | Next.js, Cytoscape.js |
| **TD-04** | Graph DB | Neo4j is bypassed in backend code. Queries return hardcoded NetworkX stubs. | `backend/app/services/graph/graph_service.py:16` | Critical | Implement real Neo4j Cypher traversal queries with parameterized inputs. | High | Neo4j driver |
| **TD-05** | Async/Celery | Celery and Redis are not wired into the investigation lifecycle. Analysis runs synchronously. | `backend/app/workers/celery_app.py` has only 1 dummy task | High | Route wallet intelligence retrieval and multi-hop graph builds through Celery tasks. | Medium | Redis, Celery |
| **TD-06** | Logic Flaw | FastAPI attribution endpoint defaults unmatched wallets to Binance! | `backend/app/api/routes/attribution.py:14-21` | Critical | Remove hardcoded fallback; return `INSUFFICIENT_EVIDENCE` or `UNKNOWN`. | Low | FastAPI service |
| **TD-07** | Security | Authentication is client-side only via `localStorage`. No password hashing or JWT. | `src/context/AuthContext.tsx:33-75` | Critical | Implement OAuth2 / JWT with secure HTTP-only cookies and bcrypt password hashing. | High | FastAPI Auth |
| **TD-08** | Security | No RBAC enforcement on API endpoints. Any client can access all routes. | `src/app/api/attribution/route.ts` lacks auth guards | Critical | Implement FastAPI dependencies for role and token verification. | Medium | JWT module |
| **TD-09** | UI/UX | Monolithic 1,373-line `vasp-attribution/page.tsx` with mixed state, presentation, and logic. | `src/app/vasp-attribution/page.tsx` | High | Refactor into modular feature components under `src/features/vasp-attribution/`. | Medium | Component architecture |
| **TD-10** | UI/UX | Indian Rupee `₹` symbol corrupted by character encoding (mojibake `â‚¹`). | `src/lib/data.ts:9, 98-99` | Medium | Normalize file encoding to UTF-8 without BOM; replace all corrupted currency glyphs. | Low | None |
| **TD-11** | UX/Fake Feature | "Generate Investigation Report" executes a fake `setTimeout` and downloads nothing. | `src/app/reports/page.tsx:18-25` | Critical | Implement real PDF/JSON report generation service. | Medium | Report generator |
| **TD-12** | Mobile UX | Sidebar is fixed at `w-64` with no mobile drawer or toggle, breaking layouts under 1024px. | `src/components/layout/TacticalSidebar.tsx:91` | High | Implement responsive mobile sheet/drawer with hamburger toggle. | Medium | Tailwind CSS |
| **TD-13** | Docker | `backend/docker-compose.yml` has syntax errors with backslash quoting. | `backend/docker-compose.yml:7, 34, 39` | Medium | Fix Compose YAML syntax and provide a unified root `docker-compose.yml`. | Low | Docker |
| **TD-14** | State Mgmt | Investigations created in `investigations/page.tsx` disappear on page reload. | `src/app/investigations/page.tsx:67` | Critical | Store cases in PostgreSQL via API endpoints. | Medium | DB schema |

---

## 11. UI/UX Pain Points

1. **Overloaded Screens**: The VASP attribution page has 5 dense tabs, multiple banners, progress bars, radar charts, candidate cards, and statutory notices squeezed into a single continuous page.
2. **Missing Loading & Error States**: Network failures on graph generation produce abrupt error banners without recovery or retry guidance.
3. **Rigid Layouts**: The dashboard cannot be customized; cards have fixed aspect ratios that clip content on smaller laptops (1366x768).
4. **Desktop-Only Orientation**: Layout assumes large high-DPI monitors (`pl-64` fixed offset); mobile and tablet viewports clip table columns and push graphs offscreen.
5. **No Graph Interactivity**: Current SVG graph does not allow drag-and-drop node rearranging, box selection, edge filtering by asset, or graph layout switching (cose, circle, dagre).

---

## 12. Performance Issues

1. **Synchronous File I/O**: Node.js `fs.readFileSync` and `fs.writeFileSync` on `vasp_database.json` block the event loop under concurrent traffic.
2. **Client-Side CPU Load**: In-browser graph BFS traversal in Next.js can freeze the tab if hop depth or node limit is increased beyond 50 nodes.
3. **Missing Pagination**: Transaction explorer and case register render entire arrays into the DOM without virtualized scrolling or backend pagination.

---

## 13. Security Risks

1. **Client-Side Only Authentication**: No cryptographic verification of officer identity or token.
2. **Unvalidated API Ingestion**: `/api/vasp/import` accepts raw JSON/CSV without schema rate-limiting or anti-DoS file size boundaries.
3. **Overclaiming & Evidence Contamination**: Backend fallback attributing unknown addresses to Binance without transaction links risks severe legal liability for LEA users.
4. **Secret Management**: Public RPC URLs and fallback credentials exist in plaintext across config files.

---

## 14. Accessibility Issues (WCAG 2.2 AA Deficiencies)

1. **Color Contrast**: Several muted text elements (`text-[#8c909f]` on `#0e1e33`) have contrast ratios below 3.5:1.
2. **Keyboard Trapping & Non-Navigable SVG**: The SVG graph cannot be navigated via keyboard (Tab / Arrow keys); nodes lack `aria-label`, `role="button"`, and `tabIndex`.
3. **Missing Screen-Reader Announcements**: Analysis progress relies purely on visual CSS animations without `aria-live="polite"` regions.
4. **Lack of Focus Rings**: Several custom buttons suppress default outline without replacing it with visible focus-visible indicators.

---

## 15. Broken or Incomplete Features

- **Report Export**: Completely non-functional (`setTimeout` stub).
- **Interactive Graph**: Static SVG placeholder; no Cytoscape.js canvas.
- **Neo4j Cypher Traversal**: Connector initialized but unused; queries return hardcoded NetworkX dummy nodes.
- **Celery Async Pipeline**: Task defined but never dispatched or queried from frontend.
- **Case Persistence**: In-memory React state; no database write.

---

## 16. Features to Preserve

1. **Explainable 7-Signal Math**: The mathematical formula decomposing attribution into Proximity, Deposit Match, Cluster, Registry, Cross-Chain, Behavioral, and Historical signals is rigorous and domain-appropriate.
2. **FIU-IND Regulatory Integration**: Pre-populated legal entities, PMLA/CrPC 91 notice templates, and statutory registration numbers.
3. **Dual-Theme Design Language**: The Space Grotesk / JetBrains Mono typography pairing and institutional slate/gold palette provide an authoritative forensic look.
4. **Controlled Demo vs Live Telemetry Toggle**: The architectural distinction between verified live RPC data and deterministic demo simulation must be retained and reinforced.

---

## 17. Features to Redesign

1. **Graph Workspace**: Replace static SVG canvas with Cytoscape.js, featuring dynamic layouts (cola/dagre/breadthfirst), node inspection drawer, and hop expander.
2. **Authentication & RBAC**: Replace `localStorage` mock with JWT authentication, refresh tokens, role checks (Investigator, Analyst, Administrator), and audit logging.
3. **Dashboard Information Architecture**: Reorganize into clear widget zones: Case Summary, Quick Launch Trace, Active Task Queue, Priority Alerts.
4. **Case & Investigation Management**: Transition to persistent PostgreSQL backed by FastAPI CRUD endpoints with case notes and evidence attachments.

---

## 18. Features to Remove and Why

1. **Hardcoded Fallback to Binance**: Remove immediately. Attributing unknown wallets to Binance violates legal and evidentiary safety rules.
2. **Fake Export Timers**: Remove mock timeouts; replace with real structured PDF and JSON export generation.
3. **Duplicate Next.js In-Memory Scoring**: Deprecate Next.js scoring duplication in favor of the authoritative FastAPI backend service.

---

## 19. Recommended Rebuild Strategy

1. **Adopt a Clean Decoupled Architecture**:
   - **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Cytoscape.js.
   - **Backend API**: Python FastAPI for all business logic, Web3 intelligence, and REST endpoints.
   - **Async Engine**: Celery + Redis for long-running multi-hop graph builds and blockchain indexing.
   - **Data Layer**: PostgreSQL (users, investigations, VASP registry, audit logs) + Neo4j (wallet-to-wallet transactions and VASP entity graph).
2. **Phased Redevelopment Order**:
   - **Phase 1**: Audit & UX Discovery (Current Phase).
   - **Phase 2**: Requirements & Scope Approval.
   - **Phase 3**: Tech Stack Verification.
   - **Phase 4**: Architecture & Database Design.
   - **Phase 5**: UI/UX Design System & Wireframes.
   - **Phase 6**: Foundation & Auth Implementation.
   - **Phase 7**: Core Workflows & Cytoscape.js Integration.
   - **Phase 8**: QA, Performance & Accessibility.
   - **Phase 9**: Deployment & Docker Orchestration.
   - **Phase 10**: Final Documentation & Release.

---

## 20. Project Risks

1. **API Rate Limiting**: Live RPC and explorer providers (Etherscan, TronGrid) enforce strict rate limits; aggressive multi-hop BFS can exhaust quotas without caching.
2. **Browser Performance on Large Graphs**: Graphs with >100 nodes can degrade client performance if Cytoscape WebGL/Canvas rendering is not configured efficiently.
3. **Overclaiming Liability**: Inconclusive or multi-hop associations must never be stated as conclusive ownership; UI must maintain strict evidentiary caveats.

---

*Report approved for Phase 1 Decision Gate review.*
