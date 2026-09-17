# CHAINTRACE — SCREEN SPECIFICATIONS & WIREFRAME MODELS

**Document ID**: CT-UX-SCREEN-SPEC-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Phase 5 Deliverable — Approved for Implementation Review  

---

## 1. Screen 1: Command Dashboard (`/dashboard`)

```
+-----------------------------------------------------------------------------------------------+
| CLASSIFICATION: TOP SECRET // LEA SENSITIVE                NODE: CLUSTER-04 [PROD] [DARK/LIGHT]|
+-----------------------------------------------------------------------------------------------+
| CHAINTRACE     | (⚡) OPERATIONAL COMMAND CENTER // VASP ATTRIBUTION DESK     [Officer Profile]|
| [Search Ctrl+K]|                                                                              |
|                | +--------------------------------------------------------------------------+ |
| Command        | | PRIMARY ACTION // AUTOMATED VASP ATTRIBUTION QUICK TRACE                 | |
| > Dashboard    | | [ Enter Suspect Wallet Address (0x... / T...) ] [Chain: AUTO v] [TRACE]  | |
|                | +--------------------------------------------------------------------------+ |
| Investigate    |                                                                              |
| - Attribution  | +------------------+ +------------------+ +------------------+ +-----------+ |
| - Fund Graph   | | ACTIVE CASES: 42 | | TRACKED: 1,849   | | FLAGGED: ₹184 Cr | | ATTRIBUTED| |
| - Wallet Intel | | (+6 this week)   | | (6 Blockchains)  | | (328 High-Risk)  | | 91.4% Conf| |
|                | +------------------+ +------------------+ +------------------+ +-----------+ |
| Case Mgmt      |                                                                              |
| - Cases (42)   | +--------------------------------------------------------------------------+ |
| - Reports      | | PRIORITY ACTIVE CASES DOCKET                      [+ New Investigation]  | |
|                | | CASE-001 | Op Hawala Nexus | High | ₹12.4 Cr | CoinDCX (96.8%) | [View] | |
| System         | | CASE-002 | Surat Gateway   | Crit | ₹8.8 Cr  | Under Analysis  | [View] | |
| - Audit Logs   | +--------------------------------------------------------------------------+ |
| - Admin        |                                                                              |
+----------------+------------------------------------------------------------------------------+
```

- **Purpose**: Central forensic command center for immediate wallet attribution and active investigation triage.
- **Target User**: Returning Investigator, First-Time Investigator.
- **Entry Point**: Direct navigation after login or root redirect.
- **Main Action**: Input wallet address and submit via "Trace Wallet" button.
- **Secondary Actions**: Click case row to view docket, launch full attribution suite, toggle theme.
- **Components**: `<CommandHeader />`, `<QuickTraceBar />`, `<KPIGrid />`, `<RecentCasesTable />`, `<TaskQueuePill />`.
- **Data**: `/api/v1/dashboard/stats`, `/api/v1/investigations/recent`, `/api/v1/tasks/active`.
- **Loading State**: Subtle card skeleton loaders matching exact dimensions.
- **Empty State**: Friendly illustration: *"No active cases registered. Paste an address above to initiate your first trace."*
- **Error State**: Non-blocking toast alert if analytics stats fail to load; quick trace bar remains fully operational.
- **Mobile Behavior**: Stack cards in single column; quick trace input becomes full width; cases table renders horizontal scroll.
- **Accessibility**: Visible focus rings on all table rows and buttons; input explicitly labelled with `aria-label="Cryptocurrency wallet address"`.
- **Success Criteria**: User can initiate a trace within **15 seconds** of landing.

---

## 2. Screen 2: VASP Attribution Engine (`/vasp-attribution`)

