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
        <div className="flex items-center gap-2 font-mono text-xs text-[#8c909f]">
          <Link href="/investigations" className="hover:text-white transition-colors">
            Investigations Register
          </Link>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">{caseData.id}</span>
        </div>

        {/* Case Dossier Master Header */}
        <div className="bg-theme-surface p-5 rounded-xl border border-theme-border shadow-sm flex flex-col gap-4 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-sm font-bold text-theme-primary px-2.5 py-0.5 rounded bg-theme-primary/15 border border-theme-primary/30">
                  {caseData.id}
                </span>
                <h1 className="font-space font-bold text-2xl text-theme-heading">
                  {caseData.title}
                </h1>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                  {caseData.priority} PRIORITY
                </span>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-theme-surface-subtle text-theme-primary border border-theme-border font-semibold">
                  {caseData.status}
                </span>
              </div>
              <p className="text-xs text-theme-text-secondary mt-2 max-w-4xl leading-relaxed">
                {caseData.summary}
              </p>
            </div>

            {/* Tactical Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => setSubpoenaSent(true)}
                className="px-3.5 py-2 rounded-md bg-theme-primary hover:opacity-90 text-white font-space text-xs font-semibold shadow-md shadow-theme-primary/20 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span>{subpoenaSent ? 'CrPC 91 Dispatched' : 'Issue CrPC 91 Notice'}</span>
              </button>

              <button
                onClick={() => setFreezeNoticeActive(!freezeNoticeActive)}
                className={`px-3.5 py-2 rounded-md font-space text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                  freezeNoticeActive
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/25'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">ac_unit</span>
                <span>{freezeNoticeActive ? 'Freeze Order Active' : 'PMLA Sec 5 Freeze'}</span>
              </button>

              <Link
                href="/reports"
                className="px-3.5 py-2 rounded-md bg-theme-surface-subtle hover:bg-theme-surface text-theme-fg font-space text-xs font-semibold border border-theme-border transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[17px]">print</span>
                <span>Affidavit (65B)</span>
              </Link>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-theme-border text-xs">
            <div>
              <span className="font-mono text-theme-text-muted text-[11px]">Total Rupee Exposure</span>
              <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                {caseData.totalExposureINR}
              </div>
            </div>

            <div>
              <span className="font-mono text-theme-text-muted text-[11px]">Seized Under Sec 5 PMLA</span>
              <div className="font-mono font-bold text-base text-theme-primary mt-0.5">
                ₹12,40,00,000 (₹12.4 Cr)
              </div>
            </div>

            <div>
              <span className="font-mono text-theme-text-muted text-[11px]">Lead Investigating Agency</span>
              <div className="font-sans font-semibold text-theme-heading mt-0.5">
                {caseData.agency}
              </div>
            </div>

            <div>
              <span className="font-mono text-theme-text-muted text-[11px]">Investigating Officer</span>
              <div className="font-sans font-semibold text-theme-heading mt-0.5">
                {caseData.leadOfficer}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-theme-border font-mono text-xs">
          <button
            onClick={() => setActiveTab('hops')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'hops'
                ? 'border-theme-primary text-theme-primary bg-theme-primary/10'
                : 'border-transparent text-theme-text-muted hover:text-theme-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">timeline</span>
            <span>Multi-Hop Attribution Chain</span>
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'wallets'
                ? 'border-theme-primary text-theme-primary bg-theme-primary/10'
                : 'border-transparent text-theme-text-muted hover:text-theme-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            <span>Correlated Wallets ({caseData.walletsTracked})</span>
          </button>

          <button
            onClick={() => setActiveTab('subpoenas')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'subpoenas'
                ? 'border-theme-primary text-theme-primary bg-theme-surface'
                : 'border-transparent text-theme-text-muted hover:text-theme-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">gavel</span>
            <span>Statutory Subpoenas (CrPC / PMLA)</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-2.5 font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'evidence'
                ? 'border-theme-primary text-theme-primary bg-theme-surface'
                : 'border-transparent text-theme-text-muted hover:text-theme-heading'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Section 65B Digital Evidence</span>
          </button>
        </div>

        {/* Tab 1: Multi-Hop Attribution Chain */}
        {activeTab === 'hops' && (
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="font-space font-semibold text-base text-theme-heading">
                De-Anonymized Transaction Attribution Pathway
              </h2>
              <Link
                href="/fund-flow-graph"
                className="font-mono text-xs text-theme-primary hover:underline flex items-center gap-1"
              >
                <span>Open in Visual Flow Graph Studio</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>

            {/* Visual Step-by-Step Flow Line */}
            <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-theme-border">
              {/* Step 1 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-red-500 border-2 border-theme-surface z-10 shadow-sm"></div>
                <div className="p-4 rounded-lg bg-theme-surface-secondary border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-300 font-bold border border-red-500/30">
                        HOP 0 // INCEPTION SEED
                      </span>
                      <span className="text-theme-heading font-semibold text-xs">Syndicate Cold Storage Extraction</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-theme-text-muted flex items-center gap-2">
                      <span>Address:</span>
                      <CopyBadge text="TWk93zM2sK8Qp...9xLt" />
                      <span className="text-theme-accent">(TRON TRC20)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">₹12,45,00,000 (1,400,000 USDT)</div>
                    <span className="text-[10px] text-theme-text-muted">2026-09-08 14:12:08 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-amber-500 border-2 border-theme-surface z-10 shadow-sm"></div>
                <div className="p-4 rounded-lg bg-theme-surface-secondary border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30">
                        HOP 1 // CROSS-CHAIN BRIDGE
                      </span>
                      <span className="text-theme-heading font-semibold text-xs">Thorchain &amp; Wormhole Obfuscation Layer</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-theme-text-muted flex items-center gap-2">
                      <span>Bridge Contract:</span>
                      <CopyBadge text="0x8849bCd03810...55C2" />
                      <span className="text-purple-600 dark:text-purple-400">(ETH &gt; SOL)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">₹8,80,00,000 (Converted to ETH/SOL)</div>
                    <span className="text-[10px] text-theme-text-muted">2026-09-09 03:45:19 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-theme-surface z-10 shadow-sm"></div>
                <div className="p-4 rounded-lg bg-theme-surface-secondary border border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-bold border border-cyan-500/30">
                        HOP 2 // P2P MULE STRUCTURING
                      </span>
                      <span className="text-theme-heading font-semibold text-xs">Surat &amp; Jaipur Mule Node Dispersal</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-theme-text-muted flex items-center gap-2">
                      <span>Mule Terminal:</span>
                      <CopyBadge text="0x71C8a77B280f9...3aF9" />
                      <span className="text-theme-accent">(42 Micro-Transfers)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">₹4,20,00,000 (INR Off-Ramp via UPI/IMPS)</div>
                    <span className="text-[10px] text-theme-text-muted">2026-09-09 18:22:40 IST</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-12">
                <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-emerald-500 border-2 border-theme-surface z-10 shadow-sm"></div>
                <div className="p-4 rounded-lg bg-theme-surface-secondary border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-bold border border-emerald-500/30">
                        HOP 3 // INTERCEPTED &amp; FROZEN
                      </span>
                      <span className="text-theme-heading font-semibold text-xs">CoinDCX &amp; WazirX Registered Enclave</span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-theme-text-muted flex items-center gap-2">
                      <span>Deposit Gateway:</span>
                      <CopyBadge text="0x38b25A89d120...e9A1" />
                      <span className="text-emerald-600 dark:text-emerald-400">(FIU-IND KYC Verified)</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right font-mono">
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">₹12,40,00,000 FROZEN UNDER PMLA</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Order Ref: ED/PMLA/2026/SEC5-09</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Correlated Wallets */}
        {activeTab === 'wallets' && (
          <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden transition-colors">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-surface-secondary text-theme-text-muted border-b border-theme-border uppercase text-[11px]">
                <tr>
                  <th className="p-3">Wallet Address</th>
                  <th className="p-3">Network</th>
                  <th className="p-3">Attribution Cluster</th>
                  <th className="p-3 text-right">Rupee Balance (INR)</th>
                  <th className="p-3 text-center">Threat Level</th>
                  <th className="p-3 text-center">Hops to Exit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {WALLETS.map((w) => (
                  <tr key={w.address} className="hover:bg-theme-surface-secondary transition-colors">
                    <td className="p-3">
                      <CopyBadge text={w.address} />
                    </td>
                    <td className="p-3 text-theme-accent">{w.chain}</td>
                    <td className="p-3 font-sans text-theme-heading font-medium">{w.clusterLabel}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{w.balanceINR}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          w.threatLevel === 'CRITICAL'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-300'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                        }`}
                      >
                        {w.threatLevel}
                      </span>
                    </td>
                    <td className="p-3 text-center text-theme-fg">{w.hopsToCashout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Statutory Subpoenas */}
        {activeTab === 'subpoenas' && (
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 text-xs transition-colors">
            <h2 className="font-space font-bold text-base text-theme-heading">
              Dispatched Statutory Production Notices (Section 91 CrPC &amp; Section 50 PMLA)
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-theme-surface-secondary border border-emerald-500/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">NOTICE-CRPC-91-2026-042</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-mono text-[10px]">
                      COMPLIED
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-theme-heading mt-1">Recipient: Neblio Technologies (CoinDCX)</h3>
                  <p className="text-theme-fg mt-1">
                    Requisition of KYC identity dossier, IP login telemetry, bank account linked to deposit hash 0x38b25A...
                  </p>
                  <div className="mt-2 font-mono text-[11px] text-theme-text-muted">
                    Nodal Compliance Officer: nodal.lea@coindcx.com | Response Received: 2 hrs ago
                  </div>
                </div>
                <button className="px-3 py-1 bg-theme-surface hover:bg-theme-surface-tertiary text-theme-fg rounded font-mono text-xs border border-theme-border transition-colors">
                  View KYC Annexure
                </button>
              </div>

              <div className="p-4 rounded-lg bg-theme-surface-secondary border border-red-500/40 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-red-500 font-bold">NOTICE-FIU-SHOWCAUSE-88</span>
                    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-300 font-mono text-[10px]">
                      NON-COMPLIANT OFFSHORE
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-theme-heading mt-1">Recipient: Offshore Unregistered Exchange (HTX / Seychelles)</h3>
                  <p className="text-theme-fg mt-1">
                    Emergency freeze of account UID #998241 associated with extortion ransoms. Statutory 72-hr notice expired.
                  </p>
                  <div className="mt-2 font-mono text-[11px] text-red-500">
                    Escalation: Referred to MeitY under Section 69A IT Act for domain &amp; IP blocking in India.
                  </div>
                </div>
                <button className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-mono text-xs transition-colors">
                  Issue Section 69A Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Section 65B Digital Evidence */}
        {activeTab === 'evidence' && (
          <div className="bg-theme-surface rounded-xl border border-theme-border p-5 space-y-4 text-xs font-mono transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-space font-bold text-base text-theme-heading">
                  Section 65B Electronic Record Certificate Ledger
                </h2>
                <p className="text-theme-text-muted text-[11px]">
                  Admissible in Indian Courts under Section 65B(4) Evidence Act / Section 63 BSA
                </p>
              </div>
              <Link
                href="/reports"
                className="px-4 py-1.5 bg-theme-primary hover:bg-theme-primary-hover text-white rounded font-space font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Export Signed Court Affidavit</span>
              </Link>
            </div>

            <div className="p-4 bg-theme-surface-secondary rounded-lg border border-theme-border space-y-2">
              <div className="text-emerald-600 dark:text-emerald-400 font-bold">
                [CRYPTOGRAPHIC CERTIFICATION OF CHAIN CUSTODY]
              </div>
              <p className="text-theme-fg">
                I, Insp. Vikramaditya Sharma, hereby certify that the electronic ledger logs, blockchain telemetry, and de-anonymized transaction trees for CASE-2026-001 were ingested via validated RPC nodes without tampering or unauthorized modification.
              </p>
              <div className="pt-2 text-[11px] text-theme-text-muted space-y-1">
                <div>Ledger Hash: <strong className="text-theme-heading">e4c5b6a78f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5</strong></div>
                <div>Signing Officer: <strong className="text-theme-heading">DEL-CYBER-8842 (Delhi Police Cyber Command)</strong></div>
                <div>Timestamp: <strong className="text-theme-heading">2026-09-10 18:50:34 IST</strong></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
