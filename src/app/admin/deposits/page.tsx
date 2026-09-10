'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

export default function AdminDepositsPage() {
  const { data: deposits, isLoading } = useQuery({
    queryKey: ['admin-deposits'],
    queryFn: () => adminApi.getAllDeposits().then(res => res.data),
  });

  const stats = deposits ? {
    total: deposits.length,
    totalAmount: deposits.reduce((sum: number, d: any) => sum + (typeof d.amount === 'number' ? d.amount : parseFloat(String(d.amount || 0))), 0),
    confirmed: deposits.filter((d: any) => d.status === 'confirmed' || d.confirmed).length,
    pending: deposits.filter((d: any) => d.status === 'pending' || !d.confirmed).length,
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Deposits Management</h1>
        <p className="text-secondary mt-1">View all platform deposits</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Total Deposits</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Total Amount</p>
            <p className="text-2xl font-bold text-primary mt-1">${stats.totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Confirmed</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.confirmed}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Pending</p>
            <p className="text-2xl font-bold text-binance-yellow mt-1">{stats.pending}</p>
          </div>
        </div>
      )}

      {/* Deposits Table */}
      <div className="bg-secondary rounded-xl border border-primary transition-colors">
        <div className="p-6 border-b border-primary">
          <h2 className="text-lg font-semibold text-primary">
            All Deposits ({deposits?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow"></div>
              <p className="mt-4 text-secondary">Loading deposits...</p>
            </div>
          ) : deposits && deposits.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Transaction Hash</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit: any) => (
                  <tr key={deposit.id} className="border-b border-primary hover:bg-tertiary transition-colors">
                    <td className="py-4 px-4 text-sm text-primary">#{deposit.id.slice(0, 8)}</td>
                    <td className="py-4 px-4 text-sm text-secondary">{deposit.user?.userName || 'N/A'}</td>
                    <td className="py-4 px-4 text-sm font-medium text-primary">
                      ${(typeof deposit.amount === 'number' ? deposit.amount : parseFloat(String(deposit.amount || 0))).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary font-mono text-xs">
                      {deposit.transaction_id || deposit.transactionHash || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        deposit.status === 'confirmed' || deposit.confirmed
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-binance-yellow/20 text-binance-yellow border-binance-yellow/30'
                      }`}>
                        {deposit.status === 'confirmed' || deposit.confirmed ? 'Confirmed' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <ArrowUpTrayIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary">No deposits found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

