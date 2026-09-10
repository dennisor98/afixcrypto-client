'use client';

import { useState } from 'react';
import { BetState } from '@/types';

interface BetFiltersProps {
    onFilterChange: (filters: { status?: BetState; isVirtual?: boolean }) => void;
}

export default function BetFilters({ onFilterChange }: BetFiltersProps) {
    const [status, setStatus] = useState<BetState | 'all'>('all');
    const [betType, setBetType] = useState<'all' | 'real' | 'virtual'>('all');

    const handleStatusChange = (newStatus: BetState | 'all') => {
        setStatus(newStatus);
        onFilterChange({
            status: newStatus === 'all' ? undefined : newStatus,
            isVirtual: betType === 'all' ? undefined : betType === 'virtual',
        });
    };

    const handleTypeChange = (newType: 'all' | 'real' | 'virtual') => {
        setBetType(newType);
        onFilterChange({
            status: status === 'all' ? undefined : status,
            isVirtual: newType === 'all' ? undefined : newType === 'virtual',
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-4">Filters</h3>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value as BetState | 'all')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value={BetState.Pending}>Pending</option>
                        <option value={BetState.Won}>Won</option>
                        <option value={BetState.Loss}>Loss</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Bet Type</label>
                    <select
                        value={betType}
                        onChange={(e) => handleTypeChange(e.target.value as 'all' | 'real' | 'virtual')}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Types</option>
                        <option value="real">Real</option>
                        <option value="virtual">Virtual</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
