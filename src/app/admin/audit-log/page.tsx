'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Card } from '@/components/ui/Card';
import { Table, THead, TH, TBody, TR, TD } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import EmptyState from '@/components/ui/EmptyState';
import PageHeader from '@/components/ui/PageHeader';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Actions that move money or change access are highlighted, since those
// are the entries that matter during a reconciliation
function actionTone(action: string) {
  if (/BALANCE|WITHDRAW|APPROVE/i.test(action)) return 'accent' as const;
  if (/ROLE|ADMIN|BLOCK/i.test(action)) return 'down' as const;
  return 'neutral' as const;
}

export default function AuditLogPage() {
  const [search, setSearch] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: () => adminApi.getAuditLog().then((r) => r.data),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs ?? [];
    return (logs ?? []).filter(
      (l: any) =>
        l.action?.toLowerCase().includes(term) ||
        l.details?.toLowerCase().includes(term) ||
        l.admin?.userName?.toLowerCase().includes(term) ||
        l.targetType?.toLowerCase().includes(term),
    );
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Every privileged action, with the administrator who performed it"
      />

      <Card flush>
        <div className="px-5 py-4 border-b border-line flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search action, admin or details"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suffix={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
          <span className="ml-auto text-xs text-ink-faint tabular-nums">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
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
            icon={ClipboardDocumentListIcon}
            title={search ? 'No matching entries' : 'No actions recorded yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Administrative actions will be recorded here.'
            }
          />
        ) : (
          <Table>
            <THead>
              <TH>Administrator</TH>
              <TH>Action</TH>
              <TH>Target</TH>
              <TH>Details</TH>
              <TH>When</TH>
            </THead>
            <TBody>
              {filtered.map((log: any) => (
                <TR key={log.id}>
                  <TD>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
                        <span className="text-accent text-xs font-bold">
                          {log.admin?.userName?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-sm text-ink truncate">
                        {log.admin?.userName || 'Unknown'}
                      </span>
                    </div>
                  </TD>

                  <TD>
                    <Badge tone={actionTone(log.action)}>
                      {log.action?.replace(/_/g, ' ').toLowerCase()}
                    </Badge>
                  </TD>

                  <TD className="text-ink-muted whitespace-nowrap">
                    {log.targetType || '—'}
                  </TD>

                  <TD className="text-ink-muted max-w-xs">
                    <span className="block truncate" title={log.details}>
                      {log.details || '—'}
                    </span>
                  </TD>

                  <TD className="text-ink-faint whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
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