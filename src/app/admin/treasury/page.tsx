'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api/client';
import { BanknotesIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function AdminTreasuryPage() {
  const [copied, setCopied] = useState(false);

  const { data: treasury, isLoading } = useQuery({
    queryKey: ['admin-treasury'],
    queryFn: () => api.get('/wallet/admin/treasury').then((r) => r.data),
    refetchInterval: 30_000,
  });

  const copyAddress = () => {
    if (treasury?.address) {
      navigator.clipboard.writeText(treasury.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Treasury</h1>
        <p className="text-secondary mt-1">Platform wallet, balances, and revenue</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow" />
        </div>
      ) : (
        <>
          {/* Treasury wallet card */}
          <div className="bg-secondary rounded-xl border border-primary p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-binance-yellow/20 border border-binance-yellow/30 flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-binance-yellow" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-primary">Platform Treasury</h2>
                <p className="text-xs text-secondary">All platform revenue collects here</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-tertiary border border-primary rounded-lg p-4">
                <p className="text-xs text-secondary uppercase">USDT Balance</p>
                <p className="text-3xl font-bold text-primary mt-1 tabular-nums">
                  ${parseFloat(treasury?.usdtBalance || '0').toFixed(2)}
                </p>
              </div>
              <div className="bg-tertiary border border-primary rounded-lg p-4">
                <p className="text-xs text-secondary uppercase">TRX Balance (gas)</p>
                <p className="text-3xl font-bold text-primary mt-1 tabular-nums">
                  {parseFloat(treasury?.trxBalance || '0').toFixed(4)} TRX
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs text-secondary uppercase mb-2">Treasury Address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-tertiary border border-primary rounded-lg px-3 py-2 font-mono text-sm text-primary break-all">
                  {treasury?.address || 'Not configured'}
                </code>
                <button
                  onClick={copyAddress}
                  disabled={!treasury?.address}
                  className="px-4 py-2 bg-binance-yellow text-black rounded-lg hover:bg-binance-yellow-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* P&L stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg border border-primary p-4">
              <p className="text-sm text-secondary">Total User Balances</p>
              <p className="text-2xl font-bold text-primary mt-1 tabular-nums">
                ${parseFloat(treasury?.totalUserBalances || '0').toFixed(2)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg border border-primary p-4">
              <p className="text-sm text-secondary">Total Wagered</p>
              <p className="text-2xl font-bold text-primary mt-1 tabular-nums">
                ${parseFloat(treasury?.totalWagered || '0').toFixed(2)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg border border-primary p-4">
              <p className="text-sm text-secondary">Paid Out (Wins)</p>
              <p className="text-2xl font-bold text-red-500 mt-1 tabular-nums">
                ${parseFloat(treasury?.totalPaidOut || '0').toFixed(2)}
              </p>
            </div>
            <div className="bg-secondary rounded-lg border border-primary p-4">
              <p className="text-sm text-secondary">Platform Revenue</p>
              <p className={`text-2xl font-bold mt-1 tabular-nums ${
                parseFloat(treasury?.netRevenue || '0') >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ${parseFloat(treasury?.netRevenue || '0').toFixed(2)}
              </p>
            </div>
          </div>

          {/* Warning banner */}
          {parseFloat(treasury?.trxBalance || '0') < 50 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 font-semibold text-sm">⚠ Low TRX Balance</p>
              <p className="text-red-400/80 text-sm mt-1">
                Treasury TRX balance is low. Top up with TRX to ensure withdrawal transactions can be processed.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}