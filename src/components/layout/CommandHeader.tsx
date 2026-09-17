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
      <header className="fixed top-6 left-0 lg:left-64 right-0 h-14 bg-[#1C1D20]/80 backdrop-blur-xl z-30 px-3 sm:px-5 flex items-center justify-between gap-3 sm:gap-4 border-b border-white/[0.08] shadow-lg transition-colors">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-1.5 rounded-md bg-white/[0.04] text-[#D8D3C7] hover:bg-white/[0.08] border border-white/[0.08] shrink-0 cursor-pointer"
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
            <span className="material-symbols-outlined absolute left-3 text-[#9D9A92] text-[18px] group-hover:text-[#7CB9E8] transition-colors">
              search
            </span>
            <input
              readOnly
              onClick={onOpenSearch}
              placeholder="Search Address (0x..., bc1..., TRC...), TX Hash, Case ID, or VASP..."
              className="w-full h-9 pl-9 pr-16 bg-[#101827]/80 text-[#F4F0E6] rounded-md font-mono text-xs placeholder:text-[#74736F] border border-white/[0.08] group-hover:border-[#436B95]/60 transition-colors cursor-pointer focus:outline-none"
            />
            <div className="absolute right-2 px-1.5 py-0.5 rounded bg-white/[0.04] text-[#9D9A92] font-mono text-[10px] border border-white/[0.06]">
              ⌘K
            </div>
          </div>
        </div>

        {/* Tactical Actions & Officer Profile */}
        <div className="flex items-center gap-3">
          {/* Directive & Telemetry indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#101827]/60 border border-white/[0.06]">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#1B512D] animate-pulse' : 'bg-[#ADC178]'}`}></span>
            <span className="font-mono text-[10px] text-[#9D9A92] tracking-wider uppercase">
              {isConnected ? 'WS LIVE TELEMETRY' : 'DEMO STREAM'} {'//'} FIU-IND
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              title="Intelligence Alerts"
              className="relative h-9 w-9 flex items-center justify-center rounded-md bg-white/[0.04] text-[#D8D3C7] hover:text-[#F4F0E6] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">notifications</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#960018] text-[#FAFAF5] font-mono text-[10px] flex items-center justify-center font-bold shadow-sm">
                4
              </span>
            </button>

            <button
              onClick={() => setShowTerminal(!showTerminal)}
              title="Forensic CLI Shell"
              className="h-9 w-9 flex items-center justify-center rounded-md bg-white/[0.04] text-[#D8D3C7] hover:text-[#F4F0E6] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">terminal</span>
            </button>

            <ThemeToggle />

            <Link
              href="/reports"
              title="Generate Section 65B Electronic Evidence Certificate"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1560BD] hover:bg-[#436B95] text-[#FAFAF5] font-mono text-xs font-semibold shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Sec 65B Cert</span>
            </Link>
          </div>

          {/* Officer Credentials Block */}
          <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
            <div className="flex flex-col text-right">
              <span className="font-space font-semibold text-xs text-[#F4F0E6] leading-none">
                {user?.officerName || CURRENT_OFFICER.name}
              </span>
              <span className="font-mono text-[10px] text-[#7CB9E8] mt-1 leading-none">
                {user?.badgeId || CURRENT_OFFICER.badgeId} • FIU Cell
              </span>
            </div>
            <button
              onClick={logout}
              type="button"
              title="Lock Enclave Session (Sign Out)"
              className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-[#D8D3C7] hover:text-[#F4F0E6] flex items-center justify-center transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications Drawer Flyout */}
      {showNotifications && (
        <div className="fixed top-20 right-6 w-96 bg-[#1C1D20]/95 backdrop-blur-2xl border border-white/[0.12] rounded-lg shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#960018] animate-ping"></span>
              <span className="font-space font-bold text-sm text-[#F4F0E6]">Priority Threat Intercepts</span>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-[#9D9A92] hover:text-[#F4F0E6] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 max-h-80 overflow-y-auto">
            <div className="p-2.5 rounded bg-[#15171B] border-l-2 border-[#960018] text-xs">
              <div className="flex items-center justify-between text-[#C44536] font-mono text-[10px] font-semibold">
                <span>CRITICAL // TRON-USDT</span>
                <span>2m ago</span>
              </div>
              <p className="text-[#E8E8E3] mt-1 font-medium">
                ₹2.22 Cr (250K USDT) routed from Mule Node into Surat P2P cashout desk.
              </p>
              <span className="font-mono text-[9px] text-[#9D9A92]">Case: CASE-2026-001 (DarkTide)</span>
            </div>

            <div className="p-2.5 rounded bg-[#15171B] border-l-2 border-[#ADC178] text-xs">
              <div className="flex items-center justify-between text-[#ADC178] font-mono text-[10px] font-semibold">
                <span>WARNING // FIU NOTICE</span>
                <span>18m ago</span>
              </div>
              <p className="text-[#E8E8E3] mt-1 font-medium">
                Offshore exchange HTX failed statutory 72hr STR response timeline.
              </p>
              <span className="font-mono text-[9px] text-[#9D9A92]">FIU Mandate Ref: PMLA/STR-094</span>
            </div>

            <div className="p-2.5 rounded bg-[#15171B] border-l-2 border-[#2A7F7F] text-xs">
              <div className="flex items-center justify-between text-[#2A7F7F] font-mono text-[10px] font-semibold">
                <span>CROSS-CHAIN ANOMALY</span>
                <span>42m ago</span>
              </div>
              <p className="text-[#E8E8E3] mt-1 font-medium">
                120,000 USDC bridged across Wormhole Ethereum-to-Solana within single block.
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/[0.08] flex justify-between">
            <Link
              href="/risk-intelligence"
              onClick={() => setShowNotifications(false)}
              className="text-xs text-[#7CB9E8] hover:underline font-mono font-medium"
            >
              View All Threat Vectors →
            </Link>
          </div>
        </div>
      )}

      {/* Forensic CLI Terminal Modal */}
      {showTerminal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#1C1D20]/95 backdrop-blur-2xl border border-white/[0.12] rounded-lg shadow-2xl overflow-hidden transition-colors">
            <div className="px-4 py-2.5 bg-[#15171B] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-[#2A7F7F]">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>CHAINTRACE FORENSIC CLI SHELL // v2.6.4 (SECURE ENCLAVE)</span>
              </div>
              <button
                onClick={() => setShowTerminal(false)}
                className="text-[#9D9A92] hover:text-[#F4F0E6] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="p-4 font-mono text-xs text-[#E8E8E3] space-y-2 max-h-96 overflow-y-auto">
              <p className="text-[#ADC178] font-semibold">
                [INIT] Authenticated Session: DEL-CYBER-8842 (Insp. V. Sharma)
              </p>
              <p className="text-[#9D9A92]">
                [NODE] Connected to Block Indexer Node: 10.24.8.192 (New Delhi Cluster)
              </p>
              <p className="text-[#7CB9E8]">
                $ chaintrace-cli --case CASE-2026-001 --trace-hops 3 --currency INR
              </p>
              <div className="p-2.5 bg-[#101827] rounded text-[11px] border border-white/[0.06] text-[#D8D3C7]">
                Found 184 correlated addresses across 4 chains.<br />
                Total Layered Volume: ₹42,85,40,000 INR.<br />
                Highest Exposure: 0x71C8a77B280f9...3aF9 (Risk: 96/100, CRITICAL).<br />
                FIU Subpoena Status: 4 Dispatched, 2 Complied (CoinDCX, WazirX).
              </div>
              <p className="text-[#ADC178]">
                [READY] Type commands or use GUI navigation bars.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
