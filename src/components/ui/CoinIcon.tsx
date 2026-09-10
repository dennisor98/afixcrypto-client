'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

// Trading pair to the base asset ticker
const BASE_ASSET: Record<string, string> = {
  BTCUSDT: 'btc',
  ETHUSDT: 'eth',
  TRXUSDT: 'trx',
  BNBUSDT: 'bnb',
  SOLUSDT: 'sol',
  XRPUSDT: 'xrp',
  ADAUSDT: 'ada',
  DOGEUSDT: 'doge',
  MATICUSDT: 'matic',
  LTCUSDT: 'ltc',
};

const SIZES = {
  sm: 'h-4 w-4 text-[9px]',
  md: 'h-6 w-6 text-[10px]',
  lg: 'h-9 w-9 text-xs',
};

/**
 * Renders a coin mark from /public/crypto. Icons are served locally rather
 * than from a CDN so there is no network request, no CORS surface and no
 * broken image if a third party goes down. If a file is missing the
 * component falls back to a neutral ticker monogram, so a new pair never
 * renders as an empty box.
 */
export default function CoinIcon({
  symbol,
  size = 'md',
  className,
}: {
  symbol: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const asset =
    BASE_ASSET[symbol.toUpperCase()] ??
    symbol.toLowerCase().replace(/usdt$|usd$|busd$/, '');

  const label = asset.toUpperCase();

  if (failed) {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        className={cn(
          'inline-flex items-center justify-center rounded-full shrink-0',
          'bg-surface-3 border border-line text-ink-muted font-bold tracking-tight',
          SIZES[size],
          className,
        )}
      >
        {label.slice(0, 3)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/crypto/${asset}.svg`}
      alt={label}
      onError={() => setFailed(true)}
      className={cn('rounded-full shrink-0 object-contain', SIZES[size], className)}
    />
  );
}