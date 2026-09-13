'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useWallet, useUserTrades, type Bet } from '@/hooks/useBackendData';
import { useLivePrice } from '@/hooks/useMarketData';
import { Card, CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge, { statusTone } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import {
  ChartBarIcon,
  WalletIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

const QUICK_ACTIONS = [
  {
    href: '/dashboard/trade',
    title: 'Place a Trade',
    desc: 'Predict the next 5-minute move',
    icon: ChartBarIcon,
  },
  {
    href: '/dashboard/wallet/deposit',
    title: 'Deposit USDT',
    desc: 'Top up over TRC20',
    icon: WalletIcon,
  },
  {
    href: '/dashboard/referrals',
    title: 'Refer a Friend',
    desc: 'Earn from their first deposit',
    icon: UserGroupIcon,
  },
];

export default function DashboardPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: trades, isLoading: tradesLoading } = useUserTrades();
  const btc = useLivePrice('BTCUSDT');
  const btcUp = btc.changePercent >= 0;

  // Win rate counts settled trades only, so pending trades never dilute it
  const stats = useMemo(() => {
    const list = trades ?? [];
    const settled = list.filter((t) => t.status !== 'pending');
    const won = settled.filter((t) => t.status === 'won');
    return {
      total: list.length,
      active: list.filter((t) => t.status === 'pending').length,
      settled: settled.length,
      won: won.length,
      lost: settled.length - won.length,
      winRate: settled.length > 0 ? (won.length / settled.length) * 100 : 0,
    };
  }, [trades]);

  const recent = (trades ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Your balance, trades and performance at a glance"
        action={
          <div className="flex items-center gap-2 bg-surface border border-line rounded-lg px-3 py-2">
            <span className="text-accent text-xs font-bold">BTC</span>
            <span className="text-ink text-sm font-bold tabular-nums">
              {btc.price > 0
                ? `$${btc.price.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : '---'}
            </span>
            <span
              className={`text-xs font-medium tabular-nums ${
                btcUp ? 'text-up' : 'text-down'
              }`}
            >
              {btcUp ? '+' : ''}
              {btc.changePercent.toFixed(2)}%
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Wallet Balance"
          value={`$${(wallet?.balance ?? 0).toFixed(2)}`}
          hint="Available to trade"
          icon={WalletIcon}
          tone="accent"
          loading={walletLoading}
        />
        <StatCard
          label="Total Trades"
          value={stats.total}
          hint={`${stats.won} won / ${stats.lost} lost`}
          icon={ChartBarIcon}
          loading={tradesLoading}
        />
        <StatCard
          label="Active Trades"
          value={stats.active}
          hint={stats.active > 0 ? 'Awaiting settlement' : 'None open'}
          icon={ClockIcon}
          loading={tradesLoading}
        />
        <StatCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          hint={`From ${stats.settled} settled`}
          icon={TrophyIcon}
          tone={stats.settled === 0 ? 'default' : stats.winRate >= 50 ? 'up' : 'down'}
          loading={tradesLoading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-surface border border-line rounded-xl p-5 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-ink">{action.title}</h3>
                <p className="text-sm text-ink-muted mt-0.5">{action.desc}</p>
              </div>
              <action.icon className="h-6 w-6 shrink-0 text-accent" />
            </div>
          </Link>
        ))}
      </div>

      <Card flush>
        <CardHeader
          title="Recent Trades"
          action={
            stats.total > 5 ? (
              <Link
                href="/dashboard/trade-history"
                className="text-sm text-accent hover:text-accent-hover font-medium"
              >
                View all
              </Link>
            ) : undefined
          }
        />

        {tradesLoading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={ChartBarIcon}
            title="No trades yet"
            description="Place your first trade to see it here."
            action={
              <Link href="/dashboard/trade">
                <Button size="sm">Start Trading</Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {recent.map((bet: Bet) => (
              <TradeRow key={bet.id} bet={bet} />
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function TradeRow({ bet }: { bet: Bet }) {
  const isRise = bet.betType === 'rise';

  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center border ${
            isRise ? 'bg-up/10 border-up/25' : 'bg-down/10 border-down/25'
          }`}
        >
          {isRise ? (
            <ArrowTrendingUpIcon className="h-4 w-4 text-up" />
          ) : (
            <ArrowTrendingDownIcon className="h-4 w-4 text-down" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-ink text-sm tabular-nums">
            {isRise ? 'RISE' : 'FALL'} · ${parseFloat(bet.betAmount).toFixed(2)}
          </p>
          <p className="text-xs text-ink-faint">
            {new Date(bet.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      <Badge tone={statusTone(bet.status)}>{bet.status}</Badge>
    </li>
  );
}
