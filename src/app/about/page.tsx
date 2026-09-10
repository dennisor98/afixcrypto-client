import PublicLayout from '@/components/layout/PublicLayout';
import { RocketLaunchIcon, EyeIcon, HeartIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function AboutPage() {
  return (
    <PublicLayout title="About afixcrypto" subtitle="Building the fastest, fairest crypto trading platform on TRON">
      <div className="prose prose-invert max-w-none space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Our Story</h2>
          <p className="text-secondary leading-relaxed">
            afixcrypto was founded by traders, for traders. We saw a gap in the market — most platforms either took too long to settle, charged excessive fees, or lacked transparency. So we built something better. A platform where every trade settles in 5 minutes, every withdrawal is on-chain, and every signal is auditable.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: RocketLaunchIcon, title: 'Mission', desc: 'Make short-term crypto trading accessible, fast, and fair for everyone.' },
            { icon: EyeIcon, title: 'Vision', desc: 'Be the world\'s most trusted platform for binary BTC trading on TRON.' },
            { icon: HeartIcon, title: 'Values', desc: 'Transparency, speed, security. No hidden fees, no manipulation, no surprises.' },
            { icon: BoltIcon, title: 'Approach', desc: 'Real Binance market data. On-chain settlements. Industry-grade security.' },
          ].map((item) => (
            <div key={item.title} className="bg-secondary border border-primary rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-binance-yellow/15 border border-[#f0b90b]/30 flex items-center justify-center mb-4">
                <item.icon className="h-6 w-6 text-[#f0b90b]" />
              </div>
              <h3 className="text-primary font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Why TRON?</h2>
          <p className="text-secondary leading-relaxed">
            We chose TRON because it offers the fastest, cheapest USDT transfers in the industry. Deposits arrive in seconds, withdrawals process in under 2 minutes, and transaction fees are pennies. For short-term traders, every second matters.
          </p>
        </section>
      </div>
    </PublicLayout>
  );
}