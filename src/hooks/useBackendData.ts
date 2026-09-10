'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';

// Types matching backend entities

export interface Signal {
  id: string;
  period_time: string;
  start_time: number;
  endtime: number;
  direction: 'rise' | 'fall';
  createdAt?: string;
  hour?: { Dayhour: string; interval: string };
}

export interface Bet {
  id: string;
  betAmount: string;
  betType: 'rise' | 'fall';
  isVirtual: boolean;
  status: 'won' | 'loss' | 'pending';
  projectedstatus: 'won' | 'loss' | 'pending';
  startPrice?: string | null;
  endPrice?: string | null;
  settleAt?: string | null;
  createdAt: string;
  signal?: Signal;
}

export interface Wallet {
  balance: number;
  virtualBalance: number;
  flows: number;
}

// Backend returns raw query results with prefixed columns (s_id, s_direction, etc.)
// Normalize to a consistent Signal shape
function normalizeSignal(raw: any): Signal {
  return {
    id: raw.s_id || raw.id,
    direction: raw.s_direction || raw.direction,
    start_time: parseInt(raw.s_start_time ?? raw.start_time ?? 0),
    endtime: parseInt(raw.s_endtime ?? raw.endtime ?? 0),
    period_time: raw.s_period_time || raw.period_time || '5 mins',
    createdAt: raw.s_createdAt || raw.createdAt,
    hour: raw.sh_Dayhour
      ? { Dayhour: raw.sh_Dayhour, interval: raw.sh_interval }
      : raw.hour,
  };
}

// The wallet entity stores decimals as strings named amount / virtualamount.
// Normalize to numbers so components never parse or guess field names.
function normalizeWallet(raw: any): Wallet {
  return {
    balance: parseFloat(raw?.amount ?? '0') || 0,
    virtualBalance: parseFloat(raw?.virtualamount ?? '0') || 0,
    flows: parseFloat(raw?.flows ?? '0') || 0,
  };
}

// Today's trading signals from backend
export function useTodaySignals() {
  return useQuery<Signal[]>({
    queryKey: ['todaySignals'],
    queryFn: async () => {
      const res = await api.get('/trades/get_today_signals');
      const raw = Array.isArray(res.data) ? res.data : [];
      return raw.map(normalizeSignal);
    },
    refetchInterval: 30_000,
    staleTime: 20_000,
  });
}

// Authenticated user's trade history
export function useUserTrades() {
  return useQuery<Bet[]>({
    queryKey: ['userTrades'],
    queryFn: async () => {
      const res = await api.get('/trades/get/user/trades');
      return Array.isArray(res.data) ? res.data : [];
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

// User wallet balance
export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await api.get('/user/wallet');
      return normalizeWallet(res.data);
    },
    refetchInterval: 20_000,
    staleTime: 15_000,
  });
}

// Security and account status. The backend has no /user/profile endpoint,
// so identity fields come from the login response held in the auth store.
export function useSecurityInfo() {
  return useQuery({
    queryKey: ['security'],
    queryFn: async () => {
      const res = await api.get('/user/security');
      return res.data;
    },
    staleTime: 60_000,
  });
}

// Platform limits and kill switches, used to gate trading in the UI
export function usePublicSettings() {
  return useQuery({
    queryKey: ['publicSettings'],
    queryFn: async () => {
      const res = await api.get('/settings/public');
      return res.data;
    },
    staleTime: 60_000,
  });
}