import type { Metadata } from 'next';
import { ServicesPageView } from '@/components/marketing-pages/ServicesPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'All Digital Utilities, Services & Wholesale Rates Catalog — ZuvaPay',
  },
  description:
    "Explore live wholesale rates across all ZuvaPay services: cheap SME data from ₦240/GB, prepaid electricity tokens with ₦0 fee, cable TV renewals, virtual dollar cards, airtime cashback, and virtual phone numbers.",
  alternates: {
    canonical: '/services',
  },
  keywords: [
    'ZuvaPay services catalog',
    'SME data bundles Nigeria',
    'MTN 1GB 240',
    'prepaid electricity token Nigeria',
    'virtual dollar card Nigeria',
    'virtual phone number rental',
    'cable TV subscription Nigeria',
    'airtime discount Nigeria',
  ],
  openGraph: {
    title: 'All Digital Utilities & Services Catalog — ZuvaPay',
    description:
      'Explore live wholesale rates for SME data bundles, prepaid meter tokens, cable TV renewals, virtual dollar cards, and virtual phone numbers.',
    url: '/services',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/main.png',
        width: 1200,
        height: 630,
        alt: 'All Digital Utilities & Services Catalog — ZuvaPay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Digital Utilities & Services Catalog — ZuvaPay',
    description:
      'Live wholesale rates on SME data, prepaid power tokens, virtual dollar cards, and digital utilities with automated instant refunds.',
    images: ['/og/main.png'],
  },
};

export default function ServicesPage() {
  return <ServicesPageView />;
}
