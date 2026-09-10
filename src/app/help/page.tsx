'use client';

import { useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQS = [
  { q: 'How do I create an account?', a: 'Click "Get Started" at the top of the page, enter your email and password, and verify your email. You\'ll be trading in under 60 seconds.' },
  { q: 'How do I deposit USDT?', a: 'After signing in, go to Wallet → Deposit. You\'ll see your unique TRC20 deposit address. Send USDT (TRC20 only) to that address from any exchange or wallet. Funds typically arrive in 5-10 minutes.' },
  { q: 'How long do withdrawals take?', a: 'Withdrawal requests are reviewed by our team and typically processed within 2 hours. Once approved, the on-chain TRC20 transfer takes 2-5 minutes to confirm.' },
  { q: 'What is the minimum deposit?', a: 'The minimum deposit is 10 USDT. There is no maximum.' },
  { q: 'How does binary trading work?', a: 'You predict whether BTC will go up (Rise) or down (Fall) within a 5-minute window. If you\'re right, you win 95% of your bet amount. If wrong, you lose your bet.' },
  { q: 'Where do the price signals come from?', a: 'All price data comes directly from Binance public API — the world\'s largest crypto exchange. No price manipulation, no proprietary feeds.' },
  { q: 'Are my funds safe?', a: 'Yes. We use industry-standard HD wallet derivation, encrypted private keys at rest, and all transactions are on-chain and verifiable.' },
  { q: 'What happens if I forget my password?', a: 'Click "Forgot Password" on the login page. We\'ll send you a reset link via email.' },
  { q: 'Can I trade from my phone?', a: 'Absolutely. afixcrypto is fully responsive and works on any device.' },
  { q: 'How do I contact support?', a: 'Email support@afixcrypto.com or message us on Telegram. We aim to respond within 4 hours.' },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PublicLayout title="Help Center" subtitle="Find answers to common questions about trading on afixcrypto">
      <div className="space-y-3">
        {FAQS.map((faq, i) => (
          <div key={i} className="bg-secondary border border-primary rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-tertiary/30 transition-colors"
            >
              <span className="text-primary font-semibold">{faq.q}</span>
              <ChevronDownIcon className={`h-5 w-5 text-secondary flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-secondary leading-relaxed border-t border-primary pt-4">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-br from-[#f0b90b]/15 via-transparent to-transparent border border-[#f0b90b]/20 rounded-2xl p-8 text-center">
        <h3 className="text-primary font-bold text-xl mb-2">Still need help?</h3>
        <p className="text-secondary mb-6">Our support team is here for you.</p>
        <a href="mailto:support@afixcrypto.com" className="inline-block bg-binance-yellow text-black font-bold px-6 py-3 rounded-xl hover:bg-[#d4a017] transition-colors">
          Contact Support
        </a>
      </div>
    </PublicLayout>
  );
}