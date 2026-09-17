# CHAINTRACE — MANDATORY TECHNOLOGY STACK VERIFICATION REPORT

**Document ID**: CT-TECH-VERIFY-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Auditor**: Senior Systems & Forensic Technology Architecture Team  
**Status**: Completed — Phase 3 Deliverable  

---

## 1. Executive Summary

This report provides a granular, evidence-based verification of the 12 mandatory core technologies required for **CHAINTRACE**. Every technology was examined across its installation status, configuration files, and actual code-level usage in both the Next.js frontend and Python backend codebases.

---

## 2. Technology Verification Matrix

| Technology | Installed? | Configured? | Actually Used? | Status Category | Evidence in Codebase | Required Redevelopment Action |
|---|---|---|---|---|---|---|
| **Next.js** | Yes | Yes | Yes | **Used** | `package.json:19` (`next: ^15.2.0`), `next.config.js`, `src/app/` (23 App Router pages and API routes prerendered). | Preserve Next.js 15 App Router; configure BFF proxy routes to forward client requests to FastAPI backend. |
| **React** | Yes | Yes | Yes | **Used** | `package.json:20-21` (`react: ^19.0.0`), `tsconfig.json: jsx: preserve`, `src/components/`, `src/context/AuthContext.tsx`. | Preserve React 19; decompose monolithic 1,373-line page files into modular reusable feature components. |
| **TypeScript** | Yes | Yes | Yes | **Used** | `package.json:35` (`typescript: ^5.8.2`), `tsconfig.json: "strict": true`, types in `src/lib/` and `src/types/`. | Preserve TypeScript in strict mode; add strictly typed schemas matching FastAPI Pydantic responses and Cytoscape elements. |
| **Tailwind CSS** | Yes | Yes | Yes | **Used** | `package.json:33` (`tailwindcss: ^3.4.17`), `tailwind.config.js`, `src/app/globals.css` with CSS variable design tokens. | Preserve Tailwind CSS; fix mobile `pl-64` margin overflow bug; improve WCAG 2.2 AA color contrast on text tokens. |
| **Cytoscape.js** | **No** | **No** | **No** | **Missing** | `npm list cytoscape` returned empty; `src/app/fund-flow-graph/page.tsx:491` renders raw inline SVG `<circle>` and `<line>`. | **Install `cytoscape` & `@types/cytoscape`**; build interactive `<WalletGraph />` canvas with Dagre/CoSE layouts and path highlighting. |
| **Python** | Yes | Yes | Yes | **Used** | Python 3.11.5 in `backend/venv`, `backend/requirements.txt`, executes FastAPI and pytest suites. | Standardize Python 3.11 as primary forensic backend; add missing dependencies (`sqlalchemy`, `reportlab`, `python-jose`, `passlib[bcrypt]`). |
| **FastAPI** | Yes | Yes | Partially | **Partially Implemented** | `backend/requirements.txt:1` (`fastapi==0.115.6`), `backend/app/main.py:6`, routes in `backend/app/api/routes/`. | Connect FastAPI as authoritative backend; implement missing route groups (`/auth`, `/investigations`, `/graph`, `/vasps`, `/reports`). |
| **Celery** | Yes | Yes | Partially | **Partially Implemented** | `backend/requirements.txt:9` (`celery==5.4.0`), `backend/app/workers/celery_app.py:4`, single dummy task `trace_wallet_async`. | Implement real async tasks for multi-hop graph building, blockchain scraping, and PDF generation; wire task status polling. |
| **Redis** | Yes | Yes | Partially | **Partially Implemented** | `backend/requirements.txt:10` (`redis==5.2.1`), `backend/app/core/config.py:32`, `backend/docker-compose.yml:31`. | Deploy Redis 7 Alpine in Docker container for Celery message broker, task state storage, and RPC response caching. |
| **Neo4j** | Yes | Yes | **No** | **Partially Implemented** | `backend/requirements.txt:11` (`neo4j==5.27.0`), `backend/app/db/neo4j.py:5`, but completely bypassed in `graph_service.py`. | Write Neo4j node/relationship schema migrations; connect queries in `graph_service.py` to real Neo4j session instead of NetworkX stubs. |
| **Cypher** | Driver Yes | Driver Yes | **No** | **Missing** | Zero Cypher queries (`MATCH`, `MERGE`, `CREATE`) exist across any `.py` or `.ts` source files. | Implement parameterized Cypher queries for node upserts, edge creation, multi-hop shortest paths, and cluster traversals. |
| **Graph Algorithms** | Yes | Partially | Partially | **Partially Implemented** | `networkx` 3.4.2 in Python; BFS in TypeScript `src/lib/graph/graphBuilder.ts:135`; dummy nodes in `graph_service.py:16`. | Formalize algorithm implementations (BFS, Dijkstra shortest path, Proximity decay, Cluster co-spend) with documentation and test suites. |

