'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CASES, WALLETS, VASP_LIST } from '@/lib/data';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredCases = CASES.filter(c =>
    c.id.toLowerCase().includes(query.toLowerCase()) ||
    c.title.toLowerCase().includes(query.toLowerCase()) ||
    c.agency.toLowerCase().includes(query.toLowerCase())
  );

  const filteredWallets = WALLETS.filter(w =>
    w.address.toLowerCase().includes(query.toLowerCase()) ||
    w.clusterLabel.toLowerCase().includes(query.toLowerCase()) ||
    w.chain.toLowerCase().includes(query.toLowerCase())
  );

  const filteredVasps = VASP_LIST.filter(v =>
    v.name.toLowerCase().includes(query.toLowerCase()) ||
    v.country.toLowerCase().includes(query.toLowerCase()) ||
    v.fiuRegNo.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-theme-surface border border-theme-border rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors">
        <div className="p-3 bg-theme-surface-secondary border-b border-theme-border flex items-center gap-3">
          <span className="material-symbols-outlined text-theme-primary text-[20px]">search</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a Case ID, Indian VASP, Wallet Hash, or section name..."
            className="w-full bg-transparent text-theme-heading font-mono text-sm placeholder:text-theme-text-muted focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-theme-surface text-[10px] font-mono text-theme-text-muted border border-theme-border">
            ESC
          </kbd>
        </div>

        <div className="p-3 max-h-96 overflow-y-auto space-y-4 text-xs">
          {/* Quick Navigation Targets */}
          {!query && (
            <div>
              <div className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-2">
                Quick Jump
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleNavigate('/investigations')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-500">folder_supervised</span>
                  <span>Investigations</span>
                </button>
                <button
                  onClick={() => handleNavigate('/fund-flow-graph')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-cyan-500">hub</span>
                  <span>Fund Flow Graph</span>
                </button>
                <button
                  onClick={() => handleNavigate('/vasp-attribution')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-500">domain</span>
                  <span>VASP Attribution</span>
                </button>
                <button
                  onClick={() => handleNavigate('/wallet-intelligence')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-500">account_balance_wallet</span>
                  <span>Wallet Matrix</span>
                </button>
                <button
                  onClick={() => handleNavigate('/reports')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-purple-500">summarize</span>
                  <span>Sec 65B Reports</span>
                </button>
                <button
                  onClick={() => handleNavigate('/audit-logs')}
                  className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary border border-theme-border flex items-center gap-2 text-left text-theme-fg transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-500">history_edu</span>
                  <span>Chain of Custody</span>
                </button>
              </div>
            </div>
          )}

          {/* Cases */}
          {filteredCases.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1.5">
                Active Cases ({filteredCases.length})
              </div>
              <div className="space-y-1">
                {filteredCases.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNavigate(`/investigations/${c.id}`)}
                    className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary cursor-pointer border border-theme-border flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-theme-primary font-semibold">{c.id}</span>
                        <span className="text-theme-heading font-medium">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-theme-text-secondary mt-0.5">
                        {c.agency} • Exposure: <strong className="text-emerald-600 dark:text-emerald-400">{c.totalExposureINR}</strong>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-300 border border-red-500/30">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wallets */}
          {filteredWallets.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1.5">
                Flagged Wallets ({filteredWallets.length})
              </div>
              <div className="space-y-1">
                {filteredWallets.slice(0, 3).map((w) => (
                  <div
                    key={w.address}
                    onClick={() => handleNavigate('/wallet-intelligence')}
                    className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary cursor-pointer border border-theme-border flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-theme-accent font-medium">{w.address}</span>
                        <span className="text-theme-text-muted">({w.chain})</span>
                      </div>
                      <div className="text-[11px] text-theme-fg">{w.clusterLabel}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-theme-heading font-semibold">{w.balanceINR}</div>
                      <div className="text-[10px] text-red-600 dark:text-red-400">Risk: {w.riskScore}/100</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VASPs */}
          {filteredVasps.length > 0 && (
            <div>
              <div className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1.5">
                VASP Gateways ({filteredVasps.length})
              </div>
              <div className="space-y-1">
                {filteredVasps.slice(0, 3).map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleNavigate('/vasp-attribution')}
                    className="p-2 rounded bg-theme-surface-secondary hover:bg-theme-surface-tertiary cursor-pointer border border-theme-border flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="text-theme-heading font-medium">{v.name}</span>
                      <div className="text-[10px] font-mono text-theme-text-muted">{v.fiuRegNo}</div>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">{v.estimatedVolume24hINR} / 24h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-2 bg-theme-surface-secondary border-t border-theme-border text-right">
          <span className="text-[10px] font-mono text-theme-text-muted">
            Press ESC to dismiss • Press ↵ to view
          </span>
        </div>
      </div>
    </div>
  );
}
