import PublicLayout from '@/components/layout/PublicLayout';

export default function TermsPage() {
  return (
    <PublicLayout title="Terms of Service" subtitle="Last updated: January 2026">
      <div className="space-y-8 text-secondary leading-relaxed">
        <p>By accessing or using afixcrypto, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</p>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">1. Eligibility</h2>
          <p>You must be at least 18 years old and legally able to enter into a binding contract in your jurisdiction to use afixcrypto. The service is not available where prohibited by law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">2. Account Responsibility</h2>
          <p>You are responsible for safeguarding your password and for any activities under your account. afixcrypto cannot recover lost passwords without verified email access. Notify us immediately of any unauthorized use.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">3. Trading Risks</h2>
          <p>Cryptocurrency trading is highly risky. Prices can move significantly in seconds. You may lose your entire stake. Only trade funds you can afford to lose. afixcrypto does not provide financial advice.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">4. Deposits & Withdrawals</h2>
          <p>Deposits must be in USDT (TRC20). Sending other assets or to wrong networks may result in permanent loss. Withdrawals are subject to a minimum amount and small network fees. afixcrypto may delay withdrawals for fraud prevention.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">5. Prohibited Activities</h2>
          <p>You may not: use multiple accounts to manipulate outcomes, use automated bots without permission, attempt to exploit bugs, engage in money laundering, or violate any applicable law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">6. Termination</h2>
          <p>We may suspend or terminate your account at any time for any reason, including violation of these terms. You may close your account at any time after withdrawing your funds.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">7. Limitation of Liability</h2>
          <p>afixcrypto is provided &quot;as is&quot; without warranties. We are not liable for indirect, incidental, or consequential damages, including loss of profits or data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">8. Changes to Terms</h2>
          <p>We may modify these terms at any time. Continued use after changes constitutes acceptance. Material changes will be communicated via email.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">9. Contact</h2>
          <p>Questions? Email <a href="mailto:legal@afixcrypto.com" className="text-[#f0b90b] hover:underline">legal@afixcrypto.com</a></p>
        </section>
      </div>
    </PublicLayout>
  );
}