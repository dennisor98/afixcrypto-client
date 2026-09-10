'use client';

import { useEffect, useState } from 'react';
import { fetchMultipleTickers, type Ticker24h } from '@/lib/api/marketApi';
import CoinIcon from '@/components/ui/CoinIcon';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'TRXUSDT', 'BNBUSDT', 'SOLUSDT'];

const SYMBOL_NAMES: Record<string, string> = {
  BTCUSDT: 'Bitcoin',
  ETHUSDT: 'Ethereum',
  TRXUSDT: 'TRON',
  BNBUSDT: 'BNB',
  SOLUSDT: 'Solana',
};

function formatPrice(p: number, symbol: string): string {
  if (symbol === 'TRXUSDT') return p.toFixed(5);
  if (symbol === 'BNBUSDT' || symbol === 'SOLUSDT') return p.toFixed(2);
  return p.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

export default function MarketTicker() {
  const [tickers, setTickers] = useState<Ticker24h[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchMultipleTickers(SYMBOLS);
        if (!cancelled) {
          setTickers(data);
          setLoading(false);
        }
      } catch (e) {
        console.error('Ticker fetch error', e);
        // Stop the skeleton so the row does not pulse forever on failure
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 10_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="w-full bg-base border border-line rounded-xl overflow-hidden">
      <div className="flex items-center overflow-x-auto divide-x divide-line">
        {loading
          ? SYMBOLS.map((s) => (
              <div key={s} className="shrink-0 px-5 py-3 min-w-[168px]">
                <div className="h-3 w-20 bg-surface-2 rounded animate-pulse mb-2" />
                <div className="h-4 w-28 bg-surface-2 rounded animate-pulse" />
              </div>
            ))
          : tickers.map((t) => {
              const isUp = t.changePercent >= 0;
              return (
                <div
                  key={t.symbol}
                  className="shrink-0 px-5 py-3 min-w-[168px] hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CoinIcon symbol={t.symbol} size="sm" />
                    <span className="text-ink-muted text-xs truncate">
                      {SYMBOL_NAMES[t.symbol] ?? t.symbol}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-ink font-bold text-sm tabular-nums">
                      ${formatPrice(t.price, t.symbol)}
                    </span>
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        isUp ? 'text-up' : 'text-down'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {t.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}