'use client';

import React, { useState } from 'react';

interface CopyBadgeProps {
  text: string;
  display?: string;
  className?: string;
}

export default function CopyBadge({ text, display, className = '' }: CopyBadgeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      title="Click to copy hash to clipboard"
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] transition-all cursor-pointer border ${
        copied
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/50'
          : 'bg-theme-surface-secondary text-theme-accent hover:text-theme-primary border-theme-border hover:border-theme-primary/50'
      } ${className}`}
    >
      <span className="truncate">{display || text}</span>
      <span className="material-symbols-outlined text-[13px] opacity-70">
        {copied ? 'check' : 'content_copy'}
      </span>
    </button>
  );
}
