# CHAINTRACE — USER PERSONAS SPECIFICATION

**Document ID**: CT-UX-PERSONAS-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Auditor**: Senior UX & Forensic Intelligence Product Team  
**Status**: Completed — Phase 1 Deliverable  

---

## 1. Executive Summary

This document defines the primary user archetypes for **CHAINTRACE**. The system serves a specialized audience spanning sworn law enforcement personnel, specialized cyber-crime unit inspectors, forensic blockchain analysts, and system administrators. 

Each persona has distinct operational contexts, risk tolerances, technical proficiencies, and evidentiary requirements.

---

## 2. Persona Directory

```
+---------------------------------------------------------------------------------------+
|                                    CHAINTRACE USERS                                    |
+---------------------------+---------------------------+-------------------------------+
| First-Time Investigator   | Returning Investigator    | Experienced Analyst           |
| (Speed, Clarity, Guidance)| (Case Continuity, Dockets)| (Deep Multi-hop, Raw Evidence)|
+---------------------------+---------------------------+-------------------------------+
|                                    Administrator                                       |
|                  (System Health, RBAC, Node RPCs, Audit Trail)                         |
+---------------------------------------------------------------------------------------+
```

---

## 3. Detailed Persona Profiles

### 3.1 Persona 1: The First-Time Cyber Investigator

```
Name: Sub-Inspector Aarav Patel
Role: Investigating Officer, State Cyber Crime Police Station
Clearance: Tier 1 Operational Investigator
Experience with Crypto: Low to Moderate (understands wallets & transactions; unfamiliar with mixer mechanics)
Typical Context: Handling cyber financial fraud complaint; victim lost funds to an unknown address.
```

- **Goals**:
  1. Quickly check an unknown cryptocurrency wallet provided in a FIR / cyber complaint.
  2. Determine which exchange or VASP (e.g., CoinDCX, Binance, WazirX) received the stolen funds.
  3. Generate an immediate legal notice (CrPC Section 91 / Information Technology Act) to freeze accounts.
  4. Avoid technical errors or misidentifications that could jeopardize court proceedings.
- **Primary Tasks**:
  - Input single wallet address on dashboard.
  - View immediate candidate attribution with plain-language explanation.
  - Review how many "hops" separated the suspect wallet from the VASP.
  - Export a court-ready one-page Section 65B summary dossier.
- **Technical Comfort**:
  - Comfortable with standard web police portals; intimidated by complex raw hex logs, JSON payloads, or unguided graph visualizers.
- **Pain Points**:
  - Cryptic blockchain jargon without definitions.
  - Complex graph interfaces that require manual node rearrangement.
  - Inconclusive results that provide no recommended next step.
- **Device Preferences**:
  - Government-issued Windows 11 desktop (1080p) and field laptop (1366x768).
- **Accessibility Needs**:
  - High color contrast, clear typography (minimum 14px body), visible keyboard focus, clear step-by-step guidance.
- **Success Criteria**:
  - Time from wallet entry to identifying candidate VASP: **< 60 seconds**.
  - Time to export signed legal notice request: **< 2 minutes**.

---

### 3.2 Persona 2: The Returning Senior Investigator

```
Name: Inspector Vikramaditya Sharma
Role: Lead Forensic Investigator, Financial Intelligence Unit (FIU-IND) Liaison Cell
Clearance: Tier 2 Senior Investigator
Experience with Crypto: High (experienced with hawala layering, mule accounts, peel chains)
Typical Context: Managing 15+ concurrent cross-border money laundering investigations.
```

- **Goals**:
  1. Maintain persistent case records with chronological activity tracking.
  2. Monitor multi-chain fund movements across active investigations.
  3. Serve formal evidentiary freeze notices to compliance officers at registered VASPs.
  4. Ensure complete chain-of-custody logging for all forensic queries.
- **Primary Tasks**:
  - Open active case docket from Command Dashboard.
  - Track new transactions and hops added to the suspect cluster.
  - Cross-examine 7-signal mathematical decomposition before signing off on statutory notices.
  - Re-run attribution when new deposit sweep transactions occur.
- **Technical Comfort**:
  - High. Understands UTXO vs Account-based models, gas telemetry, smart contracts, and bridge protocols.
- **Pain Points**:
  - Having case data lost due to lack of server-side persistence.
  - Inability to tag or annotate specific nodes and edges on the fund flow graph.
  - False positives or unexplainable AI scores without underlying proof.
- **Device Preferences**:
  - Dual-monitor workstation (1440p / 4K) in a secure forensic enclave.
- **Accessibility Needs**:
  - Dark mode support for extended tactical sessions, keyboard shortcuts (Command Palette Ctrl+K).
- **Success Criteria**:
  - Seamless case resumption with zero lost notes or graph states.
  - Instant access to case audit logs proving non-repudiation in court.

