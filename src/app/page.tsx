'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';
import Footer from '@/components/layout/Footer';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Button from '@/components/ui/Button';
import { useLivePrice } from '@/hooks/useMarketData';
import { cn } from '@/lib/utils/cn';
import {
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-us', label: 'Why us' },
];

const STATS = [
  { value: '95%', label: 'Max payout' },
  { value: '5 min', label: 'Shortest window' },
  { value: '$10', label: 'Minimum deposit' },
  { value: 'TRC20', label: 'USDT network' },
];

const FEATURES = [
  {
    icon: ChartBarIcon,
    title: 'Real market settlement',
    desc: 'Entry and exit prices are captured from live Binance data. The market decides the outcome, and every trade shows both prices.',
  },
  {
    icon: BoltIcon,
    title: 'Fast windows',
    desc: 'Trade in five, fifteen or thirty minute windows. Settlement is automatic the moment the window closes.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Fixed payout',
    desc: 'You see the exact profit and the exact risk before you commit. No slippage, no spread, no surprises.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Protected balances',
    desc: 'Every balance change is atomic and locked at the database level, so funds cannot be double spent.',
  },
  {
    icon: ClockIcon,
    title: 'Direct withdrawals',
    desc: 'Withdraw USDT to your own TRC20 address. Requests are reviewed and paid out from treasury.',
  },
  {
    icon: CheckCircleIcon,
    title: 'Quick to start',
    desc: 'Register with an email, verify with a one time code, deposit and trade. No lengthy onboarding.',
  },
];

const STEPS = [
  { n: '01', title: 'Create an account', desc: 'Register with your email and verify with a one time code.' },
  { n: '02', title: 'Deposit USDT', desc: 'Send TRC20 USDT to the address generated for your account.' },
  { n: '03', title: 'Choose a direction', desc: 'Predict whether BTC will rise or fall over your chosen window.' },
  { n: '04', title: 'Settle automatically', desc: 'The exit price is compared to your entry price and paid out.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const btc = useLivePrice('BTCUSDT');
  const isUp = btc.changePercent >= 0;

  const priceLabel =
    btc.price > 0
      ? `$${btc.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : '---';

  return (
    <div className="min-h-screen bg-base text-ink">
      <nav className="sticky top-0 z-40 h-16 border-b border-line bg-base/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4">
          <Logo href="/" size="sm" />

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-ink-muted hover:text-ink transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex h-9 items-center px-3 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get started</Button>
            </Link>
            <button
              className="md:hidden text-ink-muted hover:text-ink"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-base">
          <div className="h-16 px-4 flex items-center justify-between border-b border-line">
            <Logo href="/" size="sm" />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-ink-muted hover:text-ink"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-6 space-y-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-ink border-b border-line"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="block py-3 text-ink"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-3 space-y-6">
              <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-accent/10 border border-accent/25">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-accent text-xs font-semibold uppercase tracking-wider">
                  Live market data
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08]">
                Trade BTC in
                <br />
                <span className="text-accent">five minute</span> windows
              </h1>

              <p className="text-base sm:text-lg text-ink-muted max-w-xl leading-relaxed">
                Predict the direction, not the magnitude. Entry and exit prices come
                from live Binance data, so every outcome is decided by the market.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/auth/register">
                  <Button size="lg" fullWidth>
                    Start trading
                    <BoltIcon className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="secondary" fullWidth>
                    Sign in
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                {['USDT on TRC20', 'Fixed payout', 'Automatic settlement'].map((t) => (
                  <span key={t} className="inline-flex items-center gap-2 text-sm text-ink-muted">
                    <CheckCircleIcon className="h-4 w-4 text-up" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Live price card */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-line rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">BTC / USDT</p>
                    <p className="text-xs text-ink-faint">Binance spot</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-up/12 border border-up/30 text-up text-xs font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-up animate-pulse" />
                    Live
                  </span>
                </div>

                <div className="pt-4 border-t border-line">
                  <p className="text-xs uppercase tracking-wider text-ink-faint mb-1">
                    Current price
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-ink tabular-nums">
                    {priceLabel}
                  </p>
                  <p
                    className={cn(
                      'inline-flex items-center gap-1.5 mt-2 text-sm font-medium tabular-nums',
                      isUp ? 'text-up' : 'text-down',
                    )}
                  >
                    {isUp ? (
                      <ArrowTrendingUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4" />
                    )}
                    {isUp ? '+' : ''}
                    {btc.changePercent.toFixed(2)}%
                    <span className="text-ink-faint">24h</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-up/8 border border-up/25">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-up" />
                    <span className="text-xs font-semibold uppercase text-up mt-1.5">Rise</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-4 rounded-xl bg-down/8 border border-down/25">
                    <ArrowTrendingDownIcon className="h-5 w-5 text-down" />
                    <span className="text-xs font-semibold uppercase text-down mt-1.5">Fall</span>
                  </div>
                </div>

                <Link href="/auth/register" className="block">
                  <Button fullWidth>Open an account</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-accent tabular-nums">
                  {s.value}
                </p>
                <p className="text-xs uppercase tracking-wider text-ink-faint mt-1">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Built for short term trading</h2>
            <p className="text-ink-muted mt-3">
              Everything is designed around one idea, which is that the outcome should
              be verifiable and the terms should be clear before you commit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-surface border border-line rounded-xl p-5 hover:border-accent/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                  <f.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="font-semibold text-ink mb-1.5">{f.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-line bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">How it works</h2>
            <p className="text-ink-muted mt-3">
              From registration to settlement in four steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-base border border-line rounded-xl p-5">
                <p className="text-accent font-bold text-sm mb-3">{s.n}</p>
                <h3 className="font-semibold text-ink mb-1.5">{s.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="why-us" className="border-b border-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Transparent by design</h2>
          <p className="text-lg text-ink-muted mt-4 leading-relaxed">
            Every settled trade records the price when you entered and the price when
            the window closed. Both are shown in your history, so you can check any
            outcome against the market yourself.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-8">
            {['Entry price recorded', 'Exit price recorded', 'Outcome you can verify'].map((t) => (
              <div
                key={t}
                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-surface border border-line text-sm text-ink-muted"
              >
                <CheckCircleIcon className="h-4 w-4 text-accent shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-line bg-surface">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to place your first trade?</h2>
          <p className="text-ink-muted mt-3 mb-8">
            Register, verify your email and deposit USDT to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="secondary">Sign in</Button>
            </Link>
          </div>
          <p className="text-xs text-ink-faint mt-8">
            Trading involves risk. Never invest more than you can afford to lose.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}