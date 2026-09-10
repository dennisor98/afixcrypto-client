'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon, UsersIcon, ChartBarIcon, SignalIcon, BanknotesIcon,
  ArrowDownTrayIcon, ArrowUpTrayIcon, UserGroupIcon, Cog6ToothIcon,
  ClipboardDocumentListIcon, ArrowRightOnRectangleIcon,
  Bars3Icon, XMarkIcon, ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Badge from '@/components/ui/Badge';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { getCurrentUser, isSuperAdmin } from '@/lib/utils/admin';
import { authApi } from '@/lib/api/auth.api';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  superOnly: boolean;
}

const ALL_NAV: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, superOnly: false },
  { name: 'Users', href: '/admin/users', icon: UsersIcon, superOnly: false },
  { name: 'Bets', href: '/admin/bets', icon: ChartBarIcon, superOnly: false },
  { name: 'Signals', href: '/admin/signals', icon: SignalIcon, superOnly: false },
  { name: 'Treasury', href: '/admin/treasury', icon: BanknotesIcon, superOnly: false },
  { name: 'Withdrawals', href: '/admin/withdrawals', icon: ArrowDownTrayIcon, superOnly: false },
  { name: 'Deposits', href: '/admin/deposits', icon: ArrowUpTrayIcon, superOnly: false },
  { name: 'Manage Admins', href: '/admin/admins', icon: UserGroupIcon, superOnly: true },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon, superOnly: true },
  { name: 'Audit Log', href: '/admin/audit-log', icon: ClipboardDocumentListIcon, superOnly: true },
];

function SidebarContent({
  pathname, user, collapsed, navigation, isSuper, onNavClick, onLogout,
}: {
  pathname: string;
  user: any;
  collapsed: boolean;
  navigation: NavItem[];
  isSuper: boolean;
  onNavClick: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          'h-16 border-b border-line flex items-center',
          collapsed ? 'justify-center px-2' : 'px-4',
        )}
      >
        <Logo href="/admin" size="sm" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">
            Administration
          </p>
        )}

        {navigation.map((item) => {
          // Only /admin needs an exact match; the rest match their subtree
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavClick}
              title={collapsed ? item.name : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-accent/12 text-accent border border-accent/25'
                  : 'text-ink-muted hover:text-ink hover:bg-surface-2 border border-transparent',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 mb-1',
            collapsed && 'justify-center px-0',
          )}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-accent/12 border border-accent/25 flex items-center justify-center">
            <span className="text-accent font-bold text-sm" suppressHydrationWarning>
              {user?.userName?.charAt(0).toUpperCase() || 'A'}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate" suppressHydrationWarning>
                {user?.userName || 'Admin'}
              </p>
              <p className="text-xs text-ink-faint">
                {isSuper ? 'Super Admin' : 'Administrator'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
            'text-down hover:bg-down/10 transition-colors',
            collapsed && 'justify-center',
          )}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAutoLogout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setIsSuper(isSuperAdmin());
    if (localStorage.getItem('admin_sidebar_collapsed') === 'true') setCollapsed(true);
  }, []);

  const navigation = ALL_NAV.filter((item) => !item.superOnly || isSuper);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Revoke the refresh token server side, then clear local state regardless
  const handleLogout = async () => {
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

  const currentName =
    navigation.find((n) =>
      n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href),
    )?.name ?? 'Admin';

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 bg-surface border-r border-line flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-3 z-10 text-ink-muted hover:text-ink"
              aria-label="Close menu"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              user={user}
              collapsed={false}
              navigation={navigation}
              isSuper={isSuper}
              onNavClick={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="hidden lg:flex shrink-0 relative">
        <div
          className={cn(
            'flex flex-col border-r border-line bg-surface transition-[width] duration-200',
            collapsed ? 'w-20' : 'w-64',
          )}
        >
          <SidebarContent
            pathname={pathname}
            user={user}
            collapsed={collapsed}
            navigation={navigation}
            isSuper={isSuper}
            onNavClick={() => {}}
            onLogout={handleLogout}
          />
        </div>
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

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header
          className="shrink-0 h-16 px-4 md:px-6 flex items-center gap-3 border-b border-line bg-surface"
          suppressHydrationWarning
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-ink-muted hover:text-ink"
            aria-label="Open menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <p className="flex-1 min-w-0 font-semibold text-ink text-sm truncate">
            {currentName}
          </p>

          <div className="flex items-center gap-2 sm:gap-3">
            {isSuper && (
              <Badge tone="accent" className="hidden sm:inline-flex">
                Super Admin
              </Badge>
            )}

            <ThemeToggle />

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium
                         bg-surface-2 border border-line text-ink-muted hover:text-ink transition-colors"
            >
              <HomeIcon className="h-4 w-4" />
              <span className="hidden sm:inline">User Dashboard</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}