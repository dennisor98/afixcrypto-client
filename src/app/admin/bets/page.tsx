'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { usePublicSettings } from '@/hooks/useBackendData';
import { Card } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import Badge, { statusTone } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils/cn';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

type Filter = 'all' | 'pending' | 'won' | 'loss';
const FILTERS: Filter[] = ['all', 'pending', 'won', 'loss'];

export default function AdminBetsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const { data: bets, isLoading } = useQuery({
    queryKey: ['admin-bets'],
    queryFn: () => adminApi.getAllBets().then((res) => res.data),
  });

  const { data: settings } = usePublicSettings();
  const payout = Number(settings?.payoutMultiplier ?? 1.95);

  // Platform profit is the inverse of user profit: losses are revenue,
  // wins are paid out
  const stats = useMemo(() => {
    const list = bets ?? [];
    const won = list.filter((b: any) => b.status === 'won');
    const loss = list.filter((b: any) => b.status === 'loss');

    const paidOut = won.reduce(
      (s: number, b: any) => s + parseFloat(b.betAmount || '0') * (payout - 1),
      0,
    );
    const collected = loss.reduce(
      (s: number, b: any) => s + parseFloat(b.betAmount || '0'),
      0,
    );

    return {
      total: list.length,
      pending: list.filter((b: any) => b.status === 'pending').length,
      won: won.length,
      loss: loss.length,
      volume: list.reduce(
        (s: number, b: any) => s + parseFloat(b.betAmount || '0'),
        0,
      ),
      net: collected - paidOut,
    };
  }, [bets, payout]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (bets ?? []).filter((b: any) => {
      if (filter !== 'all' && b.status !== filter) return false;
      if (!term) return true;
      return (
        b.user?.email?.toLowerCase().includes(term) ||
        b.user?.userName?.toLowerCase().includes(term)
      );
    });
  }, [bets, filter, search]);

  const fmtPrice = (p?: string | null) =>
    p ? `$${parseFloat(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bets"
        description="Every trade placed on the platform with settlement prices"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Bets"
          value={stats.total}
          hint={`${stats.won} won / ${stats.loss} lost`}
          icon={ChartBarIcon}
          loading={isLoading}
        />
        <StatCard
          label="Open"
          value={stats.pending}
          hint={stats.pending > 0 ? 'Awaiting settlement' : 'None open'}
          icon={ClockIcon}
          tone={stats.pending > 0 ? 'accent' : 'default'}
          loading={isLoading}
        />
        <StatCard
          label="Volume"
          value={`$${stats.volume.toFixed(2)}`}
          hint="Total staked"
          icon={ChartBarIcon}
          loading={isLoading}
        />
        <StatCard
          label="Platform Net"
          value={`${stats.net >= 0 ? '+' : ''}$${stats.net.toFixed(2)}`}
          hint="Settled bets only"
          icon={ScaleIcon}
          tone={stats.net > 0 ? 'up' : stats.net < 0 ? 'down' : 'default'}
          loading={isLoading}
        />
      </div>

      <Card flush>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by user email or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>

          <div className="inline-flex bg-surface-2 border border-line rounded-lg p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors',
                  filter === f ? 'bg-accent text-accent-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-ink-faint tabular-nums">
            {filtered.length} of {stats.total}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ChartBarIcon}
            title={stats.total === 0 ? 'No bets yet' : 'No bets match these filters'}
            description={
              stats.total === 0
                ? 'Trades will appear here as users place them.'
                : 'Try a different status or search term.'
            }
          />
        ) : (
          <Table>
            <THead>
              <TH>User</TH>
              <TH>Direction</TH>
              <TH align="right">Amount</TH>
              <TH align="right">Entry</TH>
              <TH align="right">Exit</TH>
              <TH>Placed</TH>
              <TH align="center">Status</TH>
            </THead>
            <TBody>
              {filtered.map((bet: any) => {
                const isRise = bet.betType === 'rise';
                return (
                  <TR key={bet.id}>
                    <TD>
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">
                          {bet.user?.userName || 'Unknown'}
                        </p>
                        <p className="text-xs text-ink-faint truncate">
                          {bet.user?.email || ''}
                        </p>
                      </div>
                    </TD>

                    <TD>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 font-semibold text-sm',
                          isRise ? 'text-up' : 'text-down',
                        )}
                      >
                        {isRise ? (
                          <ArrowTrendingUpIcon className="h-4 w-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4" />
                        )}
                        {isRise ? 'RISE' : 'FALL'}
                      </span>
                    </TD>

                    <TD align="right" className="font-medium">
                      ${parseFloat(bet.betAmount || '0').toFixed(2)}
                    </TD>

                    <TD align="right" className="text-ink-muted">
                      {fmtPrice(bet.startPrice)}
                    </TD>

                    <TD align="right" className="text-ink-muted">
                      {fmtPrice(bet.endPrice)}
                    </TD>

                    <TD className="text-ink-muted whitespace-nowrap">
                      {new Date(bet.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TD>

                    <TD align="center">
                      <Badge tone={statusTone(bet.status)}>{bet.status}</Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}