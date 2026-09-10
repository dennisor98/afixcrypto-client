import { cn } from '@/lib/utils/cn';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

type Tone = 'info' | 'success' | 'warning' | 'error';

const ICONS: Record<Tone, React.ElementType> = {
  info: InformationCircleIcon,
  success: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
};

const TONES: Record<Tone, string> = {
  info: 'bg-surface-2 border-line text-ink-muted',
  success: 'bg-up/10 border-up/30 text-up',
  warning: 'bg-accent/10 border-accent/30 text-accent',
  error: 'bg-down/10 border-down/30 text-down',
};

export default function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = ICONS[tone];

  return (
    <div
      className={cn(
        'flex items-start gap-2.5 px-3.5 py-3 rounded-lg border text-sm',
        TONES[tone],
        className,
      )}
    >
      <Icon className="h-4.5 w-4.5 shrink-0 mt-px" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}