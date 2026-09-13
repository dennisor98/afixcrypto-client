'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUserTrades, usePublicSettings, type Bet } from '@/hooks/useBackendData';
import { Card, CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge, { statusTone } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import { cn } from '@/lib/utils/cn';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  TrophyIcon,
  BanknotesIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';

type StatusFilter = 'all' | 'won' | 'loss' | 'pending';
type DirectionFilter = 'all' | 'rise' | 'fall';

const STATUS_FILTERS: StatusFilter[] = ['all', 'won', 'loss', 'pending'];
const DIRECTION_FILTERS: DirectionFilter[] = ['all', 'rise', 'fall'];

function formatDateTime(s: string) {
  return new Date(s).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function FilterGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex bg-surface-2 border border-line rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors',
            value === opt
              ? 'bg-accent text-accent-ink'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function TradeHistoryPage() {
  const { data: trades, isLoading } = useUserTrades();
  const { data: settings } = usePublicSettings();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');

  // Profit uses the configured multiplier rather than a hardcoded 0.95
  const payout = Number(settings?.payoutMultiplier ?? 1.95);

  const stats = useMemo(() => {
    const list = trades ?? [];
    const won = list.filter((t) => t.status === 'won');
    const loss = list.filter((t) => t.status === 'loss');
    const settled = won.length + loss.length;

    const wagered = list.reduce((s, t) => s + parseFloat(t.betAmount || '0'), 0);
    const gained = won.reduce(
      (s, t) => s + parseFloat(t.betAmount || '0') * (payout - 1),
      0,
    );
    const lostAmount = loss.reduce(
      (s, t) => s + parseFloat(t.betAmount || '0'),
      0,
    );

    return {
      total: list.length,
      won: won.length,
      loss: loss.length,
      pending: list.filter((t) => t.status === 'pending').length,
      winRate: settled > 0 ? (won.length / settled) * 100 : 0,
      wagered,
      net: gained - lostAmount,
      settled,
    };
  }, [trades, payout]);

  const filtered = useMemo(() => {
    return (trades ?? []).filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (directionFilter !== 'all' && t.betType !== directionFilter) return false;
      return true;
    });
  }, [trades, statusFilter, directionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trade History"
        description="Every trade you have placed, with settlement prices"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Trades"
          value={stats.total}
          hint={`${stats.pending} still open`}
          icon={ChartBarIcon}
          loading={isLoading}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          hint={`${stats.won} won / ${stats.loss} lost`}
          icon={TrophyIcon}
          tone={stats.settled === 0 ? 'default' : stats.winRate >= 50 ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatCard
          label="Total Wagered"
          value={`$${stats.wagered.toFixed(2)}`}
          hint="Across all trades"
          icon={BanknotesIcon}
          loading={isLoading}
        />
        <StatCard
          label="Net Profit"
          value={`${stats.net >= 0 ? '+' : ''}$${stats.net.toFixed(2)}`}
          hint="Settled trades only"
          icon={ScaleIcon}
          tone={stats.net > 0 ? 'up' : stats.net < 0 ? 'down' : 'default'}
          loading={isLoading}
        />
      </div>

      <Card flush>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-3">
          <FilterGroup
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterGroup
            options={DIRECTION_FILTERS}
            value={directionFilter}
            onChange={setDirectionFilter}
          />
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
            title={stats.total === 0 ? 'No trades yet' : 'No trades match these filters'}
            description={
              stats.total === 0
                ? 'Your trades will appear here once you place one.'
                : 'Try a different status or direction.'
            }
            action={
              stats.total === 0 ? (
                <Link href="/dashboard/trade">
                  <Button size="sm">Start Trading</Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <THead>
              <TH>Direction</TH>
              <TH align="right">Amount</TH>
              <TH align="right">Entry</TH>
              <TH align="right">Exit</TH>
              <TH align="right">Result</TH>
              <TH>Placed</TH>
              <TH align="center">Status</TH>
            </THead>
            <TBody>
              {filtered.map((bet) => (
                <TradeRow key={bet.id} bet={bet} payout={payout} />
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function TradeRow({ bet, payout }: { bet: Bet; payout: number }) {
  const isRise = bet.betType === 'rise';
  const stake = parseFloat(bet.betAmount || '0');

  const result =
    bet.status === 'won'
      ? stake * (payout - 1)
      : bet.status === 'loss'
        ? -stake
        : null;

  const fmtPrice = (p?: string | null) =>
    p ? `$${parseFloat(p).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '—';

  return (
    <TR>
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
      <TD align="right">${stake.toFixed(2)}</TD>
      <TD align="right" className="text-ink-muted">
        {fmtPrice(bet.startPrice)}
      </TD>
      <TD align="right" className="text-ink-muted">
        {fmtPrice(bet.endPrice)}
      </TD>
      <TD align="right">
        {result === null ? (
          <span className="text-ink-faint">—</span>
        ) : (
          <span className={cn('font-semibold', result > 0 ? 'text-up' : 'text-down')}>
            {result > 0 ? '+' : ''}${result.toFixed(2)}
          </span>
        )}
      </TD>
      <TD className="text-ink-muted whitespace-nowrap">
        {formatDateTime(bet.createdAt)}
      </TD>
      <TD align="center">
        <Badge tone={statusTone(bet.status)}>{bet.status}</Badge>
      </TD>
    </TR>
  );
}
