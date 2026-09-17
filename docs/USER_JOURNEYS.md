# CHAINTRACE — USER JOURNEY MAPS & WORKFLOW SPECIFICATION

**Document ID**: CT-UX-JOURNEYS-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Auditor**: Senior UX & Forensic Intelligence Product Team  
**Status**: Completed — Phase 1 Deliverable  

---

## 1. Executive Summary

This document maps all operational user flows across **CHAINTRACE**. It details the primary investigative workflow, edge cases (failures, empty states, authorization errors), and secondary workflows (returning users, report generation, mobile usage), highlighting existing friction points and target redeveloped experiences.

---

## 2. Master Journey: The Core Investigative Flow

```
[1. Landing / Entry]
        │
        ▼
   [2. Secure Login]
        │ (JWT Auth + Session Guard)
        ▼
[3. Command Dashboard] ───► Quick Trace Bar: Enter Address & Chain
        │
        ▼
[4. Analysis Queue / Celery Background Processing]
        │ (Real-time progress updates: Validating -> Indexing -> Graph -> Scoring)
        ▼
[5. Interactive Cytoscape.js Graph Workspace]
        │ (Multi-hop fund flows, zoom/pan, layout selector, inspect nodes/edges)
        ▼
[6. Explainable VASP Attribution Engine]
        │ (Candidate ranking, 7-signal mathematical decomposition, confidence bands)
        ▼
[7. Evidentiary Review & Case Association]
        │ (Observed facts vs inferences, attach to new or existing investigation)
        ▼
[8. Structured Report Generation]
        │ (Section 65B Certificate, court-admissible PDF/JSON download)
        ▼
   [9. Audit Record] (Tamper-evident SHA-256 hash written to immutable ledger)
```

### Granular Step-by-Step Breakdown

| Stage | User Action | System Response | Existing Friction | Redevelopment Solution |
|---|---|---|---|---|
| **1. Landing** | Visits root URL `/` | Displays platform overview and security banner. | Inconsistent branding; direct access without auth. | Clean landing page with secure redirect to `/login` if unauthenticated. |
| **2. Login** | Enters badge ID, agency, credentials | Validates credentials and establishes session. | Mock `localStorage` session; no real password validation. | Secure OAuth2/JWT session with secure HTTP-only cookies and RBAC verification. |
| **3. Dashboard** | Inputs suspect wallet address on quick bar | Validates address syntax (EVM/Tron/BTC) and initiates trace. | Cluttered layout; hardcoded demo values; currency glyphs corrupted. | Streamlined quick trace card with instant address syntax feedback and recent case shortcuts. |
| **4. Processing** | Clicks "Analyze Wallet" | Queues background Celery task; displays progress stepper. | Client-side fake `setInterval` (180ms); no real background task tracking. | Real asynchronous task ID polling (`/api/v1/tasks/{id}`) with stage completion telemetry. |
| **5. Graph Exploration** | Explores transaction path to exchange | Renders multi-hop fund flow graph with node labels. | Static SVG canvas; cannot drag/drop; no multi-hop expansion; laggy. | Cytoscape.js interactive graph with breadthfirst/dagre layouts, node grouping, and asset filters. |
| **6. Attribution** | Inspects candidate VASP card | Shows candidate VASP, confidence score, and 7-signal breakdown. | Unmatched addresses falsely defaulted to Binance; monolithic page. | Anti-overclaiming protocol: explicit `UNKNOWN` state when unverified; modular radar and weight cards. |
| **7. Evidence Review** | Reads evidentiary provenance items | Segregates observed blockchain facts from mathematical inferences. | Buried inside complex tabs; no direct case link. | Clear evidentiary side-drawer with factual provenance citations and PMLA/CrPC legal basis. |
| **8. Report Export** | Clicks "Export Official Dossier" | Generates court-admissible PDF & JSON bundle. | **Fake button with 1.2s timeout; nothing downloaded!** | Real server-side PDF generator (Section 65B electronic certificate and executive summary). |
| **9. Audit Record** | Completes investigation session | Logs action with officer ID, query hash, and timestamp. | Audit logs recorded in volatile memory. | PostgreSQL append-only audit log with SHA-256 tamper-evident hash chaining. |

---

## 3. Secondary & Edge Case Journeys

### 3.1 The Returning User Journey
- **User Goal**: Resume work on Case `CASE-2026-004` after receiving an off-ramp update.
- **Workflow**:
  1. Log in with credentials → Redirected straight to Command Dashboard.
  2. Dashboard displays "Active Investigations" widget with `CASE-2026-004` pinned at the top.
  3. User clicks on case title → Navigates to `/investigations/CASE-2026-004`.
  4. Case detail page displays complete historical timeline, attached wallets, subpoena status, and prior attribution graphs.
  5. User clicks "Re-evaluate Attribution" → System checks for newly confirmed transactions and updates confidence score without duplicating case records.
- **Existing Friction**: Cases created in `src/app/investigations/page.tsx` vanish upon browser refresh because they are stored only in React memory!

---

### 3.2 The Failed Analysis Journey
- **User Goal**: Analyze a newly created wallet address on Tron that has zero transactions or where RPC times out.
- **Workflow**:
  1. User inputs `TN3W4H6rKdeLCdmzNFn3...` on Tron network.
  2. Background worker attempts RPC query to TronGrid node.
  3. Provider returns `TIMEOUT` or `429_RATE_LIMITED`.
  4. UI transitions gracefully from `PROCESSING` state to `DEGRADED_PROVIDER` warning banner.
  5. System informs the user: *"TronGrid telemetry timed out. Cached transaction graph not available. Would you like to switch to Secondary RPC or run in Simulated Demo Mode?"*
  6. User clicks "Retry with Secondary RPC" or "Switch to Demo Mode".
