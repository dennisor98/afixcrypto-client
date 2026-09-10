'use client';

import Link from 'next/link';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Shared frame for every auth screen, so login, register and reset
// stay visually identical without repeating markup.
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base flex flex-col">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-line">
        <Logo href="/" size="sm" />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            {subtitle && (
              <p className="text-ink-muted text-sm mt-1.5">{subtitle}</p>
            )}
          </div>

          <div className="bg-surface border border-line rounded-2xl p-6 sm:p-7">
            {children}
          </div>

          {footer && (
            <div className="text-center text-sm text-ink-muted mt-5">{footer}</div>
          )}
        </div>
      </div>

      <div className="px-4 py-5 text-center">
        <Link href="/" className="text-xs text-ink-faint hover:text-ink-muted transition-colors">
          Back to home
        </Link>
      </div>
    </div>
  );
}