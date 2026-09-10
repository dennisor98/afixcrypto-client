import api from './client';
import { Bet, CreateBetDto, CreateIntervalDto, UpdateSignalDto, Signal, SignalHour } from '@/types/bet.types';
import { PaginatedResponse } from '@/types/api.types';

export const betsApi = {
  create: (data: CreateBetDto) =>
    api.post<Bet>('/trades/create/bet', data),

  createInterval: (data: CreateIntervalDto) =>
    api.post<SignalHour>('/trades/create/interval', data),

  getTodaySignals: () =>
    api.get<{ signals: Signal[]; signalHours: SignalHour[] }>('/trades/get_today_signals'),

  getSignalById: (id: string) =>
    api.get<Signal>(`/trades/signal/${id}`),

  getIntervals: () =>
    api.get<SignalHour[]>('/trades/get_intervals'),

  getUserBets: () =>
    api.get<Bet[]>('/trades/get/user/trades'),

  getSignalsForDayhour: (dayhour: string) =>
    api.get<Signal[]>(`/trades/getSignal/${dayhour}`),

  updateSignal: (id: string, data: UpdateSignalDto) =>
    api.patch<Signal>(`/trades/changeSignal/${id}`, data),

  getById: (id: string) =>
    api.get<Bet>(`/trades/${id}`),

  getPublicSettings: () => api.get('/settings/public'),

};