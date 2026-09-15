import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Instant Airtime Top-Up & Mobile Recharge — ZuvaPay",
  description: "Instant recharge for MTN, Airtel, Glo, and 9mobile with cash rewards. Direct telecom gateway connection with zero failed top-ups.",
  openGraph: {
    title: "Instant Airtime Top-Up & Mobile Recharge — ZuvaPay",
    description: "Instant recharge for MTN, Airtel, Glo, and 9mobile with cash rewards. Direct telecom gateway connection with zero failed top-ups.",
    url: "/services/airtime",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/main.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Instant Airtime Top-Up",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Instant Airtime Top-Up & Mobile Recharge — ZuvaPay",
    description: "Instant recharge for MTN, Airtel, Glo, and 9mobile with cash rewards. Direct telecom gateway connection with zero failed top-ups.",
    images: ["/og/main.png"],
  },
};

export default function ServicesAirtimeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
