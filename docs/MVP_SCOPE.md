# CHAINTRACE — MVP SCOPE SPECIFICATION

**Document ID**: CT-SCOPE-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Approved for Phase 2 Review  

---

## 1. Scope Categorization Framework (MoSCoW)

This document establishes the boundaries of the **Minimum Viable Product (MVP)** for the complete redevelopment of CHAINTRACE. It strictly delineates what must be delivered in the initial release versus secondary enhancements, future iterations, and explicitly out-of-scope items.

---

## 2. Scope Matrix

```
+------------------------------------------------------------------------------------------+
|                                  CHAINTRACE MVP BOUNDARIES                                |
+-----------------------------+-----------------------------+------------------------------+
| MUST-HAVE (P0)              | SHOULD-HAVE (P1)            | COULD-HAVE (P2)              |
| Core Forensics & Integrity  | Analytical Enhancements     | Advanced Productivity        |
+-----------------------------+-----------------------------+------------------------------+
| FUTURE (P3)                 | OUT-OF-SCOPE (Excluded)                                    |
| Multi-Chain Protocol Scale  | Speculative / Dangerous Unverified Systems                 |
+-----------------------------+------------------------------------------------------------+
```

---

### 2.1 Must-Have (P0 — Mandatory for MVP Delivery)
*These features are non-negotiable for an operational, secure, and legally sound forensic platform.*

1. **Decoupled Architecture**:
   - Next.js 15 App Router frontend with TypeScript and Tailwind CSS.
   - Authoritative Python FastAPI backend (`/api/v1/*`) managing intelligence, scoring, and data models.
2. **True Interactive Graph Workspace (Cytoscape.js)**:
   - Interactive canvas rendering suspect, intermediary, mixer, bridge, and VASP nodes.
   - Dynamic layouts: Breadthfirst (DAG), CoSE (physics), Dagre (hierarchical).
   - 1-Click "Highlight Attribution Path" from suspect wallet to candidate VASP.
   - Node and edge inspection side-drawer with transaction hashes and amounts.
3. **Seven-Signal Explainable Attribution Engine**:
   - Strict mathematical decomposition: Proximity (24%), Deposit Match (22%), Cluster (18%), Registry (15%), Cross-Chain (10%), Behavioral (7%), Historical (4%).
   - Automatic categorization into statutory confidence bands.
4. **Strict Anti-Overclaiming & Zero-Guessing Guardrails**:
   - Removal of dangerous Binance fallback.
   - Explicit `NO_RELIABLE_ATTRIBUTION` status when no path exists.
   - Factual evidentiary disclaimers on all views.
5. **Persistent Relational Database (PostgreSQL)**:
   - Users, Roles, Investigations, Wallets, Notes, VASP Registry, and Audit Logs permanently stored.
   - Eliminates case deletion on browser reload.
6. **Neo4j Graph Integration**:
   - Real Cypher traversal queries for shortest-path calculation between wallet and VASP clusters.
7. **Secure Authentication & RBAC**:
   - JWT tokens with HTTP-only cookies, password hashing (bcrypt), and role enforcement (`INVESTIGATOR`, `ANALYST`, `ADMINISTRATOR`).
8. **Real Server-Side Forensic Report Generation**:
   - Replacement of fake button with authentic Section 65B Electronic Certificate and forensic dossier PDF/JSON downloads.
9. **Tamper-Evident SHA-256 Audit Ledger**:
   - Cryptographically hashed event chain for every query, preserving legal chain-of-custody.
10. **Responsive & Accessible UI**:
    - Mobile drawer navigation, WCAG 2.2 AA compliant contrast, dark/light theme fidelity, and zero mojibake currency symbols (`₹`).

---

### 2.2 Should-Have (P1 — Target for Initial Launch)
*High-value analytical capabilities scheduled directly following the core foundation.*

1. **Celery & Redis Asynchronous Task Pipeline**:
   - Background worker execution for multi-hop graph scrapes exceeding 3 hops.
   - Real-time task status polling and progress bar.
2. **Cross-Chain Bridge Relay Visualizer**:
   - Specialized badges and connecting edges for Stargate, Hop Protocol, and Polygon Plasma bridges.
3. **VASP Directory CSV/JSON Importer**:
   - Admin tool to ingest newly gazetted FIU-IND registered entities and deposit sweeps with schema validation.
4. **Command Palette (Ctrl+K)**:
   - Quick search across active investigations, registered VASPs, and wallet addresses.
5. **Dashboard Widget Customization**:
   - Ability to collapse or reorder dashboard metric cards based on investigator preference.

---

### 2.3 Could-Have (P2 — Secondary Enhancements)
*Desirable features to be included if development capacity permits.*

1. **WebSocket Live Telemetry**:
   - Push updates for incoming transactions directly onto an open Cytoscape canvas.
2. **Multi-Wallet Cluster Bulk Ingestion**:
   - Batch upload of 20+ wallets from an active police seizure memo.
3. **Automated CrPC 91 Notice Email Dispatch**:
   - Integration with encrypted SMTP to dispatch formal notice directly to verified compliance desks.
4. **Dark Mode Canvas Glare Optimization**:
   - High-contrast tactical night vision mode for low-light command centers.

---

### 2.4 Future Roadmap (Post-MVP)
*Long-term expansion planned for subsequent major versions.*

1. **UTXO Clustering Engine**:
   - Full implementation of Bitcoin Common-Input-Ownership and Change-Address heuristics.
2. **Solana & Cosmos Ecosystem Expansion**:
   - Integration with Solana RPCs and IBC cross-chain relays.
3. **Automated ML Anomaly Detection**:
   - Peeling-chain velocity classifiers trained on historical seized datasets.
4. **Multi-Agency Federated Case Sharing**:
   - Encrypted case transfer protocol between State Police, ED, and FIU-IND.

---

### 2.5 Strictly Out-of-Scope (Explicit Exclusions)
*Features that will NOT be implemented due to legal, security, and architectural safety rules.*

1. **Speculative Machine Learning Guessing**:
   - No black-box neural networks that output unexplainable VASP predictions.
2. **Direct Private Key / Seed Phrase Handling**:
   - Platform is strictly forensic and read-only; never touches private keys or executes on-chain transactions.
3. **Offensive Exploitation or Unauthorized Network Penetration**:
   - System relies exclusively on authorized public blockchain nodes, explorer APIs, and statutory registries.
4. **Arbitrary Real-Time Token Swapping or Trading**:
   - No DEX trading bots, swap aggregators, or non-forensic financial features.

---

*MVP Scope specification approved for Phase 2 review.*
