import { cn } from '@/lib/utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Removes inner padding so the card can hold a table or list flush to the edge */
  flush?: boolean;
}

export function Card({ children, className, flush = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-line rounded-xl',
        !flush && 'p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 px-5 py-4 border-b border-line',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="font-semibold text-ink">{title}</h2>
        {description && (
          <p className="text-sm text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}