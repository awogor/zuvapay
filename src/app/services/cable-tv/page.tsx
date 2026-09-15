import type { Metadata } from 'next';
import { CableTvPageView } from '@/components/marketing-pages/CableTvPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay',
  },
  description:
    'Instant cable TV renewals in Nigeria. Live Smartcard and IUC number pre-validation, all bouquet options from Padi to Premium, and automatic 60-second decoder reconnection.',
  alternates: {
    canonical: '/services/cable-tv',
  },
  keywords: [
    'renew DStv subscription online',
    'pay GOtv online Nigeria',
    'StarTimes bouquet recharge',
    'DStv compact subscription',
    'GOtv supa recharge',
    'cable TV subscription Nigeria',
    'instant decoder reconnection',
    'IUC number validation',
  ],
  openGraph: {
    title: 'Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay',
    description:
      'Instant cable TV bouquet renewals with 60-second decoder reconnection and real-time smartcard pre-validation across Nigeria.',
    url: '/services/cable-tv',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/cable-tv.png',
        width: 1200,
        height: 630,
        alt: 'Renew DStv, GOtv & StarTimes Online — ZuvaPay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay',
    description:
      'Instant cable TV bouquet renewals with 60-second decoder reconnection and real-time smartcard pre-validation.',
    images: ['/og/cable-tv.png'],
  },
};

export default function CableTvPage() {
  return <CableTvPageView />;
}
