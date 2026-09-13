'use client';

import { useState } from 'react';

/**
 * Renders a scannable QR image for a public wallet address. The QR service is
 * deliberately given only the public address—never account or key material.
 */
export default function QRCodeDisplay({ address }: { address: string }) {
  const [failed, setFailed] = useState(false);

  if (!address || failed) {
    return (
      <div className="h-48 w-48 flex items-center justify-center rounded border border-line bg-surface text-center">
        <p className="px-3 text-sm text-ink-muted">
          {failed ? 'Unable to load QR code' : 'Generate an address first'}
        </p>
      </div>
    );
  }

  const source = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&format=svg&data=${encodeURIComponent(address)}`;

  return (
    <img
      src={source}
      width={192}
      height={192}
      alt="QR code for your TRC20 deposit address"
      className="h-48 w-48 rounded bg-white p-2"
      onError={() => setFailed(true)}
    />
  );
}
