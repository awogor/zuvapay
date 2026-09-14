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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Renew DStv, GOtv & StarTimes Subscriptions Online — ZuvaPay',
    description:
      'Instant cable TV bouquet renewals with 60-second decoder reconnection and real-time smartcard pre-validation.',
  },
};

export default function CableTvPage() {
  return <CableTvPageView />;
}
