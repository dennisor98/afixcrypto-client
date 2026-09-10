'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Bars3Icon,  
  XMarkIcon,
  WalletIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  };

  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuth = pathname?.startsWith('/auth');

  // Don't show navbar on dashboard (it has its own layout)
  if (isDashboard) {
    return null;
  }

  return (
    <nav className="bg-secondary border-b border-primary sticky top-0 z-50 transition-colors" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-binance-yellow rounded-lg flex items-center justify-center">
                <WalletIcon className="h-6 w-6 text-binance-dark" />
              </div>
              <span className="text-xl font-bold text-primary">Crypto Trading</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                pathname === '/' ? 'text-binance-yellow' : 'text-secondary hover:text-binance-yellow'
              }`}
            >
              Home
            </Link>
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium transition ${
                    isAuth ? 'text-binance-yellow' : 'text-secondary hover:text-binance-yellow'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-binance-yellow text-binance-dark px-4 py-2 rounded-lg text-sm font-medium hover:bg-binance-yellow-dark transition"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-secondary hover:text-binance-yellow transition"
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-binance-yellow/20 flex items-center justify-center border border-binance-yellow/30">
                      <span className="text-binance-yellow font-semibold text-sm">
                        {user?.userName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-primary">{user?.userName || 'User'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-secondary hover:text-red-400 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary hover:text-primary"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-primary bg-tertiary transition-colors">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-base font-medium text-secondary hover:text-binance-yellow hover:bg-secondary rounded-md transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-secondary hover:text-binance-yellow hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-secondary hover:text-binance-yellow hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-secondary hover:text-binance-yellow hover:bg-secondary rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-secondary rounded-md transition-colors"
                >
                  Logout
                </button>
              </>
            )}
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
