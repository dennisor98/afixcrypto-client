'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { isSuperAdmin } from '@/lib/utils/admin';
import { Card, CardHeader } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import Badge, { statusTone } from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils/cn';
import {
  WalletIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.userId as string;

  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');

  const isSuper = isSuperAdmin();

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminApi.getUserById(userId).then((r) => r.data),
  });

  const notify = (tone: 'success' | 'error', text: string) => {
    setMessage({ tone, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  // Every action shares the same success and error handling. They are
  // declared individually because hooks cannot be created inside a helper.
  const mutationOptions = (successText: string) => ({
    onSuccess: () => {
      refresh();
      notify('success', successText);
    },
    onError: (err: any) =>
      notify('error', err?.response?.data?.message || 'The action failed'),
  });

  const adjustBalance = useMutation({
    mutationFn: (data: any) => adminApi.adjustBalance(userId, data),
    onSuccess: () => {
      refresh();
      setAmount('');
      setReason('');
      notify('success', 'Balance adjusted and recorded in the audit log');
    },
    onError: (err: any) =>
      notify('error', err?.response?.data?.message || 'Could not adjust the balance'),
  });

  const setRole = useMutation({
    mutationFn: (role: string) => adminApi.setUserRole(userId, role),
    ...mutationOptions('Role updated'),
  });

  const reset2FA = useMutation({
    mutationFn: () => adminApi.resetUser2FA(userId),
    ...mutationOptions('Two factor reset'),
  });

  const forceLogout = useMutation({
    mutationFn: () => adminApi.forceLogoutUser(userId),
    ...mutationOptions('Sessions revoked'),
  });

  const block = useMutation({
    mutationFn: (blocked: boolean) => adminApi.blockUser(userId, blocked),
    ...mutationOptions('Account status updated'),
  });

  const verifyEmail = useMutation({
    mutationFn: (verified: boolean) => adminApi.verifyUserEmail(userId, verified),
    ...mutationOptions('Email status updated'),
  });

  const firstDeposit = useMutation({
    mutationFn: (hasDeposit: boolean) => adminApi.setFirstDeposit(userId, hasDeposit),
    ...mutationOptions('Deposit status updated'),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        title="User not found"
        description="This account may have been removed."
        action={
          <Button variant="secondary" onClick={() => router.push('/admin/users')}>
            Back to users
          </Button>
        }
      />
    );
  }

  const balance = parseFloat(user.wallet?.amount ?? '0') || 0;
  const bets = user.bets ?? [];
  const wonCount = bets.filter((b: any) => b.status === 'won').length;
  const settled = bets.filter((b: any) => b.status !== 'pending').length;

  const canAdjust = Boolean(amount) && parseFloat(amount) > 0 && reason.trim().length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.userName || 'User'}
        description={user.email}
        action={
          <Button variant="secondary" size="sm" onClick={() => router.push('/admin/users')}>
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Button>
        }
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <div className="flex flex-wrap gap-2">
        <Badge tone={user.roles === 'user' ? 'neutral' : 'accent'}>
          {user.roles === 'super_admin' ? 'Super Admin' : user.roles}
        </Badge>
        <Badge tone={user.isblocked ? 'down' : 'up'}>
          {user.isblocked ? 'Blocked' : 'Active'}
        </Badge>
        <Badge tone={user.isEmailConfirmed ? 'up' : 'neutral'}>
          {user.isEmailConfirmed ? 'Email verified' : 'Email unverified'}
        </Badge>
        <Badge tone={user.hasMadeFirstDeposit ? 'up' : 'neutral'}>
          {user.hasMadeFirstDeposit ? 'Funded' : 'No deposit'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Balance" value={`$${balance.toFixed(2)}`} icon={WalletIcon} tone="accent" />
        <StatCard label="Total Trades" value={bets.length} icon={ChartBarIcon} />
        <StatCard
          label="Win Rate"
          value={settled > 0 ? `${((wonCount / settled) * 100).toFixed(1)}%` : '—'}
          hint={`${settled} settled`}
        />
        <StatCard label="Deposits" value={user.deposits?.length ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card flush>
          <CardHeader
            title="Adjust balance"
            description="A reason is required and is written to the audit log"
          />
          <div className="p-5 space-y-4">
            <div className="inline-flex bg-surface-2 border border-line rounded-lg p-0.5">
              {(['credit', 'debit'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setAdjustType(t)}
                  className={cn(
                    'px-4 h-8 rounded-md text-xs font-medium capitalize transition-colors',
                    adjustType === t
                      ? t === 'credit'
                        ? 'bg-up text-white'
                        : 'bg-down text-white'
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <Input
              type="number"
              step="0.01"
              min="0"
              label="Amount"
              suffix="USDT"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={
                adjustType === 'debit' && parseFloat(amount || '0') > balance
                  ? 'Exceeds the current balance'
                  : undefined
              }
            />

            <Input
              label="Reason"
              placeholder="For example, manual credit for an uncredited deposit"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />

            <Button
              fullWidth
              variant={adjustType === 'credit' ? 'up' : 'down'}
              disabled={!canAdjust}
              loading={adjustBalance.isPending}
              onClick={() =>
                adjustBalance.mutate({
                  amount: parseFloat(amount),
                  type: adjustType,
                  reason: reason.trim(),
                })
              }
            >
              {adjustType === 'credit' ? 'Credit' : 'Debit'} ${amount || '0.00'}
            </Button>
          </div>
        </Card>

        <Card flush>
          <CardHeader title="Account actions" />
          <div className="p-5 space-y-3">
            <ActionRow
              label={user.isblocked ? 'Unblock account' : 'Block account'}
              desc="A blocked user cannot trade or withdraw"
              button={
                <Button
                  size="sm"
                  variant={user.isblocked ? 'secondary' : 'danger'}
                  loading={block.isPending}
                  onClick={() => block.mutate(!user.isblocked)}
                >
                  {user.isblocked ? 'Unblock' : <NoSymbolIcon className="h-4 w-4" />}
                </Button>
              }
            />

            <ActionRow
              label="Email verification"
              desc="Manually mark the address as verified"
              button={
                <Button
                  size="sm"
                  variant="secondary"
                  loading={verifyEmail.isPending}
                  onClick={() => verifyEmail.mutate(!user.isEmailConfirmed)}
                >
                  {user.isEmailConfirmed ? 'Unverify' : 'Verify'}
                </Button>
              }
            />

            <ActionRow
              label="First deposit flag"
              desc="Controls whether the account may trade"
              button={
                <Button
                  size="sm"
                  variant="secondary"
                  loading={firstDeposit.isPending}
                  onClick={() => firstDeposit.mutate(!user.hasMadeFirstDeposit)}
                >
                  {user.hasMadeFirstDeposit ? 'Clear' : 'Set'}
                </Button>
              }
            />

            <ActionRow
              label="Reset two factor"
              desc="Use when a user has lost access"
              button={
                <Button
                  size="sm"
                  variant="secondary"
                  loading={reset2FA.isPending}
                  onClick={() => reset2FA.mutate()}
                >
                  <KeyIcon className="h-4 w-4" />
                  Reset
                </Button>
              }
            />

            <ActionRow
              label="Revoke sessions"
              desc="Invalidates the refresh token immediately"
              button={
                <Button
                  size="sm"
                  variant="secondary"
                  loading={forceLogout.isPending}
                  onClick={() => forceLogout.mutate()}
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Revoke
                </Button>
              }
            />

            {isSuper && (
              <ActionRow
                label="Role"
                desc="Administrators can approve withdrawals"
                button={
                  <div className="flex gap-2">
                    {user.roles !== 'admin' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={setRole.isPending}
                        onClick={() => setRole.mutate('admin')}
                      >
                        Make admin
                      </Button>
                    )}
                    {user.roles !== 'user' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={setRole.isPending}
                        onClick={() => setRole.mutate('user')}
                      >
                        Make user
                      </Button>
                    )}
                  </div>
                }
              />
            )}
          </div>
        </Card>
      </div>

      <Card flush>
        <CardHeader title="Recent trades" description="Most recent activity for this account" />
        {bets.length === 0 ? (
          <EmptyState
            icon={ChartBarIcon}
            title="No trades yet"
            description="This user has not placed a trade."
          />
        ) : (
          <Table>
            <THead>
              <TH>Direction</TH>
              <TH align="right">Amount</TH>
              <TH align="right">Entry</TH>
              <TH align="right">Exit</TH>
              <TH>Placed</TH>
              <TH align="center">Status</TH>
            </THead>
            <TBody>
              {bets.slice(0, 10).map((bet: any) => (
                <TR key={bet.id}>
                  <TD>
                    <span
                      className={cn(
                        'font-semibold text-sm',
                        bet.betType === 'rise' ? 'text-up' : 'text-down',
                      )}
                    >
                      {bet.betType === 'rise' ? 'RISE' : 'FALL'}
                    </span>
                  </TD>
                  <TD align="right">${parseFloat(bet.betAmount || '0').toFixed(2)}</TD>
                  <TD align="right" className="text-ink-muted">
                    {bet.startPrice ? `$${parseFloat(bet.startPrice).toFixed(2)}` : '—'}
                  </TD>
                  <TD align="right" className="text-ink-muted">
                    {bet.endPrice ? `$${parseFloat(bet.endPrice).toFixed(2)}` : '—'}
                  </TD>
                  <TD className="text-ink-muted whitespace-nowrap">
                    {new Date(bet.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TD>
                  <TD align="center">
                    <Badge tone={statusTone(bet.status)}>{bet.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

function ActionRow({
  label,
  desc,
  button,
}: {
  label: string;
  desc: string;
  button: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-2 border border-line rounded-lg">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
      </div>
      <div className="shrink-0">{button}</div>
    </div>
  );
}