- **Existing Friction**: Currently throws an unstyled red error banner or silently hangs without actionable retry options.

---

### 3.3 The Empty Data / Unattributed Wallet Journey (Anti-Overclaiming)
- **User Goal**: Analyze an arbitrary personal wallet address (`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`) with no VASP association.
- **Workflow**:
  1. User inputs wallet and initiates attribution analysis.
  2. Multi-hop traversal expands up to 3 hops.
  3. None of the connected nodes match known VASP deposit addresses, hot wallets, or registered clusters.
  4. System returns status: `NO_RELIABLE_ATTRIBUTION` / `INSUFFICIENT_EVIDENCE` (Confidence: 0.0%).
  5. UI displays an informational badge: *"No candidate Virtual Asset Service Provider detected within 3 hops. Target appears to interact solely with unhosted private wallets and decentralized protocols."*
  6. UI presents options: "Expand to 4 Hops (Deep Trace)", "Monitor Address for Future Sweeps", or "Log Unattributed Dossier".
- **Existing Critical Bug**: In current `backend/app/api/routes/attribution.py`, any unmatched wallet is automatically attributed to **Binance Services Holdings Ltd**! This is a dangerous defect that would mislead investigators in court.

---

### 3.4 The Permission-Denied Journey (RBAC)
- **User Goal**: A Tier 1 Field Investigator attempts to access `/administration` or delete case evidence.
- **Workflow**:
  1. User navigates directly or clicks on a restricted route link.
  2. Next.js middleware and FastAPI API dependency verify user token payload (`role: "investigator"`).
  3. Access is denied; user is presented with a clear 403 Forbidden screen: *"Access Denied: Node Administration requires Tier 4 Administrator clearance. Your badge DEL-CYBER-8842 has been logged."*
  4. An audit event `UNAUTHORIZED_ACCESS_ATTEMPT` is recorded with officer badge and IP.
  5. User is provided with a "Return to Command Dashboard" CTA button.
- **Existing Friction**: Currently all routes are completely unprotected; any user can access `/administration` and toggle node settings.

---

### 3.5 The Structured Report Generation Journey
- **User Goal**: Export a certified forensic report for presentation to a magistrate or bank compliance officer.
- **Workflow**:
  1. User navigates to `/reports` or clicks "Generate Report" from the investigation dossier.
  2. Selects document type:
     - *Type A*: Section 65B Electronic Certificate (Evidence Act compliant).
     - *Type B*: VASP Attribution & Forensic Intelligence Dossier.
     - *Type C*: CrPC 91 Production Notice Request Memo.
  3. Previews document metadata (officer badge, target hash, VASP entity legal name, statutory FIU registration number, mathematical confidence band).
  4. Clicks "Download Signed PDF" or "Export JSON Evidence Archive".
  5. Real-time generation streams the binary PDF to the browser with standard download dialog.
  6. File includes a cryptographic QR code and SHA-256 verification seal.
- **Existing Friction**: Currently a non-functional placeholder (`setTimeout` that toggles a message without generating any file).

---

### 3.6 The Mobile & Tablet Journey
- **User Goal**: An investigator in the field uses an iPad or mobile smartphone to check an urgent wallet address during a raid or witness examination.
- **Workflow**:
  1. Opens platform URL on mobile browser.
  2. Top header shows hamburger navigation menu button.
  3. Dashboard renders in a single-column, touch-optimized card layout.
  4. User taps "Quick Trace", pastes wallet address from clipboard, and selects chain.
  5. Attribution results card shows prominent primary candidate VASP, FIU registration badge, and 1-tap "Call VASP Nodal Officer" / "View Legal Notice".
  6. Cytoscape graph offers a simplified mobile list view or touch-pan mode with zoom controls.
- **Existing Friction**: The sidebar is fixed at 256px (`w-64`) without responsive collapsing; main content has `pl-64` margin, causing severe clipping and horizontal scrolling on mobile.

---

## 4. Friction Points & UX Redesign Priorities

```
+------------------------------------+----------------------------------------+---------------------------------------+
| Friction Point                     | Impact on Investigator                 | Proposed Redesign                     |
+------------------------------------+----------------------------------------+---------------------------------------+
| 1. Disappearing Cases on Reload    | Severe data loss; loss of trust.       | PostgreSQL backend persistence.       |
| 2. Fake Report Download Button     | Blocks official police dispatch.       | Server-side PDF & JSON export.        |
| 3. False Default to Binance        | Contaminates evidence / legal hazard.  | Strict anti-overclaiming protocol.    |
| 4. Static SVG Graph                | Poor navigation on multi-hop flows.    | Cytoscape.js interactive canvas.      |
| 5. Broken Mobile Layout            | Inoperable during field operations.    | Responsive drawer & mobile-first CSS. |
| 6. Unprotected Routes              | Security vulnerability; compliance fail| JWT + HTTP-only cookies + RBAC.       |
+------------------------------------+----------------------------------------+---------------------------------------+
```

---

*User Journey Specification approved for Phase 1 Decision Gate review.*
