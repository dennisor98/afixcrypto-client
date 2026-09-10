'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth.api';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { Card, CardHeader } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import {
  ShieldCheckIcon,
  KeyIcon,
  EnvelopeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

function formatDate(value?: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const { data: security, isLoading } = useQuery({
    queryKey: ['security'],
    queryFn: () => authApi.getSecurity().then((res) => res.data),
  });

  const changePw = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      setPwSuccess('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      queryClient.invalidateQueries({ queryKey: ['security'] });
      setTimeout(() => setPwSuccess(''), 5000);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      setPwError(
        Array.isArray(msg) ? msg.join('. ') : msg || 'Could not change the password',
      );
    },
  });

  const toggle2fa = useMutation({
    mutationFn: (enabled: boolean) => authApi.toggle2fa(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['security'] }),
  });

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    changePw.mutate({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    });
  };

  const twoFactorOn = Boolean(security?.twoFactorEnabled);
  const emailConfirmed = Boolean(security?.isEmailConfirmed);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Manage your password and account protection"
      />

      {pwSuccess && <Alert tone="success">{pwSuccess}</Alert>}

      {/* A one time code is emailed on every login regardless of this setting,
          so the copy avoids implying the account is unprotected without it */}
      <Card>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'h-12 w-12 shrink-0 rounded-xl border flex items-center justify-center',
              twoFactorOn
                ? 'bg-up/12 border-up/30'
                : 'bg-accent/12 border-accent/30',
            )}
          >
            <ShieldCheckIcon
              className={cn('h-6 w-6', twoFactorOn ? 'text-up' : 'text-accent')}
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">
              {twoFactorOn ? 'Extra protection enabled' : 'Baseline protection active'}
            </h2>
            <p className="text-sm text-ink-muted mt-1 leading-relaxed">
              Every sign in already requires a one time code sent to your email.
              {twoFactorOn
                ? ' You have additional two factor protection enabled on top of that.'
                : ' Enabling two factor adds a further layer on sensitive actions.'}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusRow
          icon={EnvelopeIcon}
          label="Email verification"
          value={emailConfirmed ? 'Verified' : 'Not verified'}
          tone={emailConfirmed ? 'up' : 'down'}
          loading={isLoading}
        />
        <StatusRow
          icon={KeyIcon}
          label="Password last changed"
          value={formatDate(security?.passwordChangedAt)}
          loading={isLoading}
        />
        <StatusRow
          icon={ClockIcon}
          label="Last sign in"
          value={formatDate(security?.lastLoginAt)}
          loading={isLoading}
        />
        <StatusRow
          icon={ShieldCheckIcon}
          label="Two factor"
          value={twoFactorOn ? 'Enabled' : 'Disabled'}
          tone={twoFactorOn ? 'up' : 'neutral'}
          loading={isLoading}
        />
      </div>

      <Card flush>
        <CardHeader
          title="Two factor authentication"
          description="Adds a second check beyond the email code"
          action={
            <Button
              variant={twoFactorOn ? 'secondary' : 'primary'}
              size="sm"
              loading={toggle2fa.isPending}
              onClick={() => toggle2fa.mutate(!twoFactorOn)}
            >
              {twoFactorOn ? 'Disable' : 'Enable'}
            </Button>
          }
        />
        <div className="p-5">
          <p className="text-sm text-ink-muted leading-relaxed">
            When enabled, sensitive account actions require an additional
            verification step. This is separate from the sign in code, which is
            always required.
          </p>
        </div>
      </Card>

      <Card flush>
        <CardHeader
          title="Password"
          description="Use a unique password you do not use elsewhere"
          action={
            !showPasswordForm ? (
              <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(true)}>
                Change
              </Button>
            ) : undefined
          }
        />

        <div className="p-5">
          {!showPasswordForm ? (
            <p className="text-sm text-ink-muted">
              Last changed {formatDate(security?.passwordChangedAt).toLowerCase()}.
            </p>
          ) : (
            <form onSubmit={submitPassword} className="space-y-4 max-w-md">
              {pwError && <Alert tone="error">{pwError}</Alert>}

              <Input
                type="password"
                name="currentPassword"
                label="Current password"
                autoComplete="current-password"
                value={pwForm.currentPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, currentPassword: e.target.value })
                }
                required
              />

              <div>
                <Input
                  type="password"
                  name="newPassword"
                  label="New password"
                  autoComplete="new-password"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, newPassword: e.target.value })
                  }
                  required
                />
                <PasswordStrengthMeter password={pwForm.newPassword} />
              </div>

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm new password"
                autoComplete="new-password"
                value={pwForm.confirmPassword}
                onChange={(e) =>
                  setPwForm({ ...pwForm, confirmPassword: e.target.value })
                }
                error={
                  pwForm.confirmPassword &&
                  pwForm.confirmPassword !== pwForm.newPassword
                    ? 'Passwords do not match'
                    : undefined
                }
                required
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  loading={changePw.isPending}
                  disabled={
                    !pwForm.currentPassword ||
                    !pwForm.newPassword ||
                    pwForm.newPassword !== pwForm.confirmPassword
                  }
                >
                  Update password
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPwError('');
                    setPwForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

function StatusRow({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-surface border border-line rounded-xl p-4">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-surface-2 border border-line flex items-center justify-center">
        <Icon className="h-4 w-4 text-ink-muted" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
        {loading ? (
          <div className="h-4 w-28 bg-surface-2 rounded mt-1.5 animate-pulse" />
        ) : (
          <p className="text-sm text-ink font-medium mt-0.5 truncate">{value}</p>
        )}
      </div>
      {!loading && tone !== 'neutral' && (
        <Badge tone={tone}>{tone === 'up' ? 'Good' : 'Action needed'}</Badge>
      )}
    </div>
  );
}