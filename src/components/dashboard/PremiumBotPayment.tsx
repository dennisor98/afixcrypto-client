'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tradingBotsApi } from '@/lib/api/trading-bots.api';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import QRCodeDisplay from '@/components/wallet/QRCodeDisplay';
import { CheckIcon, DocumentDuplicateIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function PremiumBotPayment() {
  const queryClient = useQueryClient();
  const [transactionHash, setTransactionHash] = useState('');
  const [copied, setCopied] = useState(false);

  const paymentInfo = useQuery({
    queryKey: ['premium-payment-info'],
    queryFn: () => tradingBotsApi.getPremiumPaymentInfo().then((response) => response.data),
    staleTime: 60_000,
  });

  const verify = useMutation({
    mutationFn: () => tradingBotsApi.verifyPremiumPayment(transactionHash.trim()),
    onSuccess: () => {
      setTransactionHash('');
      queryClient.invalidateQueries({ queryKey: ['premium-access'] });
      queryClient.invalidateQueries({ queryKey: ['bot-subscription-status'] });
    },
  });

  const address = paymentInfo.data?.treasuryAddress ?? '';
  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access may be unavailable on non-secure origins.
    }
  };

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-4">
      <div>
        <p className="font-semibold text-ink">Premium bot access</p>
        <p className="text-sm text-ink-muted mt-1">
          Send exactly 40 USDT to unlock premium bots. Access is granted after the transaction is confirmed.
        </p>
      </div>

      <Alert tone="warning">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span>Use only USDT on the TRC20 network. Sending another asset or using another network may permanently lose your funds.</span>
        </div>
      </Alert>

      {paymentInfo.isLoading ? (
        <div className="flex justify-center py-6"><Spinner /></div>
      ) : paymentInfo.error ? (
        <p className="text-sm text-down">Unable to load the premium treasury address.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded bg-surface-2 border border-line p-2">
              <p className="text-xs text-ink-faint">Amount</p>
              <p className="font-semibold text-ink">40 USDT</p>
            </div>
            <div className="rounded bg-surface-2 border border-line p-2">
              <p className="text-xs text-ink-faint">Network</p>
              <p className="font-semibold text-ink">TRC20</p>
            </div>
            <div className="rounded bg-surface-2 border border-line p-2">
              <p className="text-xs text-ink-faint">Asset</p>
              <p className="font-semibold text-ink">USDT</p>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-lg border border-line bg-surface-2 p-3">
            <QRCodeDisplay address={address} />
          </div>

          <div>
            <p className="text-xs text-ink-muted mb-1.5">Treasury address</p>
            <div className="flex gap-2">
              <code className="min-w-0 flex-1 rounded-lg bg-surface-2 border border-line px-3 py-2 text-xs text-ink break-all">
                {address}
              </code>
              <Button variant="secondary" onClick={copyAddress} className="shrink-0 self-start">
                {copied ? <CheckIcon className="h-4 w-4 text-up" /> : <DocumentDuplicateIcon className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs text-ink-muted" htmlFor="premium-transaction-hash">
              TRON transaction hash
            </label>
            <input
              id="premium-transaction-hash"
              value={transactionHash}
              onChange={(event) => setTransactionHash(event.target.value)}
              placeholder="Paste the confirmed transaction hash"
              className="w-full rounded-lg bg-surface-2 border border-line px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-accent"
            />
            <Button
              fullWidth
              loading={verify.isPending}
              disabled={transactionHash.trim().length !== 64 || verify.isPending}
              onClick={() => verify.mutate()}
            >
              Verify 40 USDT payment
            </Button>
            {verify.isSuccess && <p className="text-sm text-up">Payment verified. Premium bot access is now active.</p>}
            {verify.isError && (
              <p className="text-sm text-down">
                {(verify.error as any)?.response?.data?.message || 'Payment could not be verified yet.'}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}