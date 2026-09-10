'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

// Helper to extract a plain string address from whatever the API returns
function extractAddress(raw: any): string {
  if (!raw) return '';
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'object') return raw.base58 || raw.hex || '';
  return '';
}

export default function DepositPage() {
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState<string>('');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: () => walletApi.createAccount(),
    onSuccess: (response) => {
      const raw = response.data?.address || response.data?.privateKey;
      const newAddress = extractAddress(raw);
      if (newAddress) {
        setAddress(newAddress);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          userData.address = newAddress;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    },
  });

  useEffect(() => {
    const raw = user?.address;
    const parsed = extractAddress(raw);
    if (parsed) {
      setAddress(parsed);
    } else if (!address) {
      createAccountMutation.mutate();
    }
  }, [user]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Deposit Funds</h1>
        <p className="text-secondary mt-1">Add USDT to your wallet</p>
      </div>

      <div className="bg-secondary rounded-xl border border-primary p-8 transition-colors">
        <div className="space-y-6">
          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
            <p className="text-sm text-blue-400">
              <strong>How to deposit:</strong> Send USDT (TRC20) to your wallet address below.
              Funds will be credited after network confirmation (usually 5-10 minutes).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Your Wallet Address (TRC20)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address || 'Generating address...'}
                readOnly
                className="flex-1 px-4 py-3 border border-primary rounded-lg bg-tertiary font-mono text-sm text-primary"
              />
              <button
                onClick={copyAddress}
                disabled={!address}
                className="px-6 py-3 bg-binance-yellow text-binance-dark rounded-lg hover:bg-binance-yellow-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-5 w-5 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            {!address && (
              <button
                onClick={() => createAccountMutation.mutate()}
                disabled={createAccountMutation.isPending}
                className="mt-2 px-4 py-2 bg-binance-yellow text-binance-dark rounded-lg hover:bg-binance-yellow-dark transition disabled:opacity-50"
              >
                {createAccountMutation.isPending ? 'Creating...' : 'Generate Address'}
              </button>
            )}
          </div>

          <div className="bg-tertiary p-6 rounded-lg text-center border border-primary">
            <p className="text-secondary mb-2 font-medium">QR Code</p>
            <div className="bg-secondary p-4 inline-block rounded-lg border border-primary">
              {address ? (
                <div className="w-48 h-48 bg-primary flex items-center justify-center rounded border border-primary">
                  <p className="text-secondary text-xs text-center px-2 break-all">
                    {address.slice(0, 10)}...{address.slice(-6)}
                  </p>
                </div>
              ) : (
                <div className="w-48 h-48 bg-primary flex items-center justify-center rounded border border-primary">
                  <p className="text-secondary text-sm">Generate address first</p>
                </div>
              )}
            </div>
            <p className="text-sm text-secondary mt-2">Scan to deposit</p>
          </div>

          <div className="bg-binance-yellow/10 p-4 rounded-lg border border-binance-yellow/30">
            <p className="text-sm font-semibold text-binance-yellow mb-2">Important:</p>
            <ul className="list-disc list-inside text-sm text-secondary space-y-1">
              <li>Only send USDT (TRC20) to this address</li>
              <li>Minimum deposit: 10 USDT</li>
              <li>Deposits are usually credited within 5-10 minutes</li>
              <li>Do not send from exchanges that don&apos;t support TRC20</li>
              <li>Double-check the address before sending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}