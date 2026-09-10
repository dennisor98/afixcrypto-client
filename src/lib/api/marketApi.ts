// Binance public API — no API key required
const BINANCE_REST = 'https://api.binance.com/api/v3';

export type KlineInterval = '1m' | '3m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number; // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker24h {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
}

/** Fetch OHLCV candles for a symbol */
export async function fetchCandles(
  symbol: string,
  interval: KlineInterval,
  limit = 200
): Promise<Candle[]> {
  const res = await fetch(
    `${BINANCE_REST}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch candles');
  const raw: [number, string, string, string, string, string][] = await res.json();
  return raw.map((k) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
  }));
}

/** Fetch 24h ticker for one symbol */
export async function fetch24hTicker(symbol: string): Promise<Ticker24h> {
  const res = await fetch(`${BINANCE_REST}/ticker/24hr?symbol=${symbol}`);
  if (!res.ok) throw new Error(`Failed to fetch ticker for ${symbol}`);
  const d = await res.json();
  return {
    symbol,
    price: parseFloat(d.lastPrice),
    change: parseFloat(d.priceChange),
    changePercent: parseFloat(d.priceChangePercent),
    high: parseFloat(d.highPrice),
    low: parseFloat(d.lowPrice),
    volume: parseFloat(d.volume),
    quoteVolume: parseFloat(d.quoteVolume),
  };
}

/** Fetch 24h tickers for multiple symbols */
export async function fetchMultipleTickers(
  symbols: string[]
): Promise<Ticker24h[]> {
  const results = await Promise.allSettled(symbols.map(fetch24hTicker));
  return results
    .filter((r): r is PromiseFulfilledResult<Ticker24h> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export const BINANCE_WS = 'wss://stream.binance.com:9443/ws';