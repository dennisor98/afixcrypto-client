'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin.api';
import { isSuperAdmin } from '@/lib/utils/admin';
import { Card, CardHeader } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils/cn';
import {
  UsersIcon, ChartBarIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ClockIcon,
  BanknotesIcon, SignalIcon, Cog6ToothIcon, ClipboardDocumentListIcon,
  UserGroupIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

// inverted is optional, so the type is declared rather than inferred with
// `as const`, which would give each entry its own literal type
type KillSwitch = {
  key: 'tradingEnabled' | 'depositsEnabled' | 'withdrawalsEnabled' | 'maintenanceMode';
  label: string;
  inverted?: boolean;
};

const KILL_SWITCHES: KillSwitch[] = [
  { key: 'tradingEnabled', label: 'Trading' },
  { key: 'depositsEnabled', label: 'Deposits' },
  { key: 'withdrawalsEnabled', label: 'Withdrawals' },
  { key: 'maintenanceMode', label: 'Maintenance', inverted: true },
];

const SHORTCUTS = [
  { href: '/admin/signals', icon: SignalIcon, title: 'Signals', desc: 'Intervals and directions' },
  { href: '/admin/users', icon: UsersIcon, title: 'Users', desc: 'View, block and promote' },
  { href: '/admin/withdrawals', icon: ArrowDownTrayIcon, title: 'Withdrawals', desc: 'Approve or reject', showsPending: true },
  { href: '/admin/bets', icon: ChartBarIcon, title: 'Bets', desc: 'All trading activity' },
  { href: '/admin/treasury', icon: BanknotesIcon, title: 'Treasury', desc: 'Funds and P&L' },
  { href: '/admin/settings', icon: Cog6ToothIcon, title: 'Settings', desc: 'Fees, payouts, switches', superOnly: true },
  { href: '/admin/admins', icon: UserGroupIcon, title: 'Admins', desc: 'Manage the team', superOnly: true },
  { href: '/admin/audit-log', icon: ClipboardDocumentListIcon, title: 'Audit Log', desc: 'Every admin action', superOnly: true },
];

// Toggle reads as on when the platform is in its healthy state, so
// maintenance mode is inverted: green means maintenance is off.
function Toggle({
  on,
  danger,
  onClick,
  disabled,
}: {
  on: boolean;
  danger?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      role="switch"
      aria-checked={on}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        on ? (danger ? 'bg-down' : 'bg-up') : 'bg-surface-3',
      )}
    >
      <span
        className={cn(
          'inline-block h-3 w-3 rounded-full bg-white transition-transform',
          on ? 'translate-x-5' : 'translate-x-1',
        )}
      />
    </button>
  );
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [time, setTime] = useState<Date | null>(null);
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    setTime(new Date());
    setIsSuper(isSuperAdmin());
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
    enabled: isSuper,
  });

  const { data: auditLog } = useQuery({
    queryKey: ['admin-audit-log-recent'],
    queryFn: () => adminApi.getAuditLog({ limit: 5 }).then((r) => r.data),
    enabled: isSuper,
    refetchInterval: 60_000,
  });

  const { data: admins } = useQuery({
    queryKey: ['admin-list'],
    queryFn: () => adminApi.getAllAdmins().then((r) => r.data),
    enabled: isSuper,
  });

  const updateSettings = useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  });

  const pendingCount = stats?.pendingWithdrawals ?? 0;
  const shortcuts = SHORTCUTS.filter((s) => !s.superOnly || isSuper);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isSuper ? 'Command Center' : 'Admin Dashboard'}
        description={
          isSuper
            ? 'Full system control and platform health'
            : 'Platform performance and operations'
        }
        action={
          <div className="flex items-center gap-2">
            {isSuper && <Badge tone="accent">Super Admin</Badge>}
            {time && (
              <span className="text-xs text-ink-faint">
                Updated{' '}
                {time.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        }
      />

      {/* Kill switches */}
      {isSuper && settings && (
        <Card flush>
          <CardHeader
            title="Emergency Controls"
            description="Toggles take effect immediately across the platform"
            action={
              <ExclamationTriangleIcon className="h-5 w-5 text-ink-faint" />
            }
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
            {KILL_SWITCHES.map((item) => {
              const raw = Boolean(settings[item.key]);
              // Healthy state is on for the first three, off for maintenance
              const healthy = item.inverted ? !raw : raw;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 bg-surface-2 border border-line rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        'text-xs',
                        healthy ? 'text-up' : 'text-down',
                      )}
                    >
                      {item.inverted
                        ? raw ? 'Active' : 'Off'
                        : raw ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <Toggle
                    on={healthy}
                    danger={item.inverted}
                    disabled={updateSettings.isPending}
                    onClick={() =>
                      updateSettings.mutate({ [item.key]: !raw })
                    }
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          hint="Platform earnings to date"
          icon={BanknotesIcon}
          tone="accent"
          loading={statsLoading}
        />
        <StatCard
          label="Active Users"
          value={stats?.activeUsers ?? 0}
          hint={`${stats?.totalUsers ?? 0} registered`}
          icon={UsersIcon}
          loading={statsLoading}
        />
        <StatCard
          label="Active Bets"
          value={stats?.activeBets ?? 0}
          hint={`${stats?.totalBets ?? 0} all time`}
          icon={SignalIcon}
          loading={statsLoading}
        />
        <StatCard
          label="Pending Withdrawals"
          value={pendingCount}
          hint={pendingCount > 0 ? 'Needs review' : 'All clear'}
          icon={ClockIcon}
          tone={pendingCount > 0 ? 'down' : 'default'}
          loading={statsLoading}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Deposits"
          value={stats?.totalDeposits ?? 0}
          icon={ArrowUpTrayIcon}
          loading={statsLoading}
        />
        <StatCard
          label="Total Withdrawals"
          value={stats?.totalWithdrawals ?? 0}
          icon={ArrowDownTrayIcon}
          loading={statsLoading}
        />
        <StatCard
          label="Total Bets"
          value={stats?.totalBets ?? 0}
          icon={ChartBarIcon}
          loading={statsLoading}
        />
        {isSuper && (
          <StatCard
            label="Platform Admins"
            value={admins?.length ?? 0}
            hint="Manage the team"
            icon={UserGroupIcon}
            loading={statsLoading}
          />
        )}
      </div>

      {/* Audit log and admin team */}
      {isSuper && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card flush>
            <CardHeader
              title="Recent Admin Actions"
              action={
                <Link
                  href="/admin/audit-log"
                  className="text-sm text-accent hover:text-accent-hover font-medium"
                >
                  View all
                </Link>
              }
            />
            {auditLog && auditLog.length > 0 ? (
              <ul className="divide-y divide-line">
                {auditLog.map((log: any) => (
                  <li key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
                      <span className="text-accent text-xs font-bold">
                        {log.admin?.userName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink">
                        <span className="font-medium">{log.admin?.userName}</span>{' '}
                        <span className="text-ink-muted">
                          {log.action.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-ink-muted mt-0.5 truncate">
                          {log.details}
                        </p>
                      )}
                      <p className="text-xs text-ink-faint mt-0.5">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={ClipboardDocumentListIcon}
                title="No actions yet"
                description="Admin activity will appear here."
              />
            )}
          </Card>

          <Card flush>
            <CardHeader
              title="Admin Team"
              action={
                <Link
                  href="/admin/admins"
                  className="text-sm text-accent hover:text-accent-hover font-medium"
                >
                  Manage
                </Link>
              }
            />
            {admins && admins.length > 0 ? (
              <ul className="divide-y divide-line">
                {admins.slice(0, 5).map((admin: any) => (
                  <li key={admin.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-surface-3 border border-line flex items-center justify-center">
                      <span className="text-ink-muted text-xs font-bold">
                        {admin.userName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {admin.userName}
                      </p>
                      <p className="text-xs text-ink-muted truncate">
                        {admin.email}
                      </p>
                    </div>
                    <Badge tone={admin.roles === 'super_admin' ? 'accent' : 'neutral'}>
                      {admin.roles === 'super_admin' ? 'Super' : 'Admin'}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={UserGroupIcon}
                title="No admins found"
                description="Promote a user to get started."
              />
            )}
          </Card>
        </div>
      )}

      {/* Shortcuts */}
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wider text-ink-faint mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {shortcuts.map((action) => {
            const badgeCount = action.showsPending ? pendingCount : 0;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group relative bg-surface border border-line rounded-xl p-4 hover:border-accent/40 transition-colors"
              >
                {badgeCount > 0 && (
                  <span className="absolute top-3 right-3 min-w-5 h-5 px-1.5 bg-down text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {badgeCount}
                  </span>
                )}
                <action.icon className="h-5 w-5 text-accent mb-3" />
                <h3 className="font-semibold text-ink text-sm">{action.title}</h3>
                <p className="text-xs text-ink-muted mt-0.5">{action.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}