import api from './client';
import { User } from '@/types/auth.types';
import { Wallet } from '@/types/wallet.types';

export const userApi = {
  getWallet: () =>
    api.get<Wallet>('/user/wallet'),

  getProfile: () =>
    api.get<User>('/user/profile'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/user/profile', data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/user/change-password', data),
};
