'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ChainTraceLogo from '@/components/common/ChainTraceLogo';
import ThemeToggle from '@/components/common/ThemeToggle';
import ChainTraceBackground from '@/components/common/ChainTraceBackground';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [badgeId, setBadgeId] = useState('DEL-CYBER-8842');
  const [agency, setAgency] = useState('Delhi Police Cyber Command & FIU-IND Liaison');
  const [tokenPin, setTokenPin] = useState('OfficerPin8842!');
  const [authenticating, setAuthenticating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setAuthenticating(true);
    setStatusMessage('INITIALIZING ENCLAVE SECURITY PROTOCOL...');

    const res = await login(badgeId, agency, tokenPin);
    if (!res.success) {
      setAuthenticating(false);
      setErrorMessage(res.error || 'Authentication failed. Please check credentials.');
      return;
    }

    setStatusMessage('AUTHENTICATION VERIFIED: ENTERING COMMAND CENTER...');
    setTimeout(() => {
      router.push(redirectTarget);
    }, 400);
  };

  const selectPersona = (badge: string, pin: string, ag: string) => {
    setBadgeId(badge);
    setTokenPin(pin);
    setAgency(ag);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-fg flex flex-col justify-between relative overflow-hidden font-space select-none transition-colors duration-200">
      {/* Dynamic Animated Trace Field Background */}
      <ChainTraceBackground variant="landing" />

      {/* Top Telemetry & Clearance Notice */}
      <div className="relative z-20 w-full bg-theme-surface/90 backdrop-blur-md h-10 px-4 sm:px-8 flex items-center justify-between border-b border-theme-border font-mono text-[11px] transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
          <span className="text-theme-fg font-semibold tracking-wider uppercase">
            CHAINTRACE ENCLAVE // ACCESS GATEWAY
          </span>
          <span className="hidden md:inline text-theme-text-muted">•</span>
          <span className="hidden md:inline text-theme-text-muted font-mono">
            AUTHORIZATION: LAW ENFORCEMENT & FIU-IND COMPLIANT
          </span>
        </div>
        <div className="flex items-center gap-4 text-theme-text-muted">
          <span className="hidden sm:inline font-mono text-[10px]">TLS 1.3 • STATUTORY LOGGING ACTIVE</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 relative">
        <div className="w-full max-w-lg bg-theme-surface border border-theme-border rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative transition-all">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-theme-primary via-theme-accent to-amber-500 rounded-t-xl"></div>

          {/* Logo Header */}
          <div className="pb-4 border-b border-theme-border flex items-center justify-between">
            <ChainTraceLogo size="md" />
            <Link
              href="/"
              className="text-xs font-mono text-theme-text-muted hover:text-theme-heading flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Landing</span>
            </Link>
          </div>

          <div className="mt-4 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-theme-accent">
                OFFICER CLEARANCE GATEWAY
              </span>
            </div>
            <h2 className="font-space font-bold text-xl text-theme-heading">
              Enclave Authentication
            </h2>
            <p className="text-xs text-theme-text-secondary mt-1 leading-relaxed font-sans">
              Enter your designated agency badge and authorization token to access the live VASP intelligence DAG.
            </p>
          </div>

          {/* Quick Persona Selector for Testing & Evaluators */}
          <div className="mb-5 p-3 rounded-lg bg-theme-surface-secondary border border-theme-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-theme-text-muted uppercase font-bold tracking-wider">
                Select Pre-Configured Demo Persona:
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 font-semibold">
                DEMO QUICK FILL
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                type="button"
                onClick={() => selectPersona('DEL-CYBER-8842', 'OfficerPin8842!', 'Delhi Police Cyber Command & FIU-IND Liaison')}
                className={`px-2.5 py-2 rounded border text-left transition-all flex flex-col justify-between ${
                  badgeId === 'DEL-CYBER-8842'
                    ? 'bg-theme-surface text-theme-primary border-theme-primary shadow-sm font-bold ring-1 ring-theme-primary/30'
                    : 'bg-theme-surface/50 text-theme-fg border-theme-border hover:border-theme-primary/50'
                }`}
              >
                <span className="font-semibold text-xs">Investigator</span>
                <span className="text-[9px] text-theme-text-muted mt-0.5">DEL-CYBER-8842</span>
              </button>
              <button
                type="button"
                onClick={() => selectPersona('ED-FORENSIC-007', 'AnalystSecret2026!', 'Directorate of Enforcement (ED)')}
                className={`px-2.5 py-2 rounded border text-left transition-all flex flex-col justify-between ${
                  badgeId === 'ED-FORENSIC-007'
                    ? 'bg-theme-surface text-theme-primary border-theme-primary shadow-sm font-bold ring-1 ring-theme-primary/30'
                    : 'bg-theme-surface/50 text-theme-fg border-theme-border hover:border-theme-primary/50'
                }`}
              >
                <span className="font-semibold text-xs">Analyst</span>
                <span className="text-[9px] text-theme-text-muted mt-0.5">ED-FORENSIC-007</span>
              </button>
              <button
                type="button"
                onClick={() => selectPersona('ADMIN-LEA-001', 'AdminRoot2026!', 'National Cyber Security Operations Enclave')}
                className={`px-2.5 py-2 rounded border text-left transition-all flex flex-col justify-between ${
                  badgeId === 'ADMIN-LEA-001'
                    ? 'bg-theme-surface text-theme-primary border-theme-primary shadow-sm font-bold ring-1 ring-theme-primary/30'
                    : 'bg-theme-surface/50 text-theme-fg border-theme-border hover:border-theme-primary/50'
                }`}
              >
                <span className="font-semibold text-xs">Enclave Admin</span>
                <span className="text-[9px] text-theme-text-muted mt-0.5">ADMIN-LEA-001</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                Officer Badge ID
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                  badge
                </span>
                <input
                  type="text"
                  required
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none transition-colors"
                  placeholder="e.g. DEL-CYBER-8842"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                Designated Enforcement Agency
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                  account_balance
                </span>
                <input
                  type="text"
                  required
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none transition-colors"
                  placeholder="Agency name"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1">
                Enclave Security PIN / Passphrase
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-theme-text-muted text-[18px]">
                  key
                </span>
                <input
                  type="password"
                  required
                  value={tokenPin}
                  onChange={(e) => setTokenPin(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:ring-1 focus:ring-theme-primary focus:outline-none tracking-widest transition-colors"
                  placeholder="Security PIN"
                />
              </div>
            </div>

            {authenticating && (
              <div className="p-3 bg-theme-surface-secondary rounded-md border border-theme-primary font-mono text-[11px] text-theme-primary flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authenticating}
              className="w-full h-11 bg-theme-primary hover:bg-theme-primary-hover text-slate-900 font-space font-bold text-xs uppercase tracking-wider rounded-md shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{authenticating ? 'AUTHENTICATING ENCLAVE...' : 'AUTHENTICATE & ENTER ENCLAVE'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-20 w-full bg-theme-surface/90 backdrop-blur-md h-8 px-6 flex items-center justify-between border-t border-theme-border font-mono text-[10px] text-theme-text-muted transition-colors">
        <span>HOST NODE: ENCLAVE-SIM-04 // TLS 1.3 SECURE HANDSHAKE</span>
        <span>CHAINTRACE v2.6.4 // FIU-IND &amp; PMLA COMPLIANT PLATFORM</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-theme-bg" />}>
      <LoginForm />
    </Suspense>
  );
}

