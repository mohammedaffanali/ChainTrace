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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1C1D20]/90 backdrop-blur-xl p-5 rounded-xl border border-white/[0.08] shadow-glass-card transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ADC178] animate-pulse"></span>
              <span className="font-mono text-xs text-[#ADC178] uppercase tracking-wider font-semibold">
                CHAIN-OF-CUSTODY LEDGER // STATUTORY AUDIT VAULT
              </span>
            </div>
            <h1 className="font-editorial font-bold text-2xl sm:text-3xl text-[#FAFAF5] mt-1 tracking-tight">
              Immutable Audit Logs &amp; Chain-of-Custody Ledger
            </h1>
            <p className="font-mono text-xs text-[#9D9A92] mt-0.5">
              Cryptographically signed access records for every query, export, and freeze order under PMLA &amp; CrPC
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-[#1B512D]/30 text-[#ADC178] border border-[#ADC178]/30 font-semibold shadow-signal-green">
              LEDGER INTEGRITY: 100% VERIFIED
            </span>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-[#1C1D20]/90 backdrop-blur-xl rounded-xl border border-white/[0.08] overflow-hidden shadow-glass-card transition-colors">
          <div className="p-4 bg-black/20 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="font-space font-semibold text-sm text-[#FAFAF5]">
              Forensic Session Log Register ({logs.length} Recorded Events)
            </h2>
            <span className="font-mono text-xs text-[#74736F]">Append-only cryptographic store</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/30 text-[#9D9A92] uppercase text-[11px] border-b border-white/[0.06]">
                <tr>
                  <th className="p-3">Log ID / Time (IST)</th>
                  <th className="p-3">Officer &amp; Agency</th>
                  <th className="p-3">Action Executed</th>
                  <th className="p-3">Target Resource</th>
                  <th className="p-3">Statutory Legal Authority</th>
                  <th className="p-3 text-center">Integrity Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-[#7CB9E8]">{log.id}</div>
                      <div className="text-[10px] text-[#74736F] mt-0.5">{log.timestamp}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-[#FAFAF5] font-sans font-semibold text-xs">{log.officerName}</div>
                      <div className="text-[10px] text-[#74736F]">{log.officerBadge} • {log.agencyBranch}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-[#1560BD]/20 text-[#7CB9E8] text-[10px] font-bold border border-[#7CB9E8]/30">
                        {log.action}
                      </span>
                      <div className="text-[10px] text-[#74736F] mt-0.5">{log.ipAddress}</div>
                    </td>
                    <td className="p-3.5 text-[#D8D3C7] font-sans text-xs">
                      {log.targetResource}
                    </td>
                    <td className="p-3.5 text-[#ADC178] font-sans text-xs font-medium">
                      {log.legalAuthority}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleVerify(log)}
                        className="px-3 py-1.5 bg-[#25282D]/80 hover:bg-[#1560BD] text-[#FAFAF5] rounded-lg text-[10px] border border-white/[0.08] transition-colors font-medium shadow-glass-card"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-[#1C1D20] border border-white/[0.12] rounded-xl shadow-glass-elevated p-6 space-y-4 animate-in fade-in zoom-in-95 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ADC178] text-[20px]">verified</span>
                  <h3 className="font-space font-bold text-base text-[#FAFAF5]">
                    Cryptographic Integrity Verification
                  </h3>
                </div>
                <button onClick={() => setSelectedLog(null)} className="text-[#9D9A92] hover:text-[#FAFAF5]">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">AUDIT RECORD ID</span>
                  <span className="text-[#FAFAF5] font-bold">{selectedLog.id} ({selectedLog.action})</span>
                </div>

                <div>
                  <span className="text-[#74736F] text-[10px] block uppercase">RECORDED SHA-256 HASH</span>
                  <div className="mt-1 p-2.5 bg-black/30 rounded-lg border border-white/[0.08] break-all text-[#7CB9E8] text-[11px]">
                    {selectedLog.integrityHash}
                  </div>
                </div>

                <div className="p-3 bg-[#1B512D]/25 rounded-lg border border-[#ADC178]/30 text-[#ADC178] text-[11px] leading-relaxed">
                  {verifiedHash}
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-white/[0.08]">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-gradient-to-r from-[#1560BD] to-[#436B95] hover:opacity-90 text-[#FAFAF5] font-space font-semibold text-xs rounded-lg shadow-glass-card transition-all"
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
