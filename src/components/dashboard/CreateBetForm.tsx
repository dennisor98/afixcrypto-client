'use client';

import { useState, useMemo, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { betsApi } from '@/lib/api/bets.api';
import { useWallet, useUserTrades, usePublicSettings } from '@/hooks/useBackendData';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils/cn';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const PERIODS = ['5m', '15m', '30m', '24h'] as const;
type Period = (typeof PERIODS)[number];
type Direction = 'rise' | 'fall';
type TradingTab = 'short-term' | 'roi';

const QUICK_AMOUNTS = [10, 25, 50, 100];

function getTimestamp(value: string): number {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue < 1e12 ? numericValue * 1000 : numericValue;
  }
  return new Date(value).getTime();
}

export default function CreateBetForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: wallet } = useWallet();
  const { data: trades } = useUserTrades();
  const { data: settings } = usePublicSettings();

  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<Direction>('rise');
  const [period, setPeriod] = useState<Period>('5m');
  const [tradingTab, setTradingTab] = useState<TradingTab>('short-term');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const balance = wallet?.balance ?? 0;
  const amountNum = parseFloat(amount || '0');

  // Limits come from the server; the fallbacks only cover the first render
  const minBet = Number(settings?.minBet ?? 1);
  const maxBet = Number(settings?.maxBet ?? 0);
  const payout = Number(settings?.payoutMultiplier ?? 1.95);
  const dailyReturnRate = Number(settings?.dailyTradeReturnRate ?? 5);
  const isTwentyFourHourTrade = period === '24h';
  const returnPct = ((payout - 1) * 100).toFixed(0);

  const tradingBlocked = Boolean(
    settings && (settings.maintenanceMode || !settings.tradingEnabled),
  );
  const blockReason = settings?.maintenanceMode
    ? settings.maintenanceMessage || 'Platform is under maintenance'
    : 'Trading is currently disabled';

  // The backend allows one open trade at a time, so mirror that here
  const hasOpenTrade = useMemo(
    () => (trades ?? []).some((t) => t.status === 'pending'),
    [trades],
  );
  const openTrade = useMemo(
    () => (trades ?? []).find((t) => t.status === 'pending'),
    [trades],
  );
  const openTradeCreatedAt = openTrade?.createdAt;
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!openTradeCreatedAt) {
      setElapsedSeconds(0);
      return;
    }

    const placedAt = getTimestamp(openTradeCreatedAt);
    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - placedAt) / 1000)));
    };

    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [openTradeCreatedAt]);

  const elapsedLabel = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  const validation = useMemo(() => {
    if (!amount) return null;
    if (isNaN(amountNum) || amountNum <= 0) return 'Enter a valid amount';
    if (amountNum < minBet) return `Minimum trade is ${minBet} USDT`;
    if (maxBet > 0 && amountNum > maxBet) return `Maximum trade is ${maxBet} USDT`;
    if (amountNum > balance) return 'Insufficient balance';
    return null;
  }, [amount, amountNum, minBet, maxBet, balance]);

  const placeBet = useMutation({
    mutationFn: () =>
      betsApi.create({
        Amount: amount,
        direction,
        Period: period,
        isVatual: false,
      } as any),
    onSuccess: (res: any) => {
      setSuccess(res?.data?.message || 'Trade placed. It will settle at the end of the period.');
      setAmount('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['userTrades'] });
      setTimeout(() => {
        setSuccess('');
        onSuccess?.();
      }, 4000);
    },
    onError: (err: any) => {
      if (err?.response?.status === 401) {
        setError('Session expired. Redirecting to login.');
        setTimeout(() => router.push('/auth/login'), 1500);
        return;
      }
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to place trade');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (tradingBlocked) return setError(blockReason);
    if (hasOpenTrade) return setError('You already have an active trade');
    if (!amount) return setError('Enter an amount');
    if (validation) return setError(validation);
    placeBet.mutate();
  };

  const disabled = tradingBlocked || hasOpenTrade;
  const canSubmit = !disabled && !!amount && !validation && !placeBet.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {tradingBlocked && (
        <Notice tone="down" icon={ExclamationTriangleIcon} title="Trading suspended">
          {blockReason}
        </Notice>
      )}

      {!tradingBlocked && hasOpenTrade && (
        <Notice tone="accent" icon={ExclamationTriangleIcon} title="Trade in progress">
          <span className="flex items-center justify-between gap-3">
            <span>Wait for your current trade to settle before placing another.</span>
            <span className="shrink-0 font-semibold tabular-nums">Elapsed {elapsedLabel}</span>
          </span>
        </Notice>
      )}

      <div className="flex items-center justify-between px-3.5 py-3 bg-surface-2 border border-line rounded-lg">
        <span className="text-sm text-ink-muted">Available</span>
        <span className="text-ink font-bold tabular-nums">
          ${balance.toFixed(2)}
        </span>
      </div>

      <div>
        <p className="text-sm text-ink-muted mb-2">Direction</p>
        <div className="grid grid-cols-2 gap-2">
          <DirectionButton
            active={direction === 'rise'}
            disabled={disabled}
            tone="up"
            icon={ArrowTrendingUpIcon}
            label="RISE"
            onClick={() => setDirection('rise')}
          />
          <DirectionButton
            active={direction === 'fall'}
            disabled={disabled}
            tone="down"
            icon={ArrowTrendingDownIcon}
            label="FALL"
            onClick={() => setDirection('fall')}
          />
        </div>
      </div>

      <div>
        <p className="text-sm text-ink-muted mb-2">Trade window</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          {([
            { id: 'short-term', label: 'Short-term' },
            { id: 'roi', label: `ROI 24hr trade (~${dailyReturnRate.toFixed(1)}%)` },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                setTradingTab(tab.id);
                setPeriod(tab.id === 'roi' ? '24h' : '5m');
              }}
              className={cn(
                'h-10 rounded-lg border text-sm font-medium transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                tradingTab === tab.id
                  ? 'bg-accent text-accent-ink border-accent'
                  : 'bg-surface-2 text-ink-muted border-line hover:border-line-strong',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tradingTab === 'short-term' && (
          <div className="grid grid-cols-3 gap-2">
            {PERIODS.slice(0, 3).map((p) => (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => setPeriod(p)}
                className={cn(
                  'h-10 rounded-lg border text-sm font-medium transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  period === p
                    ? 'bg-accent text-accent-ink border-accent'
                    : 'bg-surface-2 text-ink-muted border-line hover:border-line-strong',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        {tradingTab === 'roi' && (
          <div className="px-3.5 py-2.5 rounded-lg border border-accent/30 bg-accent/5 text-sm text-ink-muted">
            ROI 24hr trade at approximately {dailyReturnRate.toFixed(1)}% fixed return.
          </div>
        )}
      </div>

      <div>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          label="Amount"
          hint={maxBet > 0 ? `${minBet} – ${maxBet} USDT` : `Min ${minBet} USDT`}
          placeholder="0.00"
          value={amount}
          disabled={disabled}
          suffix="USDT"
          error={validation ?? undefined}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex gap-2 mt-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={disabled || amt > balance || amt < minBet}
              onClick={() => setAmount(String(amt))}
              className="flex-1 h-8 text-xs rounded-lg bg-surface-2 border border-line text-ink-muted
                         hover:text-ink hover:border-line-strong transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {amt}
            </button>
          ))}
          <button
            type="button"
            disabled={disabled || balance < minBet}
            onClick={() =>
              setAmount(
                (maxBet > 0 ? Math.min(balance, maxBet) : balance).toFixed(2),
              )
            }
            className="flex-1 h-8 text-xs rounded-lg bg-surface-2 border border-line text-ink-muted
                       hover:text-ink hover:border-line-strong transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            MAX
          </button>
        </div>
      </div>

      {amountNum > 0 && !validation && (
        <div className="px-3.5 py-3 bg-surface-2 border border-line rounded-lg space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">
              {isTwentyFourHourTrade
                ? `Fixed return (+${dailyReturnRate.toFixed(2)}%)`
                : `If correct (+${returnPct}%)`}
            </span>
            <span className="text-up font-bold tabular-nums">
              +${(
                isTwentyFourHourTrade
                  ? amountNum * (dailyReturnRate / 100)
                  : amountNum * payout - amountNum
              ).toFixed(2)}
            </span>
          </div>
          {!isTwentyFourHourTrade && (
            <div className="flex justify-between">
              <span className="text-ink-muted">If wrong</span>
              <span className="text-down font-bold tabular-nums">
                -${amountNum.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {error && (
        <Notice tone="down" icon={ExclamationTriangleIcon}>
          {error}
        </Notice>
      )}

      {success && (
        <Notice tone="up" icon={CheckCircleIcon}>
          {success}
        </Notice>
      )}

      <Button
        type="submit"
        fullWidth
        size="lg"
        variant={direction === 'rise' ? 'up' : 'down'}
        loading={placeBet.isPending}
        disabled={!canSubmit}
      >
        {placeBet.isPending ? 'Placing' : `Place ${direction.toUpperCase()} trade`}
      </Button>

      <p className="text-xs text-ink-faint text-center">
        Settled against live BTC price at the end of the period.
      </p>
    </form>
  );
}

function DirectionButton({
  active,
  disabled,
  tone,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  tone: 'up' | 'down';
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'h-16 rounded-lg border flex flex-col items-center justify-center gap-1 font-bold transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active
          ? tone === 'up'
            ? 'bg-up/15 border-up text-up'
            : 'bg-down/15 border-down text-down'
          : 'bg-surface-2 border-line text-ink-muted hover:border-line-strong',
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Notice({
  tone,
  icon: Icon,
  title,
  children,
}: {
  tone: 'up' | 'down' | 'accent';
  icon: React.ElementType;
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    up: 'bg-up/10 border-up/30 text-up',
    down: 'bg-down/10 border-down/30 text-down',
    accent: 'bg-accent/10 border-accent/30 text-accent',
  };

  return (
    <div className={cn('flex items-start gap-2.5 px-3.5 py-3 rounded-lg border text-sm', tones[tone])}>
      <Icon className="h-4.5 w-4.5 shrink-0 mt-0.5" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <p className={cn(title && 'opacity-80 mt-0.5')}>{children}</p>
      </div>
    </div>
  );
}