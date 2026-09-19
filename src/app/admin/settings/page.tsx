'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Card, CardHeader } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

// inverted is optional, so the type is declared rather than inferred with
// `as const`, which would give each entry its own literal type
type SwitchDef = {
  key: 'tradingEnabled' | 'depositsEnabled' | 'withdrawalsEnabled' | 'maintenanceMode';
  label: string;
  desc: string;
  inverted?: boolean;
};

const SWITCHES: SwitchDef[] = [
  { key: 'tradingEnabled', label: 'Trading', desc: 'Allow users to place new trades' },
  { key: 'depositsEnabled', label: 'Deposits', desc: 'Credit incoming USDT transfers' },
  { key: 'withdrawalsEnabled', label: 'Withdrawals', desc: 'Accept new withdrawal requests' },
  {
    key: 'maintenanceMode',
    label: 'Maintenance mode',
    desc: 'Block all user operations',
    inverted: true,
  },
];

const TRADING_FIELDS = [
  { key: 'payoutMultiplier', label: 'Payout multiplier', hint: '1.95 returns 95% profit', step: '0.01' },
  { key: 'dailyTradeReturnRate', label: '24-hour trade return', hint: 'ROI percent, 0-100', step: '0.01' },
  { key: 'minBet', label: 'Minimum trade', hint: 'USDT', step: '0.01' },
  { key: 'maxBet', label: 'Maximum trade', hint: 'USDT', step: '1' },
];

const MONEY_FIELDS = [
  { key: 'minDeposit', label: 'Minimum deposit', hint: 'USDT', step: '0.01' },
  { key: 'minWithdrawal', label: 'Minimum withdrawal', hint: 'USDT', step: '0.01' },
  { key: 'withdrawalFee', label: 'Network fee', hint: 'USDT', step: '0.01' },
  { key: 'serviceFee', label: 'Service fee', hint: 'USDT', step: '0.01' },
];

function Toggle({
  on,
  danger,
  disabled,
  onClick,
}: {
  on: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
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

// Each field keeps its own draft so a value is only sent when Save is
// pressed. Saving on every keystroke would fire a request per character.
function EditableField({
  label,
  hint,
  value,
  step,
  type = 'number',
  multiline,
  saving,
  onSave,
}: {
  label: string;
  hint?: string;
  value: string;
  step?: string;
  type?: string;
  multiline?: boolean;
  saving: boolean;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  const dirty = draft !== value;

  return (
    <div>
      {multiline ? (
        <div>
          <label className="block text-sm text-ink-muted mb-1.5">{label}</label>
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-lg bg-surface-2 border border-line px-3.5 py-2.5 text-ink
                       placeholder:text-ink-faint focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      ) : (
        <Input
          type={type}
          step={step}
          label={label}
          hint={hint}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}

      {dirty && (
        <div className="flex gap-2 mt-2">
          <Button size="sm" loading={saving} onClick={() => onSave(draft)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDraft(value)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
  });

  const update = useMutation({
    mutationFn: (data: any) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['publicSettings'] });
      setMessage({ tone: 'success', text: 'Settings updated' });
      setTimeout(() => setMessage(null), 4000);
    },
    onError: (err: any) => {
      setMessage({
        tone: 'error',
        text: err?.response?.data?.message || 'Could not update settings',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const s = settings ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings"
        description="Global configuration for trading, fees and operations"
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      <Card flush>
        <CardHeader
          title="Operational switches"
          description="Changes take effect immediately across the platform"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5">
          {SWITCHES.map((item) => {
            const raw = Boolean(s[item.key]);
            // Green consistently means healthy, so maintenance is inverted
            const healthy = item.inverted ? !raw : raw;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-surface-2 border border-line rounded-lg"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="text-xs text-ink-muted mt-0.5">{item.desc}</p>
                </div>
                <Toggle
                  on={healthy}
                  danger={item.inverted}
                  disabled={update.isPending}
                  onClick={() => update.mutate({ [item.key]: !raw })}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card flush>
          <CardHeader
            title="Trading limits"
            description="Applied on the server for every trade"
          />
          <div className="p-5 space-y-4">
            {TRADING_FIELDS.map((f) => (
              <EditableField
                key={f.key}
                label={f.label}
                hint={f.hint}
                step={f.step}
                value={String(s[f.key] ?? '')}
                saving={update.isPending}
                onSave={(v) => {
                  const num = parseFloat(v);
                  if (!isNaN(num)) update.mutate({ [f.key]: num });
                }}
              />
            ))}
          </div>
        </Card>

        <Card flush>
          <CardHeader
            title="Deposits and withdrawals"
            description="Minimums and fees charged on transfers"
          />
          <div className="p-5 space-y-4">
            {MONEY_FIELDS.map((f) => (
              <EditableField
                key={f.key}
                label={f.label}
                hint={f.hint}
                step={f.step}
                value={String(s[f.key] ?? '')}
                saving={update.isPending}
                onSave={(v) => {
                  const num = parseFloat(v);
                  if (!isNaN(num)) update.mutate({ [f.key]: num });
                }}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card flush>
        <CardHeader
          title="Messages"
          description="Text shown to users in the interface"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Announcement</span>
              <Toggle
                on={Boolean(s.announcementActive)}
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({ announcementActive: !s.announcementActive })
                }
              />
            </div>
          }
        />
        <div className="p-5 space-y-5">
          <EditableField
            label="Announcement message"
            type="text"
            multiline
            value={String(s.systemAnnouncement ?? '')}
            saving={update.isPending}
            onSave={(v) => update.mutate({ systemAnnouncement: v })}
          />
          <EditableField
            label="Maintenance message"
            type="text"
            multiline
            value={String(s.maintenanceMessage ?? '')}
            saving={update.isPending}
            onSave={(v) => update.mutate({ maintenanceMessage: v })}
          />
        </div>
      </Card>
    </div>
  );
}