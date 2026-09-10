import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {Icon && (
        <Icon className="h-10 w-10 mx-auto mb-3 text-ink-faint" />
      )}
      <p className="font-medium text-ink">{title}</p>
      {description && (
        <p className="text-sm text-ink-muted mt-1 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}