import api from './client';
import { Wallet, WithdrawalRequest, Deposit, WithdrawWalletDto, ApproveWithdrawalDto } from '@/types/wallet.types';

export const walletApi = {
  requestWithdrawal: (data: WithdrawWalletDto) =>
    api.post<WithdrawalRequest>('/wallet/withdraw', data),

  approveWithdrawal: (data: ApproveWithdrawalDto) =>
    api.post('/wallet/approve/withdraw', data),

  getWithdrawalRequests: () =>
    api.get<WithdrawalRequest[]>('/wallet/withdrawalRequests'),

  getMyWithdrawalRequests: () =>
    api.get<WithdrawalRequest[]>('/wallet/mywithdrawalRequests'),

  getDeposits: () =>
    api.get<Deposit[]>('/wallet/deposits'),

  getBalance: (address: string) =>
    api.get<number>(`/wallet/balance/${address}`),

  getUsdtBalance: (address: string) =>
    api.get<number>(`/wallet/usdtBalance/${address}`),

  getDepositHistory: (address: string) =>
    api.get<any[]>(`/wallet/deposits/${address}`),

  getTransactions: (address: string) =>
    api.get<any[]>(`/wallet/transactions/${address}`),

  getAccount: (address: string) =>
    api.get<any>(`/wallet/account/${address}`),

  createAccount: () =>
    api.get<any>('/wallet/create-account'),

  subscribeToEvents: () =>
    api.get('/wallet/subscribe'),
};
