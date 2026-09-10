'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import io from 'socket.io-client';
import { notificationsApi, type NotificationRecord } from '@/lib/api/notifications.api';
import { Card } from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import {
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

type NType = NotificationRecord['type'];

const ICONS: Record<NType, React.ElementType> = {
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const TONES: Record<NType, string> = {
  success: 'text-up bg-up/10 border-up/25',
  warning: 'text-accent bg-accent/10 border-accent/25',
  error: 'text-down bg-down/10 border-down/25',
  info: 'text-ink-muted bg-surface-2 border-line',
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<any>(null);

  // History comes from the database, so the list survives a reload
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMine().then((r) => r.data),
  });

  // The socket only signals that something arrived; the list is refetched
  // so websocket and REST can never drift apart
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(`${apiUrl}/notification`, { auth: { token } });
    socketRef.current = socket;

    const refresh = () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('createNotification', refresh);

    return () => {
      socket.close();
    };
  }, [queryClient]);

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const list = notifications ?? [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Deposits, withdrawals and trade settlements"
        action={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  connected ? 'bg-up animate-pulse' : 'bg-ink-faint',
                )}
              />
              {connected ? 'Live' : 'Offline'}
            </span>
            {unread > 0 && (
              <Button
                variant="secondary"
                size="sm"
                loading={markAllRead.isPending}
                onClick={() => markAllRead.mutate()}
              >
                Mark all read
              </Button>
            )}
          </div>
        }
      />

      <Card flush>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 bg-surface-2 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={BellIcon}
            title="No notifications"
            description="Updates about your trades and transfers will appear here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((n) => {
              const Icon = ICONS[n.type] ?? InformationCircleIcon;
              return (
                <li
                  key={n.id}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                  className={cn(
                    'flex items-start gap-3 px-5 py-4 transition-colors',
                    !n.read && 'bg-accent/[0.04] cursor-pointer hover:bg-surface-2',
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center',
                      TONES[n.type] ?? TONES.info,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink text-sm">{n.title}</p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-ink-muted mt-0.5">{n.message}</p>
                    <p className="text-xs text-ink-faint mt-1">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}