import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHAINTRACE — Automated Blockchain Intelligence & VASP Attribution',
  description: 'CHAINTRACE automates attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers (VASPs) through multi-chain blockchain intelligence.',
  keywords: ['blockchain intelligence', 'VASP attribution', 'crypto forensics', 'wallet tracing', 'virtual asset service provider', 'compliance'],
  authors: [{ name: 'CHAINTRACE Research' }],
  metadataBase: new URL('https://chaintrace.internal'),
  openGraph: {
    title: 'CHAINTRACE — Automated Blockchain Intelligence & VASP Attribution',
    description: 'Automated attribution of unknown cryptocurrency wallets to their nearest Virtual Asset Service Providers (VASPs).',
    siteName: 'CHAINTRACE',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: '/logo.svg', width: 240, height: 60, alt: 'CHAINTRACE Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CHAINTRACE — Automated Blockchain Intelligence & VASP Attribution',
    description: 'Automated attribution of unknown cryptocurrency wallets to nearest Virtual Asset Service Providers.',
    images: ['/logo.svg'],
  },
  manifest: '/site.webmanifest',
};

import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        {/* Immediate anti-FOUC theme setter */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('chaintrace-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-theme-bg text-theme-fg antialiased selection:bg-theme-primary selection:text-white transition-colors duration-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
