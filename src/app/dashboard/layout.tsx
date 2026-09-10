'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useSessionManager } from '@/hooks/useSessionManager';

function SessionGuard({ children }: { children: React.ReactNode }) {
  useSessionManager();
  return <>{children}</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Use window.location for reliable redirect — no Next.js router issues
      window.location.href = '/auth/login';
      return;
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-binance-yellow border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SessionGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionGuard>
  );
}