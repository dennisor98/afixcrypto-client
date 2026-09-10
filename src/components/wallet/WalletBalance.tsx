'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api/user.api';
import { formatCurrency } from '@/lib/utils/format';

export default function WalletBalance() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => userApi.getWallet().then(res => res.data),
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-primary p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-medium mb-2">Total Balance</h3>
      <p className="text-4xl font-bold mb-4">
        ${parseFloat(wallet?.balance || '0').toFixed(2)}
      </p>
      {wallet?.virtualBalance && (
        <p className="text-sm opacity-90">
          Virtual: ${parseFloat(wallet.virtualBalance || '0').toFixed(2)}
        </p>
      )}
    </div>
  );
}
