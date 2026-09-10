'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { betsApi } from '@/lib/api/bets.api';
import { userApi } from '@/lib/api/user.api';
import { getUser } from '@/lib/api/api';
import { useLivePrice } from '@/hooks/useMarketData';
import type { Signal, Direction } from '@/types/bet.types';
import type { Wallet } from '@/types/wallet.types';

function minuteToTime(minute: number) {
  return `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
}

function getState(signal: Signal): 'upcoming' | 'live' | 'ended' {
  const now = new Date();
  const m = now.getHours() * 60 + now.getMinutes();
  if (m < signal.start_time) return 'upcoming';
  if (m <= signal.endtime) return 'live';
  return 'ended';
}

export default function CreateBetForm() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = getUser();
  const btc = useLivePrice('BTCUSDT');

  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [direction, setDirection] = useState<'rise' | 'fall' | ''>('');
  const [amount, setAmount] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch today's signals — backend returns { signals, signalHours }
  const { data: signalsData, isLoading: sigLoading } = useQuery({
    queryKey: ['todaySignals'],
    queryFn: () => betsApi.getTodaySignals(),
    refetchInterval: 30_000,
    select: (res) => res.data.signals ?? [],
  });

  // Fetch wallet for balance check
  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['wallet'],
    queryFn: async () => (await userApi.getWallet()).data,
  });

  const availableSignals = (signalsData ?? [])
    .filter((s: Signal) => getState(s) !== 'ended')
    .sort((a: Signal, b: Signal) => a.start_time - b.start_time);

  const { mutate: placeBet, isPending, error: betError } = useMutation({
    mutationFn: () => {
      if (!selectedSignal || !direction || !amount || !user) throw new Error('Missing fields');
      return betsApi.create({
        user,
        Period: selectedSignal.period_time,
        Amount: amount,
        direction: direction as Direction,
        isVatual: isVirtual,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['userTrades'] });
      qc.invalidateQueries({ queryKey: ['wallet'] });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/bets'), 2000);
    },
  });

  // Use wallet type fields: amount (real), virtualamount (virtual)
  const balance = isVirtual
    ? parseFloat((wallet as any)?.virtualamount ?? '0')
    : parseFloat((wallet as any)?.amount ?? '0');

  const amountNum = parseFloat(amount);
  const insufficient = !isNaN(amountNum) && amountNum > balance;
  const canSubmit = selectedSignal && direction && amount && amountNum > 0 && !insufficient && !isPending;

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 bg-[#0ecb8120] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="#0ecb81" strokeWidth="2" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
          </svg>
        </div>
        <p className="text-primary font-bold text-xl">Bet placed!</p>
        <p className="text-secondary text-sm">Redirecting to trade history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Live price bar */}
      <div className="flex items-center justify-between bg-secondary border border-primary rounded-xl px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-binance-yellow rounded-full flex items-center justify-center text-black font-black">₿</div>
          <div>
            <p className="text-secondary text-xs">BTC / USDT Live Price</p>
            <p className="text-primary font-bold text-lg tabular-nums">
              {btc.price > 0 ? `$${btc.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Loading...'}
            </p>
          </div>
        </div>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg ${btc.changePercent >= 0 ? 'bg-[#0ecb8120] text-green-400' : 'bg-[#f6465d20] text-red-400'}`}>
          {btc.changePercent >= 0 ? '▲' : '▼'} {Math.abs(btc.changePercent).toFixed(2)}%
        </span>
      </div>

      {/* Step 1: Pick a signal */}
      <div className="bg-secondary border border-primary rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-primary">
          <h2 className="text-primary font-bold">Step 1 — Select a trading window</h2>
          <p className="text-secondary text-xs mt-1">Pick a live or upcoming signal to bet on</p>
        </div>
        <div className="divide-y divide-[#1e2329] max-h-72 overflow-y-auto">
          {sigLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-3">
                <div className="h-10 w-10 bg-tertiary rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-tertiary rounded animate-pulse w-32" />
                  <div className="h-3 bg-tertiary rounded animate-pulse w-20" />
                </div>
              </div>
            ))
          ) : availableSignals.length === 0 ? (
            <div className="px-5 py-10 text-center text-secondary text-sm">No active signals right now.</div>
          ) : (
            availableSignals.map((signal: Signal) => {
              const state = getState(signal);
              const selected = selectedSignal?.id === signal.id;
              return (
                <button
                  key={signal.id}
                  onClick={() => setSelectedSignal(signal)}
                  className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${selected ? 'bg-[#f0b90b08] border-l-2 border-[#f0b90b]' : 'hover:bg-[#1a1f28]'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${signal.direction === 'rise' ? 'bg-[#0ecb8115] text-green-400' : 'bg-[#f6465d15] text-red-400'}`}>
                      {signal.direction === 'rise' ? '▲' : '▼'}
                    </div>
                    <div>
                      <p className="text-primary text-sm font-medium">{minuteToTime(signal.start_time)} → {minuteToTime(signal.endtime)}</p>
                      <p className="text-secondary text-xs">{signal.period_time} · Signal: {signal.direction?.toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {state === 'live' && <span className="flex items-center gap-1 text-[#f0b90b] text-xs font-bold"><span className="w-1.5 h-1.5 bg-binance-yellow rounded-full animate-pulse"/>LIVE</span>}
                    {state === 'upcoming' && <span className="text-secondary text-xs">Upcoming</span>}
                    {selected && <div className="w-5 h-5 bg-binance-yellow rounded-full flex items-center justify-center"><svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-black"><path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd"/></svg></div>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Step 2: Direction */}
      <div className="bg-secondary border border-primary rounded-xl p-5">
        <h2 className="text-primary font-bold mb-1">Step 2 — Your prediction</h2>
        <p className="text-secondary text-xs mb-4">Will BTC price RISE or FALL during this window?</p>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setDirection('rise')} className={`py-5 rounded-xl font-bold text-lg border-2 transition-all ${direction === 'rise' ? 'bg-[#0ecb8115] border-[#0ecb81] text-green-400' : 'border-primary text-secondary hover:border-[#0ecb8140] hover:text-green-400'}`}>▲ RISE</button>
          <button onClick={() => setDirection('fall')} className={`py-5 rounded-xl font-bold text-lg border-2 transition-all ${direction === 'fall' ? 'bg-[#f6465d15] border-[#f6465d] text-red-400' : 'border-primary text-secondary hover:border-[#f6465d40] hover:text-red-400'}`}>▼ FALL</button>
        </div>
      </div>

      {/* Step 3: Amount */}
      <div className="bg-secondary border border-primary rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-primary font-bold">Step 3 — Stake amount</h2>
            <p className="text-secondary text-xs mt-0.5">
              Available: <span className="text-primary font-medium">${balance.toFixed(2)} USDT</span>
              {isVirtual && <span className="text-secondary"> (virtual)</span>}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-secondary text-xs">Virtual</span>
            <div onClick={() => setIsVirtual(!isVirtual)} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${isVirtual ? 'bg-binance-yellow' : 'bg-tertiary'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isVirtual ? 'translate-x-5' : 'translate-x-0.5'}`}/>
            </div>
          </label>
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold">$</span>
          <input type="number" min="1" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
            className="w-full bg-primary border border-primary text-primary rounded-xl pl-8 pr-20 py-3.5 text-sm focus:outline-none focus:border-[#f0b90b] transition-colors placeholder:text-[#2b3139]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary text-xs font-medium">USDT</span>
        </div>
        <div className="flex gap-2 mt-3">
          {[10, 25, 50, 100].map((v) => (
            <button key={v} onClick={() => setAmount(String(v))} className="flex-1 py-1.5 text-xs border border-primary text-secondary rounded-lg hover:border-[#f0b90b40] hover:text-[#f0b90b] transition-colors">${v}</button>
          ))}
        </div>
        {insufficient && <p className="text-red-400 text-xs mt-2">Insufficient balance. <a href="/dashboard/wallet" className="underline">Deposit funds →</a></p>}
      </div>

      {/* Summary */}
      {selectedSignal && direction && amount && (
        <div className="bg-secondary border border-primary rounded-xl p-4 space-y-2 text-sm">
          <p className="text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Order Summary</p>
          <div className="flex justify-between"><span className="text-secondary">Window</span><span className="text-primary">{minuteToTime(selectedSignal.start_time)} – {minuteToTime(selectedSignal.endtime)}</span></div>
          <div className="flex justify-between"><span className="text-secondary">Prediction</span><span className={`font-bold ${direction === 'rise' ? 'text-green-400' : 'text-red-400'}`}>{direction.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-secondary">Stake</span><span className="text-primary font-bold">${parseFloat(amount || '0').toFixed(2)} USDT</span></div>
          <div className="flex justify-between"><span className="text-secondary">Mode</span><span className="text-primary">{isVirtual ? 'Virtual' : 'Real'}</span></div>
        </div>
      )}

      {betError && (
        <div className="bg-[#f6465d15] border border-[#f6465d40] text-red-400 text-sm px-4 py-3 rounded-xl">
          {(betError as any)?.response?.data?.message || 'Failed to place bet. Please try again.'}
        </div>
      )}

      <button onClick={() => placeBet()} disabled={!canSubmit}
        className="w-full bg-binance-yellow text-black font-bold py-4 rounded-xl text-base hover:bg-[#d4a017] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isPending ? <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/>Placing bet...</span> : 'Place Bet'}
      </button>
    </div>
  );
}