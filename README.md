# CHAINTRACE: Automated Cryptocurrency Intelligence & VASP Attribution Platform

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](/)
[![Tests Frontend](https://img.shields.io/badge/Tests_Frontend-64%2F64_Passing-brightgreen)](/)
[![Tests Backend](https://img.shields.io/badge/Tests_Backend-14%2F14_Passing-brightgreen)](/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-blue)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)](https://fastapi.tiangolo.com/)
[![Evidence Act](https://img.shields.io/badge/Evidence_Act-Sec_65B_Compliant-gold)](/)

> **Smart India Hackathon (SIH 2026)** — High-performance forensic cryptocurrency intelligence and VASP attribution platform engineered for Indian Law Enforcement Agencies (LEAs), the Enforcement Directorate (ED), and the Financial Intelligence Unit (FIU-IND).

---

## The Problem
Illicit actors rapidly layer cryptocurrency through mule networks, peel chains, and decentralized mixers to obfuscate origin before cashing out at Virtual Asset Service Providers (VASPs). Existing tools rely on black-box heuristics or guess unattributed nodes, generating inadmissible evidence that fails judicial scrutiny under the Indian Evidence Act.

## What Makes CHAINTRACE Different

1. **Explainable 7-Signal Attribution Engine**: Transparent, mathematically weighted scoring combining Hop Proximity (24%), Deposit Signatures (22%), Cluster Correlation (18%), Regulatory Directory Status (15%), Cross-Chain Relays (10%), Behavioral Profile (7%), and Historical Intel (4%).
2. **Strict Anti-Overclaiming Protocol**: Zero-guessing policy. Unattributed wallets return explicit `NO_RELIABLE_ATTRIBUTION` / `INSUFFICIENT_EVIDENCE` (< 30% score), preventing speculative overclaiming in court.
3. **Section 65B Digital Evidence Dossier**: One-click generation of court-admissible PDF certificates with embedded SHA-256 chain-of-custody seals and statutory 4-tier evidentiary categorizations.
4. **Interactive Multi-Hop Fund Flow Studio**: Directed Cytoscape.js topological visualization with instant attribution path highlighting and node dossiers.
5. **Dual-Mode Resilient Architecture**: Seamless switching between live blockchain indexing (EVM, TRON) and offline zero-network demo simulation.

---

## Quick Start (Two Commands)

```bash
# 1. Start Backend API Gateway (FastAPI on :8000)
cd backend && python -m uvicorn app.main:app --port 8000

# 2. Start Frontend Web Dashboard (Next.js on :3000)
npm run dev
```

- **Web Dashboard**: [http://localhost:3000](http://localhost:3000) (Demo Officer: `ADMIN-LEA-001` / `AdminRoot2026!`)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Production Docker**: `docker compose up --build`

---

## Automated SIH 2026 Demo Walkthrough

```bash
python scripts/demo_walkthrough.py
```
Executes the automated 6-step jury inspection: health checks, officer auth, graph traversal, 7-signal explainable attribution, anti-overclaiming refusal test, and Section 65B PDF generation.

---

## Verification & Test Status

| Suite | Scope | Status |
|:---|:---|:---|
| **Frontend Unit & Integration** | `npm test` | **64 / 64 Passed (100%)** |
| **Backend Pytest Suite** | `npm run test:backend` | **14 / 14 Passed (100%)** |
| **TypeScript Typecheck** | `npx tsc --noEmit` | **0 Errors (Clean)** |

*Detailed architectural specifications, database schemas, and API documentation are maintained in [`docs/`](./docs).*
