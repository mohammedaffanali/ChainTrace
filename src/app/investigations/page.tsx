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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
              <span className="font-mono text-xs text-theme-primary uppercase tracking-wider font-semibold">
                STATUTORY CRIME REGISTER // PMLA 2002 &amp; IT ACT 2000
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Case Management &amp; Investigation Register
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Active forensic operations across FIU-IND, Enforcement Directorate, and State Cyber Cells
            </p>
          </div>

          <button
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-primary hover:opacity-90 text-white font-space font-semibold text-xs rounded-md shadow-md shadow-theme-primary/20 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Initiate New Investigation</span>
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Total Active Mandates</span>
            <div className="mt-2 font-space font-bold text-2xl text-theme-heading">{casesList.length} Inquiries</div>
            <span className="font-mono text-[10px] text-theme-primary mt-1 block">All High-Priority LEA Directives</span>
          </div>

          <div className="p-4 bg-theme-surface rounded-xl border border-red-500/30 shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Critical Threat Priority</span>
            <div className="mt-2 font-space font-bold text-2xl text-red-600 dark:text-red-400">
              {casesList.filter((c) => c.priority === 'CRITICAL').length} Operations
            </div>
            <span className="font-mono text-[10px] text-red-500 mt-1 block">Syndicates / Darknet Escrows</span>
          </div>

          <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm transition-colors">
            <span className="font-mono text-xs text-theme-text-muted uppercase">Cumulative Exposure</span>
            <div className="mt-2 font-space font-bold text-2xl text-emerald-600 dark:text-emerald-400">
              ₹184.60 Crore
            </div>
            <span className="font-mono text-[10px] text-theme-text-muted mt-1 block">
              Tracked across 6 Layer-1 &amp; Layer-2 Chains
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-theme-surface p-3 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, Operation Name, Lead Officer, or Agency..."
              className="w-full h-9 pl-9 pr-3 bg-theme-surface-subtle text-theme-fg text-xs font-mono rounded-md border border-theme-border focus:border-theme-primary focus:outline-none"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'ACTIVE TRACE', 'SUBPOENA SERVED', 'EVIDENTIARY FREEZE', 'ESCALATED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                    : 'bg-theme-surface-subtle text-theme-text-muted border-theme-border hover:text-theme-heading'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-surface-subtle border-b border-theme-border text-theme-text-muted uppercase text-[11px]">
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
              <tbody className="divide-y divide-theme-border">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-theme-surface-subtle transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-theme-primary text-xs">{c.id}</span>
                        <span className="font-sans text-theme-heading text-xs font-medium line-clamp-1 mt-0.5">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-theme-text-muted">Opened: {c.openedDate}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-theme-heading font-sans text-xs font-medium">{c.leadOfficer}</div>
                      <span className="text-[10px] text-theme-text-muted">{c.agency}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {c.chains.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.5 rounded bg-theme-surface-subtle text-theme-primary text-[9px] border border-theme-border"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {c.totalExposureINR}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.priority === 'CRITICAL'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-theme-surface-subtle text-theme-primary text-[10px] border border-theme-border font-semibold">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/investigations/${c.id}`}
                        className="px-3 py-1 rounded bg-theme-surface-subtle hover:bg-theme-primary hover:text-white text-theme-fg text-xs border border-theme-border transition-colors font-medium"
                      >
                        Dossier →
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-theme-primary text-[20px]">create_new_folder</span>
                <h3 className="font-space font-bold text-base text-theme-heading">
                  Initiate Statutory Cyber Investigation
                </h3>
              </div>
              <button onClick={() => setShowNewCaseModal(false)} className="text-theme-text-muted hover:text-theme-heading">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-mono text-[11px] text-theme-text-secondary uppercase mb-1">
                  Investigation Title / Operation Codename
                </label>
                <input
                  type="text"
                  required
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="e.g. Operation NetSweep — Hawala Bridge Cluster"
                  className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-heading font-mono text-xs focus:border-theme-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-theme-text-secondary uppercase mb-1">
                    Originating Agency
                  </label>
                  <select
                    value={newCaseAgency}
                    onChange={(e) => setNewCaseAgency(e.target.value)}
                    className="w-full h-9 px-2 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-heading text-xs focus:border-theme-primary focus:outline-none"
                  >
                    <option>Delhi Police Cyber Command &amp; FIU-IND Liaison</option>
                    <option>Enforcement Directorate (ED) PMLA Cell</option>
                    <option>CBI Cyber Crime Division</option>
                    <option>CERT-In Threat Defense Matrix</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-theme-text-secondary uppercase mb-1">
                    Priority Tier
                  </label>
                  <select
                    value={newCasePriority}
                    onChange={(e) => setNewCasePriority(e.target.value as any)}
                    className="w-full h-9 px-2 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-heading text-xs focus:border-theme-primary focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (National Threat / High Escrow)</option>
                    <option value="HIGH">HIGH (Organized Syndicate)</option>
                    <option value="MEDIUM">MEDIUM (Retail Fraud / Task Scam)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-theme-text-secondary uppercase mb-1">
                    Estimated Rupee Exposure (INR)
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseExposure}
                    onChange={(e) => setNewCaseExposure(e.target.value)}
                    placeholder="e.g. ₹15,00,00,000"
                    className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-heading font-mono text-xs focus:border-theme-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-theme-text-secondary uppercase mb-1">
                    Primary Target Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseWallet}
                    onChange={(e) => setNewCaseWallet(e.target.value)}
                    placeholder="0x..., bc1..., or TRC20..."
                    className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-heading font-mono text-xs focus:border-theme-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-theme-surface-secondary border border-theme-border rounded-md text-[11px] text-theme-text-muted">
                Mandate Notice: Initiating an inquiry activates automated Section 65B audit trails and queries Indian FIU-registered VASP mempools.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 bg-theme-surface-secondary hover:bg-theme-surface-tertiary text-theme-fg rounded-md font-space text-xs border border-theme-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold rounded-md text-xs shadow-md transition-colors"
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
