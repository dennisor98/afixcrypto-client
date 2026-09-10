'use client';

import { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';
import { useWallet, usePublicSettings } from '@/hooks/useBackendData';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Matches the TRC20 base58 format the backend validates against
const TRON_ADDRESS = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export default function WithdrawalForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { data: wallet } = useWallet();
  const { data: settings } = usePublicSettings();

  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const balance = wallet?.balance ?? 0;
  const amountNum = parseFloat(amount || '0');

  // Limits and fees come from platform settings, not hardcoded values
  const minWithdrawal = Number(settings?.minWithdrawal ?? 10);
  const networkFee = Number(settings?.withdrawalFee ?? 1);
  const serviceFee = Number(settings?.serviceFee ?? 1);
  const totalFees = networkFee + serviceFee;
  const totalDebit = amountNum > 0 ? amountNum + totalFees : 0;

  const withdrawalsDisabled = Boolean(settings && !settings.withdrawalsEnabled);
  const maintenance = Boolean(settings?.maintenanceMode);
  const blocked = withdrawalsDisabled || maintenance;

  const addressError = useMemo(() => {
    if (!address) return undefined;
    return TRON_ADDRESS.test(address.trim())
      ? undefined
      : 'Enter a valid TRC20 address, starting with T';
  }, [address]);

  const amountError = useMemo(() => {
    if (!amount) return undefined;
    if (isNaN(amountNum) || amountNum <= 0) return 'Enter a valid amount';
    if (amountNum < minWithdrawal) return `Minimum withdrawal is ${minWithdrawal} USDT`;
    if (totalDebit > balance) return `Balance does not cover the amount plus ${totalFees} USDT in fees`;
    return undefined;
  }, [amount, amountNum, minWithdrawal, totalDebit, balance, totalFees]);

  const withdraw = useMutation({
    mutationFn: () =>
      walletApi.requestWithdrawal({ address: address.trim(), amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      setSuccess('Withdrawal requested. An administrator will review it shortly.');
      setAddress('');
      setAmount('');
      setError('');
      setTimeout(() => {
        setSuccess('');
        onSuccess?.();
      }, 6000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join('. ') : msg || 'Could not request the withdrawal');
    },
  });

  const canSubmit =
    !blocked && !!address && !!amount && !addressError && !amountError && !withdraw.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    withdraw.mutate();
  };

  // The maximum is what remains after fees are taken from the balance
  const maxWithdrawable = Math.max(0, balance - totalFees);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {blocked && (
        <Alert tone="error">
          {maintenance
            ? settings?.maintenanceMessage || 'The platform is under maintenance.'
            : 'Withdrawals are temporarily disabled.'}
        </Alert>
      )}

      {success && <Alert tone="success">{success}</Alert>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex items-center justify-between px-3.5 py-3 bg-surface-2 border border-line rounded-lg">
        <span className="text-sm text-ink-muted">Available</span>
        <span className="text-ink font-bold tabular-nums">${balance.toFixed(2)}</span>
      </div>

      <Input
        label="Destination address"
        hint="TRC20 only"
        placeholder="T..."
        value={address}
        disabled={blocked}
        onChange={(e) => setAddress(e.target.value)}
        error={addressError}
        className="font-mono text-sm"
      />

      <div>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          label="Amount"
          hint={`Min ${minWithdrawal} USDT`}
          placeholder="0.00"
          suffix="USDT"
          value={amount}
          disabled={blocked}
          onChange={(e) => setAmount(e.target.value)}
          error={amountError}
        />
        <button
          type="button"
          disabled={blocked || maxWithdrawable < minWithdrawal}
          onClick={() => setAmount(maxWithdrawable.toFixed(2))}
          className="mt-2 h-8 px-3 text-xs rounded-lg bg-surface-2 border border-line text-ink-muted
                     hover:text-ink hover:border-line-strong transition-colors
                     disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Max {maxWithdrawable.toFixed(2)}
        </button>
      </div>

      {amountNum > 0 && !amountError && (
        <div className="px-3.5 py-3 bg-surface-2 border border-line rounded-lg space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">You receive</span>
            <span className="text-ink font-medium tabular-nums">
              ${amountNum.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Network fee</span>
            <span className="text-ink-muted tabular-nums">${networkFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Service fee</span>
            <span className="text-ink-muted tabular-nums">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-line">
            <span className="text-ink font-medium">Total debited</span>
            <span className="text-ink font-bold tabular-nums">
              ${totalDebit.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <Alert tone="warning">
        <div className="flex items-start gap-2">
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            Check the address carefully. Transfers on the TRON network cannot be
            reversed once sent.
          </span>
        </div>
      </Alert>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={withdraw.isPending}
        disabled={!canSubmit}
      >
        {withdraw.isPending ? 'Submitting' : 'Request withdrawal'}
      </Button>

      <p className="text-xs text-ink-faint text-center">
        Requests are reviewed by an administrator before payout.
      </p>
    </form>
  );
}