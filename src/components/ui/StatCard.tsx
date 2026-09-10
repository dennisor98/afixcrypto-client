import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  /** Colours the value only. Used for gains and losses, not decoration. */
  tone?: 'default' | 'up' | 'down' | 'accent';
  loading?: boolean;
}

const TONES = {
  default: 'text-ink',
  up: 'text-up',
  down: 'text-down',
  accent: 'text-accent',
};

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-surface border border-line rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
            {label}
          </p>

          {loading ? (
            <div className="h-8 w-24 bg-surface-2 rounded mt-2 animate-pulse" />
          ) : (
            <p
              className={cn(
                'text-2xl font-bold mt-1 tabular-nums truncate',
                TONES[tone],
              )}
            >
              {value}
            </p>
          )}

          {hint && !loading && (
            <p className="text-xs text-ink-muted mt-1 truncate">{hint}</p>
          )}
        </div>

        {Icon && (
          <div className="h-9 w-9 shrink-0 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Icon className="h-4.5 w-4.5 text-accent" />
          </div>
        )}
      </div>
    </div>
  );
}