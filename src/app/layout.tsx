import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/components/common/Toast';
import { ReceiptModal } from '@/components/modals/ReceiptModal';
import { SupportProvider } from '@/components/modals/SupportModal';

export const metadata: Metadata = {
  title: 'ZuvaPay — Cheap SME Data, Bill Payments & Communication Tools',
  description:
    'ZuvaPay is the all-in-one digital platform for cheap SME data, 20-digit electricity tokens, foreign virtual SMS OTP numbers, and automated utility bill payments in Nigeria.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('zuvapay_theme') || 'dark';
                var d = document.documentElement;
                if (saved === 'light') {
                  d.classList.remove('dark');
                  d.classList.add('light');
                  d.setAttribute('data-theme', 'light');
                  d.style.colorScheme = 'light';
                } else {
                  d.classList.add('dark');
                  d.classList.remove('light');
                  d.setAttribute('data-theme', 'dark');
                  d.style.colorScheme = 'dark';
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
        <ThemeProvider>
          <AuthProvider>
            <WalletProvider>
              <ToastProvider>
                <SupportProvider>
                  {children}
                  <ReceiptModal />
                </SupportProvider>
              </ToastProvider>
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
