'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { CASES, CaseItem } from '@/lib/data';

import { getApiBaseUrl } from '@/lib/apiConfig';

function InvestigationsContent() {
  const searchParams = useSearchParams();
  const [casesList, setCasesList] = useState<CaseItem[]>(CASES);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // New Case Form State
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [newCaseAgency, setNewCaseAgency] = useState('Delhi Police Cyber Command & FIU-IND Liaison');
  const [newCasePriority, setNewCasePriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newCaseExposure, setNewCaseExposure] = useState('₹15,00,00,000');
  const [newCaseWallet, setNewCaseWallet] = useState('');

  // Fetch from FastAPI backend
  const fetchInvestigations = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/investigations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCasesList(data);
        }
      }
    } catch {
      // Offline fallback: retains seeded CASES
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, []);

  // Auto-fill from VASP Attribution redirect
  useEffect(() => {
    const qWallet = searchParams?.get('wallet');
    const qVasp = searchParams?.get('vasp');
    const qConf = searchParams?.get('confidence');

    if (qWallet) {
      setNewCaseWallet(qWallet);
      setNewCaseTitle(`Operation Attributed VASP Nexus — Target ${qWallet.slice(0, 8)}... (${qVasp || 'VASP'} ${qConf ? `${qConf}%` : ''})`);
      setShowNewCaseModal(true);
    }
  }, [searchParams]);

  const filteredCases = casesList.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.leadOfficer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: newCaseTitle || `Inquiry on Target ${newCaseWallet.slice(0, 10)}...`,
      agency: newCaseAgency,
      priority: newCasePriority,
      total_exposure_inr: newCaseExposure,
      target_wallet: newCaseWallet,
      chain: 'Ethereum',
      summary: `Investigation initiated regarding seed target ${newCaseWallet}. Authorized under CrPC 91 / PMLA Section 50 directives.`
    };

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/investigations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        setCasesList([created, ...casesList]);
      } else {
        throw new Error();
      }
    } catch {
      // Local optimistic fallback
      const newId = `CASE-2026-${String(casesList.length + 1).padStart(3, '0')}`;
      const fallbackCase: CaseItem = {
        id: newId,
        title: payload.title,
        leadOfficer: 'Insp. Vikramaditya Sharma',
        agency: payload.agency,
        openedDate: '10 Sep 2026',
        status: 'ACTIVE TRACE',
        priority: payload.priority as any,
        totalExposureINR: `${payload.total_exposure_inr} INR`,
        exposureAmountRaw: 150000000,
        walletsTracked: 1,
        chains: ['Ethereum', 'Tron'],
        associatedVasp: 'Under Attribution',
        riskScore: 88,
        summary: payload.summary,
      };
      setCasesList([fallbackCase, ...casesList]);
    }

    setShowNewCaseModal(false);
    setNewCaseTitle('');
    setNewCaseWallet('');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7CB9E8] animate-pulse"></span>
              <span className="font-mono text-xs text-[#7CB9E8] uppercase tracking-wider font-semibold">
                STATUTORY CRIME REGISTER // PMLA 2002 &amp; IT ACT 2000
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
              Case Management &amp; Investigation Register
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Active forensic operations across FIU-IND, Enforcement Directorate, and State Cyber Cells
            </p>
          </div>

          <button
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg shadow-glass-card transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Initiate New Investigation</span>
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
            <span className="font-mono text-xs text-[#9D9A92] uppercase">Total Active Mandates</span>
            <div className="mt-2 font-space font-bold text-2xl text-[#FAFAF5]">{casesList.length} Inquiries</div>
            <span className="font-mono text-[10px] text-[#7CB9E8] mt-1 block">All High-Priority LEA Directives</span>
          </div>

          <div className="p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-[#960018]/40 shadow-glass-card transition-colors">
            <span className="font-mono text-xs text-[#9D9A92] uppercase">Critical Threat Priority</span>
            <div className="mt-2 font-space font-bold text-2xl text-[#C44536]">
              {casesList.filter((c) => c.priority === 'CRITICAL').length} Operations
            </div>
            <span className="font-mono text-[10px] text-[#C44536] mt-1 block">Syndicates / Darknet Escrows</span>
          </div>

          <div className="p-4 bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-[#ADC178]/30 shadow-glass-card transition-colors">
            <span className="font-mono text-xs text-[#9D9A92] uppercase">Cumulative Exposure</span>
            <div className="mt-2 font-space font-bold text-2xl text-[#ADC178]">
              ₹184.60 Crore
            </div>
            <span className="font-mono text-[10px] text-[#9D9A92] mt-1 block">
              Tracked across 6 Layer-1 &amp; Layer-2 Chains
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#1C1D20]/90 backdrop-blur-xl p-3.5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#74736F] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, Operation Name, Lead Officer, or Agency..."
              className="w-full h-9 pl-9 pr-3 bg-black/30 text-[#FAFAF5] text-xs font-mono rounded-lg border border-white/[0.08] focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'ACTIVE TRACE', 'SUBPOENA SERVED', 'EVIDENTIARY FREEZE', 'ESCALATED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-mono text-[10px] font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-[#1560BD] text-[#FAFAF5] border-[#7CB9E8] shadow-signal-blue'
                    : 'bg-black/20 text-[#9D9A92] border-white/[0.06] hover:text-[#FAFAF5] hover:border-white/[0.12]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] overflow-hidden shadow-glass-card transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/30 border-b border-white/[0.06] text-[#9D9A92] uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Case Docket</th>
                  <th className="py-3 px-4">Agency / Lead</th>
                  <th className="py-3 px-4">Chains</th>
                  <th className="py-3 px-4 text-right">Rupee Valuation</th>
                  <th className="py-3 px-4 text-center">Threat</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#7CB9E8] text-xs">{c.id}</span>
                        <span className="font-sans text-[#FAFAF5] text-xs font-medium line-clamp-1 mt-0.5">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-[#74736F]">Opened: {c.openedDate}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#FAFAF5] font-sans text-xs font-medium">{c.leadOfficer}</div>
                      <span className="text-[10px] text-[#74736F]">{c.agency}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.chains.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.5 rounded bg-black/30 text-[#7CB9E8] text-[9px] border border-[#7CB9E8]/20"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-[#ADC178]">
                      {c.totalExposureINR}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-[#960018]/20 text-[#FAFAF5] border border-[#960018]/40'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-black/30 text-[#7CB9E8] text-[10px] border border-white/[0.06] font-semibold">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/investigations/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-[#25282D]/80 hover:bg-[#1560BD] text-[#FAFAF5] text-xs border border-white/[0.08] transition-colors font-medium shadow-glass-card inline-flex items-center gap-1"
                      >
                        <span>Dossier</span>
                        <span className="text-[11px]">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Case Creation Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#1C1D20] border border-white/[0.12] rounded-xl shadow-glass-elevated p-6 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7CB9E8] text-[20px]">create_new_folder</span>
                <h3 className="font-space font-bold text-base text-[#FAFAF5]">
                  Initiate Statutory Cyber Investigation
                </h3>
              </div>
              <button onClick={() => setShowNewCaseModal(false)} className="text-[#9D9A92] hover:text-[#FAFAF5]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-mono text-[11px] text-[#9D9A92] uppercase mb-1">
                  Investigation Title / Operation Codename
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Operation NetSweep — Hawala Bridge Cluster"
                  className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#9D9A92] uppercase mb-1">
                    Originating Agency
                  </label>
                  <select
                    value={newCaseAgency}
                    onChange={(e) => setNewCaseAgency(e.target.value)}
                    className="w-full h-9 px-2 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] text-xs focus:border-[#7CB9E8] focus:outline-none"
                  >
                    <option className="bg-[#1C1D20] text-[#FAFAF5]">Delhi Police Cyber Command &amp; FIU-IND Liaison</option>
                    <option className="bg-[#1C1D20] text-[#FAFAF5]">Enforcement Directorate (ED) PMLA Cell</option>
                    <option className="bg-[#1C1D20] text-[#FAFAF5]">CBI Cyber Crime Division</option>
                    <option className="bg-[#1C1D20] text-[#FAFAF5]">CERT-In Threat Defense Matrix</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#9D9A92] uppercase mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as any)}
                    className="w-full h-9 px-2 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] text-xs focus:border-[#7CB9E8] focus:outline-none"
                  >
                    <option value="CRITICAL" className="bg-[#1C1D20] text-[#FAFAF5]">CRITICAL (National Threat / High Escrow)</option>
                    <option value="HIGH" className="bg-[#1C1D20] text-[#FAFAF5]">HIGH (Organized Syndicate)</option>
                    <option value="MEDIUM" className="bg-[#1C1D20] text-[#FAFAF5]">MEDIUM (Retail Fraud / Task Scam)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-[#9D9A92] uppercase mb-1">
                    Estimated Rupee Exposure (INR)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseExposure}
                    onChange={(e) => setNewCaseExposure(e.target.value)}
                    placeholder="e.g. ₹15,00,00,000"
                    className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#9D9A92] uppercase mb-1">
                    Primary Target Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseWallet}
                    onChange={(e) => setNewCaseWallet(e.target.value)}
                    placeholder="0x..., bc1..., or TRC20..."
                    className="w-full h-9 px-3 bg-black/30 border border-white/[0.08] rounded-lg text-[#FAFAF5] font-mono text-xs focus:border-[#7CB9E8] focus:outline-none placeholder:text-[#74736F]"
                  />
                </div>
              </div>

              <div className="p-3 bg-black/20 border border-white/[0.06] rounded-lg text-[11px] text-[#9D9A92] leading-relaxed">
                Mandate Notice: Initiating an inquiry activates automated Section 65B audit trails and queries Indian FIU-registered VASP mempools.
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-[#FAFAF5] rounded-lg font-space text-xs border border-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold rounded-lg text-xs shadow-glass-card transition-colors"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function InvestigationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white font-mono text-xs">Loading Investigations Register...</div>}>
      <InvestigationsContent />
    </Suspense>
  );
}
