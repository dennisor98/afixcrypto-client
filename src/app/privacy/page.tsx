import PublicLayout from '@/components/layout/PublicLayout';

export default function PrivacyPage() {
  return (
    <PublicLayout title="Privacy Policy" subtitle="Last updated: January 2026">
      <div className="space-y-8 text-secondary leading-relaxed">
        <p>This Privacy Policy describes how afixcrypto collects, uses, and shares your information when you use our service.</p>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">1. Information We Collect</h2>
          <p>We collect: email address, hashed password, IP address, device information, transaction history, deposit/withdrawal addresses, and usage patterns. We do not collect personally identifiable information beyond what is necessary to provide the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">2. How We Use Your Information</h2>
          <p>To provide the service, process transactions, prevent fraud, comply with legal obligations, send service-related emails, and improve our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">3. Information Sharing</h2>
          <p>We do not sell your data. We may share information with: service providers (email, hosting), law enforcement when legally required, and successors in business transfers.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">4. Data Security</h2>
          <p>We use industry-standard encryption, secure password hashing (bcrypt), HD wallet derivation, and access controls. While no system is 100% secure, we take reasonable measures to protect your data.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">5. Cookies</h2>
          <p>We use cookies for authentication and session management. You can disable cookies in your browser, but some features may not work.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">6. Your Rights</h2>
          <p>You can: access your data, request corrections, request deletion (subject to legal retention requirements), and export your data. Email <a href="mailto:privacy@afixcrypto.com" className="text-[#f0b90b] hover:underline">privacy@afixcrypto.com</a> to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">7. Children</h2>
          <p>afixcrypto is not for users under 18. We do not knowingly collect data from minors.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-primary mb-3">8. Contact</h2>
          <p>Questions? Email <a href="mailto:privacy@afixcrypto.com" className="text-[#f0b90b] hover:underline">privacy@afixcrypto.com</a></p>
        </section>
      </div>
    </PublicLayout>
  );
}