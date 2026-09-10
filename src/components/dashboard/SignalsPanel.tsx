'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTodaySignals, type Signal } from '@/hooks/useBackendData';

function minuteToTime(minute: number): string {
  const h = Math.floor(minute / 60).toString().padStart(2, '0');
  const m = (minute % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getSignalState(signal: Signal): 'upcoming' | 'live' | 'ended' {
  const now = new Date();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  if (minuteOfDay < signal.start_time) return 'upcoming';
  if (minuteOfDay >= signal.start_time && minuteOfDay < signal.endtime) return 'live';
  return 'ended';
}

function Countdown({ targetMinute }: { targetMinute: number }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function calc() {
      const now = new Date();
      const currentMinute = now.getHours() * 60 + now.getMinutes();
      const diff = targetMinute - currentMinute;
      if (diff <= 0) { setRemaining('Now'); return; }
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      setRemaining(h > 0 ? `${h}h ${m}m` : `${m}m`);
    }
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, [targetMinute]);

  return <span>{remaining}</span>;
}

export default function SignalsPanel() {
  const { data: signals, isLoading, error } = useTodaySignals();

  const sorted = signals?.slice().sort((a, b) => a.start_time - b.start_time) ?? [];

  return (
    <div className="bg-primary border border-primary rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary">
        <h3 className="text-secondary text-sm font-medium uppercase tracking-wider">
          Today&apos;s Signals
        </h3>
        <Link
          href="/dashboard/trade"
          className="text-xs bg-binance-yellow text-black font-bold px-3 py-1 rounded hover:bg-[#d4a017] transition-colors"
        >
          + Place Bet
        </Link>
      </div>

      <div className="divide-y divide-[#1e2329] max-h-[320px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="h-3 bg-tertiary rounded animate-pulse w-20" />
              <div className="h-3 bg-tertiary rounded animate-pulse w-16" />
              <div className="h-3 bg-tertiary rounded animate-pulse w-12" />
            </div>
          ))
        ) : error ? (
          <div className="px-5 py-8 text-center">
            <p className="text-red-400 text-sm">Failed to load signals</p>
            <p className="text-secondary text-xs mt-1">Check your connection</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-secondary text-sm">No signals for today</p>
          </div>
        ) : (
          sorted.map((signal) => {
            const state = getSignalState(signal);
            const isRise = signal.direction === 'rise';
            return (
              <div
                key={signal.id}
                className={`flex items-center justify-between px-5 py-3 transition-colors ${
                  state === 'live' ? 'bg-[#f0b90b08]' : 'hover:bg-[#1a1f28]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Direction badge */}
                  <div
                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                      isRise
                        ? 'bg-[#0ecb8120] text-green-400'
                        : 'bg-[#f6465d20] text-red-400'
                    }`}
                  >
                    {isRise ? '▲' : '▼'}
                  </div>
                  <div>
                    <p className="text-primary text-sm font-medium">
                      {minuteToTime(signal.start_time)} – {minuteToTime(signal.endtime)}
                    </p>
                    <p className="text-secondary text-xs">{signal.period_time}</p>
                  </div>
                </div>

                <div className="text-right">
                  {state === 'live' && (
                    <span className="inline-flex items-center gap-1 text-[#f0b90b] text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-binance-yellow rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                  {state === 'upcoming' && (
                    <span className="text-secondary text-xs">
                      <Countdown targetMinute={signal.start_time} />
                    </span>
                  )}
                  {state === 'ended' && (
                    <span className="text-[#2b3139] text-xs">Ended</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}