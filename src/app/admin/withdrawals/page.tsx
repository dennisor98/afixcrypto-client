'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useState } from 'react';
import { ArrowDownTrayIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: () => adminApi.getAllWithdrawals().then(res => res.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      adminApi.approveWithdrawal(id, { approved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const filteredWithdrawals = withdrawals?.filter((w: any) => {
    if (statusFilter === 'all') return true;
    return w.status === statusFilter;
  }) || [];

  const stats = withdrawals ? {
    total: withdrawals.length,
    pending: withdrawals.filter((w: any) => w.status === 'pending').length,
    approved: withdrawals.filter((w: any) => w.status === 'approved').length,
    rejected: withdrawals.filter((w: any) => w.status === 'rejected').length,
    totalAmount: withdrawals.reduce((sum: number, w: any) => sum + parseFloat(String(w.amount || 0)), 0),
  } : null;

  const handleApprove = (id: string, approved: boolean) => {
    if (confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this withdrawal?`)) {
      approveMutation.mutate({ id, approved });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Withdrawals Management</h1>
        <p className="text-secondary mt-1">Review and manage withdrawal requests</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Total</p>
            <p className="text-2xl font-bold text-primary mt-1">{stats.total}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Pending</p>
            <p className="text-2xl font-bold text-binance-yellow mt-1">{stats.pending}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Approved</p>
            <p className="text-2xl font-bold text-green-500 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Rejected</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-secondary rounded-lg border border-primary p-4 transition-colors">
            <p className="text-sm text-secondary">Total Amount</p>
            <p className="text-2xl font-bold text-primary mt-1">${stats.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-secondary rounded-xl border border-primary p-4 transition-colors">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-secondary">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-tertiary border border-primary rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-binance-yellow"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-secondary rounded-xl border border-primary transition-colors">
        <div className="p-6 border-b border-primary">
          <h2 className="text-lg font-semibold text-primary">
            All Withdrawals ({filteredWithdrawals.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-binance-yellow"></div>
              <p className="mt-4 text-secondary">Loading withdrawals...</p>
            </div>
          ) : filteredWithdrawals.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Address</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal: any) => (
                  <tr key={withdrawal.id} className="border-b border-primary hover:bg-tertiary transition-colors">
                    <td className="py-4 px-4 text-sm text-primary">#{withdrawal.id.slice(0, 8)}</td>
                    <td className="py-4 px-4 text-sm text-secondary">{withdrawal.user?.userName || 'N/A'}</td>
                    <td className="py-4 px-4 text-sm font-medium text-primary">
                      ${parseFloat(String(withdrawal.amount || 0)).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary font-mono text-xs">
                      {withdrawal.address?.slice(0, 10)}...
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        withdrawal.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        withdrawal.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-binance-yellow/20 text-binance-yellow border-binance-yellow/30'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-secondary">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      {withdrawal.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(withdrawal.id, true)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center"
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(withdrawal.id, false)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center"
                          >
                            <XMarkIcon className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <ArrowDownTrayIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary">No withdrawals found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

