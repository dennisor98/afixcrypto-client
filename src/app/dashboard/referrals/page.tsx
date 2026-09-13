'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { referralApi } from '@/lib/api/referral.api';
import { Card, CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import {
  DocumentDuplicateIcon,
  CheckIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

export default function ReferralsPage() {
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['referral-stats'],
    queryFn: () => referralApi.getReferralStats().then((r) => r.data),
  });

  const user =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('user') || '{}')
      : {};

  const referralCode = user.referralCode || (stats as any)?.referralCode || '';
  const referralLink =
    typeof window !== 'undefined' && referralCode
      ? `${window.location.origin}/auth/register?ref=${referralCode}`
      : '';

  // navigator.clipboard is unavailable on insecure origins, so fail quietly
  const copy = async (value: string, which: 'code' | 'link') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const totalReferred = (stats as any)?.total ?? 0;
  const activeReferred = (stats as any)?.active ?? 0;
  const totalEarned = Number((stats as any)?.totalAmount ?? 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referrals"
        description="Earn a bonus when someone you invite makes their first deposit"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard
          label="Total Referred"
          value={totalReferred}
          hint="People who signed up"
          icon={UserGroupIcon}
          loading={isLoading}
        />
        <StatCard
          label="Active"
          value={activeReferred}
          hint="Made a first deposit"
          icon={UserPlusIcon}
          loading={isLoading}
        />
        <StatCard
          label="Total Earned"
          value={`$${totalEarned.toFixed(2)}`}
          hint="Paid to your balance"
          icon={CurrencyDollarIcon}
          tone="accent"
          loading={isLoading}
        />
      </div>

      <Card flush>
        <CardHeader
          title="Your Referral Link"
          description="Share this and your bonus is credited automatically"
        />

        {referralCode ? (
          <div className="p-5 space-y-4">
            <div>
              <p className="text-sm text-ink-muted mb-2">Referral code</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 h-11 px-3.5 flex items-center bg-surface-2 border border-line rounded-lg">
                  <code className="text-accent font-bold tracking-widest">
                    {referralCode}
                  </code>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => copy(referralCode, 'code')}
                  className="shrink-0 justify-center"
                >
                  {copied === 'code' ? (
                    <CheckIcon className="h-4 w-4 text-up" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-ink-muted mb-2">Invite link</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 h-11 px-3.5 flex items-center bg-surface-2 border border-line rounded-lg min-w-0">
                  <span className="text-ink text-sm truncate font-mono">
                    {referralLink}
                  </span>
                </div>
                <Button
                  onClick={() => copy(referralLink, 'link')}
                  className="shrink-0 justify-center"
                >
                  {copied === 'link' ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  )}
                  {copied === 'link' ? 'Copied' : 'Copy link'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={UserGroupIcon}
            title="No referral code yet"
            description="Your code is created with your account. Try refreshing."
          />
        )}
      </Card>

      <Card>
        <h3 className="font-semibold text-ink mb-3">How it works</h3>
        <ol className="space-y-2.5">
          {[
            'Share your link or code with someone who wants to trade.',
            'They sign up using it and verify their email.',
            'When they make their first deposit, your bonus is credited to your balance automatically.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="h-5 w-5 shrink-0 rounded-full bg-accent/12 border border-accent/25 text-accent text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="text-ink-muted">{step}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
