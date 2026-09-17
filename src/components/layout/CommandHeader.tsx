'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CURRENT_OFFICER } from '@/lib/data';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useTelemetryWebSocket } from '@/hooks/useTelemetryWebSocket';

interface CommandHeaderProps {
  onOpenSearch?: () => void;
  onToggleMobileNav?: () => void;
}

export default function CommandHeader({ onOpenSearch, onToggleMobileNav }: CommandHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const { user, logout } = useAuth();
  const { isConnected } = useTelemetryWebSocket();

  return (
    <>
      <header className="fixed top-6 left-0 lg:left-64 right-0 h-14 bg-theme-surface/90 backdrop-blur-xl z-30 px-3 sm:px-5 flex items-center justify-between gap-3 sm:gap-4 border-b border-theme-border shadow-lg transition-colors">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 rounded-md bg-theme-surface-subtle text-theme-fg hover:bg-theme-surface border border-theme-border shrink-0 cursor-pointer"
          aria-label="Toggle navigation drawer"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Global Forensic Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div
            onClick={onOpenSearch}
            className="relative w-full flex items-center cursor-pointer group"
          >
            <span className="material-symbols-outlined absolute left-3 text-theme-text-muted text-[18px] group-hover:text-theme-primary transition-colors">
              search
            </span>
            <input
              readOnly
              onClick={onOpenSearch}
              placeholder="Search Address (0x..., bc1..., TRC...), TX Hash, Case ID, or VASP..."
              className="w-full h-9 pl-9 pr-16 bg-theme-surface-subtle text-theme-fg rounded-md font-mono text-xs placeholder:text-theme-text-muted border border-theme-border group-hover:border-theme-primary/50 transition-colors cursor-pointer focus:outline-none"
            />
            <div className="absolute right-2 px-1.5 py-0.5 rounded bg-theme-surface text-theme-text-muted font-mono text-[10px] border border-theme-border">
              ⌘K
            </div>
          </div>
        </div>

        {/* Tactical Actions & Officer Profile */}
        <div className="flex items-center gap-3">
          {/* Directive & Telemetry indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-theme-surface-subtle border border-theme-border">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="font-mono text-[10px] text-theme-text-muted tracking-wider uppercase">
              {isConnected ? 'WS LIVE TELEMETRY' : 'DEMO STREAM'} {'//'} FIU-IND
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Intelligence Alerts"
              className="relative h-9 w-9 flex items-center justify-center rounded-md bg-theme-surface-subtle text-theme-fg hover:bg-theme-surface border border-theme-border transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white font-mono text-[10px] flex items-center justify-center font-bold shadow-sm">
                4
              </span>
            </button>

            <button
              onClick={() => setShowTerminal(!showTerminal)}
              title="Forensic CLI Shell"
              className="h-9 w-9 flex items-center justify-center rounded-md bg-theme-surface-subtle text-theme-fg hover:bg-theme-surface border border-theme-border transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">terminal</span>
            </button>

            <ThemeToggle />

            <Link
              href="/reports"
              title="Generate Section 65B Electronic Evidence Certificate"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-theme-primary hover:opacity-90 text-white font-mono text-xs font-semibold shadow-md shadow-theme-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Sec 65B Cert</span>
            </Link>
          </div>

          {/* Officer Credentials Block */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-theme-border">
            <div className="flex flex-col text-right">
              <span className="font-space font-semibold text-xs text-theme-heading leading-none">
                {user?.officerName || CURRENT_OFFICER.name}
              </span>
              <span className="font-mono text-[10px] text-theme-primary mt-1 leading-none">
                {user?.badgeId || CURRENT_OFFICER.badgeId} • FIU Cell
              </span>
            </div>
            <button
              onClick={logout}
              type="button"
              title="Lock Enclave Session (Sign Out)"
              className="w-8 h-8 rounded-md bg-gradient-to-tr from-theme-primary to-theme-accent flex items-center justify-center text-white shadow-inner hover:ring-2 hover:ring-theme-primary transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Flyout */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-96 bg-theme-surface border border-theme-border rounded-lg shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-theme-border">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span className="font-space font-bold text-sm text-theme-heading">Priority Threat Intercepts</span>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-theme-text-muted hover:text-theme-heading"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 max-h-80 overflow-y-auto">
            <div className="p-2.5 rounded bg-theme-surface-secondary border-l-2 border-red-500 text-xs">
              <div className="flex items-center justify-between text-red-500 font-mono text-[10px] font-semibold">
                <span>CRITICAL // TRON-USDT</span>
                <span>2m ago</span>
              </div>
              <p className="text-theme-fg mt-1 font-medium">
                ₹2.22 Cr (250K USDT) routed from Mule Node into Surat P2P cashout desk.
              </p>
              <span className="font-mono text-[9px] text-theme-text-muted">Case: CASE-2026-001 (DarkTide)</span>
            </div>

            <div className="p-2.5 rounded bg-theme-surface-secondary border-l-2 border-amber-500 text-xs">
              <div className="flex items-center justify-between text-amber-500 font-mono text-[10px] font-semibold">
                <span>WARNING // FIU NOTICE</span>
                <span>18m ago</span>
              </div>
              <p className="text-theme-fg mt-1 font-medium">
                Offshore exchange HTX failed statutory 72hr STR response timeline.
              </p>
              <span className="font-mono text-[9px] text-theme-text-muted">FIU Mandate Ref: PMLA/STR-094</span>
            </div>

            <div className="p-2.5 rounded bg-theme-surface-secondary border-l-2 border-theme-accent text-xs">
              <div className="flex items-center justify-between text-theme-accent font-mono text-[10px] font-semibold">
                <span>CROSS-CHAIN ANOMALY</span>
                <span>42m ago</span>
              </div>
              <p className="text-theme-fg mt-1 font-medium">
                120,000 USDC bridged across Wormhole Ethereum-to-Solana within single block.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-theme-border flex justify-between">
            <Link
              href="/risk-intelligence"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-theme-primary hover:underline font-mono font-medium"
            >
              View All Threat Vectors →
            </Link>
          </div>
        </div>
      )}

      {/* Forensic CLI Terminal Modal */}
      {showTerminal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-theme-surface border border-theme-border rounded-lg shadow-2xl overflow-hidden transition-colors">
            <div className="px-4 py-2 bg-theme-surface-secondary border-b border-theme-border flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-theme-accent">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>CHAINTRACE FORENSIC CLI SHELL // v2.6.4 (SECURE ENCLAVE)</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="text-theme-text-muted hover:text-theme-heading"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 font-mono text-xs text-theme-fg space-y-2 max-h-96 overflow-y-auto">
              <p className="text-emerald-500 font-semibold">
                [INIT] Authenticated Session: DEL-CYBER-8842 (Insp. V. Sharma)
              </p>
              <p className="text-theme-text-muted">
                [NODE] Connected to Block Indexer Node: 10.24.8.192 (New Delhi Cluster)
              </p>
              <p className="text-cyan-300">
                $ chaintrace-cli --case CASE-2026-001 --trace-hops 3 --currency INR
              </p>
              <div className="p-2 bg-theme-surface-secondary rounded text-[11px] border border-theme-border text-theme-fg">
                Found 184 correlated addresses across 4 chains.<br />
                Total Layered Volume: ₹42,85,40,000 INR.<br />
                Highest Exposure: 0x71C8a77B280f9...3aF9 (Risk: 96/100, CRITICAL).<br />
                FIU Subpoena Status: 4 Dispatched, 2 Complied (CoinDCX, WazirX).
              </div>
              <p className="text-yellow-400">
                [READY] Type commands or use GUI navigation bars.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
