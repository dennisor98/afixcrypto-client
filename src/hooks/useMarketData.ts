'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BINANCE_WS, type Candle, type KlineInterval } from '@/lib/api/marketApi';

interface LivePrice {
  price: number;
  change: number;
  changePercent: number;
}

/** Live kline updates from Binance WebSocket — with auto-reconnect */
export function useLiveCandle(
  symbol: string,
  interval: KlineInterval,
  onCandle: (candle: Candle, isClosed: boolean) => void
): boolean {
  const [connected, setConnected] = useState(false);
  const onCandleRef = useRef(onCandle);

  // Keep the latest render's handler without treating it as changed socket
  // configuration. The chart passes an inline handler on every render.
  useEffect(() => {
    onCandleRef.current = onCandle;
  }, [onCandle]);

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (disposed) return;

      try {
        socket = new WebSocket(`${BINANCE_WS}/${symbol.toLowerCase()}@kline_${interval}`);
        socket.onopen = () => {
          if (!disposed) setConnected(true);
        };
        socket.onmessage = (evt) => {
          if (disposed) return;
          try {
            const msg = JSON.parse(evt.data);
            const k = msg.k ?? msg.data?.k;
            if (!k) return;
            onCandleRef.current({
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            }, k.x);
          } catch {
            // Ignore malformed messages and retain the current candle.
          }
        };
        socket.onerror = () => {}; // Suppress transient connection errors.
        socket.onclose = () => {
          if (disposed) return;
          setConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      disposed = true;
      setConnected(false);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [symbol, interval]);

  return connected;
}

/** Live ticker price from Binance miniTicker stream — with auto-reconnect */
export function useLivePrice(symbol: string): LivePrice {
  const [price, setPrice] = useState<LivePrice>({ price: 0, change: 0, changePercent: 0 });
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    try {
      const stream = `${BINANCE_WS}/${symbol.toLowerCase()}@miniTicker`;
      const socket = new WebSocket(stream);
      ws.current = socket;

      socket.onmessage = (evt) => {
        if (!isMounted.current) return;
        try {
          const d = JSON.parse(evt.data);
          const close = parseFloat(d.c);
          const open = parseFloat(d.o);
          setPrice({
            price: close,
            change: close - open,
            changePercent: ((close - open) / open) * 100,
          });
        } catch {}
      };

      socket.onerror = () => {}; // Suppress error logs

      socket.onclose = () => {
        if (!isMounted.current) return;
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    } catch {}
  }, [symbol]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);

  return price;
}
