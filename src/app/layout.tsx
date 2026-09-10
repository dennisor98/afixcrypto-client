import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import LayoutWrapper from '@/components/layout/LayoutWrapper';

// Body and UI text. Excellent legibility at small sizes.
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

// Headings only. Geometric and confident without being decorative.
const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['500', '600', '700'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'afixcrypto | Trade BTC',
    description: 'Binary BTC options trading platform. Predict price direction in 5-minute intervals and earn payouts.',
    manifest: '/site.webmanifest',
    icons: {
        icon: [
            { url: '/favicon.ico?v=2', sizes: 'any' },
            { url: '/favicon-16x16.png?v=2', type: 'image/png', sizes: '16x16' },
            { url: '/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
        ],
        apple: '/apple-touch-icon.png?v=2',
        other: [
            { rel: 'icon', url: '/android-chrome-192x192.png?v=2', sizes: '192x192' },
            { rel: 'icon', url: '/android-chrome-512x512.png?v=2', sizes: '512x512' },
        ],
    },
    openGraph: {
        title: 'afixcrypto',
        description: 'Trade BTC in 5-minute windows',
        url: '/',
        siteName: 'afixcrypto',
        images: [
            { url: '/afixcrypto.png', width: 1200, height: 630, alt: 'afixcrypto' },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'afixcrypto',
        description: 'Trade BTC in 5-minute windows',
        images: ['/afixcrypto.png'],
    },
};

export const viewport: Viewport = {
    themeColor: '#0a0c0f',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${spaceGrotesk.variable}`}
            suppressHydrationWarning
        >
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              (function() {
                try {
                  // Dark is the product default. Only an explicit choice
                  // switches to light, and it runs before paint so there
                  // is no flash of the wrong theme.
                  var stored = localStorage.getItem('theme');
                  var theme = stored === 'light' ? 'light' : 'dark';
                  document.documentElement.classList.add(theme);
                  if (!stored) localStorage.setItem('theme', 'dark');
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
                    }}
                />
            </head>
            <body suppressHydrationWarning>
                <Providers>
                    <LayoutWrapper>{children}</LayoutWrapper>
                </Providers>
            </body>
        </html>
    );
}