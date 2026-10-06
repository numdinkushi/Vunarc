import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PWAComponents } from '@/components/PWAComponents';
import { ConvexClientProvider } from '../providers/ConvexClientProvider';
import Web3Provider from '../providers/Web3Provider';
import { Toaster } from '@/components/ui/sonner';
import { WalletConnectionTracker } from '@/components/wallet/WalletConnectionTracker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vunarc - Harvesting the Future',
  description: 'Connect directly with local farmers and access the freshest produce while supporting sustainable agriculture in South Africa',
  manifest: '/manifest.json',
  themeColor: '#22c55e',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vunarc',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/assets/logo/logo-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/logo/logo-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/logo/logo-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vunarc" />
        <link rel="apple-touch-icon" href="/assets/logo/logo-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Drop stale SW caches (old RainbowKit bundles) then re-register.
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    return Promise.all(regs.map(function(r) { return r.unregister(); }));
                  }).then(function() {
                    return caches.keys();
                  }).then(function(keys) {
                    return Promise.all(keys.map(function(k) { return caches.delete(k); }));
                  }).then(function() {
                    return navigator.serviceWorker.register('/sw.js');
                  }).catch(function(err) {
                    console.log('SW refresh failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const originalError = console.error;
              console.error = function(...args) {
                if (args[0] && args[0].toString().includes('chrome.runtime.sendMessage')) {
                  return;
                }
                originalError.apply(console, args);
              };
            `,
          }}
        />
        <ConvexClientProvider>
          <Web3Provider>
            {children}
            <WalletConnectionTracker />
            <PWAComponents />
            <Toaster />
          </Web3Provider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
