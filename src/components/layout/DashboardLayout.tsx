'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ClassificationHeader from './ClassificationHeader';
import TacticalSidebar from './TacticalSidebar';
import CommandHeader from './CommandHeader';
import CommandPalette from '../common/CommandPalette';
import GlobalErrorBoundary from '../common/GlobalErrorBoundary';
import ChainTraceBackground from '../common/ChainTraceBackground';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="bg-theme-bg min-h-screen text-theme-fg flex items-center justify-center font-mono text-xs">
        <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-theme-surface border border-theme-border shadow-xl">
          <span className="material-symbols-outlined text-3xl text-theme-primary animate-spin">
            progress_activity
          </span>
          <span className="text-theme-text-muted">VERIFYING ENCLAVE CLEARANCE...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-theme-bg min-h-screen text-theme-fg flex flex-col font-sans transition-colors relative">
      {/* Cinematic Blockchain Intelligence Ambient Network */}
      <ChainTraceBackground variant="dashboard" />

      {/* Pinned Classification banner */}
      <ClassificationHeader />

      {/* Tactical Fixed / Mobile Sidebar Drawer */}
      <TacticalSidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Container: pl-0 on mobile, pl-64 on desktop (lg) */}
      <div className="pl-0 lg:pl-64 flex flex-col min-h-screen transition-all">
        {/* Header with Search and Officer controls */}
        <CommandHeader
          onOpenSearch={() => setIsSearchOpen(true)}
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        />

        {/* Dynamic Page Content (padded top 24 for headers) */}
        <main className="pt-24 px-4 sm:px-6 pb-8 min-h-screen w-full max-w-7xl mx-auto">
          <GlobalErrorBoundary>
            {children}
          </GlobalErrorBoundary>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}