---

## 3. Granular Subsystem Verification

### 3.1 Frontend Stack Details

#### Next.js & React 19
- **Installation Verification**:
  - `package.json` specifies `"next": "^15.2.0"`, `"react": "^19.0.0"`, `"react-dom": "^19.0.0"`.
  - `npm run build` executed successfully, generating 23 routes (22 static, 1 dynamic `/investigations/[id]`).
- **Gaps**:
  - Missing server-side middleware for protected routes (currently uses a client-side `useEffect` in `DashboardLayout.tsx`).
  - Next.js API routes duplicate backend business logic instead of forwarding to FastAPI.

#### Cytoscape.js Gaps
- **Current State**: The file `src/app/fund-flow-graph/page.tsx` renders nodes using raw inline SVG elements:
  ```tsx
  // src/app/fund-flow-graph/page.tsx:491
  <svg viewBox={`0 0 ${canvasDimensions.width} ${canvasDimensions.height}`}>
    {edges.map((e) => (<line ... />))}
    {nodes.map((n) => (<g ...><circle ... /></g>))}
  </svg>
  ```
- **Consequences**:
  - Zero dynamic graph physics (no force-directed layouts, no automatic collision avoidance).
  - No viewport box-selection, zoom-to-fit bounding, or node branch expand/collapse.
  - High DOM node overhead when rendering >50 elements.
- **Required Remediation**: Install `cytoscape` (v3.30+) and `@types/cytoscape`, implement `<CytoscapeGraph />` canvas with `cola` / `dagre` layout extensions.

---

### 3.2 Backend Stack Details

#### Python & FastAPI
- **Installation Verification**:
  - Virtual environment active at `backend/venv` with Python 3.11.5.
  - FastAPI 0.115.6 and Uvicorn 0.34.0 installed and running.
  - Basic health check at `GET /health` and endpoints at `/api/v1/wallets/validate` and `/api/v1/attribution/run`.
- **Gaps**:
  - Missing database ORM (SQLAlchemy is not installed).
  - Missing JWT auth dependencies (`python-jose`, `passlib[bcrypt]`).
  - Missing PDF generation library (`reportlab`).
  - Critical logic bug: `backend/app/api/routes/attribution.py:14-21` falls back to attributing unknown addresses to Binance!

#### Celery & Redis
- **Installation Verification**:
  - `celery` 5.4.0 and `redis` 5.2.1 installed in `backend/venv`.
  - `backend/app/workers/celery_app.py` instantiates Celery application.
- **Gaps**:
  - Worker is not configured to execute real graph scraping tasks.
  - Redis server is not currently running locally or managed via background process.
  - Task status endpoints are not exposed to the frontend.

#### Neo4j & Cypher
- **Installation Verification**:
  - `neo4j` 5.27.0 driver installed in `backend/venv`.
  - `backend/app/db/neo4j.py` has a basic connector class.
