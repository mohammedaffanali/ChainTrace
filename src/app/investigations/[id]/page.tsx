'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { CASES, WALLETS, TRANSACTIONS } from '@/lib/data';
import { getApiBaseUrl } from '@/lib/apiConfig';

export default function CaseDetailPage() {
  const params = useParams();
  const caseId = (params?.id as string) || 'CASE-2026-001';
  const defaultCase = CASES.find((c) => c.id === caseId) || CASES[0];
  const [caseData, setCaseData] = useState<any>(defaultCase);

  const [activeTab, setActiveTab] = useState<'hops' | 'wallets' | 'subpoenas' | 'evidence'>('hops');
  const [subpoenaSent, setSubpoenaSent] = useState(false);
  const [freezeNoticeActive, setFreezeNoticeActive] = useState(false);

  React.useEffect(() => {
    const baseUrl = getApiBaseUrl();
    fetch(`${baseUrl}/api/v1/investigations/${caseId}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then((data) => {
        if (data && data.id) {
          setCaseData({
            ...defaultCase,
            ...data,
            walletsTracked: data.wallets ? data.wallets.length : defaultCase.walletsTracked,
          });
        }
      })
      .catch(() => {
        // Retain fallback case
      });
  }, [caseId, defaultCase]);

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 font-mono text-xs text-[#9D9A92]">
          <Link href="/investigations" className="hover:text-[#FAFAF5] transition-colors">
            Investigations Register
          </Link>
          <span className="text-[#74736F]">/</span>
          <span className="text-[#7CB9E8] font-semibold">{caseData.id}</span>
        </div>

        {/* Case Dossier Master Header */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl p-6 rounded-xl border border-white/[0.08] shadow-glass-card flex flex-col gap-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-bold text-[#7CB9E8] px-2.5 py-0.5 rounded bg-[#1560BD]/20 border border-[#7CB9E8]/30">
                  {caseData.id}
                </span>
                <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] tracking-tight">
                  {caseData.title}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40">
                  {caseData.priority} PRIORITY
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-black/30 text-[#7CB9E8] border border-white/[0.08] font-semibold">
                  {caseData.status}
                </span>
              </div>
              <p className="text-xs text-[#9D9A92] mt-2 max-w-4xl leading-relaxed">
                {caseData.summary}
              </p>
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setSubpoenaSent(true)}
                className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space text-xs font-semibold shadow-glass-card transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>{subpoenaSent ? 'CrPC 91 Dispatched' : 'Issue CrPC 91 Notice'}</span>
              </button>

              <button
                onClick={() => setFreezeNoticeActive(!freezeNoticeActive)}
                className={`px-3.5 py-2 rounded-lg font-space text-xs font-semibold border transition-all flex items-center gap-1.5 shadow-glass-card ${
                  freezeNoticeActive
                    ? 'bg-[#960018] text-[#FAFAF5] border-[#C44536]'
                    : 'bg-[#960018]/20 text-[#FAFAF5] border-[#960018]/40 hover:bg-[#960018]/30'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">ac_unit</span>
                <span>{freezeNoticeActive ? 'Freeze Order Active' : 'PMLA Sec 5 Freeze'}</span>
              </button>

              <Link
                href="/reports"
                className="px-3.5 py-2 rounded-lg bg-[#25282D]/80 hover:bg-[#25282D] text-[#FAFAF5] font-space text-xs font-semibold border border-white/[0.08] transition-all flex items-center gap-1.5 shadow-glass-card"
              >
                <span className="material-symbols-outlined text-[17px]">print</span>
                <span>Affidavit (65B)</span>
              </Link>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <span className="font-mono text-[#74736F] text-[11px]">Total Rupee Exposure</span>
              <div className="font-mono font-bold text-base text-[#ADC178] mt-0.5">
                {caseData.totalExposureINR}
              </div>
            </div>

            <div>
              <span className="font-mono text-[#74736F] text-[11px]">Seized Under Sec 5 PMLA</span>
              <div className="font-mono font-bold text-base text-[#7CB9E8] mt-0.5">
                ₹12,40,00,000 (₹12.4 Cr)
              </div>
            </div>

            <div>
              <span className="font-mono text-[#74736F] text-[11px]">Lead Investigating Agency</span>
              <div className="font-sans font-semibold text-[#FAFAF5] mt-0.5">
                {caseData.agency}
              </div>
            </div>

            <div>
              <span className="font-mono text-[#74736F] text-[11px]">Investigating Officer</span>
              <div className="font-sans font-semibold text-[#FAFAF5] mt-0.5">
                {caseData.leadOfficer}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] font-mono text-xs overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('hops')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === 'hops'
                ? 'border-t-2 border-[#7CB9E8] text-[#7CB9E8] bg-[#1C1D20] border-x border-white/[0.08]'
                : 'text-[#9D9A92] hover:text-[#FAFAF5]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            <span>Multi-Hop Attribution Chain</span>
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === 'wallets'
                ? 'border-t-2 border-[#7CB9E8] text-[#7CB9E8] bg-[#1C1D20] border-x border-white/[0.08]'
                : 'text-[#9D9A92] hover:text-[#FAFAF5]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span>Correlated Wallets ({caseData.walletsTracked})</span>
          </button>

          <button
            onClick={() => setActiveTab('subpoenas')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === 'subpoenas'
                ? 'border-t-2 border-[#7CB9E8] text-[#7CB9E8] bg-[#1C1D20] border-x border-white/[0.08]'
                : 'text-[#9D9A92] hover:text-[#FAFAF5]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Statutory Subpoenas (CrPC / PMLA)</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 rounded-t-lg transition-all whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'border-t-2 border-[#7CB9E8] text-[#7CB9E8] bg-[#1C1D20] border-x border-white/[0.08]'
                : 'text-[#9D9A92] hover:text-[#FAFAF5]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Section 65B Digital Evidence</span>
          </button>
        </div>

        {/* Tab 1: Multi-Hop Attribution Chain */}
        {activeTab === 'hops' && (
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="font-space font-semibold text-base text-[#FAFAF5]">
                De-Anonymized Transaction Attribution Pathway
              </h2>
              <Link
                href="/fund-flow-graph"
                className="font-mono text-xs text-[#7CB9E8] hover:underline flex items-center gap-1"
              >
                <span>Open in Visual Flow Graph Studio</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>

            {/* Visual Step-by-Step Flow Line */}
            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-white/[0.08]">
              {/* Step 1 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-[#C44536] border-2 border-[#1C1D20] z-10 shadow-sm"></div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#960018]/20 text-[#FAFAF5] font-bold border border-[#960018]/40">
                        HOP 0 // INCEPTION SEED
                      </span>
                      <span className="text-[#FAFAF5] font-semibold text-xs">Syndicate Cold Storage Extraction</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[#9D9A92] flex items-center gap-2">
                      <span>Address:</span>
                      <CopyBadge text="TWk93zM2sK8Qp...9xLt" />
                      <span className="text-[#7CB9E8]">(TRON TRC20)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[#ADC178] font-bold text-sm">₹12,45,00,000 (1,400,000 USDT)</div>
                    <span className="text-[10px] text-[#74736F]">2026-09-08 14:12:08 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-amber-400 border-2 border-[#1C1D20] z-10 shadow-sm"></div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                        HOP 1 // CROSS-CHAIN BRIDGE
                      </span>
                      <span className="text-[#FAFAF5] font-semibold text-xs">Thorchain &amp; Wormhole Obfuscation Layer</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[#9D9A92] flex items-center gap-2">
                      <span>Bridge Contract:</span>
                      <CopyBadge text="0x8849bCd03810...55C2" />
                      <span className="text-[#B23AEE]">(ETH &gt; SOL)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[#ADC178] font-bold text-sm">₹8,80,00,000 (Converted to ETH/SOL)</div>
                    <span className="text-[10px] text-[#74736F]">2026-09-09 03:45:19 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-[#40E0D0] border-2 border-[#1C1D20] z-10 shadow-sm"></div>
                <div className="p-4 rounded-xl bg-black/20 border border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#006666]/30 text-[#40E0D0] font-bold border border-[#40E0D0]/30">
                        HOP 2 // P2P MULE STRUCTURING
                      </span>
                      <span className="text-[#FAFAF5] font-semibold text-xs">Surat &amp; Jaipur Mule Node Dispersal</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[#9D9A92] flex items-center gap-2">
                      <span>Mule Terminal:</span>
                      <CopyBadge text="0x71C8a77B280f9...3aF9" />
                      <span className="text-[#7CB9E8]">(42 Micro-Transfers)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[#ADC178] font-bold text-sm">₹4,20,00,000 (INR Off-Ramp via UPI/IMPS)</div>
                    <span className="text-[10px] text-[#74736F]">2026-09-09 18:22:40 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-[#ADC178] border-2 border-[#1C1D20] z-10 shadow-sm"></div>
                <div className="p-4 rounded-xl bg-black/20 border border-[#ADC178]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1B512D]/30 text-[#ADC178] font-bold border border-[#ADC178]/30">
                        HOP 3 // INTERCEPTED &amp; FROZEN
                      </span>
                      <span className="text-[#FAFAF5] font-semibold text-xs">CoinDCX &amp; WazirX Registered Enclave</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-[#9D9A92] flex items-center gap-2">
                      <span>Deposit Gateway:</span>
                      <CopyBadge text="0x38b25A89d120...e9A1" />
                      <span className="text-[#ADC178]">(FIU-IND KYC Verified)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-[#ADC178] font-bold text-sm">₹12,40,00,000 FROZEN UNDER PMLA</div>
                    <span className="text-[10px] text-[#ADC178]">Order Ref: ED/PMLA/2026/SEC5-09</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Correlated Wallets */}
        {activeTab === 'wallets' && (
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card overflow-hidden transition-colors">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/30 text-[#9D9A92] border-b border-white/[0.06] uppercase text-[11px]">
                <tr>
                  <th className="p-3">Wallet Address</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Attribution Cluster</th>
                  <th className="p-3 text-right">Rupee Balance (INR)</th>
                  <th className="p-3 text-center">Threat Level</th>
                  <th className="p-3 text-center">Hops to Exit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {WALLETS.map((w) => (
                  <tr key={w.address} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3">
                      <CopyBadge text={w.address} />
                    </td>
                    <td className="p-3 text-[#7CB9E8]">{w.chain}</td>
                    <td className="p-3 font-sans text-[#FAFAF5] font-medium">{w.clusterLabel}</td>
                    <td className="p-3 text-right font-bold text-[#ADC178]">{w.balanceINR}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.threatLevel === 'CRITICAL'
                            ? 'bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40'
                            : 'bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30'
                        }`}
                      >
                        {w.threatLevel}
                      </span>
                    </td>
                    <td className="p-3 text-center text-[#D8D3C7]">{w.hopsToCashout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Statutory Subpoenas */}
        {activeTab === 'subpoenas' && (
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card p-5 space-y-4 text-xs transition-colors">
            <h2 className="font-space font-bold text-base text-[#FAFAF5]">
              Dispatched Statutory Production Notices (Section 91 CrPC &amp; Section 50 PMLA)
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-black/20 border border-[#ADC178]/30 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#ADC178] font-bold">NOTICE-CRPC-91-2026-042</span>
                    <span className="px-2 py-0.5 rounded bg-[#1B512D]/30 text-[#ADC178] font-mono text-[10px] border border-[#ADC178]/30">
                      COMPLIED
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#FAFAF5] mt-1">Recipient: Neblio Technologies (CoinDCX)</h3>
                  <p className="text-[#D8D3C7] mt-1 leading-relaxed">
                    Requisition of KYC identity dossier, IP login telemetry, bank account linked to deposit hash 0x38b25A...
                  </p>
                  <div className="mt-2 font-mono text-[11px] text-[#74736F]">
                    Nodal Compliance Officer: nodal.lea@coindcx.com | Response Received: 2 hrs ago
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#FAFAF5] rounded-lg font-mono text-xs border border-white/[0.08] transition-colors shrink-0">
                  View KYC Annexure
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/20 border border-[#960018]/40 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#C44536] font-bold">NOTICE-FIU-SHOWCAUSE-88</span>
                    <span className="px-2 py-0.5 rounded bg-[#960018]/20 text-[#FAFAF5] font-mono text-[10px] border border-[#960018]/40">
                      NON-COMPLIANT OFFSHORE
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#FAFAF5] mt-1">Recipient: Offshore Unregistered Exchange (HTX / Seychelles)</h3>
                  <p className="text-[#D8D3C7] mt-1 leading-relaxed">
                    Emergency freeze of account UID #998241 associated with extortion ransoms. Statutory 72-hr notice expired.
                  </p>
                  <div className="mt-2 font-mono text-[11px] text-[#C44536]">
                    Escalation: Referred to MeitY under Section 69A IT Act for domain &amp; IP blocking in India.
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-[#960018] hover:bg-[#B22222] text-[#FAFAF5] rounded-lg font-mono text-xs transition-colors shrink-0">
                  Issue Section 69A Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Section 65B Digital Evidence */}
        {activeTab === 'evidence' && (
          <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card p-5 space-y-4 text-xs font-mono transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-space font-bold text-base text-[#FAFAF5]">
                  Section 65B Electronic Record Certificate Ledger
                </h2>
                <p className="text-[#9D9A92] text-[11px]">
                  Admissible in Indian Courts under Section 65B(4) Evidence Act / Section 63 BSA
                </p>
              </div>
              <Link
                href="/reports"
                className="px-4 py-2 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] rounded-lg font-space font-semibold text-xs flex items-center gap-1.5 transition-all shadow-glass-card"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Export Signed Court Affidavit</span>
              </Link>
            </div>

            <div className="p-4 bg-black/20 rounded-xl border border-white/[0.04] space-y-2">
              <div className="text-[#ADC178] font-bold">
                [CRYPTOGRAPHIC CERTIFICATION OF CHAIN CUSTODY]
              </div>
              <p className="text-[#D8D3C7] leading-relaxed">
                I, Insp. Vikramaditya Sharma, hereby certify that the electronic ledger logs, blockchain telemetry, and de-anonymized transaction trees for CASE-2026-001 were ingested via validated RPC nodes without tampering or unauthorized modification.
              </p>
              <div className="pt-2 text-[11px] text-[#74736F] space-y-1">
                <div>Ledger Hash: <strong className="text-[#FAFAF5]">e4c5b6a78f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5</strong></div>
                <div>Signing Officer: <strong className="text-[#FAFAF5]">DEL-CYBER-8842 (Delhi Police Cyber Command)</strong></div>
                <div>Timestamp: <strong className="text-[#FAFAF5]">2026-09-10 18:50:34 IST</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
