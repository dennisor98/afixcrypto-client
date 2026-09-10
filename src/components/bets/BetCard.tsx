'use client';

import { Bet, BetState, Direction } from '@/types';

interface BetCardProps {
    bet: Bet;
    onClick?: () => void;
}

export default function BetCard({ bet, onClick }: BetCardProps) {
    const getStatusColor = (status: BetState) => {
        switch (status) {
            case BetState.Won:
                return 'bg-green-100 text-green-800 border-green-300';
            case BetState.Loss:
                return 'bg-red-100 text-red-800 border-red-300';
            case BetState.Pending:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getDirectionIcon = (direction?: Direction) => {
        if (direction === Direction.Bullish) {
            return (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            );
        }
        return (
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        );
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {getDirectionIcon(bet.signal?.direction)}
                    <span className="font-semibold text-lg">
                        {bet.signal?.direction === Direction.Bullish ? 'Rise' : 'Fall'}
                    </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(bet.status)}`}>
                    {bet.status}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">${bet.betAmount} USDT</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className={bet.isVirtual ? 'text-purple-600' : 'text-blue-600'}>
                        {bet.isVirtual ? 'Virtual' : 'Real'}
                    </span>
                </div>

                {bet.signal && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Period:</span>
                        <span>{bet.signal.period_time}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-500">
                    <span>Created:</span>
                    <span>{new Date(bet.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
}
