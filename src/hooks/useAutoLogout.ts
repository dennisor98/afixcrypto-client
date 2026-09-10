'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;  // 15 minutes
const WARNING_MS = 60 * 1000;                // warn 1 min before logout
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export function useAutoLogout() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/auth/login?reason=inactivity');
  }, [router]);

  const showWarning = useCallback(() => {
    const ok = window.confirm(
      'You will be logged out in 1 minute due to inactivity. Click OK to stay signed in.'
    );
    if (ok) {
      resetTimer();
    } else {
      logout();
    }
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    warningRef.current = setTimeout(showWarning, INACTIVITY_LIMIT_MS - WARNING_MS);
    timerRef.current = setTimeout(logout, INACTIVITY_LIMIT_MS);
  }, [logout, showWarning]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('token')) return;

    resetTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);
}