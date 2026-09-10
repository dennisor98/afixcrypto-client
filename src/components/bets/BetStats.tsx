'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import { BetState } from '@/types';

export default function BetStats() {
    const { data: bets, isLoading } = useQuery({
        queryKey: ['user-bets'],
        queryFn: async () => {
            const res = await betsApi.getUserBets();
            return res.data;
        },
    });

    const stats = bets?.reduce((acc, bet) => {
        acc.total++;
        if (bet.status === BetState.Pending) acc.pending++;
        if (bet.status === BetState.Won) {
            acc.won++;
            acc.totalWon += parseFloat(bet.betAmount);
        }
        if (bet.status === BetState.Loss) {
            acc.lost++;
            acc.totalLost += parseFloat(bet.betAmount);
        }
        return acc;
    }, {
        total: 0,
        pending: 0,
        won: 0,
        lost: 0,
        totalWon: 0,
        totalLost: 0,
    }) || { total: 0, pending: 0, won: 0, lost: 0, totalWon: 0, totalLost: 0 };

    const winRate = stats.total > 0 ? (stats.won / (stats.won + stats.lost)) * 100 : 0;
    const profitLoss = stats.totalWon - stats.totalLost;

    if (isLoading) {
        return <div className="animate-pulse bg-gray-200 h-48 rounded-lg"></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Betting Statistics</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Bets</p>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.won}</p>
                    <p className="text-sm text-gray-600">Won</p>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
                    <p className="text-sm text-gray-600">Lost</p>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Profit/Loss</p>
                    <p className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} USDT
                    </p>
                </div>
            </div>
        </div>
    );
}