- **Gaps**:
  - **Zero Cypher queries exist in the codebase**.
  - `backend/app/services/graph/graph_service.py` hardcodes:
    ```python
    hop1 = "0x28c6c06298d514db089934071355e5743bf21d60"
    G.add_node(hop1, type='vasp', label=vasp_name)
    ```
    This completely bypasses Neo4j and returns hardcoded stubs.
  - No database migration or graph schema constraint scripts exist for Neo4j.

---

### 3.3 Graph Algorithms Specification

To satisfy Phase 3 requirements, the following algorithms must be formally implemented, documented, and tested:

#### Algorithm 1: Bounded Breadth-First Search (BFS) Traversal
- **Purpose**: Traverse outbound and inbound fund flows from a seed wallet across transaction hops up to depth $K$ ($K \le 5$).
- **Inputs**: `starting_address: str`, `chain: str`, `max_hops: int`, `max_nodes: int`, `direction: str`.
- **Outputs**: `nodes: List[Node]`, `edges: List[Edge]`, `traversal_depth: int`.
- **Time Complexity**: $\mathcal{O}(V + E)$ bounded by `max_nodes` ($N \le 100$).
- **Limitations**: Requires bounded transaction limits per node (e.g., 20 txs) to avoid memory explosion on high-volume contract addresses (e.g., Uniswap pools).
- **Test Suite**: `tests/graph_traversal_test.py` verifying cyclic graph handling and hop cutoff.

#### Algorithm 2: Proximity & Hop Decay Scoring
- **Purpose**: Quantify the topological distance between suspect wallet and candidate VASP custodial endpoint.
- **Inputs**: `path_length: int` (number of hops).
- **Formula**:
  $$\text{ProximityScore}(h) = \text{HopDecay}[h] \times 100$$
  where $\text{HopDecay} = \{1: 1.00, 2: 0.90, 3: 0.75, 4: 0.55, 5: 0.30, >5: 0.15\}$.
- **Outputs**: `raw_proximity_score: float \in [0, 100]`.
- **Limitations**: Proximity alone does not confirm intentional money laundering; must be combined with deposit match and cluster heuristics.

#### Algorithm 3: Co-Spend & Common-Input Cluster Detection
- **Purpose**: Group addresses belonging to the same controlling entity based on multi-input transactions (UTXO) and deposit sweep consolidation patterns (Account-based).
- **Inputs**: `transactions: List[Transaction]`, `known_clusters: Dict[str, Cluster]`.
- **Outputs**: `cluster_id: Optional[str]`, `is_cluster_member: bool`, `confidence: float`.
- **Complexity**: $\mathcal{O}(T \times I)$ where $T$ is transactions and $I$ is inputs.
- **Limitations**: Mixers (CoinJoin) can generate false clustering if not filtered prior to analysis.

#### Algorithm 4: Shortest Path to Known VASP Endpoint
- **Purpose**: Determine the minimal evidentiary link between target wallet and statutory VASP registry.
- **Inputs**: Neo4j Graph session, `source_wallet: str`, `target_vasp_id: str`.
- **Cypher Query**:
  ```cypher
  MATCH (start:Wallet {address: $source_address})
  MATCH (target:VASP {id: $vasp_id})
  MATCH p = shortestPath((start)-[:SENT|RECEIVED_BY*..5]-(target))
  RETURN p, length(p) AS hops
  ```
- **Outputs**: Ordered sequence of nodes and edges forming the evidentiary chain.

---

## 4. Missing Dependencies to Install

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "cytoscape": "^3.30.4",
    "cytoscape-dagre": "^2.5.0",
    "cytoscape-cose-bilkent": "^4.1.0"
  },
  "devDependencies": {
    "@types/cytoscape": "^3.19.16",
    "@types/cytoscape-dagre": "^2.3.3"
  }
}
```

### Backend (`backend/requirements.txt`)
```text
sqlalchemy>=2.0.36
alembic>=1.14.0
asyncpg>=0.30.0
psycopg2-binary>=2.9.10
reportlab>=4.2.5
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.20
```

---

*Technology Verification Report approved for Phase 3 review.*
