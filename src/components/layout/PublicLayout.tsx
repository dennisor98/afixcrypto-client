'use client';

import Link from 'next/link';
import Footer from './Footer';
import Logo from '@/components/Logo';

export default function PublicLayout({
                                         children,
                                         title,
                                         subtitle,
                                     }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="min-h-screen bg-primary text-primary flex flex-col">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0b0e11/80] backdrop-blur-xl border-b border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">

                    <Logo size="sm" />

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/#features" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
                            Features
                        </Link>
                        <Link href="/help" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
                            Help
                        </Link>
                        <Link href="/about" className="text-secondary hover:text-primary text-sm font-medium transition-colors">
                            About
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                        <Link
                            href="/auth/login"
                            className="hidden sm:inline-block text-primary text-sm font-medium hover:text-[#f0b90b] transition-colors px-4 py-2"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/register"
                            className="bg-binance-yellow text-black text-sm font-bold px-3 sm:px-5 py-2.5 rounded-lg hover:bg-[#d4a017] transition-colors shadow-lg shadow-[#f0b90b]/20"
                        >
                            <span className="sm:hidden">Start</span>
                            <span className="hidden sm:inline">Get Started</span>
                        </Link>
                    </div>

                </div>
            </header>

            {/* Page Hero */}
            <section className="border-b border-primary bg-gradient-to-br from-[#f0b90b]/5 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">{title}</h1>
                    {subtitle && (
                        <p className="text-secondary text-lg max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
