'use client';

import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';

export default function WithdrawalHistory() {
    const { data: withdrawals, isLoading, error } = useQuery({
        queryKey: ['my-withdrawal-requests'],
        queryFn: async () => {
            const res = await walletApi.getMyWithdrawalRequests();
            return res.data;
        },
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Failed to load withdrawal history
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">Withdrawal History</h3>
            </div>

            {withdrawals && withdrawals.length > 0 ? (
                <div className="divide-y">
                    {withdrawals.map((withdrawal) => (
                        <div key={withdrawal.id} className="p-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-semibold text-lg">${withdrawal.amount} USDT</p>
                                    <p className="text-sm text-gray-600">To: {withdrawal.address.substring(0, 10)}...{withdrawal.address.substring(withdrawal.address.length - 8)}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(withdrawal.status)}`}>
                                    {withdrawal.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Requested: {new Date(withdrawal.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-gray-500">
                    No withdrawal requests yet
                </div>
            )}
        </div>
    );
}
