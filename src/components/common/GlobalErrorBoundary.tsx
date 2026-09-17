'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CHAINTRACE DEFENSE AUDIT] Uncaught component rendering error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#070A11] text-slate-100 flex items-center justify-center p-6 font-mono">
          <div className="max-w-xl w-full p-8 rounded-2xl bg-[#0F172A] border border-red-500/40 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-700/60 pb-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
                <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
              </div>
              <div>
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest block">
                  STATUTORY RECOVERY GATE // ERROR INTERCEPTED
                </span>
                <h2 className="font-space font-bold text-lg text-white mt-0.5">
                  Component Rendering Exception Handled
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              CHAINTRACE defense containment prevented an unhandled UI crash. Evidentiary state remains preserved in your active browser session.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/50 border border-slate-800 text-[11px] text-red-300 overflow-x-auto max-h-36">
                <code>{this.state.error.message || String(this.state.error)}</code>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 font-space">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Return to Previous View
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md shadow-blue-600/30"
              >
                Reload Enclave
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
