'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Card } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import { cn } from '@/lib/utils/cn';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type Filter = 'all' | 'active' | 'blocked' | 'admins';
const FILTERS: Filter[] = ['all', 'active', 'blocked', 'admins'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then((res) => res.data),
  });

  const toggleBlock = useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      adminApi.blockUser(userId, blocked),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const stats = useMemo(() => {
    const list = users ?? [];
    return {
      total: list.length,
      active: list.filter((u: any) => !u.isblocked).length,
      blocked: list.filter((u: any) => u.isblocked).length,
      deposited: list.filter((u: any) => u.hasMadeFirstDeposit).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (users ?? []).filter((u: any) => {
      if (filter === 'active' && u.isblocked) return false;
      if (filter === 'blocked' && !u.isblocked) return false;
      if (filter === 'admins' && u.roles === 'user') return false;
      if (!term) return true;
      return (
        u.email?.toLowerCase().includes(term) ||
        u.userName?.toLowerCase().includes(term) ||
        u.referralCode?.toLowerCase().includes(term)
      );
    });
  }, [users, search, filter]);

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="View, search and manage every account" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={stats.total} icon={UsersIcon} loading={isLoading} />
        <StatCard label="Active" value={stats.active} tone="up" loading={isLoading} />
        <StatCard
          label="Blocked"
          value={stats.blocked}
          tone={stats.blocked > 0 ? 'down' : 'default'}
          loading={isLoading}
        />
        <StatCard label="Funded" value={stats.deposited} hint="Made a deposit" loading={isLoading} />
      </div>

      <Card flush>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search email, username or code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>

          <div className="inline-flex bg-surface-2 border border-line rounded-lg p-0.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-medium capitalize transition-colors',
                  filter === f ? 'bg-accent text-accent-ink' : 'text-ink-muted hover:text-ink',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs text-ink-faint tabular-nums">
            {filtered.length} of {stats.total}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title={stats.total === 0 ? 'No users yet' : 'No users match this search'}
            description={
              stats.total === 0
                ? 'Accounts will appear here as people register.'
                : 'Try a different term or filter.'
            }
          />
        ) : (
          <Table>
            <THead>
              <TH>User</TH>
              <TH>Role</TH>
              <TH align="right">Balance</TH>
              <TH align="center">Deposited</TH>
              <TH>Joined</TH>
              <TH align="center">Status</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {filtered.map((user: any) => {
                const balance = parseFloat(user.wallet?.amount ?? '0') || 0;
                const isAdmin = user.roles !== 'user';

                return (
                  <TR key={user.id}>
                    <TD>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-surface-3 border border-line flex items-center justify-center">
                          <span className="text-xs font-bold text-ink-muted">
                            {user.userName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-sm font-medium text-ink hover:text-accent transition-colors truncate block"
                          >
                            {user.userName || 'Unnamed'}
                          </Link>
                          <p className="text-xs text-ink-faint truncate">{user.email}</p>
                        </div>
                      </div>
                    </TD>

                    <TD>
                      <Badge tone={isAdmin ? 'accent' : 'neutral'}>
                        {user.roles === 'super_admin' ? 'Super' : user.roles}
                      </Badge>
                    </TD>

                    <TD align="right" className="font-medium">
                      ${balance.toFixed(2)}
                    </TD>

                    <TD align="center">
                      {user.hasMadeFirstDeposit ? (
                        <CheckCircleIcon className="h-4 w-4 text-up inline" />
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </TD>

                    <TD className="text-ink-muted whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TD>

                    <TD align="center">
                      <Badge tone={user.isblocked ? 'down' : 'up'}>
                        {user.isblocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </TD>

                    <TD align="right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                        <Button
                          variant={user.isblocked ? 'secondary' : 'danger'}
                          size="sm"
                          loading={
                            toggleBlock.isPending &&
                            toggleBlock.variables?.userId === user.id
                          }
                          onClick={() =>
                            toggleBlock.mutate({
                              userId: user.id,
                              blocked: !user.isblocked,
                            })
                          }
                        >
                          {user.isblocked ? 'Unblock' : <NoSymbolIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}