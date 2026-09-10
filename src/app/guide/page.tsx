import PublicLayout from '@/components/layout/PublicLayout';

export default function GuidePage() {
  return (
    <PublicLayout title="Trading Guide" subtitle="Everything you need to start trading BTC on afixcrypto">
      <div className="space-y-12">
        {[
          {
            step: '01',
            title: 'Understand Binary Trading',
            content: 'Binary trading is simple: you predict whether BTC will go up (Rise) or down (Fall) within a fixed time window. If you\'re right, you win 95% of your stake. If wrong, you lose the stake. There\'s no in-between.',
          },
          {
            step: '02',
            title: 'Read the Signals',
            content: 'Every 5 minutes, afixcrypto generates a trading signal showing the suggested direction (Rise or Fall) for that window. Use signals as guidance, but always combine with your own analysis of the BTC chart.',
          },
          {
            step: '03',
            title: 'Place Your First Trade',
            content: 'On the Trade page: 1) Choose a direction (Rise/Fall). 2) Pick a period (5m, 15m, or 30m). 3) Enter your amount. 4) Click "Place Trade". The trade settles automatically when the window closes.',
          },
          {
            step: '04',
            title: 'Manage Risk',
            content: 'Never bet more than you can afford to lose. Start small (1-5 USDT) until you\'re consistently profitable. Watch the live BTC chart for context — strong trends often continue, but reversals happen at extremes.',
          },
          {
            step: '05',
            title: 'Withdraw Your Profits',
            content: 'Won trades credit your USDT balance instantly. Go to Wallet → Withdraw, enter your TRC20 address and amount, and submit. Withdrawals process within 2 hours.',
          },
        ].map((item) => (
          <div key={item.step} className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-binance-yellow/15 border border-[#f0b90b]/30 flex items-center justify-center">
                <span className="text-[#f0b90b] font-black text-2xl">{item.step}</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary mb-3">{item.title}</h2>
              <p className="text-secondary leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}