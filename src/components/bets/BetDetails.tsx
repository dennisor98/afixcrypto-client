'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import { Bet } from '@/types';

interface BetDetailsProps {
    betId: string;
}

export default function BetDetails({ betId }: BetDetailsProps) {
    const { data: bet, isLoading, error } = useQuery({
        queryKey: ['bet', betId],
        queryFn: async () => {
            const res = await betsApi.getById(betId);
            return res.data;
        },
    });

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
    }

    if (error || !bet) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Failed to load bet details
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Bet Details</h2>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600 text-sm">Bet ID</p>
                        <p className="font-semibold">{bet.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Status</p>
                        <p className="font-semibold capitalize">{bet.status}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-600 text-sm">Amount</p>
                        <p className="font-semibold">${bet.betAmount} USDT</p>
                    </div>
                    <div>
                        <p className="text-gray-600 text-sm">Type</p>
                        <p className="font-semibold">{bet.isVirtual ? 'Virtual' : 'Real'}</p>
                    </div>
                </div>

                {bet.signal && (
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Signal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 text-sm">Direction</p>
                                <p className="font-semibold capitalize">{bet.signal.direction}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Period</p>
                                <p className="font-semibold">{bet.signal.period_time}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm">Created At</p>
                            <p className="font-semibold">{new Date(bet.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm">Updated At</p>
                            <p className="font-semibold">{new Date(bet.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
