'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { getCurrentUser, isSuperAdmin } from '@/lib/utils/admin';
import { Card } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function ManageAdminsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);

  useEffect(() => {
    const ok = isSuperAdmin();
    setAllowed(ok);
    setSelfId(getCurrentUser()?.id ?? null);
    if (!ok) router.push('/admin');
  }, [router]);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admin-list'],
    queryFn: () => adminApi.getAllAdmins().then((r) => r.data),
    enabled: allowed === true,
  });

  const { data: allUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getAllUsers().then((r) => r.data),
    enabled: showAddModal,
  });

  const notify = (tone: 'success' | 'error', text: string) => {
    setMessage({ tone, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-list'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const setRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.setUserRole(userId, role),
    onSuccess: (_d, vars) => {
      refresh();
      setShowAddModal(false);
      notify('success', `Role updated to ${vars.role.replace('_', ' ')}`);
    },
    onError: (err: any) =>
      notify('error', err?.response?.data?.message || 'Could not update the role'),
  });

  const toggleBlock = useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
      adminApi.blockUser(userId, blocked),
    onSuccess: () => {
      refresh();
      notify('success', 'Account status updated');
    },
    onError: (err: any) =>
      notify('error', err?.response?.data?.message || 'Could not update the account'),
  });

  const reset2fa = useMutation({
    mutationFn: (userId: string) => adminApi.resetUser2FA(userId),
    onSuccess: () => {
      refresh();
      notify('success', 'Two factor reset for that administrator');
    },
    onError: (err: any) =>
      notify('error', err?.response?.data?.message || 'Could not reset two factor'),
  });

  const filteredAdmins = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return admins ?? [];
    return (admins ?? []).filter(
      (a: any) =>
        a.email?.toLowerCase().includes(term) ||
        a.userName?.toLowerCase().includes(term),
    );
  }, [admins, searchTerm]);

  // Only ordinary users can be promoted, so existing admins are excluded
  const promotable = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return (allUsers ?? [])
      .filter((u: any) => u.roles === 'user')
      .filter(
        (u: any) =>
          !term ||
          u.email?.toLowerCase().includes(term) ||
          u.userName?.toLowerCase().includes(term),
      )
      .slice(0, 8);
  }, [allUsers, userSearch]);

  if (allowed === null) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!allowed) return null;

  const superCount = (admins ?? []).filter((a: any) => a.roles === 'super_admin').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Admins"
        description="Promote, demote and control administrator accounts"
        action={<Button onClick={() => setShowAddModal(true)}>Add administrator</Button>}
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <Card flush>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search administrators"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              suffix={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <span className="ml-auto text-xs text-ink-faint tabular-nums">
            {filteredAdmins.length} {filteredAdmins.length === 1 ? 'admin' : 'admins'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredAdmins.length === 0 ? (
          <EmptyState
            icon={UserGroupIcon}
            title="No administrators found"
            description="Promote a user to give them administrative access."
          />
        ) : (
          <Table>
            <THead>
              <TH>Administrator</TH>
              <TH>Role</TH>
              <TH align="center">Status</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {filteredAdmins.map((admin: any) => {
                const isSuper = admin.roles === 'super_admin';
                const isSelf = admin.id === selfId;
                // The last super admin must not be demoted or blocked,
                // otherwise nobody can administer the platform
                const isLastSuper = isSuper && superCount <= 1;
                const locked = isSelf || isLastSuper;

                return (
                  <TR key={admin.id}>
                    <TD>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
                          <span className="text-accent text-xs font-bold">
                            {admin.userName?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {admin.userName}
                            {isSelf && (
                              <span className="text-ink-faint font-normal"> (you)</span>
                            )}
                          </p>
                          <p className="text-xs text-ink-faint truncate">{admin.email}</p>
                        </div>
                      </div>
                    </TD>

                    <TD>
                      <Badge tone={isSuper ? 'accent' : 'neutral'}>
                        {isSuper ? 'Super Admin' : 'Admin'}
                      </Badge>
                    </TD>

                    <TD align="center">
                      <Badge tone={admin.isblocked ? 'down' : 'up'}>
                        {admin.isblocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </TD>

                    <TD align="right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        {!isSuper && !locked && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              setRole.mutate({ userId: admin.id, role: 'super_admin' })
                            }
                            loading={
                              setRole.isPending && setRole.variables?.userId === admin.id
                            }
                          >
                            <ShieldCheckIcon className="h-4 w-4" />
                            Make super
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          title="Reset two factor"
                          onClick={() => reset2fa.mutate(admin.id)}
                          loading={reset2fa.isPending && reset2fa.variables === admin.id}
                        >
                          <KeyIcon className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={locked}
                          title={
                            isSelf
                              ? 'You cannot change your own role'
                              : isLastSuper
                                ? 'The last super admin cannot be demoted'
                                : undefined
                          }
                          onClick={() => setRole.mutate({ userId: admin.id, role: 'user' })}
                        >
                          Demote
                        </Button>

                        <Button
                          variant={admin.isblocked ? 'secondary' : 'danger'}
                          size="sm"
                          disabled={locked}
                          onClick={() =>
                            toggleBlock.mutate({
                              userId: admin.id,
                              blocked: !admin.isblocked,
                            })
                          }
                        >
                          {admin.isblocked ? 'Unblock' : <NoSymbolIcon className="h-4 w-4" />}
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

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-surface border border-line rounded-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div>
                <h2 className="font-semibold text-ink">Add administrator</h2>
                <p className="text-sm text-ink-muted mt-0.5">
                  Search for a user to promote
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-ink-muted hover:text-ink"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Input
                placeholder="Search by email or username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                suffix={<MagnifyingGlassIcon className="h-4 w-4" />}
                autoFocus
              />

              {!allUsers ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : promotable.length === 0 ? (
                <p className="text-sm text-ink-muted text-center py-8">
                  {userSearch ? 'No matching users' : 'No users available to promote'}
                </p>
              ) : (
                <ul className="divide-y divide-line border border-line rounded-lg overflow-hidden">
                  {promotable.map((u: any) => (
                    <li
                      key={u.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-ink truncate">{u.userName}</p>
                        <p className="text-xs text-ink-faint truncate">{u.email}</p>
                      </div>
                      <Button
                        size="sm"
                        loading={setRole.isPending && setRole.variables?.userId === u.id}
                        onClick={() => setRole.mutate({ userId: u.id, role: 'admin' })}
                      >
                        Promote
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <Alert tone="warning">
                Administrators can approve withdrawals and adjust balances. Every
                action they take is recorded in the audit log.
              </Alert>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}