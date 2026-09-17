'use client';

import React, { useState, useEffect } from 'react';

export default function ClassificationHeader() {
  const [time, setTime] = useState('2026-09-14 12:00:00 IST');
  const [engineInfo, setEngineInfo] = useState<{
    runtime_mode: string;
    engine: string;
    evidentiary_status: string;
  }>({
    runtime_mode: 'FALLBACK_DEMO',
    engine: 'FALLBACK-DEMO-SQLITE-NETWORKX',
    evidentiary_status: 'NON_EVIDENTIARY_SIMULATION',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check backend health and engine mode
    fetch('/health')
      .then((res) => {
        const engineHeader = res.headers.get('X-ChainTrace-Engine');
        const evidentiaryHeader = res.headers.get('X-ChainTrace-Evidentiary-Status');
        return res.json().then((data) => ({ data, engineHeader, evidentiaryHeader }));
      })
      .then(({ data, engineHeader, evidentiaryHeader }) => {
        if (data) {
          setEngineInfo({
            runtime_mode: data.runtime_mode || 'FALLBACK_DEMO',
            engine: engineHeader || data.engine || 'FALLBACK-DEMO-SQLITE-NETWORKX',
            evidentiary_status: evidentiaryHeader || data.evidentiary_status || 'NON_EVIDENTIARY_SIMULATION',
          });
        }
      })
      .catch(() => {});
  }, []);

  const isProduction = engineInfo.runtime_mode === 'PRODUCTION';

  return (
    <div className="fixed top-0 left-0 lg:left-64 right-0 z-40 bg-theme-surface-secondary h-6 px-4 flex items-center justify-between font-mono text-[10px] sm:text-[11px] text-theme-text-secondary border-b border-theme-border select-none transition-colors">
      <div className="flex items-center gap-2 overflow-hidden">
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${
            isProduction ? 'bg-emerald-400 animate-pulse' : 'bg-theme-gold animate-ping'
          }`}
        ></span>
        {isProduction ? (
          <span className="text-emerald-500 dark:text-emerald-400 font-semibold tracking-wider truncate">
            ENGINE: PRODUCTION // POSTGRESQL + NEO4J // PRODUCTION_GRADE
          </span>
        ) : (
          <span className="text-theme-gold font-semibold tracking-wider truncate">
            ENGINE: FALLBACK DEMO (SQLITE + NETWORKX) // NON_EVIDENTIARY_SIMULATION
          </span>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <span className="text-theme-text-muted">
          IST: <strong className="text-theme-heading font-medium">{time}</strong>
        </span>
        <span className="text-theme-border">|</span>
        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          SEC-65B SEAL
        </span>
      </div>
    </div>
  );
}