---

### 3.3 Persona 3: The Experienced Forensic Blockchain Analyst

```
Name: Dr. Meera Nambiar
Role: Principal Blockchain Forensic Specialist, Directorate of Enforcement (ED)
Clearance: Tier 3 Master Analyst
Experience with Crypto: Expert (reads bytecode, understands de-anonymization heuristics, clustering)
Typical Context: Investigating large-scale syndicate operations involving DeFi bridges, mixers, and unlicensed OTCs.
```

- **Goals**:
  1. Deep multi-hop graph analysis (up to 5 hops) across Ethereum, Polygon, and Tron.
  2. Disentangle mixer interactions (Tornado Cash, Wasabi) and cross-chain bridge relays (Stargate, Hop).
  3. Validate mathematical signals (deposit match, co-spend heuristics, sweep timing) with raw tx proof.
  4. Build customized evidentiary reports with complete hash appendices.
- **Primary Tasks**:
  - Interactive graph exploration using Cytoscape.js layouts (breadth-first, dagre, concentric).
  - Expand and collapse specific wallet branches.
  - Inspect raw transaction payloads, internal contract calls, and gas price anomalies.
  - Ingest custom known VASP hot/cold wallet addresses via JSON/CSV import.
- **Technical Comfort**:
  - Expert. Comfortable with Cypher queries, Python scripts, raw RPC requests, and complex graph algorithms.
- **Pain Points**:
  - Over-simplified "black box" scores that conceal underlying data.
  - Laggy SVG graph visualizations that cannot handle >50 nodes.
  - Inability to filter transactions by asset (e.g. filter for only USDT above ₹10 Lakh).
- **Device Preferences**:
  - Ultrawide monitors (3440x1440) and high-performance multi-threaded forensic workstations.
- **Accessibility Needs**:
  - Rapid keyboard navigation, dense data mode, customizable graph physics.
- **Success Criteria**:
  - Graph loads and renders smooth 60fps interaction up to 200 nodes.
  - Full transparency into all 7 scoring weights and signal raw values.

---

### 3.4 Persona 4: The System & Security Administrator

```
Name: Rajesh Kumar
Role: Lead Infrastructure & Security Operations Engineer, National Cyber Security Agency
Clearance: Tier 4 Super Administrator
Experience with Crypto: Moderate to High (DevOps, security architecture, RPC node management)
Typical Context: Ensuring 99.9% uptime, compliance with data protection laws, and node synchronization.
```

- **Goals**:
  1. Manage user identities, roles, and cryptographic access tokens.
  2. Monitor healthy connectivity to Ethereum/Polygon RPC nodes and Neo4j/Redis clusters.
  3. Review immutable audit logs to detect any unauthorized queries or data leakages.
  4. Maintain API rate-limit protections and manage blockchain provider API keys.
- **Primary Tasks**:
  - Provision and revoke investigator accounts and role permissions (RBAC).
  - Inspect cluster latency, Celery queue depth, and background job failure rates.
  - Review tamper-evident SHA-256 audit ledger.
  - Configure blockchain node provider fallback endpoints.
- **Technical Comfort**:
  - System architect level: Linux, Docker, FastAPI, Celery, Redis, Neo4j, PostgreSQL, OAuth2/JWT.
- **Pain Points**:
  - Hardcoded API credentials or cleartext secrets.
  - Silent background task failures without alerting.
  - Non-responsive services during heavy batch analysis requests.
- **Device Preferences**:
  - Secure Linux/Windows workstation, mobile terminal for emergency alerts.
- **Accessibility Needs**:
  - Standard WCAG compliant forms, clear status alerts and health indicators.
- **Success Criteria**:
  - Zero unauthenticated API exposures.
  - Health check endpoints providing real-time telemetry on all sub-services.

---

## 4. Persona Matrix & Prioritization for MVP Rebuild

| Dimension | First-Time Investigator | Returning Investigator | Experienced Analyst | Administrator |
|---|---|---|---|---|
| **Priority in MVP** | **Must-Have (Core)** | **Must-Have (Core)** | **Should-Have** | **Must-Have (Security)** |
| **Primary Entry** | Quick Trace on Dashboard | Investigation Register | Graph Workspace | Administration Console |
| **Key Deliverable** | 1-Click Candidate VASP | Ongoing Case Notes | Multi-hop Cytoscape DAG | System Health & Audit Logs |
| **Evidentiary Need** | Plain Explanation | CrPC 91 Notice | Math Decomposition & Hashes | Non-Repudiation Signatures |
| **UI Complexity** | Minimal / High Guidance | Medium / Docket Style | High / Studio Controls | Operational / Tabular |

---

*Specification approved for Phase 1 Decision Gate review.*