```
+-----------------------------------------------------------------------------------------------+
| ATTRIBUTION SUITE // TARGET: 0x7A91bC84D2697e88b209eB0eAc821639d4A44F82 [ETH] [ATTRIBUTED]   |
+-----------------------------------------------------------------------------------------------+
| +----------------------------------------------+ +------------------------------------------+ |
| | PRIMARY CANDIDATE VASP (STRONG CANDIDATE)    | | 7-SIGNAL MATHEMATICAL RADAR DECOMPOSITION| |
| | Entity: CoinDCX (Neblio Technologies Pvt Ltd)| | - Proximity & Hop Distance:       90.0%  | |
| | FIU-IND Reg: FIU-IND/2023/VASP-0021          | | - Deposit Address Correlation:    95.0%  | |
| | Nearest Path: 2 Hops (Indirect Transit)      | | - Wallet Cluster Association:     92.0%  | |
| | Overall Confidence: 88.4% (Strong Candidate) | | - Statutory Registry Status:     100.0%  | |
| |                                              | | - Cross-Chain Relay Continuity:   85.0%  | |
| | [Attach to Case Docket] [View Full Evidence] | | - Behavioral Sweep Timing:        78.0%  | |
| |                                              | | - Historical Inquiry Record:      70.0%  | |
| +----------------------------------------------+ +------------------------------------------+ |
|                                                                                               |
| STATUTORY DISCLAIMER: Scores represent investigative attribution confidence, not ownership.  |
|                                                                                               |
| [ OVERVIEW ] [ SIGNAL DECOMPOSITION ] [ CANDIDATE COMPARISON ] [ EVIDENTIARY FACTS ]         |
| +-------------------------------------------------------------------------------------------+ |
| | EVIDENTIARY PROVENANCE & OBSERVED BLOCKCHAIN FACTS                                        | |
| | [Fact 1] Target 0x7A91... transferred 12.45 ETH in tx 0x9f18... to intermediary 0x71C8... | |
| | [Fact 2] Intermediary 0x71C8... deposited 150,000 USDT to verified CoinDCX custody sweep. | |
| | [Legal Basis] PMLA 2002 Section 12 Statutory Custody Record                               | |
| +-------------------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------------------+
```

- **Purpose**: Transparent, mathematically explainable attribution of unknown addresses to registered VASPs.
- **Target User**: Experienced Analyst, Returning Investigator.
- **Entry Point**: Redirect from Quick Trace bar or navigation menu.
- **Main Action**: Inspect candidate VASP confidence score and mathematical radar breakdown.
- **Secondary Actions**: Click "Attach to Docket", switch to "Candidate Comparison" tab, inspect raw signal weights.
- **Components**: `<CandidateCard />`, `<RadarChart />`, `<SignalWeightBars />`, `<EvidenceProvenanceList />`, `<LegalDisclaimerBanner />`.
- **Data**: `POST /api/v1/attribution/evaluate`.
- **Loading State**: Step-by-step pipeline progress indicator showing active processing stage.
- **Empty / Unattributed State**: Explicit `NO_RELIABLE_ATTRIBUTION` card with recommendations: *"No candidate VASP detected within 3 hops. Target appears to interact solely with unhosted private wallets."* Zero default to Binance.
- **Error State**: Inline retry button if RPC times out.
- **Mobile Behavior**: Tabs scroll horizontally; radar chart collapses to vertical bar list for clean touch viewing.
- **Accessibility**: All signal values rendered in accessible text alongside visual charts; radar canvas accompanied by screen-reader `<table>`.
- **Success Criteria**: Complete explainability delivered to user in under 60 seconds.

---

## 3. Screen 3: Interactive Cytoscape.js Fund Flow Workspace (`/fund-flow-graph`)

```
+-----------------------------------------------------------------------------------------------+
| FUND FLOW TOPOLOGY WORKSPACE // CYTOSCAPE.JS ENGINE                        [Reset Zoom] [100%]|
+-----------------------------------------------------------------------------------------------+
| Controls: [Layout: Dagre v] [Filter Asset: USDT v] [Hops: 3 v] [⭐ Highlight Attribution Path]|
+-----------------------------------------------------------------------------------------------+
| +----------------------------------------------------------------+ +------------------------+ |
| |                                                                | | NODE INSPECTOR DRAWER  | |
| |   (O) Suspect Seed Node                                        | | Type: VASP Custody     | |
| |        \                                                       | | Address: 0xa090...57e  | |
| |         \ [tx: 12.45 ETH]                                      | | Entity: CoinDCX        | |
| |          v                                                     | | FIU: Registered        | |
| |         (O) Intermediary Mule Node                             | | Inflow: 150,000 USDT   | |
| |              \                                                 | | Hop Distance: 2 Hops   | |
| |               \ [tx: 150,000 USDT]                             | |                        | |
| |                v                                               | | [Filter Connected Txs] | |
| |               [⭐ Nearest VASP Endpoint: CoinDCX]              | | [Copy Full Address]    | |
| |                                                                | | [Open Explorer]        | |
| +----------------------------------------------------------------+ +------------------------+ |
| Nodes: 18 | Edges: 24 | Max Depth: 2 Hops | Render Time: 142ms | Layout: Hierarchical Dagre   |
+-----------------------------------------------------------------------------------------------+
```

