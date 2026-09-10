'use client';

import { useQuery } from '@tanstack/react-query';
import { referralApi } from '@/lib/api/referral.api';

export default function ReferralStats() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['referral-stats'],
        queryFn: async () => {
            const res = await referralApi.getReferralStats();
            return res.data;
        },
    });

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Failed to load referral statistics
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-6">Referral Statistics</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{stats?.totalReferrals || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Referrals</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{stats?.activeReferrals || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Active Referrals</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">${stats?.totalEarned || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">Total Earned</p>
                </div>
            </div>
        </div>
    );
}
