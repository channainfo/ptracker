import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { WalletProvider } from '@/components/providers/wallet-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'PTracker - Smart Portfolio & Crypto Education',
    template: '%s | PTracker',
  },
  description: 'The ultimate crypto portfolio management and education platform with real-time market sentiment analysis.',
  keywords: [
    'crypto',
    'cryptocurrency',
    'portfolio',
    'trading',
    'education',
    'bitcoin',
    'ethereum',
    'defi',
    'market analysis',
    'sentiment analysis',
  ],
  authors: [{ name: 'PTracker Team' }],
  creator: 'PTracker',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ptracker.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'PTracker - Smart Portfolio & Crypto Education',
    description: 'The ultimate crypto portfolio management and education platform with real-time market sentiment analysis.',
    siteName: 'PTracker',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PTracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PTracker - Smart Portfolio & Crypto Education',
    description: 'The ultimate crypto portfolio management and education platform with real-time market sentiment analysis.',
    images: ['/og-image.png'],
    creator: '@ptracker',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <WalletProvider>
                <SocketProvider>
                  {children}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      className: 'toast',
                      success: {
                        iconTheme: {
                          primary: '#10b981',
                          secondary: '#ffffff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#ffffff',
                        },
                      },
                    }}
                  />
                </SocketProvider>
              </WalletProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}