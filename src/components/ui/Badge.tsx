import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'accent' | 'up' | 'down' | 'pending';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-muted border-line',
  accent: 'bg-accent/12 text-accent border-accent/30',
  up: 'bg-up/12 text-up border-up/30',
  down: 'bg-down/12 text-down border-down/30',
  pending: 'bg-accent/12 text-accent border-accent/30',
};

// Maps a bet status straight to a tone so pages never hand-roll this
export function statusTone(status: string): Tone {
  if (status === 'won') return 'up';
  if (status === 'loss') return 'down';
  if (status === 'pending') return 'pending';
  return 'neutral';
}

export default function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-xs font-medium border capitalize whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}