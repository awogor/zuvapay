import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay",
  description: "Instant decoder reactivation for DStv, GOtv, and StarTimes in Nigeria. Zero service fee, instant smartcard verification, and immediate reconnection.",
  openGraph: {
    title: "Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay",
    description: "Instant decoder reactivation for DStv, GOtv, and StarTimes in Nigeria. Zero service fee, instant smartcard verification, and immediate reconnection.",
    url: "/services/tv",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/cable-tv.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Instant Cable TV Subscription",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay",
    description: "Instant decoder reactivation for DStv, GOtv, and StarTimes in Nigeria. Zero service fee, instant smartcard verification, and immediate reconnection.",
    images: ["/og/cable-tv.png"],
  },
};

export default function ServicesTvLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
