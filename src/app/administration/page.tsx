'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

interface ClusterNode {
  id: string;
  name: string;
  chain: string;
  status: 'ONLINE' | 'SYNCING' | 'MAINTENANCE';
  latency: string;
  tps: string;
  blocksBehind: number;
}

export interface OfficerUser {
  id: string;
  badge_id: string;
  email: string;
  full_name: string;
  designation: string;
  agency: string;
  role: 'INVESTIGATOR' | 'ANALYST' | 'ADMINISTRATOR';
  is_active: boolean;
  created_at?: string;
  last_login_at?: string;
}

const PRESET_AGENCIES = [
  'Central Bureau of Investigation (CBI)',
  'Directorate of Enforcement (ED)',
  'Delhi Police Cyber Command & FIU-IND Liaison',
  'National Investigation Agency (NIA)',
  'Financial Intelligence Unit - India (FIU-IND)',
  'State Police Cyber Crime Cell',
];

const NODES: ClusterNode[] = [
  { id: 'NODE-01', name: 'New Delhi TRON Full-Node', chain: 'TRON (TRC20)', status: 'ONLINE', latency: '42ms', tps: '8,420 TX/s', blocksBehind: 0 },
  { id: 'NODE-02', name: 'Mumbai Ethereum Geth Archive', chain: 'ETHEREUM', status: 'ONLINE', latency: '65ms', tps: '4,100 TX/s', blocksBehind: 0 },
  { id: 'NODE-03', name: 'Bangalore Bitcoin Core Node', chain: 'BITCOIN', status: 'ONLINE', latency: '88ms', tps: '1,840 TX/s', blocksBehind: 0 },
  { id: 'NODE-04', name: 'Hyderabad Solana Validator Intercept', chain: 'SOLANA', status: 'ONLINE', latency: '35ms', tps: '3,200 TX/s', blocksBehind: 0 },
  { id: 'NODE-05', name: 'Chennai Polygon Bor Node', chain: 'POLYGON', status: 'ONLINE', latency: '52ms', tps: '860 TX/s', blocksBehind: 0 },
];

