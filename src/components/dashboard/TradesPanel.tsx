'use client';

import Link from 'next/link';
import { useUserTrades, type Bet } from '@/hooks/useBackendData';

function StatusBadge({ status }: { status: Bet['status'] }) {
  const map = {
    won: 'bg-[#0ecb8120] text-green-400',
    loss: 'bg-[#f6465d20] text-red-400',
    pending: 'bg-[#f0b90b20] text-[#f0b90b]',
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${map[status]}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TradesPanel() {
  const { data: trades, isLoading, error } = useUserTrades();

  const recent = trades?.slice(0, 10) ?? [];

  const stats = trades
    ? {
        total: trades.length,
        won: trades.filter((t) => t.status === 'won').length,
        pending: trades.filter((t) => t.status === 'pending').length,
        winRate:
          trades.length > 0
            ? ((trades.filter((t) => t.status === 'won').length / trades.filter((t) => t.status !== 'pending').length) * 100 || 0).toFixed(0)
            : '0',
      }
    : null;

  return (
    <div className="bg-primary border border-primary rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
        <h3 className="text-secondary text-sm font-medium uppercase tracking-wider">
          Recent Trades
        </h3>
        <Link
          href="/dashboard/trade-history"
          className="text-[#f0b90b] text-xs hover:text-[#d4a017] transition-colors"
        >
          View All →
        </Link>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="flex divide-x divide-[#1e2329] border-b border-primary">
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-secondary text-xs">Total</p>
            <p className="text-primary font-bold">{stats.total}</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-secondary text-xs">Won</p>
            <p className="text-green-400 font-bold">{stats.won}</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-secondary text-xs">Pending</p>
            <p className="text-[#f0b90b] font-bold">{stats.pending}</p>
          </div>
          <div className="flex-1 px-4 py-3 text-center">
            <p className="text-secondary text-xs">Win Rate</p>
            <p className="text-primary font-bold">{stats.winRate}%</p>
          </div>
        </div>
      )}

      {/* Trade list */}
      <div className="divide-y divide-[#1e2329] max-h-[280px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="space-y-1.5">
                <div className="h-3 bg-tertiary rounded animate-pulse w-24" />
                <div className="h-2 bg-tertiary rounded animate-pulse w-16" />
              </div>
              <div className="h-5 bg-tertiary rounded animate-pulse w-14" />
            </div>
          ))
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <p className="text-red-400 text-sm">Failed to load trades</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-secondary text-sm">No trades yet</p>
            <Link
              href="/dashboard/trade"
              className="text-[#f0b90b] text-xs mt-2 inline-block"
            >
              Place your first bet →
            </Link>
          </div>
        ) : (
          recent.map((bet) => {
            const isRise = bet.betType === 'rise';
            return (
              <div
                key={bet.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-[#1a1f28] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                      isRise
                        ? 'bg-[#0ecb8115] text-green-400'
                        : 'bg-[#f6465d15] text-red-400'
                    }`}
                  >
                    {isRise ? '▲' : '▼'}
                  </div>
                  <div>
                    <p className="text-primary text-sm font-medium">
                      ${Number(bet.betAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {bet.isVirtual && (
                        <span className="ml-1 text-secondary text-xs">(virtual)</span>
                      )}
                    </p>
                    <p className="text-secondary text-xs">{formatDate(bet.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status={bet.status} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}