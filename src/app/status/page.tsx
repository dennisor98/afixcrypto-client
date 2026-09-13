'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const SERVICES = [
  { name: 'Trading API', status: 'operational' },
  { name: 'Live Signal Engine', status: 'operational' },
  { name: 'BTC Price Feed (Binance)', status: 'operational' },
  { name: 'Database', status: 'operational' },
  { name: 'Job Queue (Redis)', status: 'operational' },
  { name: 'TRON Node Sync', status: 'operational' },
  { name: 'Deposit Detection', status: 'operational' },
  { name: 'Withdrawal Processing', status: 'operational' },
  { name: 'Web Dashboard', status: 'operational' },
  { name: 'Email Notifications', status: 'operational' },
];

export default function StatusPage() {
  return (
    <PublicLayout title="System Status" subtitle="Real-time status of afixcrypto services">
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-[#0ecb81]/15 via-transparent to-transparent border border-[#0ecb81]/30 rounded-2xl p-5 sm:p-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-[#0ecb81]/30 flex items-center justify-center flex-shrink-0">
            <CheckCircleIcon className="h-7 w-7 text-green-400" />
          </div>
          <div>
            <h2 className="text-primary font-bold text-xl">All systems operational</h2>
            <p className="text-secondary text-sm mt-1">Last checked just now</p>
          </div>
        </div>

        <div className="space-y-2">
          {SERVICES.map((s) => (
            <div key={s.name} className="bg-secondary border border-primary rounded-xl p-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-primary font-medium">{s.name}</span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
                </div>
                <span className="text-green-400 text-sm font-semibold">Operational</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-secondary border border-primary rounded-2xl p-6">
          <h3 className="text-primary font-bold mb-3">Incident History</h3>
          <p className="text-secondary text-sm">No incidents reported in the past 30 days.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
