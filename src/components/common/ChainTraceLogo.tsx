'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function ChainTraceLogo({
  size = 'md',
  showText = true,
  className = '',
}: LogoProps) {
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <Link 
      href="/" 
      aria-label="CHAINTRACE - Home" 
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
    >
      {/* Direction 2: Network Intelligence Cube inside Hexagonal "C" Chassis */}
      <div
        className={`${iconDimensions} shrink-0 rounded-xl bg-gradient-to-br from-[#155EEF] via-[#06B6D4] to-[#087F8C] p-[1.5px] shadow-sm shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-cyan-500/30 transition-all`}
      >
        <div className="w-full h-full rounded-[10px] bg-[#07111F] flex items-center justify-center p-1 relative overflow-hidden transition-colors">
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="logoHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#155EEF"/>
                <stop offset="60%" stopColor="#06B6D4"/>
                <stop offset="100%" stopColor="#087F8C"/>
              </linearGradient>
              <linearGradient id="logoCubeTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8"/>
                <stop offset="100%" stopColor="#0284C7"/>
              </linearGradient>
              <linearGradient id="logoCubeLeft" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0369A1"/>
                <stop offset="100%" stopColor="#0C4A6E"/>
              </linearGradient>
              <linearGradient id="logoCubeRight" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0284C7"/>
                <stop offset="100%" stopColor="#075985"/>
              </linearGradient>
            </defs>

            {/* Outer Hexagonal C-Chassis */}
            <path
              d="M 29 11 L 20 6 L 10 12 L 10 28 L 20 34 L 29 29"
              stroke="url(#logoHexGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Inner Technical Facet Notch */}
            <path
              d="M 25 14 L 20 11 L 14 15 L 14 25 L 20 29 L 25 26"
              stroke="#0C4A6E"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Floating Isometric Intelligence Cube */}
            {/* Center origin: (20, 20) */}
            {/* Top Face */}
            <polygon points="20,14 25.5,17 20,20 14.5,17" fill="url(#logoCubeTop)" stroke="#BAE6FD" strokeWidth="0.4"/>
            {/* Left Face */}
            <polygon points="14.5,17 20,20 20,26 14.5,23" fill="url(#logoCubeLeft)" stroke="#38BDF8" strokeWidth="0.4"/>
            {/* Right Face */}
            <polygon points="20,20 25.5,17 25.5,23 20,26" fill="url(#logoCubeRight)" stroke="#38BDF8" strokeWidth="0.4"/>

            {/* Core Attribution Singularity */}
            <circle cx="20" cy="20" r="1.3" fill="#FFFFFF"/>

            {/* Outer Nodes */}
            <circle cx="29" cy="11" r="1.5" fill="#38BDF8" />
            <circle cx="10" cy="12" r="1.5" fill="#155EEF" />
            <circle cx="10" cy="28" r="1.5" fill="#087F8C" />
            <circle cx="29" cy="29" r="1.5" fill="#A67C32" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-space font-extrabold ${titleSize} tracking-tight text-theme-heading transition-colors`}>
              CHAIN<span className="bg-gradient-to-r from-[#155EEF] via-[#06B6D4] to-[#087F8C] bg-clip-text text-transparent">TRACE</span>
            </span>
            <span className="font-mono text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-theme-surface-secondary border border-theme-border text-theme-gold uppercase">
              VASP INTEL
            </span>
          </div>
          <span className="font-mono text-[9.5px] tracking-widest text-theme-text-muted uppercase mt-0.5 font-medium transition-colors">
            BLOCKCHAIN INTELLIGENCE
          </span>
        </div>
      )}
    </Link>
  );
}
