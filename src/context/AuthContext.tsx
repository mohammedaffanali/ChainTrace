'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface InvestigatorSession {
  id: string;
  badgeId: string;
  email: string;
  agency: string;
  officerName: string;
  designation: string;
  role: 'INVESTIGATOR' | 'ANALYST' | 'ADMINISTRATOR';
  csrfToken?: string;
  authenticatedAt: string;
  isOfflineFallback?: boolean;
}

interface AuthContextType {
  user: InvestigatorSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'INVESTIGATOR' | 'ANALYST' | 'ADMINISTRATOR';
  login: (badgeId: string, agencyOrPin: string, tokenPin?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'chaintrace_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InvestigatorSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Validate active session against backend /api/auth/me on mount
  useEffect(() => {
    async function checkActiveSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const remoteUser = await res.json();
          const session: InvestigatorSession = {
            id: remoteUser.id,
            badgeId: remoteUser.badge_id,
            email: remoteUser.email,
            agency: remoteUser.agency,
            officerName: remoteUser.full_name,
            designation: remoteUser.designation,
            role: remoteUser.role || 'INVESTIGATOR',
            authenticatedAt: new Date().toISOString(),
          };
          setUser(session);
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          } catch {}
          return;
        }
      } catch {
        // Backend not reachable — user stays unauthenticated
      } finally {
        setIsLoading(false);
      }
    }

    checkActiveSession();
  }, []);

  const login = async (
    badgeId: string,
    agencyOrPin: string,
    tokenPin?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanBadge = badgeId.trim();
    // Handle both 2-arg (badgeId, pin) and 3-arg (badgeId, agency, pin) legacy calls
    const cleanPin = (tokenPin !== undefined ? tokenPin : agencyOrPin).trim();
    const cleanAgency = tokenPin !== undefined ? agencyOrPin.trim() : '';

    if (!cleanBadge) {
      return { success: false, error: 'Investigator Badge ID is required.' };
    }
    if (!cleanPin) {
      return { success: false, error: 'Enclave Security PIN is required.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badge_id: cleanBadge,
          password: cleanPin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.message || data.detail || 'Authentication failed' };
      }

      const session: InvestigatorSession = {
        id: data.user.id,
        badgeId: data.user.badge_id,
        email: data.user.email,
        agency: data.user.agency || cleanAgency || 'Cyber Crime Unit // FIU-IND Liaison',
        officerName: data.user.full_name,
        designation: data.user.designation,
        role: data.user.role || 'INVESTIGATOR',
        csrfToken: data.csrf_token,
        authenticatedAt: new Date().toISOString(),
        isOfflineFallback: data.is_offline_fallback,
      };

      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      } catch {}

      setUser(session);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error connecting to auth server' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}

    setUser(null);
    router.push('/login');
  };

  const refreshSession = useCallback(async () => {
    try {
      await fetch('/api/v1/auth/refresh', { method: 'POST' });
    } catch {}
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        role: user?.role || 'INVESTIGATOR',
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
