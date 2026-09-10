export enum Direction {
  Bearish = 'fall',
  Bullish = 'rise',
}

import type { User } from '@/types/auth.types';

export enum BetState {
  Won = 'won',
  Loss = 'loss',
  Pending = 'pending',
}

export interface Signal {
  id: string;
  period_time: string;
  endtime: number;
  start_time: number;
  direction: Direction;
  createdAt: string;
  updatedAt: string;
}

export interface SignalHour {
  id: string;
  Dayhour: string;
  interval: string;
  signals: Signal[];
}

export interface Bet {
  id: string;
  betAmount: string;
  isVirtual: boolean;
  betType: string;
  status: BetState;
  projectedstatus: BetState;
  createdAt: string;
  updatedAt: string;
  signal?: Signal;
}

export interface CreateBetDto {
  user: User;
  Period: string;
  Amount: string;
  direction: Direction;
  isVatual: boolean; // Note: backend has typo "isVatual" instead of "isVirtual"
}

export interface CreateIntervalDto {
  Dayhour: string;
  interval: string;
}

export interface UpdateSignalDto {
  direction?: Direction;
  period_time?: string;
  endtime?: number;
  start_time?: number;
}

export interface BetStats {
  totalBets: number;
  activeBets: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
}