'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { useState } from 'react';
import { SignalIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function AdminSignalsPage() {
  const queryClient = useQueryClient();

  const [editingSignal, setEditingSignal] =
      useState<{ id: string; direction: string } | null>(null);

  const [newInterval, setNewInterval] = useState({ Dayhour: '8', interval: '5' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');

  const { data: signals, isLoading } = useQuery({
    queryKey: ['admin-signals'],
    queryFn: () => adminApi.getTodaySignals().then(res => res.data),
  });

  const { data: intervals } = useQuery({
    queryKey: ['admin-intervals'],
    queryFn: () => adminApi.getIntervals().then(res => res.data),
  });

  const updateSignalMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: string }) =>
        adminApi.updateSignal(id, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-signals'] });
      setEditingSignal(null);
      setMessage('Signal updated successfully');
      setTimeout(() => setMessage(''), 3000);
    },
  });

  const createIntervalMutation = useMutation({
    mutationFn: (data: { Dayhour: string; interval: string }) =>
        adminApi.createInterval(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-intervals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-signals'] });
      setShowCreateForm(false);
      setMessage('Interval created — signals will generate on next load');
      setTimeout(() => setMessage(''), 4000);
    },
    onError: (err: any) => {
      setMessage(err?.response?.data?.message?.[0] || 'Failed to create interval');
      setTimeout(() => setMessage(''), 4000);
    },
  });

  const signalsList = Array.isArray(signals) ? signals : [];
  const intervalsList = Array.isArray(intervals) ? intervals : [];

  const riseCount = signalsList.filter(
      (s: any) => s?.s_direction === 'rise' || s?.direction === 'rise'
  ).length;

  const fallCount = signalsList.filter(
      (s: any) => s?.s_direction === 'fall' || s?.direction === 'fall'
  ).length;

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Signals Management</h1>
            <p className="text-secondary mt-1">
              Manage today&apos;s trading signals and intervals
            </p>
          </div>

          <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-binance-yellow text-black font-semibold rounded-lg hover:bg-binance-yellow-dark transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Create Interval
          </button>
        </div>

        {message && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
              {message}
            </div>
        )}

        {/* CREATE INTERVAL */}
        {showCreateForm && (
            <div className="bg-secondary rounded-xl border border-primary p-6">
              <h2 className="text-lg font-semibold text-primary mb-4">
                Create New Interval
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Hour of Day
                  </label>

                  <select
                      value={newInterval.Dayhour}
                      onChange={(e) =>
                          setNewInterval({ ...newInterval, Dayhour: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-tertiary border border-primary rounded-lg text-primary"
                  >
                    {HOURS.map((h) => (
                        <option key={h} value={String(h)}>
                          {String(h).padStart(2, '0')}:00
                        </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Interval
                  </label>

                  <select
                      value={newInterval.interval}
                      onChange={(e) =>
                          setNewInterval({ ...newInterval, interval: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-tertiary border border-primary rounded-lg text-primary"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                    onClick={() => createIntervalMutation.mutate(newInterval)}
                    className="px-6 py-2 bg-binance-yellow text-black font-semibold rounded-lg"
                >
                  Create
                </button>

                <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 bg-tertiary text-secondary border border-primary rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
        )}

        {/* TABLE */}
        <div className="bg-secondary rounded-xl border border-primary">
          <div className="overflow-x-auto">
            {isLoading ? (
                <div className="text-center py-12 text-secondary">Loading...</div>
            ) : (
                <table className="w-full">
                  <thead>
                  <tr className="border-b border-primary">
                    <th className="text-left p-4">Hour</th>
                    <th className="text-left p-4">Window</th>
                    <th className="text-left p-4">Direction</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                  </thead>

                  <tbody>
                  {signalsList.map((signal: any) => {
                    const direction = signal.s_direction || signal.direction;
                    const signalId = signal.s_id || signal.id;

                    const es = editingSignal; // ✅ SAFE ALIAS
                    const isEditing = es?.id === signalId;

                    return (
                        <tr key={signalId} className="border-b border-primary">
                          <td className="p-4 text-sm text-primary">
                            {signal.sh_Dayhour ?? '?'}:00
                          </td>

                          <td className="p-4 text-sm text-secondary">
                            {signal.s_start_time}m — {signal.s_endtime}m
                          </td>

                          <td className="p-4">
                            {isEditing && es ? (
                                <select
                                    value={es.direction}
                                    onChange={(e) =>
                                        setEditingSignal({
                                          ...es,
                                          direction: e.target.value,
                                        })
                                    }
                                    className="px-3 py-1 bg-tertiary border border-binance-yellow rounded-lg text-primary text-sm"
                                >
                                  <option value="rise">Rise</option>
                                  <option value="fall">Fall</option>
                                </select>
                            ) : (
                                <span
                                    className={`px-3 py-1 rounded-full text-xs ${
                                        direction === 'rise'
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                    }`}
                                >
                            {direction}
                          </span>
                            )}
                          </td>

                          <td className="p-4">
                            {isEditing && es ? (
                                <div className="flex gap-2">
                                  <button
                                      onClick={() =>
                                          updateSignalMutation.mutate({
                                            id: signalId,
                                            direction: es.direction,
                                          })
                                      }
                                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded"
                                  >
                                    Save
                                  </button>

                                  <button
                                      onClick={() => setEditingSignal(null)}
                                      className="px-3 py-1 bg-tertiary text-secondary rounded"
                                  >
                                    Cancel
                                  </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() =>
                                        setEditingSignal({
                                          id: signalId,
                                          direction,
                                        })
                                    }
                                    className="flex items-center gap-1 text-binance-yellow"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                  Edit
                                </button>
                            )}
                          </td>
                        </tr>
                    );
                  })}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
  );
}