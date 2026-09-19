'use client';

import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { tradingBotsApi } from '@/lib/api/trading-bots.api';

export default function BotSparkline({ botId, direction }: { botId: string; direction?: 'rise' | 'fall' }) {
  const { data, isLoading } = useQuery({
    queryKey: ['trading-bot-analysis', botId],
    queryFn: () => tradingBotsApi.analysis(botId, 50).then((response) => response.data),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const points = (data?.candles ?? []).map((candle) => ({
    time: candle.time,
    close: candle.close,
  }));
  const color = (data?.direction ?? direction) === 'fall' ? '#f6465d' : '#0ecb81';
  const latest = data?.latestPrice ?? points.at(-1)?.close;

  return (
    <div className="w-full sm:w-[120px] shrink-0" aria-label="Live bot analysis chart">
      <div className="h-12 w-full">
        {isLoading && !points.length ? (
          <div className="h-full rounded bg-surface-3 animate-pulse" />
        ) : points.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 3, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id={`bot-spark-${botId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.[0] ? (
                    <div className="rounded bg-surface border border-line px-2 py-1 text-[10px] text-ink">
                      ${Number(payload[0].value).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                    </div>
                  ) : null
                }
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#bot-spark-${botId})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-[10px] text-ink-faint">No data</div>
        )}
      </div>
      <p className="mt-1 text-right text-[10px] tabular-nums text-ink-faint">
        {latest ? `$${Number(latest).toLocaleString('en-US', { maximumFractionDigits: 2 })}` : 'Loading'}
      </p>
    </div>
  );
}