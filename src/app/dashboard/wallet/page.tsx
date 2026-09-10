'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useBackendData';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

// The deposit address belongs to the user record, not the wallet, and may
// arrive as a plain string or as a { base58, hex } object
function extractAddress(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.base58 || raw.hex || '';
  return '';
}

export default function WalletCard() {
  const { data: wallet, isLoading, error } = useWallet();
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setAddress(extractAddress(JSON.parse(raw).address));
    } catch {
      // ignore malformed storage
    }
  }, []);

  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard is unavailable on insecure origins
    }
  };

  const money = (v: number) =>
    v.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-ink-faint">
          My Wallet
        </h3>
        <Link
          href="/dashboard/wallet"
          className="text-xs text-accent hover:text-accent-hover font-medium"
        >
          Manage
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-down text-sm">Could not load your wallet</p>
      ) : (
        <div className="space-y-4">
          <div className="pb-3 border-b border-line">
            <p className="text-xs text-ink-muted">USDT Balance</p>
            <p className="text-2xl font-bold text-ink tabular-nums mt-0.5">
              ${money(wallet?.balance ?? 0)}
            </p>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div>
              <p className="text-xs text-ink-muted">Demo Balance</p>
              <p className="text-lg font-bold text-ink-muted tabular-nums mt-0.5">
                ${money(wallet?.virtualBalance ?? 0)}
              </p>
            </div>
            <span className="text-xs text-ink-faint">Practice only</span>
          </div>

          {address && (
            <div>
              <p className="text-xs text-ink-muted mb-1.5">
                Deposit address, TRC20 only
              </p>
              <button
                onClick={copy}
                title="Copy address"
                className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 border border-line
                           rounded-lg hover:border-line-strong transition-colors text-left"
              >
                <code className="flex-1 min-w-0 text-xs font-mono text-ink truncate">
                  {address}
                </code>
                {copied ? (
                  <CheckIcon className="h-4 w-4 shrink-0 text-up" />
                ) : (
                  <DocumentDuplicateIcon className="h-4 w-4 shrink-0 text-ink-faint" />
                )}
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <Link href="/dashboard/wallet/deposit" className="flex-1">
              <Button fullWidth size="sm">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Deposit
              </Button>
            </Link>
            <Link href="/dashboard/wallet/withdraw" className="flex-1">
              <Button fullWidth size="sm" variant="secondary">
                <ArrowUpTrayIcon className="h-4 w-4" />
                Withdraw
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}