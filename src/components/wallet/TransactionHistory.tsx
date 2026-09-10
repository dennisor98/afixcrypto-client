'use client';

import { useQuery } from '@tanstack/react-query';
import { walletApi } from '@/lib/api/wallet.api';
import { userApi } from '@/lib/api/user.api';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';

export default function TransactionHistory() {
  const { data: wallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => userApi.getWallet().then(res => res.data),
  });

  const { data: deposits } = useQuery({
    queryKey: ['deposits'],
    queryFn: () => walletApi.getDeposits().then(res => res.data),
    enabled: !!wallet,
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['my-withdrawals'],
    queryFn: () => walletApi.getMyWithdrawalRequests().then(res => res.data),
    enabled: !!wallet,
  });

  const transactions = [
    ...(deposits?.map((d: any) => ({
      id: d.id,
      type: 'deposit',
      amount: d.amount,
      status: d.status || 'confirmed',
      createdAt: d.createdAt,
    })) || []),
    ...(withdrawals?.map((w: any) => ({
      id: w.id,
      type: 'withdrawal',
      amount: w.amount,
      status: w.status,
      createdAt: w.createdAt,
    })) || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Transaction History</h3>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold capitalize">{tx.type}</p>
                  <p className="text-sm text-gray-500">{formatDateTime(tx.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tx.status === 'approved' || tx.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800' 
                      : tx.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
