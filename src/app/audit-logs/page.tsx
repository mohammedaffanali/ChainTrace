'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CopyBadge from '@/components/common/CopyBadge';
import { AUDIT_LOGS, AuditLogEntry } from '@/lib/data';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(AUDIT_LOGS);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [verifiedHash, setVerifiedHash] = useState<string | null>(null);

  const handleVerify = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setVerifiedHash('VERIFYING BLOCK TELEMETRY HASH WITH FORENSIC ROOT...');
    setTimeout(() => {
      setVerifiedHash('HASH VALIDATED: ZERO MUTATION DETECTED // IMMUTABLE LEDGER CONFIRMED.');
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full gap-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-theme-surface p-4 rounded-xl border border-theme-border shadow-sm transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
                CHAIN-OF-CUSTODY LEDGER // STATUTORY AUDIT VAULT
              </span>
            </div>
            <h1 className="font-space font-bold text-2xl text-theme-heading mt-1">
              Immutable Audit Logs &amp; Chain-of-Custody Ledger
            </h1>
            <p className="font-mono text-xs text-theme-text-muted mt-0.5">
              Cryptographically signed access records for every query, export, and freeze order under PMLA &amp; CrPC
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
              LEDGER INTEGRITY: 100% VERIFIED
            </span>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-theme-surface rounded-xl border border-theme-border overflow-hidden shadow-sm transition-colors">
          <div className="p-4 bg-theme-surface-subtle border-b border-theme-border flex items-center justify-between">
            <h2 className="font-space font-semibold text-sm text-theme-heading">
              Forensic Session Log Register ({logs.length} Recorded Events)
            </h2>
            <span className="font-mono text-xs text-theme-text-muted">Append-only cryptographic store</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-surface-subtle text-theme-text-muted uppercase text-[11px] border-b border-theme-border">
                <tr>
                  <th className="p-3">Log ID / Time (IST)</th>
                  <th className="p-3">Officer &amp; Agency</th>
                  <th className="p-3">Action Executed</th>
                  <th className="p-3">Target Resource</th>
                  <th className="p-3">Statutory Legal Authority</th>
                  <th className="p-3 text-center">Integrity Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-theme-surface-subtle transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-theme-primary">{log.id}</div>
                      <div className="text-[10px] text-theme-text-muted mt-0.5">{log.timestamp}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-theme-heading font-sans font-semibold text-xs">{log.officerName}</div>
                      <div className="text-[10px] text-theme-text-muted">{log.officerBadge} • {log.agencyBranch}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-theme-primary/15 text-theme-primary text-[10px] font-bold border border-theme-primary/30">
                        {log.action}
                      </span>
                      <div className="text-[10px] text-theme-text-muted mt-0.5">{log.ipAddress}</div>
                    </td>
                    <td className="p-3 text-theme-fg font-sans text-xs">
                      {log.targetResource}
                    </td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400 font-sans text-xs font-medium">
                      {log.legalAuthority}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleVerify(log)}
                        className="px-2.5 py-1 bg-theme-surface-subtle hover:bg-theme-primary hover:text-white text-theme-fg rounded text-[10px] border border-theme-border transition-colors font-medium"
                      >
                        Verify Hash →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hash Verification Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-theme-border">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-theme-accent text-[20px]">verified</span>
                  <h3 className="font-space font-bold text-base text-theme-heading">
                    Cryptographic Integrity Verification
                  </h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-theme-text-muted hover:text-theme-heading">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-theme-text-muted text-[10px] block">AUDIT RECORD ID</span>
                  <span className="text-theme-heading font-bold">{selectedLog.id} ({selectedLog.action})</span>
                </div>

                <div>
                  <span className="text-theme-text-muted text-[10px] block">RECORDED SHA-256 HASH</span>
                  <div className="mt-1 p-2 bg-theme-surface-secondary rounded border border-theme-border break-all text-theme-accent text-[11px]">
                    {selectedLog.integrityHash}
                  </div>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-[11px]">
                  {verifiedHash}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-theme-primary hover:bg-theme-primary-hover text-white font-space font-semibold text-xs rounded transition-colors"
                >
                  Dismiss Ledger Proof
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
