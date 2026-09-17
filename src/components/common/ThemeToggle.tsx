'use client';

import React, { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('chaintrace-theme') as ThemeMode | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      setTheme('system');
      applyTheme('system');
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const currentSaved = localStorage.getItem('chaintrace-theme') as ThemeMode | null;
      if (!currentSaved || currentSaved === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else if (mode === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    // Dispatch custom event for theme-aware canvas/GSAP components
    window.dispatchEvent(new CustomEvent('chaintrace-theme-change', { detail: { theme: mode } }));
  };

  const handleToggle = () => {
    let next: ThemeMode;
    if (theme === 'light') next = 'dark';
    else if (theme === 'dark') next = 'system';
    else next = 'light';

    setTheme(next);
    localStorage.setItem('chaintrace-theme', next);
    applyTheme(next);
  };

  if (!mounted) {
    return (
      <button
        aria-label="Toggle Theme"
        className={`h-9 px-2.5 rounded-md border border-theme-border bg-theme-surface text-theme-fg text-xs font-mono flex items-center gap-1.5 opacity-60 ${className}`}
      >
        <span className="material-symbols-outlined text-[17px]">brightness_auto</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      title={`Current Theme: ${theme.toUpperCase()} (Click to toggle)`}
      aria-label={`Current Theme: ${theme}. Click to switch theme`}
      className={`h-9 px-2.5 rounded-md border border-theme-border bg-theme-surface hover:bg-theme-secondary text-theme-fg text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm ${className}`}
    >
      <span className="material-symbols-outlined text-[17px] text-theme-gold">
        {theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'brightness_auto'}
      </span>
      <span className="uppercase text-[10px] font-bold hidden sm:inline">
        {theme}
      </span>
    </button>
  );
}
