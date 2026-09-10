'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import BetCard from './BetCard';
import BetFilters from './BetFilters';
import { BetState } from '@/types';

export default function BetHistory() {
    const [filters, setFilters] = useState<{ status?: BetState; isVirtual?: boolean }>({});

    const { data: bets, isLoading, error } = useQuery({
        queryKey: ['user-bets'],
        queryFn: async () => {
            const res = await betsApi.getUserBets();
            return res.data;
        },
    });

    const filteredBets = bets?.filter(bet => {
        if (filters.status && bet.status !== filters.status) return false;
        if (filters.isVirtual !== undefined && bet.isVirtual !== filters.isVirtual) return false;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Failed to load bet history. Please try again.
            </div>
        );
    }

    return (
        <div>
            <BetFilters onFilterChange={setFilters} />

            {filteredBets && filteredBets.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBets.map((bet) => (
                        <BetCard key={bet.id} bet={bet} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No bets found</p>
                </div>
            )}
        </div>
    );
}
