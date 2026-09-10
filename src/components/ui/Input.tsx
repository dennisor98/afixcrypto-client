'use client';

import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  suffix,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {(label || hint) && (
        <div className="flex items-baseline justify-between mb-1.5">
          {label && (
            <label htmlFor={inputId} className="text-sm text-ink-muted">
              {label}
            </label>
          )}
          {hint && <span className="text-xs text-ink-faint">{hint}</span>}
        </div>
      )}

      <div className="relative">
        <input
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full h-11 rounded-lg bg-surface-2 border px-3.5 text-ink',
            'placeholder:text-ink-faint tabular-nums',
            'transition-colors focus:outline-none',
            error
              ? 'border-down focus:border-down'
              : 'border-line focus:border-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            suffix && 'pr-16',
            className,
          )}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
            {suffix}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-down mt-1.5">{error}</p>}
    </div>
  );
}