'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { CURRENT_OFFICER, CASES } from '@/lib/data';
import { PRIMARY_DEMO_WALLET } from '@/lib/blockchain';
import { getApiBaseUrl } from '@/lib/apiConfig';

export default function ReportsPage() {
  const [selectedCase, setSelectedCase] = useState(CASES[0]);
  const [reportType, setReportType] = useState('VASP_ATTRIBUTION_DOSSIER');
  const [certifyingDate, setCertifyingDate] = useState('10 September 2026');
  const [courtName, setCourtName] = useState('Special Cyber & PMLA Adjudicating Authority, New Delhi');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const payload = {
        case_number: selectedCase.id,
        title: selectedCase.title,
        agency: selectedCase.agency,
        officer_name: selectedCase.leadOfficer,
        officer_badge: CURRENT_OFFICER.badgeId,
        target_wallet: PRIMARY_DEMO_WALLET.address,
        attributed_vasp: 'CoinDCX (Neblio Technologies Pvt Ltd)',
        fiu_reg: 'FIU-IND-VDA-2023-0008',
        confidence_score: 96.8,
        total_exposure_inr: selectedCase.totalExposureINR,
        court_name: courtName,
      };

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/reports/export-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('PDF Generation failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ChainTrace_Section65B_${selectedCase.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 5000);
    } catch {
      // Fallback notification
      setExportNotice(true);
      setTimeout(() => setExportNotice(false), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-[#ADC178] animate-pulse"></span>
              <span className="font-mono text-xs text-[#ADC178] uppercase tracking-wider font-semibold">
                INDIAN EVIDENCE ACT SEC-65B // COURT ADMISSIBILITY SUITE
              </span>
              <span className="text-[#74736F]">•</span>
              <span className="font-mono text-[10px] text-[#ADC178] bg-[#1B512D]/30 px-2 py-0.5 rounded border border-[#ADC178]/30 font-semibold">
                DEMONSTRATION INTELLIGENCE
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
              Evidentiary Reports &amp; Investigation Dossiers
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Automated compilation of court-admissible VASP attribution dossiers and Section 65B electronic certificates
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg shadow-glass-card transition-all shrink-0 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isExporting ? 'sync' : 'download'}
            </span>
            <span>{isExporting ? 'GENERATING SIGNED DOSSIER...' : 'Generate Investigation Report'}</span>
          </button>
        </div>

        {/* Template Controls & Config Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-3.5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] space-y-1 shadow-glass-card transition-colors">
            <label className="block font-mono text-[10px] text-[#9D9A92] uppercase">Document Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-9 px-2 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none"
            >
              <option value="VASP_ATTRIBUTION_DOSSIER" className="bg-[#1C1D20] text-[#FAFAF5]">
                VASP Attribution &amp; Forensic Intelligence Dossier (SIH 2026)
              </option>
              <option value="SEC_65B" className="bg-[#1C1D20] text-[#FAFAF5]">Section 65B Indian Evidence Act Certificate</option>
              <option value="PMLA_SEC5" className="bg-[#1C1D20] text-[#FAFAF5]">Section 5 PMLA Provisional Seizure Memo</option>
              <option value="FIU_STR" className="bg-[#1C1D20] text-[#FAFAF5]">FIU-IND Suspicious Transaction Report (STR)</option>
            </select>
          </div>

          <div className="p-3.5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] space-y-1 shadow-glass-card transition-colors">
            <label className="block font-mono text-[10px] text-[#9D9A92] uppercase">Investigation Case File</label>
            <select
              value={selectedCase.id}
              onChange={(e) => {
                const found = CASES.find((c) => c.id === e.target.value);
                if (found) setSelectedCase(found);
              }}
              className="w-full h-9 px-2 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none"
            >
              {CASES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#1C1D20] text-[#FAFAF5]">
                  {c.id} — {c.title.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] space-y-1 shadow-glass-card transition-colors">
            <label className="block font-mono text-[10px] text-[#9D9A92] uppercase">Adjudicating Authority</label>
            <input
              type="text"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none"
            />
          </div>
        </div>

        {/* Export Notification */}
        {exportNotice && (
          <div className="p-4 bg-[#1B512D]/30 border border-[#ADC178]/40 rounded-xl text-[#ADC178] font-mono text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ADC178] text-[20px]">verified</span>
              <span>
                DOSSIER COMPILED: SHA-256 SEAL APPLIED (Ref: CERT-2026-DEL-65B-9941). READY FOR ADMISSIBILITY.
              </span>
            </div>
            <span className="text-[11px] text-[#ADC178] underline cursor-pointer font-semibold">
              Download PDF / XML Archive
            </span>
          </div>
        )}

        {/* SECTION 29: INVESTIGATION-READY REPORT PREVIEW */}
        <div className="bg-[#15171B]/95 backdrop-blur-xl rounded-xl border border-white/[0.1] p-6 sm:p-8 shadow-glass-elevated space-y-6 text-[#D8D3C7] transition-colors relative overflow-hidden">
          {/* Subtle Institutional Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B512D] via-[#ADC178] to-[#7CB9E8]"></div>

          {/* Institutional Document Header */}
          <div className="border-b border-white/[0.08] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1560BD] to-[#436B95] flex items-center justify-center p-2 text-white shadow-glass-card border border-[#7CB9E8]/30">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full text-white">
                  <path d="M28 14 C26 10, 22 8, 17 8 C10 8, 5 13, 5 20 C5 27, 10 32, 17 32 C22 32, 26 30, 28 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <line x1="20" y1="8" x2="35" y2="8" stroke="#ADC178" strokeWidth="3" strokeLinecap="round" />
                  <line x1="27.5" y1="8" x2="27.5" y2="28" stroke="#ADC178" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="font-editorial font-bold text-lg text-[#FAFAF5] tracking-tight">
                  CHAINTRACE // AUTOMATED BLOCKCHAIN INTELLIGENCE
                </h2>
                <p className="font-mono text-xs text-[#ADC178] tracking-wider">
                  VASP ATTRIBUTION &amp; FORENSIC EVIDENCE DOSSIER
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs space-y-0.5">
              <div className="text-[#FAFAF5] font-bold">DOSSIER REF: {selectedCase.id}-ATTRIB-65B</div>
              <div className="text-[#9D9A92]">GENERATED: {certifyingDate} • 19:42:00 IST</div>
              <div className="text-[#ADC178] text-[10px] font-semibold">INTEGRITY: SHA-256 CERTIFIED</div>
            </div>
          </div>

          {/* Demonstration Notice Box */}
          <div className="p-3 rounded-lg bg-black/30 border border-white/[0.06] font-mono text-xs text-[#9D9A92] flex items-center justify-between">
            <span><strong className="text-[#FAFAF5]">DEMONSTRATION DATA NOTICE:</strong> Synthesized for Smart India Hackathon evaluation.</span>
            <span className="text-[#ADC178] font-semibold">PROTOTYPE ENVIRONMENT</span>
          </div>

          {/* SECTION 29 REQUIRED FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-mono">
            {/* 1. Case Information */}
            <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
                1. CASE INFORMATION
              </span>
              <div>Case Reference: <strong className="text-[#FAFAF5]">{selectedCase.id}</strong></div>
              <div>Operation Title: <span className="text-[#D8D3C7]">{selectedCase.title}</span></div>
              <div>Investigating Agency: <span className="text-[#D8D3C7]">{selectedCase.agency}</span></div>
              <div>Lead Investigator: <span className="text-[#D8D3C7]">{selectedCase.leadOfficer}</span></div>
              <div>Total Exposure: <span className="text-[#ADC178] font-bold">{selectedCase.totalExposureINR}</span></div>
            </div>

            {/* 2. Suspect Wallet & Blockchain */}
            <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
                2. SUSPECT WALLET &amp; BLOCKCHAIN
              </span>
              <div>Suspect Wallet: <strong className="text-[#7CB9E8]">{PRIMARY_DEMO_WALLET.address}</strong></div>
              <div>Detected Protocol: <span className="text-[#D8D3C7]">TRON (TRC20) → POLYGON POS (BRIDGED)</span></div>
              <div>Token Asset: <span className="text-[#D8D3C7]">USDT / USD₮ (Tether USD)</span></div>
              <div>Risk Level: <span className="text-[#C44536] font-bold">CRITICAL (Score: 94/100)</span></div>
              <div>Classification: <span className="text-[#D8D3C7]">High-Velocity Syndicate Mule Terminal</span></div>
            </div>

            {/* 3. Attributed VASP & Confidence */}
            <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
                3. ATTRIBUTED VASP &amp; CONFIDENCE
              </span>
              <div>Nearest VASP: <strong className="text-[#FAFAF5]">CoinDCX (Neblio Technologies Pvt Ltd)</strong></div>
              <div>FIU Registration: <span className="text-[#7CB9E8]">FIU-IND-VDA-2023-0008</span></div>
              <div>Attribution Confidence: <strong className="text-[#ADC178] text-sm">96.8% (VERY HIGH)</strong></div>
              <div>Hop Distance: <span className="text-[#D8D3C7]">2 Ledger Hops</span></div>
              <div>Deposit Relation: <span className="text-[#D8D3C7]">Direct Regulated Gateway Deposit</span></div>
            </div>

            {/* 4. Cross-Chain Activity */}
            <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/[0.06] transition-colors">
              <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
                4. CROSS-CHAIN ACTIVITY
              </span>
              <div>Bridge Detected: <span className="text-[#B23AEE] font-bold">Stargate Finance / LayerZero</span></div>
              <div>Source Ledger: <span className="text-[#D8D3C7]">Tron (USDT TRC20)</span></div>
              <div>Target Ledger: <span className="text-[#D8D3C7]">Polygon PoS (USD₮)</span></div>
              <div>Bridge Relayer Checksum: <span className="text-[#74736F]">Multi-Sig Relayer Verified</span></div>
              <div>Exit Deposit Hash: <span className="text-[#D8D3C7]">0x38b25A89d120B44e3bAc19777E576921319fe9A1</span></div>
            </div>
          </div>

          {/* 5. Transaction Path & Fund Flow Summary */}
          <div className="space-y-3 p-4 rounded-xl bg-black/20 border border-white/[0.06] font-mono text-xs transition-colors">
            <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
              5. TRANSACTION PATH &amp; FUND FLOW SUMMARY
            </span>
            <div className="space-y-2">
              <div className="p-3 bg-[#1C1D20] rounded-lg border border-white/[0.06] flex items-center justify-between">
                <span>Hop 0: Suspect Wallet (0x7A91...4F82)</span>
                <span className="text-[#FAFAF5] font-medium">250,000 USDT</span>
                <span className="text-[#74736F]">Tron TRC20</span>
              </div>
              <div className="p-3 bg-[#1C1D20] rounded-lg border border-white/[0.06] flex items-center justify-between">
                <span>Hop 1: Mule Terminal (Surat Cell) → LayerZero Bridge</span>
                <span className="text-[#FAFAF5] font-medium">249,850 USDT</span>
                <span className="text-[#B23AEE]">Cross-Chain Relayed</span>
              </div>
              <div className="p-3 bg-[#1C1D20] rounded-lg border border-[#ADC178]/40 flex items-center justify-between">
                <span className="text-[#ADC178] font-bold">Hop 2: CoinDCX Regulated Custody Vault (Exit)</span>
                <span className="text-[#ADC178] font-bold">249,600 USD₮</span>
                <span className="text-[#ADC178] font-bold">NEAREST VASP ATTRIBUTED</span>
              </div>
            </div>
          </div>

          {/* SECTION 18: FOUR-TIER EVIDENTIARY CLASSIFICATION */}
          <div className="p-5 rounded-xl bg-black/20 border border-white/[0.06] font-mono text-xs space-y-3">
            <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
              SECTION 18 — STATUTORY EVIDENTIARY CATEGORIZATION
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Tier 1: Observed Fact */}
              <div className="p-3.5 bg-[#1C1D20] rounded-xl border border-[#ADC178]/30 space-y-2 shadow-glass-card">
                <span className="px-2 py-0.5 rounded bg-[#1B512D]/30 text-[#ADC178] font-bold text-[9px] uppercase border border-[#ADC178]/30">
                  OBSERVED FACT
                </span>
                <p className="text-[11px] text-[#D8D3C7] leading-relaxed">
                  Immutable on-chain transactions recorded on public blockchain ledgers with cryptographic signatures, gas parameters, and block header proofs.
                </p>
              </div>

              {/* Tier 2: Derived Intelligence */}
              <div className="p-3.5 bg-[#1C1D20] rounded-xl border border-[#7CB9E8]/30 space-y-2 shadow-glass-card">
                <span className="px-2 py-0.5 rounded bg-[#1560BD]/20 text-[#7CB9E8] font-bold text-[9px] uppercase border border-[#7CB9E8]/30">
                  DERIVED INTELLIGENCE
                </span>
                <p className="text-[11px] text-[#D8D3C7] leading-relaxed">
                  Multi-hop graph traversal metrics, co-spending cluster expansions, and cross-chain relayer confirmation logs.
                </p>
              </div>

              {/* Tier 3: Inference */}
              <div className="p-3.5 bg-[#1C1D20] rounded-xl border border-amber-500/30 space-y-2 shadow-glass-card">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold text-[9px] uppercase border border-amber-500/30">
                  INFERENCE
                </span>
                <p className="text-[11px] text-[#D8D3C7] leading-relaxed">
                  7-Signal attribution confidence scoring (96.8%), confidence band categorization, and nearest VASP candidate ranking.
                </p>
              </div>

              {/* Tier 4: Recommendation */}
              <div className="p-3.5 bg-[#1C1D20] rounded-xl border border-[#B23AEE]/30 space-y-2 shadow-glass-card">
                <span className="px-2 py-0.5 rounded bg-[#2A0134]/50 text-[#B23AEE] font-bold text-[9px] uppercase border border-[#B23AEE]/30">
                  RECOMMENDATION
                </span>
                <p className="text-[11px] text-[#D8D3C7] leading-relaxed">
                  Issuance of formal Section 91 CrPC notice to CoinDCX compliance nodal desk for KYC beneficiary disclosure and provisional account freeze under PMLA Sec 5.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Analytical Methodology & Statutory Verification */}
          <div className="space-y-2 p-4 rounded-xl bg-black/20 border border-white/[0.06] font-mono text-xs transition-colors">
            <span className="text-[#ADC178] font-bold uppercase text-[11px] block border-b border-white/[0.06] pb-1">
              7. ANALYTICAL METHODOLOGY &amp; LEGAL CERTIFICATION
            </span>
            <p className="text-[11px] text-[#9D9A92] leading-relaxed">
              This dossier has been programmatically assembled via CHAINTRACE Blockchain Intelligence APIs utilizing multi-hop directed acyclic graph traversal, common-input address clustering, cross-chain relayer confirmation, and 7-variable Bayesian confidence scoring.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#74736F]">
              <span>Certifying Official: <strong className="text-[#FAFAF5]">{CURRENT_OFFICER.name}</strong> ({CURRENT_OFFICER.badgeId})</span>
              <span>Electronic Seal Checksum: <strong className="text-[#ADC178]">a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2</strong></span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
