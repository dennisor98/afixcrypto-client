'use client';

import BTCChart from '@/components/dashboard/BTCChart';
import CreateBetForm from '@/components/dashboard/CreateBetForm';
import SignalsPanel from '@/components/dashboard/SignalsPanel';
import { Card, CardHeader } from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';

export default function TradePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trade"
        description="Predict BTC price direction and settle against the live market"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card flush className="overflow-hidden">
            <BTCChart symbol="BTCUSDT" height={420} />
          </Card>
          <SignalsPanel />
        </div>

        {/* Sticky so the form stays reachable while scrolling the chart */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card flush>
            <CardHeader title="Place a Trade" />
            <div className="p-5">
              <CreateBetForm />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}