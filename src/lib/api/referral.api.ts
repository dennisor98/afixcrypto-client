import api from './client';
import { ReferralStats } from '@/types/referral.types';

export const referralApi = {
  getReferralStats: () =>
    api.get<ReferralStats>('/referrals/get/referrals'),
};
