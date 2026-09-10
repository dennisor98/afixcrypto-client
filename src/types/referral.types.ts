export interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  code: string;
  earned: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface ReferralStats {
  total: number;
  active: number;
  totalAmount: any;
  totalReferrals?: number;
  activeReferrals?: number;
  totalEarnings?: number;
  totalEarned?: number;
  referralCode?: string;
}
