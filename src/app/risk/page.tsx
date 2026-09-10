import PublicLayout from '@/components/layout/PublicLayout';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function RiskPage() {
  return (
    <PublicLayout title="Risk Disclosure" subtitle="Important information about trading on afixcrypto">
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-[#f6465d]/15 via-transparent to-transparent border border-[#f6465d]/30 rounded-2xl p-6 flex gap-4">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-primary font-medium">
            Trading cryptocurrency involves significant risk. You may lose all or part of your investment. Only trade with funds you can afford to lose.
          </p>
        </div>

        <div className="space-y-8 text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-primary mb-3">High Volatility</h2>
            <p>Cryptocurrency prices are highly volatile. Bitcoin can move 5-10% in a single hour. In binary trading, even small price movements determine win/loss outcomes. There is no &quot;safe&quot; trade.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Total Loss of Principal</h2>
            <p>Each trade you place puts your entire stake at risk. If your prediction is wrong, you lose 100% of the stake. Wins return 95% — meaning the platform retains a 5% edge over time. Statistically, most traders lose money.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Not Investment Advice</h2>
            <p>Signals provided by afixcrypto are for informational purposes only. They do not constitute financial advice, investment recommendations, or guarantees of profitability.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Technology Risks</h2>
            <p>Blockchain transactions are irreversible. Sending funds to wrong addresses results in permanent loss. Network outages, smart contract bugs, or platform downtime may temporarily prevent trading or withdrawals.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Regulatory Risk</h2>
            <p>Cryptocurrency regulation varies by jurisdiction and is rapidly evolving. Trading may become restricted or illegal in your region without notice. You are responsible for complying with local laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">No Refunds</h2>
            <p>Trades cannot be undone after placement. Lost stakes are not refundable. Once a withdrawal is processed on-chain, it cannot be reversed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-3">Tax Obligations</h2>
            <p>You are responsible for reporting and paying any taxes on profits from afixcrypto in your jurisdiction. Consult a tax professional.</p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}