# CHAINTRACE — SUCCESS METRICS & PERFORMANCE TARGETS

**Document ID**: CT-METRICS-2026-01  
**Version**: 1.0.0  
**Date**: September 14, 2026  
**Status**: Approved for Phase 2 Review  

---

## 1. Executive Summary

This document establishes the quantitative and qualitative success criteria for the redeveloped **CHAINTRACE** platform. In accordance with the Redevelopment Rules, baseline values that cannot be verified from existing telemetry are explicitly designated as **To be measured (TBM)**. 

Target metrics are established to guarantee superior usability, forensic precision, sub-second API responsiveness, and zero data loss.

---

## 2. Usability Metrics

| Metric | Description | Current Legacy Baseline | Rebuilt Target Target | Measurement Method |
|---|---|---|---|---|
| **Primary Task Completion** | Percentage of investigators who successfully input a wallet and identify a candidate VASP. | ~60% (fails on unmatched wallets due to fake defaults or confusing UI) | **≥ 95%** | Automated analytics event tracking (`analysis_completed`). |
| **Time to Start Analysis** | Time from landing on dashboard to clicking "Trace Wallet". | To be measured | **< 15 seconds** | Timestamp difference: page mount to form submit. |
| **Time to Find Evidence** | Time required to locate the specific transaction hop connecting wallet to VASP. | > 120 seconds (manual scanning of long tables) | **< 30 seconds** | 1-Click "Highlight Attribution Path" in Cytoscape.js. |
| **Time to Generate Report** | Time from case completion to downloading court-ready Section 65B PDF. | **Infinite (Button was fake / non-functional)** | **< 5 seconds** | Real-time PDF generation latency. |
| **Navigation Success Rate** | Ratio of users reaching intended screen without backtrack errors. | To be measured (sidebar collapses/misaligns on mobile) | **≥ 92%** | Route transition analytics. |
| **Error Recovery Rate** | Percentage of users who correct an invalid address or chain error on first prompt. | To be measured | **≥ 85%** | Real-time address syntax feedback and chain auto-detect. |
| **Onboarding Completion** | Time for a first-time investigator to run their first demo analysis. | > 10 minutes | **< 3 minutes** | Interactive quick-start tutorial / preset demo buttons. |

---

## 3. Performance & System Metrics

| Metric | Description | Current Legacy Baseline | Rebuilt Target Target | Measurement Method |
|---|---|---|---|---|
| **Initial Page Load (FCP)** | First Contentful Paint on standard 4G / broadband network. | 2.4s (heavy unoptimized layout scripts) | **< 1.2 seconds** | Lighthouse / Core Web Vitals audit. |
| **Dashboard Load Time** | Time to render all dashboard KPI cards and case tables. | 1.8s | **< 800 ms** | Next.js Server Components + SSR benchmarks. |
| **API Latency (P95)** | 95th percentile response time for REST queries (`/wallets`, `/vasps`, `/attribution`). | ~650ms (Next.js route) / ~1100ms (Python Web3) | **< 250 ms** (cached) / **< 800 ms** (live RPC) | FastAPI middleware telemetry / Prometheus. |
| **Graph Render Time** | Time to layout and render 50 nodes and 100 edges. | > 1500ms (laggy SVG DOM manipulation) | **< 300 ms** | Cytoscape.js WebGL/Canvas layout benchmarks. |
| **Background Task Completion** | End-to-end execution of a 3-hop multi-chain BFS scrape. | To be measured (run in-process, often timeouts) | **< 8.0 seconds** (P90) | Celery task lifecycle timestamps (`task_time`). |
| **Frontend Error Rate** | Uncaught exceptions / React render crashes per 1,000 sessions. | To be measured | **< 0.1%** | Sentry / Browser error telemetry. |
| **Largest Contentful Paint (LCP)**| Time to render largest viewport element. | 3.1s | **< 2.0 seconds** | Google Core Web Vitals standard. |
| **Cumulative Layout Shift (CLS)** | Visual stability during async data hydration. | 0.18 (shifts when GSAP canvas mounts) | **< 0.05** | Core Web Vitals standard. |

---

## 4. Reliability & Availability Metrics

| Metric | Description | Current Legacy Baseline | Rebuilt Target Target | Measurement Method |
|---|---|---|---|---|
| **Platform Uptime** | Availability of API and web interface. | To be measured | **≥ 99.9%** (forensic service availability) | Automated uptime health checks (`/health`). |
| **API Failure Rate** | Percentage of 5xx server errors on total incoming API calls. | To be measured | **< 0.5%** | Nginx / FastAPI access logs. |
| **Background Task Failures**| Percentage of Celery tasks entering `FAILURE` state. | To be measured | **< 1.0%** (with automatic retry on RPC timeout) | Redis Celery queue monitor. |
| **Recovery Time (MTTR)** | Mean time to recover from worker / database container restart. | To be measured | **< 30 seconds** | Health check probe & Docker auto-restart. |
| **Data Integrity Incidents** | Incidents of corrupted cases or tampered audit log entries. | **High (Cases vanish on refresh in legacy app)** | **Zero (0)** | PostgreSQL transactional integrity & SHA-256 chain checks. |

---

## 5. User Satisfaction & Evidentiary Quality Metrics

| Metric | Description | Current Legacy Baseline | Rebuilt Target Target | Measurement Method |
|---|---|---|---|---|
| **Task Difficulty (SEQ)** | Single Ease Question (1–7 scale) following wallet analysis. | To be measured | **≥ 6.2 / 7.0** | Post-investigation in-app prompt. |
| **Attribution Explainability**| Percentage of investigators who can explain the score in court. | Low (legacy formula hardcoded several signals) | **≥ 90%** | Audit evaluation with LEA panel. |
| **False Positive Rate** | Instances where an unattributed wallet is incorrectly linked to a VASP. | **Unacceptable (Defaults unmatched wallets to Binance!)** | **0.0% (Strict Anti-Overclaiming Protocol)** | Automated validation suite against known unhosted wallets. |
| **Repeat Usage** | Weekly active return rate for authorized forensic officers. | To be measured | **≥ 70%** | Active investigator session tokens. |

---

*Success Metrics specification approved for Phase 2 review.*
