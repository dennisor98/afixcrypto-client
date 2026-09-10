import PublicLayout from '@/components/layout/PublicLayout';

export default function DocsPage() {
  return (
    <PublicLayout title="API Documentation" subtitle="Build on top of afixcrypto with our REST API">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Coming Soon</h2>
          <p className="text-secondary leading-relaxed">
            Our public API is currently in private beta. If you&apos;d like early access, send us an email at <a href="mailto:api@afixcrypto.com" className="text-[#f0b90b] hover:underline">api@afixcrypto.com</a> with your use case.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">What you&apos;ll be able to do</h2>
          <ul className="space-y-3 text-secondary">
            <li className="flex items-start gap-3"><span className="text-[#f0b90b] font-bold">→</span> Query live BTC signals programmatically</li>
            <li className="flex items-start gap-3"><span className="text-[#f0b90b] font-bold">→</span> Place trades via REST endpoints</li>
            <li className="flex items-start gap-3"><span className="text-[#f0b90b] font-bold">→</span> Subscribe to real-time trade updates via WebSocket</li>
            <li className="flex items-start gap-3"><span className="text-[#f0b90b] font-bold">→</span> Manage deposits and withdrawals</li>
            <li className="flex items-start gap-3"><span className="text-[#f0b90b] font-bold">→</span> Pull complete trade history</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">Authentication</h2>
          <p className="text-secondary leading-relaxed mb-4">
            All API requests will require a Bearer token in the Authorization header.
          </p>
          <pre className="bg-primary border border-primary rounded-xl p-4 text-sm text-secondary overflow-x-auto">
{`curl https://api.afixcrypto.com/v1/signals \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
          </pre>
        </section>
      </div>
    </PublicLayout>
  );
}