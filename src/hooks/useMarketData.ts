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
) {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    try {
      const stream = `${BINANCE_WS}/${symbol.toLowerCase()}@kline_${interval}`;
      const socket = new WebSocket(stream);
      ws.current = socket;

      socket.onmessage = (evt) => {
        if (!isMounted.current) return;
        try {
          const msg = JSON.parse(evt.data);
          const { k } = msg;
          onCandle(
            {
              time: Math.floor(k.t / 1000),
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            },
            k.x
          );
        } catch {}
      };

      socket.onerror = () => {}; // Suppress error logs

      socket.onclose = () => {
        if (!isMounted.current) return;
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };
    } catch {}
  }, [symbol, interval, onCandle]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on intentional close
        ws.current.close();
        ws.current = null;
      }
    };
  }, [connect]);
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