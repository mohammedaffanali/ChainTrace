'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChainTraceLogo from '../common/ChainTraceLogo';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  isPrimary?: boolean;
}

interface NavSection {
  sectionTitle: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    sectionTitle: 'COMMAND',
    items: [
      { title: 'Command Dashboard', href: '/dashboard', icon: 'space_dashboard' },
    ],
  },
  {
    sectionTitle: 'INVESTIGATE',
    items: [
      {
        title: 'VASP Attribution',
        href: '/vasp-attribution',
        icon: 'radar',
        badge: 'CORE ENGINE',
        badgeColor: 'bg-[#B45309]/20 text-[#B45309] dark:text-[#F59E0B] border-[#B45309]/40 font-bold',
        isPrimary: true,
      },
      { title: 'Wallet Intelligence', href: '/wallet-intelligence', icon: 'account_balance_wallet' },
      { title: 'Transaction Explorer', href: '/transaction-explorer', icon: 'receipt_long' },
      { title: 'Fund Flow Graph', href: '/fund-flow-graph', icon: 'hub', badge: 'CYTOSCAPE', badgeColor: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' },
      { title: 'Cross-Chain Analysis', href: '/cross-chain-analysis', icon: 'shuffle' },
    ],
  },
  {
    sectionTitle: 'INTELLIGENCE',
    items: [
      { title: 'Risk Intelligence', href: '/risk-intelligence', icon: 'gshield', badge: '328 High', badgeColor: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30' },
      { title: 'VASP Directory', href: '/vasp-attribution#directory', icon: 'domain' },
    ],
  },
  {
    sectionTitle: 'CASE MANAGEMENT',
    items: [
      { title: 'Investigations Register', href: '/investigations', icon: 'folder_supervised', badge: '42' },
      { title: 'Investigation Reports', href: '/reports', icon: 'summarize' },
    ],
  },
  {
    sectionTitle: 'SYSTEM',
    items: [
      { title: 'Chain-of-Custody Logs', href: '/audit-logs', icon: 'history_edu' },
      { title: 'Node Administration', href: '/administration', icon: 'admin_panel_settings' },
    ],
  },
];

interface TacticalSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TacticalSidebar({ isOpen = false, onClose }: TacticalSidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [engineMode, setEngineMode] = React.useState<'PRODUCTION' | 'FALLBACK_DEMO'>('FALLBACK_DEMO');

  React.useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.runtime_mode) setEngineMode(data.runtime_mode);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    const cleanHref = href.split('#')[0];
    if (cleanHref === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(cleanHref);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#1C1D20]/90 backdrop-blur-xl border-r border-white/[0.08] z-50 flex flex-col justify-between select-none shadow-2xl transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand & Platform Emblem */}
          <div className="h-16 px-4 flex items-center justify-between bg-[#15171B]/60 border-b border-white/[0.07] transition-colors">
            <ChainTraceLogo size="sm" />
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-md text-[#9D9A92] hover:text-[#F4F0E6] hover:bg-white/[0.05]"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Tactical Status Pill */}
          <div className="px-4 py-2 bg-[#15171B]/40 border-b border-white/[0.05] flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#9D9A92] font-semibold flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${engineMode === 'PRODUCTION' ? 'bg-[#1B512D] animate-ping' : 'bg-[#ADC178] animate-pulse'}`}></span>
              CHAINTRACE
            </span>
            <span
              className={`font-mono text-[9px] px-2 py-0.5 rounded font-semibold border ${
                engineMode === 'PRODUCTION'
                  ? 'bg-[#1B512D]/20 text-[#ADC178] border-[#1B512D]/40'
                  : 'bg-white/[0.04] text-[#ADC178] border-white/[0.08]'
              }`}
            >
              {engineMode === 'PRODUCTION' ? 'PROD ENCLAVE' : 'DEMO FALLBACK'}
            </span>
          </div>

          {/* Navigation sections */}
          <nav className="p-2 flex flex-col gap-3 overflow-y-auto max-h-[calc(100vh-230px)]">
            {NAV_SECTIONS.map((section) => (
              <div key={section.sectionTitle} className="space-y-1">
                <div className="px-3 pt-2 text-[10px] font-mono font-bold tracking-widest text-[#74736F] uppercase">
                  {section.sectionTitle}
                </div>
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onClose?.()}
                      className={`flex items-center justify-between px-3 py-2 rounded-md transition-all text-xs ${
                        active
                          ? 'bg-white/[0.07] text-[#F4F0E6] border-l-2 border-[#7CB9E8] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] font-semibold'
                          : 'text-[#D8D3C7] hover:bg-white/[0.03] hover:text-[#F4F0E6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-[18px] ${active ? 'text-[#7CB9E8]' : 'text-[#9D9A92]'}`}>
                          {item.icon}
                        </span>
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono border font-semibold ${
                            active
                              ? 'bg-white/15 text-[#FAFAF5] border-white/20'
                              : item.badgeColor || 'bg-white/[0.03] text-[#9D9A92] border-white/[0.06]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Node Ingestion Telemetry Footer */}
        <div className="p-3 bg-[#15171B]/60 border-t border-white/[0.07] flex flex-col gap-2">
          <div className="flex items-center justify-between text-[#9D9A92] font-mono text-[10px]">
            <span>CLEARANCE: {user?.role || 'INVESTIGATOR'}</span>
            <span className="text-[#ADC178] font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B512D] animate-pulse"></span>
              ENCLAVE ACTIVE
            </span>
          </div>
          <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden border border-white/[0.06]">
            <div className="bg-gradient-to-r from-[#1560BD] to-[#2A7F7F] h-full w-[94%] transition-all"></div>
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-[#74736F]">
            <Link href="/" className="text-[#9D9A92] hover:text-[#F4F0E6] transition-colors">
              Landing Page
            </Link>
            <button
              onClick={logout}
              type="button"
              className="text-[#7CB9E8] hover:text-[#F4F0E6] hover:underline cursor-pointer bg-transparent border-none p-0 text-[9px] font-mono transition-colors"
            >
              Lock Enclave
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
