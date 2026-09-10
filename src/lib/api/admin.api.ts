import api from './client';
import { walletApi } from './wallet.api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  activeBets: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalRevenue: number;
  pendingWithdrawals: number;
}

export const adminApi = {
  getStats: () => api.get<AdminStats>('/user/admin/stats'),

  // Users
  getAllUsers: () => api.get('/user/admin/users'),
  getUserById: (id: string) => api.get(`/user/admin/users/${id}`),
  updateUser: (id: string, data: any) => api.patch(`/user/admin/users/${id}`, data),
  blockUser: (id: string, blocked: boolean) =>
    api.patch(`/user/admin/users/${id}/block`, { isblocked: blocked }),

  // Bets
  getAllBets: () => api.get('/trades/admin/bets'),
  getBetById: (id: string) => api.get(`/trades/admin/bets/${id}`),
  updateBet: (id: string, data: any) => api.patch(`/trades/admin/bets/${id}`, data),

  // Signals
  getTodaySignals: () => api.get('/trades/get_today_signals'),
  getSignalById: (id: string) => api.get(`/trades/signal/${id}`),
  updateSignal: (id: string, direction: string) =>
    api.patch(`/trades/changeSignal/${id}`, { direction }),
  createInterval: (data: { Dayhour: string; interval: string }) =>
    api.post('/trades/create/interval', data),
  getIntervals: () => api.get('/trades/get_intervals'),

  // Withdrawals
  getAllWithdrawals: () => api.get('/wallet/admin/withdrawals'),
  getWithdrawalById: (id: string) => api.get(`/wallet/admin/withdrawals/${id}`),
  approveWithdrawal: (id: string, data: { approved: boolean }) =>
    walletApi.approveWithdrawal({
      withdrawalId: id,
      status: data.approved ? 'approved' : 'rejected',
    }),

  // Deposits
  getAllDeposits: () => api.get('/wallet/admin/deposits'),
  getDepositById: (id: string) => api.get(`/wallet/admin/deposits/${id}`),

  // Platform settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.patch('/admin/settings', data),

  // User controls
  adjustBalance: (userId: string, data: { amount: number; type: 'credit' | 'debit'; reason: string }) =>
      api.post(`/admin/users/${userId}/balance`, data),
  setUserRole: (userId: string, role: string) =>
      api.patch(`/admin/users/${userId}/role`, { role }),
  resetUser2FA: (userId: string) =>
      api.post(`/admin/users/${userId}/reset-2fa`),
  forceLogoutUser: (userId: string) =>
      api.post(`/admin/users/${userId}/force-logout`),
  verifyUserEmail: (userId: string, verified: boolean) =>
      api.patch(`/admin/users/${userId}/verify-email`, { verified }),
  setFirstDeposit: (userId: string, hasDeposit: boolean) =>
      api.patch(`/admin/users/${userId}/first-deposit`, { hasDeposit }),

  // Audit log
  getAuditLog: (params?: { limit?: number; offset?: number }) =>
      api.get('/admin/audit-log', { params }),

  getAllAdmins: () => api.get('/admin/admins'),

};