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
    <div className="min-h-screen bg-theme-bg text-theme-fg flex flex-col justify-between relative overflow-hidden font-sans select-none transition-colors duration-200">
      {/* GSAP Animated Background */}
      <ChainTraceBackground />

      {/* Top Telemetry & Clearance Notice */}
      <div className="relative z-20 w-full bg-theme-surface-secondary/90 backdrop-blur-sm h-8 px-4 sm:px-8 flex items-center justify-between border-b border-theme-border font-mono text-[11px] transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
          <span className="text-theme-gold font-semibold tracking-wider">
            CHAINTRACE SECURE ENCLAVE // FORENSIC INTELLIGENCE SUITE
          </span>
        </div>
        <div className="flex items-center gap-4 text-theme-text-muted">
          <span className="hidden sm:inline font-mono">TLS 1.3 • JWT HTTP-ONLY • CSRF SECURED</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 z-10 relative">
        <div className="w-full max-w-md bg-theme-surface border border-theme-border rounded-xl shadow-xl p-8 backdrop-blur-xl relative transition-colors">
          {/* Gold accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1D4ED8] via-[#0E7490] to-[#B45309] rounded-t-xl"></div>

          {/* Logo Header */}
          <div className="pb-5 border-b border-theme-border flex items-center justify-between">
            <ChainTraceLogo size="lg" />
            <Link
              href="/"
              className="text-xs font-mono text-theme-primary hover:underline"
            >
              ← Landing
            </Link>
          </div>

          <div className="mt-4 mb-4">
            <h2 className="font-space font-bold text-lg text-theme-heading">OFFICER AUTHENTICATION</h2>
            <p className="text-xs text-theme-text-secondary mt-0.5 leading-relaxed">
              Authenticate using your authorized forensic clearance badge ID and security PIN.
            </p>
          </div>

          {/* Quick Persona Selector for Testing & Evaluators */}
          <div className="mb-5 p-2.5 rounded-lg bg-theme-surface-subtle border border-theme-border">
            <div className="font-mono text-[10px] text-theme-text-muted uppercase font-bold tracking-wider mb-2">
              Select Clearance Tier (Quick Fill):
            </div>
            <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
              <button
                type="button"
                onClick={() => selectPersona('DEL-CYBER-8842', 'OfficerPin8842!', 'Delhi Police Cyber Command & FIU-IND Liaison')}
                className={`px-2 py-1.5 rounded border text-center transition-all ${
                  badgeId === 'DEL-CYBER-8842'
                    ? 'bg-theme-primary text-white border-theme-primary font-bold'
                    : 'bg-theme-surface text-theme-fg border-theme-border hover:border-theme-primary'
                }`}
              >
                Investigator
              </button>
              <button
                type="button"
                onClick={() => selectPersona('ED-FORENSIC-007', 'AnalystSecret2026!', 'Directorate of Enforcement (ED)')}
                className={`px-2 py-1.5 rounded border text-center transition-all ${
                  badgeId === 'ED-FORENSIC-007'
                    ? 'bg-theme-primary text-white border-theme-primary font-bold'
                    : 'bg-theme-surface text-theme-fg border-theme-border hover:border-theme-primary'
                }`}
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => selectPersona('ADMIN-LEA-001', 'AdminRoot2026!', 'National Cyber Security Operations Enclave')}
                className={`px-2 py-1.5 rounded border text-center transition-all ${
                  badgeId === 'ADMIN-LEA-001'
                    ? 'bg-theme-primary text-white border-theme-primary font-bold'
                    : 'bg-theme-surface text-theme-fg border-theme-border hover:border-theme-primary'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-500 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1.5">
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
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none transition-colors"
                  placeholder="e.g. DEL-CYBER-8842"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-theme-text-muted uppercase tracking-wider mb-1.5">
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
                  className="w-full h-10 pl-9 pr-3 bg-theme-surface-secondary border border-theme-border rounded-md text-theme-fg font-mono text-xs focus:border-theme-primary focus:outline-none tracking-widest transition-colors"
                  placeholder="Security PIN"
                />
              </div>
            </div>

            {authenticating && (
              <div className="p-3 bg-theme-surface-secondary rounded-md border border-theme-accent font-mono text-[11px] text-theme-accent flex items-center gap-2 animate-pulse">
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authenticating}
              className="w-full h-11 bg-gradient-to-r from-[#1D4ED8] to-[#0E7490] hover:opacity-95 text-white font-space font-bold text-xs uppercase tracking-wider rounded-md shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">lock_open</span>
              <span>{authenticating ? 'AUTHENTICATING...' : 'ENTER FORENSIC COMMAND'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-20 w-full bg-theme-surface-secondary/90 backdrop-blur-sm h-8 px-6 flex items-center justify-between border-t border-theme-border font-mono text-[10px] text-theme-text-muted transition-colors">
        <span>HOST NODE: ENCLAVE-SIM-04 // TLS 1.3 SECURE HANDSHAKE</span>
        <span>CHAINTRACE v2.6.4 // FIU-IND & PMLA COMPLIANT PLATFORM</span>
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
