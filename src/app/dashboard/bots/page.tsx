'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradingBotsApi, type BotSubscription } from '@/lib/api/trading-bots.api';
import { useUserTrades, useWallet } from '@/hooks/useBackendData';
import { Card, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import BotSparkline from '@/components/dashboard/BotSparkline';
import PremiumBotPayment from '@/components/dashboard/PremiumBotPayment';

const PERIODS: BotSubscription['period'][] = ['5m', '15m', '30m', '24h'];

function formatNextRun(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Pending scheduler'
    : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function TradingBotsPage() {
  const queryClient = useQueryClient();
  const { data: wallet } = useWallet();
  const { data: trades, isLoading: tradesLoading } = useUserTrades();
  const [selectedBot, setSelectedBot] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BotSubscription['period']>('5m');
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const bots = useQuery({
    queryKey: ['trading-bots'],
    queryFn: () => tradingBotsApi.list().then((response) => response.data),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 10_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });
  const subscriptions = useQuery({
    queryKey: ['bot-subscriptions'],
    queryFn: () => tradingBotsApi.listSubscriptions().then((response) => response.data),
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 10_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  const subscribe = useMutation({
    mutationFn: () => tradingBotsApi.subscribe({ botId: selectedBot, Amount: amount, Period: period }),
    onSuccess: () => {
      setAmount('');
      setMessage({ tone: 'success', text: 'Bot trading activated.' });
      queryClient.invalidateQueries({ queryKey: ['bot-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (error: any) => setMessage({
      tone: 'error',
      text: error?.response?.data?.message || 'Could not activate bot trading.',
    }),
  });

  const stop = useMutation({
    mutationFn: (id: string) => tradingBotsApi.stop(id),
    onSuccess: () => {
      setMessage({ tone: 'success', text: 'Bot trading stopped.' });
      queryClient.invalidateQueries({ queryKey: ['bot-subscriptions'] });
    },
    onError: () => setMessage({ tone: 'error', text: 'Could not stop bot trading.' }),
  });

  const amountValue = Number(amount);
  const canSubscribe = Boolean(selectedBot && amount && amountValue > 0 && amountValue <= (wallet?.balance ?? 0));
  const activeSubscriptions = (subscriptions.data ?? []).filter(
    (subscription) => subscription.isActive,
  );
  const selectedBotData = (bots.data ?? []).find((bot) => bot.id === selectedBot);
  const premiumAccess = useQuery({
    queryKey: ['premium-access'],
    queryFn: () => tradingBotsApi.getPremiumAccess().then((response) => response.data),
    enabled: Boolean(selectedBotData?.isPremium),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const botSubscriptionStatus = useQuery({
    queryKey: ['bot-subscription-status', selectedBot],
    queryFn: () => tradingBotsApi.getBotSubscriptionStatus(selectedBot).then((response) => response.data),
    enabled: Boolean(selectedBotData?.isPremium),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const premiumBotNeedsPayment = Boolean(
    selectedBotData?.isPremium &&
    !botSubscriptionStatus.data?.isSubscribed &&
    !premiumAccess.data?.hasPremiumAccess,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trading Bots"
        description="Automate recurring BTC trades with a strategy-backed execution schedule"
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <Card flush>
          <CardHeader title="Available strategies" description="Choose a bot, stake, and settlement period" />
          <div className="p-4 sm:p-5 space-y-4">
            {bots.isLoading ? (
              <div className="flex justify-center py-10"><Spinner size="lg" /></div>
            ) : bots.error ? (
              <p className="text-sm text-down">Unable to load trading bots.</p>
            ) : (bots.data ?? []).length === 0 ? (
              <p className="text-sm text-ink-muted">No active trading bots are available.</p>
            ) : (
              <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1 sm:max-h-[340px]">
                {(bots.data ?? []).map((bot) => (
                  <button
                    key={bot.id}
                    type="button"
                    onClick={() => setSelectedBot(bot.id)}
                    className={cn(
                      'w-full text-left rounded-lg border p-4 transition-colors',
                      selectedBot === bot.id
                        ? 'border-accent bg-accent/8'
                        : 'border-line bg-surface-2 hover:border-line-strong',
                    )}
                  >
                    <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink break-words">{bot.name}</p>
                          <span className={cn(
                            'rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            bot.isPremium
                              ? 'bg-accent/15 text-accent'
                              : 'bg-surface-3 text-ink-muted',
                          )}>
                            {bot.isPremium ? 'Premium' : 'Non-premium'}
                          </span>
                        </div>
                        <p className="text-sm text-ink-muted mt-1 leading-relaxed">{bot.description}</p>
                      </div>
                      <BotSparkline botId={bot.id} />
                    </div>
                    <p className="text-xs text-ink-faint mt-3 capitalize">{bot.symbol} · {bot.strategy.replace('_', ' ')}</p>
                  </button>
                ))}
              </div>
            )}

            {selectedBotData?.isPremium && botSubscriptionStatus.isLoading && (
              <div className="text-sm text-ink-muted">Checking premium bot access...</div>
            )}
            {premiumBotNeedsPayment && <PremiumBotPayment />}
            {selectedBotData?.isPremium && premiumAccess.data?.hasPremiumAccess && !botSubscriptionStatus.data?.isSubscribed && (
              <p className="rounded-lg border border-up/30 bg-up/5 px-3 py-2 text-sm text-up">
                Premium access verified. You can start this bot below.
              </p>
            )}

            <div className="border-t border-line pt-4 space-y-4">
              <Input
                type="number"
                min="0"
                step="0.01"
                label="Stake per automatic trade"
                hint={`Available: ${(wallet?.balance ?? 0).toFixed(2)} USDT`}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                suffix="USDT"
              />
              <div>
                <p className="text-sm text-ink-muted mb-2">Settlement period</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PERIODS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPeriod(option)}
                      className={cn(
                        'h-10 rounded-lg border text-sm font-medium',
                        period === option
                          ? 'bg-accent text-accent-ink border-accent'
                          : 'bg-surface-2 text-ink-muted border-line hover:border-line-strong',
                      )}
                    >
                      {option === '24h' ? '24 hr' : option}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                fullWidth
                size="lg"
                loading={subscribe.isPending}
                disabled={!canSubscribe || premiumBotNeedsPayment || subscribe.isPending}
                onClick={() => subscribe.mutate()}
              >
                Start automated trading
              </Button>
              {amount && amountValue > (wallet?.balance ?? 0) && (
                <p className="text-xs text-down">The stake cannot exceed your available balance.</p>
              )}
            </div>
          </div>
        </Card>

        <Card flush>
          <CardHeader title="Active automation" description="The scheduler runs due subscriptions every minute" />
          <div className="p-4 sm:p-5 space-y-3">
            {subscriptions.isLoading ? (
              <div className="flex justify-center py-10"><Spinner size="lg" /></div>
            ) : activeSubscriptions.length === 0 ? (
              <p className="text-sm text-ink-muted py-6">No active bot subscriptions yet.</p>
            ) : (
              activeSubscriptions.map((subscription) => (
                <div key={subscription.id} className="rounded-lg border border-line bg-surface-2 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{subscription.bot?.name || 'Trading bot'}</p>
                      <p className="text-sm text-ink-muted mt-1">
                        {Number(subscription.amount).toFixed(2)} USDT · {subscription.period}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-up">ACTIVE</span>
                  </div>
                  <p className="text-xs text-ink-faint mt-3">Next run: {formatNextRun(subscription.nextRunAt)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={stop.isPending}
                    onClick={() => stop.mutate(subscription.id)}
                    className="mt-3 w-full sm:w-auto text-down hover:text-down"
                  >
                    Stop bot
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card flush>
        <CardHeader title="Recent trades" description="Latest trades from your account, including automated executions" />
        <div className="divide-y divide-line">
          {tradesLoading ? (
            <div className="p-5 text-sm text-ink-muted">Loading recent trades...</div>
          ) : (trades ?? []).length === 0 ? (
            <div className="p-5 text-sm text-ink-muted">No trades have been executed yet.</div>
          ) : (
            (trades ?? []).slice(0, 6).map((trade) => (
              <div key={trade.id} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    <span className={trade.betType === 'rise' ? 'text-up' : 'text-down'}>
                      {trade.betType === 'rise' ? 'RISE' : 'FALL'}
                    </span>
                    <span className="text-ink-muted"> · </span>
                    ${Number(trade.betAmount).toFixed(2)}
                  </p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    {new Date(trade.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={cn(
                  'shrink-0 text-xs font-semibold uppercase',
                  trade.status === 'won' ? 'text-up' : trade.status === 'loss' ? 'text-down' : 'text-accent',
                )}>
                  {trade.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}