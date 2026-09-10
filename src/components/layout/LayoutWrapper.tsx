'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

const PUBLIC_PAGES = ['/about', '/careers', '/help', '/docs', '/guide', '/status', '/terms', '/privacy', '/risk', '/aml'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname?.startsWith('/auth');
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');
  const isHome = pathname === '/';
  const isPublicPage = PUBLIC_PAGES.includes(pathname || '');

  if (isHome || isAuth || isDashboard || isAdmin || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen" suppressHydrationWarning>
      <Navbar />
      <main className="flex-grow" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
    </div>
  );
}