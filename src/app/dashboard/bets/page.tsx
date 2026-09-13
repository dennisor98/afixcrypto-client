'use client';

import { useQuery } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function BetsPage() {
  const { data: bets, isLoading } = useQuery({
    queryKey: ['user-bets'],
    queryFn: () => betsApi.getUserBets().then(res => res.data),
  });

  // Calculate stats only from fetched database data
  const stats = bets ? {
    total: bets.length,
    active: bets.filter((bet: any) => bet.status === 'pending').length,
    won: bets.filter((bet: any) => bet.status === 'won').length,
    lost: bets.filter((bet: any) => bet.status === 'loss').length,
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Bets</h1>
          <p className="text-secondary mt-1">View and manage your betting history</p>
        </div>
        <Link
          href="/dashboard/bets/create"
          className="inline-flex w-full sm:w-auto justify-center items-center px-4 sm:px-6 py-3 bg-binance-yellow text-binance-dark rounded-lg hover:bg-binance-yellow-dark transition shadow-lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Place New Bet
        </Link>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-secondary rounded-lg border border-primary p-4 transition-colors animate-pulse">
              <div className="h-12 bg-tertiary rounded"></div>
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Total Bets</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Active</p>
            <p className="text-2xl font-bold text-binance-yellow mt-1">{stats.active}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Won</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.won}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Lost</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.lost}</p>
          </div>
        </div>
      ) : null}

      {/* Bets List */}
      <div className="bg-secondary rounded-xl border border-primary transition-colors">
        <div className="p-4 sm:p-6 border-b border-primary">
          <h2 className="text-lg font-semibold text-primary">Betting History</h2>
        </div>
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow"></div>
              <p className="mt-4 text-secondary">Loading bets...</p>
            </div>
          ) : bets && bets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Direction</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet: any) => (
                    <tr key={bet.id} className="border-b border-primary hover:bg-tertiary transition-colors">
                      <td className="py-4 px-4 text-sm text-primary">#{bet.id.slice(0, 8)}</td>
                      <td className="py-4 px-4 text-sm font-medium text-primary">${bet.betAmount}</td>
                      <td className="py-4 px-4 text-sm text-secondary">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          bet.isVirtual ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}>
                          {bet.isVirtual ? 'Virtual' : 'Real'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary">
                        <span className={`px-2 py-1 rounded-full text-xs border ${
                          bet.signal?.direction === 'rise' 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {bet.signal?.direction === 'rise' ? '↑ Rise' : '↓ Fall'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          bet.status === 'won' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          bet.status === 'loss' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          'bg-binance-yellow/20 text-binance-yellow border-binance-yellow/30'
                        }`}>
                          {bet.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-secondary">
                        {new Date(bet.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <Link
                          href={`/dashboard/bets/${bet.id}`}
                          className="text-binance-yellow hover:text-binance-yellow-dark font-medium transition"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-secondary mb-4">No bets found</p>
              <Link
                href="/dashboard/bets/create"
                className="inline-flex items-center px-4 py-2 bg-binance-yellow text-binance-dark rounded-lg hover:bg-binance-yellow-dark transition"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Place Your First Bet
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
