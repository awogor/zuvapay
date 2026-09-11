import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { ToastProvider } from '@/components/common/Toast';
import { ReceiptModal } from '@/components/modals/ReceiptModal';
import { SupportProvider } from '@/components/modals/SupportModal';

export const metadata: Metadata = {
  title: 'KorrectPay — Nigerian Fintech & Digital Services Platform',
  description:
    'Instant Airtime, Internet Data, Electricity, Cable TV, Virtual SMS Phone Numbers, Social Media Growth, and Premium Digital Logs & Tools.',
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
                var saved = localStorage.getItem('korrectpay_theme') || 'dark';
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
