'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { BET_STATUS_COLORS } from '@/lib/utils/validation';

export default function BetsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-bets'],
    queryFn: async () => {
      const res = await betsApi.getUserBets();
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
    </div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Your Bets</h3>
      
      {data?.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bets placed yet</p>
      ) : (
        <div className="space-y-3">
          {data?.map((bet) => (
            <div key={bet.id} className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">Period: {bet.signal?.period_time || 'N/A'}</p>
                  <p className="font-semibold">${bet.betAmount}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  bet.status === 'won' ? 'bg-green-100 text-green-800' :
                  bet.status === 'loss' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {bet.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{formatDateTime(bet.createdAt)}</span>
                <span className={`font-semibold ${
                  bet.isVirtual ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  {bet.isVirtual ? 'Virtual' : 'Real'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