- **Purpose**: High-performance interactive visual exploration of multi-hop transaction flows and clustering.
- **Target User**: Experienced Forensic Analyst.
- **Entry Point**: Sidebar link or "View in Graph" button on attribution card.
- **Main Action**: Pan, zoom, select nodes/edges, and click "Highlight Attribution Path".
- **Secondary Actions**: Change layout (Dagre, Breadthfirst, CoSE), filter edges by asset (USDT, ETH), export graph PNG/JSON.
- **Components**: `<CytoscapeCanvas />`, `<GraphFloatingToolbar />`, `<NodeDetailsDrawer />`, `<Minimap />`, `<MobileTableViewFallback />`.
- **Data**: `POST /api/v1/graph/traverse`.
- **Loading State**: Centered spinner over dimmed canvas with progress message: *"Constructing topological DAG..."*
- **Empty State**: *"No transaction flows found for this address within specified parameters."*
- **Mobile Behavior**: Displays a toggle between **Touch Canvas** (pinch-to-zoom enabled) and **Mobile Table View** (sequential list of hops and transactions for smaller screens).
- **Accessibility**: Full keyboard navigation support (Tab moves between nodes, Enter opens inspector drawer); text alternatives for all graph connections.
- **Success Criteria**: 60fps interaction rendering up to 200 nodes without browser stutter.

---

## 4. Screen 4: Evidentiary Reports Suite (`/reports`)

```
+-----------------------------------------------------------------------------------------------+
| COURT-ADMISSIBLE FORENSIC REPORTS SUITE // SEC-65B EVIDENCE ACT & PMLA DOSSIERS               |
+-----------------------------------------------------------------------------------------------+
| Configuration:                                                                                |
| Select Case: [ CASE-2026-001 — Op Hawala Nexus v ]  Template: [ Section 65B Certificate v ]   |
| Adjudicating Authority: [ Special Cyber & PMLA Court, New Delhi                              ] |
| Certifying Officer:     [ Insp. Vikramaditya Sharma ]  Badge: [ DEL-CYBER-8842 ]              |
+-----------------------------------------------------------------------------------------------+
| +-------------------------------------------------------------------------------------------+ |
| | DOCUMENT PREVIEW // SECTION 65B INDIAN EVIDENCE ACT ELECTRONIC CERTIFICATE                | |
| | ----------------------------------------------------------------------------------------- | |
| | 1. Case Docket Reference:   CASE-2026-001 (FIR 88/2026 PS Cyber Crime, New Delhi)         | |
| | 2. Target Subject Wallet:   0x7A91bC84D2697e88b209eB0eAc821639d4A44F82                    | |
| | 3. Attributed Candidate:    CoinDCX (Neblio Technologies Pvt Ltd) [FIU-IND/2023/VASP-0021] | |
| | 4. Evidentiary Trail:       Direct 2-Hop Ingestion Sweep via Intermediary 0x71C8...        | |
| | 5. Cryptographic Checksum:  SHA-256: 9b18a42c7e019b...                                    | |
| +-------------------------------------------------------------------------------------------+ |
|                                                                                               |
| [ ⬇️ DOWNLOAD SIGNED EVIDENTIARY PDF (SEC-65B) ]   [ ⬇️ EXPORT JSON FORENSIC ARCHIVE ]       |
+-----------------------------------------------------------------------------------------------+
```

- **Purpose**: Generate and download authenticated Section 65B Electronic Certificates and complete forensic dossiers.
- **Target User**: First-Time Investigator, Returning Investigator.
- **Entry Point**: Sidebar link or "Generate Report" action from case docket.
- **Main Action**: Click "Download Signed Evidentiary PDF".
- **Secondary Actions**: Change report template (Sec 65B, PMLA Memo, STR Summary), export JSON archive.
- **Components**: `<ReportConfigBar />`, `<DocumentLivePreview />`, `<DownloadButton />`, `<ChecksumSeal />`.
- **Data**: `POST /api/v1/reports/generate`, `GET /api/v1/reports/{id}/download`.
- **Loading State**: Button displays spinner: *"Compiling Certified PDF..."* with progress bar.
- **Empty State**: *"Select an active case docket to compile report preview."*
- **Error State**: Toast notice if server generation fails, with immediate error details.
- **Mobile Behavior**: Preview collapses to structured list; download button stays sticky at bottom of viewport.
- **Accessibility**: High contrast preview document; PDF adheres to PDF/UA accessible standards.
- **Success Criteria**: Valid, cryptographically sealed PDF downloaded in under **5 seconds** (replaces the fake `setTimeout` button).

---

*Screen specifications approved for Phase 5 design gate review.*
