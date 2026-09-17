import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/components/common/Toast';
import { ReceiptModal } from '@/components/modals/ReceiptModal';
import { SupportProvider } from '@/components/modals/SupportModal';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zuvapay.com';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-1PQWBFSLXP';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FF6B00' },
    { media: '(prefers-color-scheme: dark)', color: '#FF6B00' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Cheap SME Data, Electricity Tokens & Digital Services — ZuvaPay',
    template: '%s — ZuvaPay',
  },
  description:
    'ZuvaPay is the all-in-one digital platform for cheap SME data, 20-digit electricity tokens, virtual dollar cards, virtual phone numbers, and automated utility bill payments in Nigeria.',
  applicationName: 'ZuvaPay',
  keywords: [
    'ZuvaPay',
    'buy SME data Nigeria',
    'instant electricity tokens',
    'virtual dollar card Nigeria',
    'Mastercard virtual card',
    'virtual phone numbers',
    'international payments Nigeria',
    'automated bill payment Nigeria',
  ],
  authors: [{ name: 'ZuvaPay Technologies' }],
  creator: 'ZuvaPay Technologies',
  publisher: 'ZuvaPay Technologies',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: baseUrl,
    siteName: 'ZuvaPay',
    title: 'Cheap SME Data, Electricity Tokens & Digital Services — ZuvaPay',
    description:
      'Power your everyday digital payments with zero delay. Instant wholesale SME data, prepaid electricity tokens, virtual dollar cards, and foreign carrier virtual phone numbers.',
    images: [
      {
        url: '/og/main.png',
        width: 1200,
        height: 630,
        alt: 'ZuvaPay — Instant Bill Payments, SME Data & Digital Services',
        type: 'image/png',
      },
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZuvaPay Platform',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheap SME Data, Electricity Tokens & Digital Services — ZuvaPay',
    description:
      'Power your everyday digital payments in Nigeria with instant wholesale SME data, 20-digit electricity tokens, foreign SMS OTPs, and verified AI tools.',
    images: ['/og/main.png'],
    creator: '@zuvapay',
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#FF6B00" />
        <meta name="msapplication-navbutton-color" content="#FF6B00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('zuvapay_theme') || 'light';
                var d = document.documentElement;
                if (saved === 'dark') {
                  d.classList.add('dark');
                  d.classList.remove('light');
                  d.setAttribute('data-theme', 'dark');
                  d.style.colorScheme = 'dark';
                } else {
                  d.classList.remove('dark');
                  d.classList.add('light');
                  d.setAttribute('data-theme', 'light');
                  d.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className="antialiased selection:bg-brand-orange selection:text-slate-950"
        suppressHydrationWarning
      >
        {/* Google Analytics (GA4) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
        <ThemeProvider>
          <ToastProvider>
            <SupportProvider>
              <AuthProvider>
                <WalletProvider>
                  {children}
                  <ReceiptModal />
                </WalletProvider>
              </AuthProvider>
            </SupportProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