export default function AdministrationPage() {
  const { user, role } = useAuth();


  const [activeTab, setActiveTab] = useState<'USERS' | 'NODES'>('USERS');
  const [usersList, setUsersList] = useState<OfficerUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Modal State
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  // Server-verified admin role — null = checking, true/false = result
  const [verifiedAdmin, setVerifiedAdmin] = useState<boolean | null>(null);

  // Verify role server-side via /api/auth/me on mount
  useEffect(() => {
    async function verifyAdminRole() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const me = await res.json();
          setVerifiedAdmin(me.role === 'ADMINISTRATOR');
        } else {
          setVerifiedAdmin(false);
        }
      } catch {
        setVerifiedAdmin(false);
      }
    }
    verifyAdminRole();
  }, []);

  // Authoritative admin flag — server-verified role takes precedence
  const isAdmin = verifiedAdmin === true;
  const [createdCredentials, setCreatedCredentials] = useState<{ badge_id: string; pin: string; name: string } | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [email, setEmail] = useState('');
  const [agency, setAgency] = useState(PRESET_AGENCIES[0]);
  const [designation, setDesignation] = useState('Cyber Forensic Investigator');
  const [selectedRole, setSelectedRole] = useState<'INVESTIGATOR' | 'ANALYST' | 'ADMINISTRATOR'>('INVESTIGATOR');
  const [securityPin, setSecurityPin] = useState('SecurePin2026!');

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUserError('');
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      } else {
        const err = await res.json().catch(() => ({}));
        setUserError(err.detail || 'Failed to load officer directory.');
      }
    } catch {
      setUserError('Network error connecting to user registry.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleToggleStatus = async (targetUser: OfficerUser) => {
    if (targetUser.id === user?.id && targetUser.is_active) {
      alert('Security Policy: You cannot revoke your own administrator clearance.');
      return;
    }

    const confirmMsg = targetUser.is_active
      ? `Revoke clearance for officer ${targetUser.full_name} (${targetUser.badge_id})?`
      : `Re-activate clearance for officer ${targetUser.full_name} (${targetUser.badge_id})?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/users/${targetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !targetUser.is_active }),
      });

      if (res.ok) {
        setActionSuccessMsg(`Status updated for ${targetUser.badge_id}`);
        setTimeout(() => setActionSuccessMsg(''), 4000);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update clearance status.');
      }
    } catch {
      alert('Network error updating clearance status.');
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badge_id: badgeId.trim(),
          email: email.trim(),
          password: securityPin.trim(),
          full_name: fullName.trim(),
          designation: designation.trim(),
          agency: agency.trim(),
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProvisionError(data.detail || 'Failed to provision officer account.');
        setIsSubmitting(false);
        return;
      }

      setCreatedCredentials({
        badge_id: data.badge_id,
        pin: securityPin,
        name: data.full_name,
      });

      fetchUsers();
      setFullName('');
      setBadgeId('');
      setEmail('');
      setSecurityPin('SecurePin2026!');
    } catch {
      setProvisionError('Network error provisioning user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeStyle = (r: string) => {
    switch (r) {
      case 'ADMINISTRATOR':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'ANALYST':
        return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  const totalOfficers = usersList.length;
  const activeInvestigators = usersList.filter((u) => u.role === 'INVESTIGATOR' && u.is_active).length;
  const activeAnalysts = usersList.filter((u) => u.role === 'ANALYST' && u.is_active).length;
  const activeAdmins = usersList.filter((u) => u.role === 'ADMINISTRATOR' && u.is_active).length;
  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-theme-primary animate-pulse"></span>
              <span className="font-mono text-xs text-theme-primary uppercase tracking-wider font-semibold">
                SYSTEM ENCLAVE ADMINISTRATION // TIER-1 SECURITY
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Node &amp; Clearance Administration
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Forensic user account provisioning, role-based access control, and GovNet indexer cluster telemetry.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-theme-surface-subtle border border-theme-border rounded-lg self-start sm:self-auto font-mono text-xs">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'USERS'
                  ? 'bg-theme-primary text-white shadow-sm'
                  : 'text-theme-text-muted hover:text-theme-heading'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">badge</span>
              <span>Officer Directory</span>
            </button>
            <button
              onClick={() => setActiveTab('NODES')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'NODES'
                  ? 'bg-theme-primary text-white shadow-sm'
                  : 'text-theme-text-muted hover:text-theme-heading'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">dns</span>
              <span>Cluster Nodes</span>
            </button>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'USERS' && (
          <div className="space-y-5">
            {verifiedAdmin === null ? (
              <div className="p-6 bg-theme-surface rounded-xl border border-theme-border text-center">
                <span className="material-symbols-outlined animate-spin text-theme-text-muted">sync</span>
                <p className="text-xs font-mono text-theme-text-muted mt-2">VERIFYING ADMINISTRATOR CLEARANCE...</p>
              </div>
            ) : !isAdmin ? (
              <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold font-space text-base">
                  <span className="material-symbols-outlined">gshield</span>
                  <span>SUPERVISORY CLEARANCE REQUIRED</span>
                </div>
                <p className="text-xs text-theme-fg leading-relaxed">
                  The Officer Clearance Directory and Account Provisioning console is restricted to certified 
                  <strong> Enclave Administrators (ADMINISTRATOR)</strong> pursuant to LEA Data Governance protocols.
                </p>
                <div className="font-mono text-[11px] text-theme-text-muted pt-1">
                  Current Session Clearance: <span className="font-bold text-theme-heading">{user?.role || role}</span> (Badge: {user?.badgeId})
                </div>
              </div>
            ) : (
              <>
                {/* Stat Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm">
                    <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Total Personnel</div>
                    <div className="text-2xl font-space font-bold text-theme-heading mt-1">{totalOfficers}</div>
                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">Enclave Authorized</div>
                  </div>
                  <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm">
                    <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Field Investigators</div>
                    <div className="text-2xl font-space font-bold text-blue-600 dark:text-blue-400 mt-1">{activeInvestigators}</div>
                    <div className="text-[10px] font-mono text-theme-text-muted mt-0.5">Active Clearance</div>
                  </div>
                  <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm">
                    <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Forensic Analysts</div>
                    <div className="text-2xl font-space font-bold text-cyan-600 dark:text-cyan-400 mt-1">{activeAnalysts}</div>
                    <div className="text-[10px] font-mono text-theme-text-muted mt-0.5">Deep Tracing Clearance</div>
                  </div>
                  <div className="p-4 bg-theme-surface rounded-xl border border-theme-border shadow-sm">
                    <div className="text-[10px] font-mono text-theme-text-muted uppercase font-semibold">Enclave Admins</div>
                    <div className="text-2xl font-space font-bold text-amber-600 dark:text-amber-400 mt-1">{activeAdmins}</div>
                    <div className="text-[10px] font-mono text-theme-text-muted mt-0.5">Root Provisioners</div>
                  </div>
                </div>

                {/* Main Officer Table Card */}
                <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
                  <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="font-space font-semibold text-sm text-theme-heading">
                        Authorized Forensic Personnel Register
                      </h2>
                      <p className="text-[11px] font-mono text-theme-text-muted mt-0.5">
                        Statutory digital identities authorized to access blockchain intelligence and issue Section 65B dossiers.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setCreatedCredentials(null);
                        setProvisionError('');
                        setShowProvisionModal(true);
                      }}
                      className="px-3.5 py-2 bg-theme-primary text-white hover:bg-theme-primary/90 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">person_add</span>
                      <span>Provision New Officer</span>
                    </button>
                  </div>

                  {userError && (
                    <div className="p-3 bg-red-500/10 border-b border-red-500/20 text-red-500 font-mono text-xs">
                      {userError}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[10px] border-b border-theme-border">
                        <tr>
                          <th className="p-3.5">Officer &amp; Badge ID</th>
                          <th className="p-3.5">Agency &amp; Contact</th>
                          <th className="p-3.5 text-center">Clearance Tier</th>
                          <th className="p-3.5 text-center">Clearance Status</th>
                          <th className="p-3.5 text-center">Last Login</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-theme-border">
                        {isLoadingUsers ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-theme-text-muted font-mono text-xs">
                              Loading forensic officer directory...
                            </td>
                          </tr>
                        ) : usersList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-theme-text-muted font-mono text-xs">
                              No officers found in directory.
                            </td>
                          </tr>
                        ) : (
                          usersList.map((u) => {
                            const isSelf = u.id === user?.id;
                            return (
                              <tr key={u.id} className="hover:bg-theme-surface-subtle transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-theme-heading font-sans text-xs">
                                    {u.full_name} {isSelf && <span className="text-[10px] font-mono text-theme-primary font-normal">(You)</span>}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="px-1.5 py-0.2 rounded bg-theme-surface-secondary border border-theme-border text-[10px] font-mono font-bold text-theme-primary">
                                      {u.badge_id}
                                    </span>
                                    <span className="text-[11px] text-theme-text-muted">{u.designation}</span>
                                  </div>
                                </td>

                                <td className="p-3.5">
                                  <div className="text-theme-fg font-sans text-xs font-medium">{u.agency}</div>
                                  <div className="text-[10px] text-theme-text-muted font-mono mt-0.5">{u.email}</div>
                                </td>

                                <td className="p-3.5 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeStyle(u.role)}`}>
                                    {u.role}
                                  </span>
                                </td>

                                <td className="p-3.5 text-center">
                                  {u.is_active ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      ACTIVE
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                      REVOKED
                                    </span>
                                  )}
                                </td>

                                <td className="p-3.5 text-center text-theme-text-muted text-[11px]">
                                  {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                                </td>

                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => handleToggleStatus(u)}
                                    disabled={isSelf && u.is_active}
                                    className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold border transition-all cursor-pointer ${
                                      isSelf && u.is_active
                                        ? 'opacity-40 cursor-not-allowed bg-theme-surface-subtle text-theme-text-muted border-theme-border'
                                        : u.is_active
                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                    }`}
                                  >
                                    {u.is_active ? 'Revoke Clearance' : 'Restore Clearance'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: CLUSTER NODES & HSM */}
        {activeTab === 'NODES' && (
          <div className="space-y-5">
            {/* Indexer Cluster Nodes */}
            <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
              <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex items-center justify-between">
                <h2 className="font-space font-semibold text-sm text-theme-heading">
                  Sovereign Blockchain RPC Indexer Cluster (GovNet Enclave)
                </h2>
                <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-semibold">5 of 5 Nodes Healthy</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                    <tr>
                      <th className="p-3">Node ID / Location</th>
                      <th className="p-3">Network Chain</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Throughput</th>
                      <th className="p-3 text-right">Latency</th>
                      <th className="p-3 text-center">Blocks Behind</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {NODES.map((node) => (
                      <tr key={node.id} className="hover:bg-theme-surface-subtle transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-theme-heading font-sans text-xs">{node.name}</div>
                          <div className="text-[10px] text-theme-primary mt-0.5 font-semibold">{node.id}</div>
                        </td>
                        <td className="p-3 text-theme-fg">{node.chain}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            {node.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{node.tps}</td>
                        <td className="p-3 text-right text-theme-primary font-medium">{node.latency}</td>
                        <td className="p-3 text-center text-theme-fg">{node.blocksBehind}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security & Access Roles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-theme-surface rounded-xl border border-theme-border space-y-3 shadow-sm transition-colors">
                <h3 className="font-space font-bold text-base text-theme-heading">
                  FIU-IND &amp; Law Enforcement Gateway Sync
                </h3>
                <p className="text-xs text-theme-text-secondary leading-relaxed">
                  Automated ingestion of Suspicious Transaction Reports (STRs) and Cash Transaction Reports (CTRs) pursuant to the Prevention of Money Laundering Rules.
                </p>
                <div className="pt-2 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-theme-text-muted">
                    <span>Last PMLA Sync:</span>
                    <strong className="text-theme-heading">2026-09-10 18:30 IST (Success)</strong>
                  </div>
                  <div className="flex justify-between text-theme-text-muted">
                    <span>Registered VDA Entities:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">28 Active Gateways</strong>
                  </div>
                  <div className="flex justify-between text-theme-text-muted">
                    <span>Subpoena Response SLA:</span>
                    <strong className="text-theme-primary">4.2 Hours (National Average)</strong>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-theme-surface rounded-xl border border-theme-border space-y-3 shadow-sm transition-colors">
                <h3 className="font-space font-bold text-base text-theme-heading">
                  Cryptographic Enclave Key Lifecycle
                </h3>
                <p className="text-xs text-theme-text-secondary leading-relaxed">
                  Hardware Security Modules (HSM) manage digital signing keys for Section 65B court evidence certificates and emergency VDA freezing orders under Section 5 PMLA.
                </p>
                <div className="pt-2 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-theme-text-muted">
                    <span>HSM Security Level:</span>
                    <strong className="text-theme-heading">FIPS 140-3 Level 4</strong>
                  </div>
                  <div className="flex justify-between text-theme-text-muted">
                    <span>Root CA Authority:</span>
                    <strong className="text-theme-primary">GovNet CCA India</strong>
                  </div>
                  <div className="flex justify-between text-theme-text-muted">
                    <span>Key Rotation Epoch:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Active (Next: Dec 2026)</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROVISION NEW OFFICER MODAL */}
        {showProvisionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-6 relative transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-theme-primary text-[20px]">person_add</span>
                  <h3 className="font-space font-bold text-base text-theme-heading">
                    PROVISION FORENSIC OFFICER CLEARANCE
                  </h3>
                </div>
                <button
                  onClick={() => setShowProvisionModal(false)}
                  className="p-1 text-theme-text-muted hover:text-theme-heading rounded-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {createdCredentials ? (
                <div className="my-5 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold font-sans text-sm">
                    <span className="material-symbols-outlined">verified</span>
                    <span>Officer Clearance Provisioned Successfully!</span>
                  </div>
                  <p className="text-theme-fg text-xs font-sans">
                    Secure credentials generated. Provide these to the officer for initial enclave onboarding:
                  </p>
                  <div className="p-3 bg-theme-surface-subtle border border-theme-border rounded-md space-y-1.5">
                    <div>Officer: <strong className="text-theme-heading">{createdCredentials.name}</strong></div>
                    <div>Badge ID: <strong className="text-theme-primary font-bold">{createdCredentials.badge_id}</strong></div>
                    <div>Security PIN / Pass: <strong className="text-theme-gold font-bold">{createdCredentials.pin}</strong></div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowProvisionModal(false)}
                      className="px-4 py-2 bg-theme-primary text-white rounded-md text-xs font-sans font-semibold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProvisionSubmit} className="mt-4 space-y-4 text-xs">
                  {provisionError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500 font-mono text-xs">
                      {provisionError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Officer Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Insp. Amit Verma"
                        className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-sans focus:outline-none focus:border-theme-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Official Badge ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={badgeId}
                        onChange={(e) => setBadgeId(e.target.value)}
                        placeholder="e.g. CBI-CYBER-101"
                        className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono focus:outline-none focus:border-theme-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. a.verma@cbi.gov.in"
                        className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono focus:outline-none focus:border-theme-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Clearance Role / Tier *
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as any)}
                        className="w-full h-9 px-2 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono focus:outline-none focus:border-theme-primary"
                      >
                        <option value="INVESTIGATOR">INVESTIGATOR (Field / FIR Tracing)</option>
                        <option value="ANALYST">ANALYST (Deep Graph / Syndicate)</option>
                        <option value="ADMINISTRATOR">ADMINISTRATOR (Enclave Root)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Law Enforcement Agency *
                      </label>
                      <input
                        type="text"
                        required
                        list="agencies-list"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder="Agency Name"
                        className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-sans focus:outline-none focus:border-theme-primary"
                      />
                      <datalist id="agencies-list">
                        {PRESET_AGENCIES.map((ag) => (
                          <option key={ag} value={ag} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                        Designation / Rank *
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Senior Cyber Investigator"
                        className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-sans focus:outline-none focus:border-theme-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase text-theme-text-muted font-bold mb-1">
                      Temporary Enclave Security PIN / Passphrase *
                    </label>
                    <input
                      type="text"
                      required
                      value={securityPin}
                      onChange={(e) => setSecurityPin(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full h-9 px-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono tracking-wider focus:outline-none focus:border-theme-primary"
                    />
                    <p className="text-[10px] text-theme-text-muted mt-1 font-mono">
                      Must be hashed using bcrypt (cost factor 12) upon transmission.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-theme-border flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProvisionModal(false)}
                      className="px-4 py-2 border border-theme-border rounded-md text-theme-fg hover:bg-theme-surface-subtle font-mono text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-theme-primary text-white rounded-md font-mono text-xs font-semibold hover:bg-theme-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                          <span>Signing &amp; Enrolling...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          <span>Provision Officer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
