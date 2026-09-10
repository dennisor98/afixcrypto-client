'use client';

import { useEffect, useRef, useCallback } from 'react';
import { clearAuth, getToken } from '@/lib/api/api';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const TOKEN_CHECK_INTERVAL = 60 * 1000;     // Check every 60s
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h max session
const SESSION_START_KEY = 'session_start';
const LAST_ACTIVE_KEY = 'last_active';

export function useSessionManager() {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback((reason: string) => {
    clearAuth();
    sessionStorage.removeItem(SESSION_START_KEY);
    sessionStorage.removeItem(LAST_ACTIVE_KEY);
    window.location.href = `/auth/login?reason=${reason}`;
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    inactivityTimer.current = setTimeout(() => logout('inactivity'), INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      logout('no_token');
      return;
    }

    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, Date.now().toString());
    }

    resetInactivityTimer();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, resetInactivityTimer, { passive: true }));

    const tokenCheck = setInterval(() => {
      if (!getToken()) { logout('token_removed'); return; }

      const sessionStart = parseInt(sessionStorage.getItem(SESSION_START_KEY) || '0');
      if (sessionStart && Date.now() - sessionStart > SESSION_DURATION) {
        logout('session_expired');
        return;
      }

      const lastActive = parseInt(sessionStorage.getItem(LAST_ACTIVE_KEY) || '0');
      if (lastActive && Date.now() - lastActive > INACTIVITY_TIMEOUT) {
        logout('inactivity');
      }
    }, TOKEN_CHECK_INTERVAL);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && !getToken()) {
        logout('token_removed');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      clearInterval(tokenCheck);
      events.forEach((e) => window.removeEventListener(e, resetInactivityTimer));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [logout, resetInactivityTimer]);
}