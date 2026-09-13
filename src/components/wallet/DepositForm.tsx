'use client';

import { useState, useEffect } from 'react';
import { usePublicSettings } from '@/hooks/useBackendData';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import QRCodeDisplay from '@/components/wallet/QRCodeDisplay';
import {
  DocumentDuplicateIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// The TRON address may be stored as a string or as a { base58 } object
function extractAddress(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.base58 || raw.hex || '';
  return '';
}

export default function DepositForm() {
  const [address, setAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);
  const { data: settings } = usePublicSettings();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setAddress(extractAddress(JSON.parse(raw).address));
    } catch {
      // ignore malformed storage
    }
    setReady(true);
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

  const depositsDisabled = Boolean(settings && !settings.depositsEnabled);
  const minDeposit = Number(settings?.minDeposit ?? 10);

  if (!ready) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {depositsDisabled && (
        <Alert tone="error">
          Deposits are temporarily disabled. Funds sent now will not be credited
          until this is lifted.
        </Alert>
      )}

      <Alert tone="warning">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Send only USDT on the TRC20 network. Any other asset or network will be
            lost permanently.
          </span>
        </div>
      </Alert>

      <div>
        <p className="text-sm text-ink-muted mb-2">Your deposit address</p>
        {address ? (
          <div className="flex gap-2">
            <div className="flex-1 min-w-0 px-3.5 py-3 bg-surface-2 border border-line rounded-lg">
              <code className="text-ink text-sm font-mono break-all">{address}</code>
            </div>
            <Button variant="secondary" onClick={copy} className="shrink-0 self-start">
              {copied ? (
                <CheckIcon className="h-4 w-4 text-up" />
              ) : (
                <DocumentDuplicateIcon className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        ) : (
          <Alert tone="error">
            No deposit address is on file for this account. Contact support.
          </Alert>
        )}
      </div>

      {address && (
        <div className="flex flex-col items-center rounded-lg border border-line bg-surface-2 p-4">
          <p className="mb-3 text-sm font-medium text-ink">Scan to deposit</p>
          <QRCodeDisplay address={address} />
        </div>
      )}

      <div className="px-3.5 py-3 bg-surface-2 border border-line rounded-lg space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">Network</span>
          <span className="text-ink font-medium">TRON (TRC20)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Asset</span>
          <span className="text-ink font-medium">USDT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-muted">Minimum deposit</span>
          <span className="text-ink font-medium tabular-nums">
            {minDeposit.toFixed(2)} USDT
          </span>
        </div>
      </div>

      <p className="text-xs text-ink-faint leading-relaxed">
        Deposits are detected automatically and usually credited within a few
        minutes of confirmation. Your balance updates once the transfer is credited.
      </p>
    </div>
  );
}
