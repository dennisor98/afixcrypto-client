import PublicLayout from '@/components/layout/PublicLayout';

export default function AmlPage() {
  return (
    <PublicLayout title="AML Policy" subtitle="Anti-Money Laundering & Know Your Customer">
      <div className="space-y-8 text-secondary leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Our Commitment</h2>
          <p>afixcrypto is committed to preventing money laundering, terrorist financing, and other financial crimes. We comply with applicable AML/CFT regulations and cooperate fully with law enforcement.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Customer Verification</h2>
          <p>For accounts above certain thresholds, we may require enhanced verification including: government-issued ID, proof of address, source of funds documentation, and additional identity checks.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Transaction Monitoring</h2>
          <p>All deposits, withdrawals, and trading activity are monitored for suspicious patterns. Indicators include: unusual transaction sizes, structured deposits to avoid reporting thresholds, rapid in-out fund movements, and connections to sanctioned addresses.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Prohibited Activities</h2>
          <ul className="space-y-2 mt-3">
            <li className="flex items-start gap-3"><span className="text-red-400 font-bold">×</span> Using funds derived from illegal activity</li>
            <li className="flex items-start gap-3"><span className="text-red-400 font-bold">×</span> Operating on behalf of sanctioned individuals or entities</li>
            <li className="flex items-start gap-3"><span className="text-red-400 font-bold">×</span> Structuring transactions to evade reporting</li>
            <li className="flex items-start gap-3"><span className="text-red-400 font-bold">×</span> Using mixers, tumblers, or privacy-obscuring services to deposit</li>
            <li className="flex items-start gap-3"><span className="text-red-400 font-bold">×</span> Creating multiple accounts to circumvent limits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Reporting Obligations</h2>
          <p>We may file Suspicious Activity Reports (SARs) with relevant authorities when required. Account holders subject to such reports will not be notified, in accordance with law.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Account Freezes</h2>
          <p>We may freeze accounts pending investigation if we suspect: AML violations, sanctions violations, fraudulent activity, or court orders. Frozen funds may be held until the investigation concludes or relevant authorities provide guidance.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Sanctions Compliance</h2>
          <p>afixcrypto screens against international sanctions lists including OFAC, UN, EU, and UK. Users from sanctioned jurisdictions are prohibited from using the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">Reporting Concerns</h2>
          <p>To report suspicious activity or file an AML concern, email <a href="mailto:compliance@afixcrypto.com" className="text-[#f0b90b] hover:underline">compliance@afixcrypto.com</a></p>
        </section>
      </div>
    </PublicLayout>
  );
}