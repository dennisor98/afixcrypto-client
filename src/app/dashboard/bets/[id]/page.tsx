'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

export default function BetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const betId = params.id as string;

  const { data: bet, isLoading } = useQuery({
    queryKey: ['bet', betId],
    queryFn: () => betsApi.getById(betId).then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow"></div>
        <p className="mt-4 text-secondary">Loading bet details...</p>
      </div>
    );
  }

  if (!bet) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary mb-4">Bet not found</p>
        <button
          onClick={() => router.push('/dashboard/bets')}
          className="text-binance-yellow hover:text-binance-yellow-dark"
        >
          Back to Bets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.push('/dashboard/bets')}
        className="flex items-center text-secondary hover:text-primary mb-4 transition"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Bets
      </button>

      <div className="bg-secondary rounded-xl border border-primary p-6 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">Bet Details</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
            bet.status === 'won' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
            bet.status === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
            'bg-binance-yellow/20 text-binance-yellow border-binance-yellow/30'
          }`}>
            {bet.status}
          </span>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-tertiary rounded-lg border border-primary">
              <p className="text-sm text-secondary mb-1">Bet Amount</p>
              <p className="text-xl font-bold text-primary">${bet.betAmount}</p>
            </div>
            <div className="p-4 bg-tertiary rounded-lg border border-primary">
              <p className="text-sm text-secondary mb-1">Bet Type</p>
              <p className="text-lg font-semibold text-primary">
                {bet.isVirtual ? 'Virtual' : 'Real Money'}
              </p>
            </div>
          </div>

          {bet.signal && (
            <div className="p-4 bg-tertiary rounded-lg border border-primary">
              <p className="text-sm text-secondary mb-2">Prediction Direction</p>
              <div className="flex items-center gap-2">
                {bet.signal.direction === 'rise' ? (
                  <>
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
                    <span className="text-lg font-semibold text-green-500">Rise (Bullish)</span>
                  </>
                ) : (
                  <>
                    <ArrowTrendingDownIcon className="h-6 w-6 text-red-500" />
                    <span className="text-lg font-semibold text-red-500">Fall (Bearish)</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-tertiary rounded-lg border border-primary">
            <p className="text-sm text-secondary mb-1">Period</p>
            <p className="text-lg font-semibold text-primary">{bet.signal?.period_time || 'N/A'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-tertiary rounded-lg border border-primary">
              <p className="text-sm text-secondary mb-1">Created At</p>
              <p className="text-sm font-medium text-primary">
                {new Date(bet.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-tertiary rounded-lg border border-primary">
              <p className="text-sm text-secondary mb-1">Updated At</p>
              <p className="text-sm font-medium text-primary">
                {new Date(bet.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {bet.signal && (
            <div className="p-4 bg-binance-yellow/10 rounded-lg border border-binance-yellow/30">
              <h3 className="font-semibold text-primary mb-2">Signal Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Start Time:</span>
                  <span className="font-medium text-primary">
                    {new Date(bet.signal.start_time * 1000).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">End Time:</span>
                  <span className="font-medium text-primary">
                    {new Date(bet.signal.endtime * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

