'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useBackendData';
import { Card, CardHeader } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  UserIcon,
  EnvelopeIcon,
  WalletIcon,
  TicketIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// The TRON address may arrive as a string or as a { base58, hex } object
function extractAddress(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.base58 || raw.hex || '';
  return '';
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { data: wallet } = useWallet();

  // Identity comes from the login response held in localStorage.
  // Add a GET /user/me endpoint to make this live.
  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      parsed.address = extractAddress(parsed.address);
      setUser(parsed);
    } catch {
      // ignore malformed storage
    }
  }, []);

  const copyAddress = async () => {
    if (!user?.address) return;
    try {
      await navigator.clipboard.writeText(user.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner />
        <p className="text-ink-muted text-sm">Loading profile</p>
      </div>
    );
  }

  const isAdmin = user.roles === 'admin' || user.roles === 'super_admin';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Your account details and deposit address"
        action={
          <Link href="/dashboard/security">
            <Button variant="secondary" size="sm">
              <ShieldCheckIcon className="h-4 w-4" />
              Security
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
            <span className="text-accent font-bold text-xl">
              {user.userName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-ink truncate">
                {user.userName || 'Trader'}
              </h2>
              {isAdmin && (
                <Badge tone="accent">
                  {user.roles === 'super_admin' ? 'Super Admin' : 'Admin'}
                </Badge>
              )}
            </div>
            <p className="text-ink-muted text-sm truncate">{user.email}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailCard icon={UserIcon} label="Username" value={user.userName || '—'} />
        <DetailCard icon={EnvelopeIcon} label="Email" value={user.email || '—'} />
        <DetailCard
          icon={WalletIcon}
          label="Balance"
          value={`$${(wallet?.balance ?? 0).toFixed(2)}`}
        />
        <DetailCard
          icon={TicketIcon}
          label="Referral Code"
          value={user.referralCode || '—'}
        />
      </div>

      <Card flush>
        <CardHeader
          title="Deposit Address"
          description="Send only USDT on the TRC20 network to this address"
        />
        <div className="p-5">
          {user.address ? (
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3.5 py-3 bg-surface-2 border border-line rounded-lg">
                <code className="text-ink text-sm font-mono break-all">
                  {user.address}
                </code>
              </div>
              <Button
                variant="secondary"
                onClick={copyAddress}
                className="shrink-0 self-start"
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4 text-up" />
                ) : (
                  <DocumentDuplicateIcon className="h-4 w-4" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ) : (
            <p className="text-ink-muted text-sm">
              No deposit address on file. Contact support if this persists.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 bg-surface border border-line rounded-xl p-4">
      <div className="h-9 w-9 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
        <p className="text-ink font-medium mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}