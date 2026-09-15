import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay",
  description: "Rent disposable and permanent non-VoIP virtual phone numbers for instant SMS OTP verification on WhatsApp, Telegram, OpenAI, Claude, PayPal, and Google.",
  openGraph: {
    title: "Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay",
    description: "Rent disposable and permanent non-VoIP virtual phone numbers for instant SMS OTP verification on WhatsApp, Telegram, OpenAI, Claude, PayPal, and Google.",
    url: "/services/sms",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/virtual-number.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Virtual Phone Numbers for SMS Verification",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay",
    description: "Rent disposable and permanent non-VoIP virtual phone numbers for instant SMS OTP verification on WhatsApp, Telegram, OpenAI, Claude, PayPal, and Google.",
    images: ["/og/virtual-number.png"],
  },
};

export default function ServicesSmsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
