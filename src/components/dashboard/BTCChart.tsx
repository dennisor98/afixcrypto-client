'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import { fetchCandles, type Candle, type KlineInterval } from '@/lib/api/marketApi';
import { useLiveCandle, useLivePrice } from '@/hooks/useMarketData';

const INTERVALS: { label: string; value: KlineInterval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
];

interface ChartPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  label: string;
}

interface BTCChartProps {
  symbol?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartPoint;
  const isUp = d.close >= d.open;
  return (
    <div className="bg-tertiary border border-primary rounded-lg px-3 py-2 text-xs">
      <p className="text-secondary mb-1">{d.label}</p>
      <p className="text-primary">O: <span className="tabular-nums">${d.open.toLocaleString()}</span></p>
      <p className="text-primary">H: <span className="tabular-nums">${d.high.toLocaleString()}</span></p>
      <p className="text-primary">L: <span className="tabular-nums">${d.low.toLocaleString()}</span></p>
      <p className={isUp ? 'text-green-400' : 'text-red-400'}>
        C: <span className="tabular-nums">${d.close.toLocaleString()}</span>
      </p>
    </div>
  );
};

export default function BTCChart({ symbol = 'BTCUSDT', height = 420 }: BTCChartProps) {
  const [interval, setInterval] = useState<KlineInterval>('1m');
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const livePrice = useLivePrice(symbol);
  const isUp = livePrice.changePercent >= 0;

  const formatLabel = (ts: number, iv: KlineInterval) => {
    const d = new Date(ts * 1000);
    if (iv === '1d') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const loadCandles = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const candles: Candle[] = await fetchCandles(symbol, interval, 120);
      setData(candles.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        label: formatLabel(c.time, interval),
      })));
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [symbol, interval]);

  useEffect(() => {
    loadCandles(true);

    // The WebSocket is the primary source. This lightweight sync keeps the
    // current candle accurate after a temporary socket/network interruption.
    const refreshTimer = window.setInterval(() => loadCandles(), 15_000);
    return () => clearInterval(refreshTimer);
  }, [loadCandles]);

  // Live kline updates are the primary source for the chart.
  const candleConnected = useLiveCandle(symbol, interval, (candle) => {
    setData((prev) => {
      if (!prev.length) {
        return [{
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          label: formatLabel(candle.time, interval),
        }];
      }
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last.time === candle.time) {
        updated[updated.length - 1] = {
          ...last,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        };
      } else {
        updated.push({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          label: formatLabel(candle.time, interval),
        });
        if (updated.length > 120) updated.shift();
      }
      return updated;
    });
  });

  const priceColor = isUp ? '#0ecb81' : '#f6465d';
  const priceMin = data.length ? Math.min(...data.map((d) => d.low)) * 0.9995 : 0;
  const priceMax = data.length ? Math.max(...data.map((d) => d.high)) * 1.0005 : 0;

  // Show every Nth label to avoid clutter
  const step = Math.max(1, Math.floor(data.length / 8));

  return (
    <div className="w-full bg-primary rounded-xl border border-primary overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-primary">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-binance-yellow flex items-center justify-center text-black font-bold text-xs">₿</div>
            <span className="text-primary font-bold">{symbol.replace('USDT', '/USDT')}</span>
          </div>
          {livePrice.price > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-primary tabular-nums">
                ${livePrice.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(livePrice.changePercent).toFixed(2)}%
              </span>
            </div>
          )}
          <span
            title={candleConnected ? 'Connected to Binance live market data' : 'Reconnecting to Binance live market data'}
            className={`h-2 w-2 rounded-full ${candleConnected ? 'bg-up animate-pulse' : 'bg-ink-faint'}`}
          />
        </div>
        <div className="flex gap-1">
          {INTERVALS.map((i) => (
            <button
              key={i.value}
              onClick={() => setInterval(i.value)}
              className={`px-3 py-1 text-xs rounded font-medium transition-all ${
                interval === i.value
                  ? 'bg-binance-yellow text-black'
                  : 'text-secondary hover:text-primary hover:bg-tertiary'
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }} className="relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary z-10 gap-3">
            <div className="w-8 h-8 border-2 border-[#f0b90b] border-t-transparent rounded-full animate-spin" />
            <span className="text-secondary text-sm">Loading market data...</span>
          </div>
        )}
        {!loading && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={priceColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={priceColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2329" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#848e9c', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#1e2329' }}
                interval={step - 1}
              />
              <YAxis
                domain={[priceMin, priceMax]}
                tick={{ fill: '#848e9c', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={70}
                tickFormatter={(v) => `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke={priceColor}
                strokeWidth={1.5}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 3, fill: priceColor }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
