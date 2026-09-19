'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser } from '@/lib/api/api';
import { authApi } from '@/lib/api/auth.api';
import { useLivePrice } from '@/hooks/useMarketData';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils/cn';
import {
  Squares2X2Icon,
  BoltIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
  UserGroupIcon,
  BellIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon, group: 'main' },
  { label: 'Trade', href: '/dashboard/trade', icon: BoltIcon, group: 'main' },
  { label: 'Trading Bots', href: '/dashboard/bots', icon: CpuChipIcon, group: 'main' },
  { label: 'Trade History', href: '/dashboard/trade-history', icon: ClipboardDocumentListIcon, group: 'main' },
  { label: 'Wallet', href: '/dashboard/wallet', icon: WalletIcon, group: 'account' },
  { label: 'Referrals', href: '/dashboard/referrals', icon: UserGroupIcon, group: 'account' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: BellIcon, group: 'account' },
  { label: 'Profile', href: '/dashboard/profile', icon: UserIcon, group: 'account' },
  { label: 'Security', href: '/dashboard/security', icon: ShieldCheckIcon, group: 'account' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAutoLogout();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);

  const btc = useLivePrice('BTCUSDT');
  const btcUp = btc.changePercent >= 0;
  const isAdmin = user?.roles === 'admin' || user?.roles === 'super_admin';

  useEffect(() => {
    setUser(getUser());
    if (localStorage.getItem('sidebar_collapsed') === 'true') setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = async () => {
    // Clear local state even if the API call fails, so the user is never stuck
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'auth_token=; path=/; max-age=0';
    router.push('/auth/login');
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const currentLabel =
    NAV.find((n) => isActive(n.href))?.label ?? 'Dashboard';

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = collapsed && !isMobile;

    const NavLink = ({ item }: { item: (typeof NAV)[number] }) => (
      <Link
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isCollapsed && 'justify-center',
          isActive(item.href)
            ? 'bg-accent/12 text-accent border border-accent/25'
            : 'text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent',
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    return (
      <aside
        className={cn(
          'flex flex-col h-full bg-surface border-r border-line transition-[width] duration-200',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        <div
          className={cn(
            'h-16 px-4 flex items-center border-b border-line',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <Logo href="/dashboard" size="sm" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Main
            </p>
          )}
          {NAV.filter((n) => n.group === 'main').map((item) => (
            <NavLink key={item.href} item={item} />
          ))}

          {!isCollapsed && (
            <p className="px-3 mt-5 mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
              Account
            </p>
          )}
          {!isCollapsed || <div className="h-4" />}
          {NAV.filter((n) => n.group === 'account').map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-line">
          <div
            className={cn(
              'flex items-center gap-3 px-3 py-2 mb-1',
              isCollapsed && 'justify-center px-0',
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
              <span className="text-accent font-bold text-sm">
                {user?.userName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-ink text-sm font-medium truncate">
                  {user?.userName || 'Trader'}
                </p>
                <p className="text-ink-faint text-xs truncate">
                  {user?.email || ''}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign out' : undefined}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
              'text-down hover:bg-down/10 transition-colors',
              isCollapsed && 'justify-center',
            )}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    );
  };

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <div className="hidden md:flex shrink-0 relative">
        <Sidebar />
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-5 -right-3 h-6 w-6 z-10 rounded-full bg-surface-2 border border-line
                     flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronLeftIcon
            className={cn('h-3 w-3 transition-transform', collapsed && 'rotate-180')}
          />
        </button>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64">
            <Sidebar isMobile />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 h-16 px-4 md:px-6 flex items-center gap-3 border-b border-line bg-surface">
          <button
            className="md:hidden text-ink-muted hover:text-ink"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <p className="flex-1 min-w-0 font-semibold text-ink text-sm truncate">
            {currentLabel}
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-bold
                           bg-accent/12 text-accent border border-accent/25 hover:bg-accent/20 transition-colors"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Admin
              </Link>
            )}

            <div className="hidden sm:flex items-center gap-2 h-9 px-3 bg-surface-2 border border-line rounded-lg">
              <span className="text-accent text-xs font-bold">BTC</span>
              <span className="text-ink text-sm font-bold tabular-nums">
                {btc.price > 0
                  ? `$${btc.price.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : '---'}
              </span>
              <span
                className={cn(
                  'text-xs font-medium tabular-nums',
                  btcUp ? 'text-up' : 'text-down',
                )}
              >
                {btcUp ? '+' : ''}
                {btc.changePercent.toFixed(2)}%
              </span>
            </div>

            <ThemeToggle />

            <Link
              href="/dashboard/wallet/deposit"
              className="inline-flex items-center h-9 px-4 rounded-lg text-xs font-bold
                         bg-accent text-accent-ink hover:bg-accent-hover transition-colors"
            >
              Deposit
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}