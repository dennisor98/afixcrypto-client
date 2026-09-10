import PublicLayout from '@/components/layout/PublicLayout';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const POSITIONS = [
    { title: 'Senior Backend Engineer', team: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Frontend Developer (React)', team: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Blockchain Engineer (TRON)', team: 'Engineering', location: 'Remote', type: 'Full-time' },
    { title: 'Customer Support Specialist', team: 'Operations', location: 'Remote', type: 'Full-time' },
    { title: 'Marketing Manager', team: 'Growth', location: 'Remote', type: 'Full-time' },
];

export default function CareersPage() {
    return (
        <PublicLayout
            title="Careers"
            subtitle="Join the team building the future of crypto trading"
        >
            <div className="space-y-8">

                {/* Why work here */}
                <div className="bg-gradient-to-br from-[#f0b90b]/15 via-transparent to-transparent border border-[#f0b90b]/20 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-primary mb-3">
                        Why work at afixcrypto?
                    </h2>
                    <p className="text-secondary leading-relaxed">
                        We&apos;re a fully remote, distributed team passionate about crypto, fintech, and great products.
                        We offer competitive compensation, equity, flexible hours, and the chance to build something traders actually love.
                    </p>
                </div>

                {/* Open Positions */}
                <div>
                    <h2 className="text-2xl font-bold text-primary mb-6">
                        Open Positions
                    </h2>

                    <div className="space-y-3">
                        {POSITIONS.map((p) => (
                            <a
                                key={p.title}
                                href={`mailto:careers@afixcrypto.com?subject=Application for ${encodeURIComponent(p.title)}`}
                                className="block bg-secondary border border-primary rounded-2xl p-6 hover:border-[#f0b90b]/30 transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-primary font-bold text-lg mb-1">
                                            {p.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-sm text-secondary">
                                            <span>{p.team}</span>
                                            <span>•</span>
                                            <span>{p.location}</span>
                                            <span>•</span>
                                            <span>{p.type}</span>
                                        </div>
                                    </div>

                                    <ArrowRightIcon className="h-5 w-5 text-secondary group-hover:text-[#f0b90b] group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-secondary border border-primary rounded-2xl p-8 text-center">
                    <h3 className="text-primary font-bold text-xl mb-2">
                        Don&apos;t see your role?
                    </h3>
                    <p className="text-secondary mb-6">
                        We&apos;re always interested in talented people. Send us a note.
                    </p>
                    <a
                        href="mailto:careers@afixcrypto.com"
                        className="inline-block bg-binance-yellow text-black font-bold px-6 py-3 rounded-xl hover:bg-[#d4a017] transition-colors"
                    >
                        Get in Touch
                    </a>
                </div>

            </div>
        </PublicLayout>
    );
}