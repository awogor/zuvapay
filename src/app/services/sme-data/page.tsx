import type { Metadata } from 'next';
import { SmeDataPageView } from '@/components/marketing-pages/SmeDataPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Cheap SME Data Bundles from ₦240/GB (MTN, Airtel, Glo, 9mobile) — ZuvaPay',
  },
  description:
    'Buy and resell wholesale SME, Corporate Gifting, and Direct Data bundles in Nigeria. Instant 1.2s delivery, 30-day automatic rollover, and reseller profit margins.',
  alternates: {
    canonical: '/services/sme-data',
  },
  keywords: [
    'cheap SME data Nigeria',
    'MTN SME data 240',
    'buy data online Nigeria',
    'Airtel corporate gifting data',
    'Glo cheap data bundle',
    '9mobile SME data',
    'VTU data reseller Nigeria',
    'resell data bundles Nigeria',
    'instant SME data delivery',
  ],
  openGraph: {
    title: 'Cheap SME Data Bundles from ₦240/GB — ZuvaPay',
    description:
      'Wholesale SME, Corporate Gifting, and Direct Data bundles across MTN, Airtel, Glo, and 9mobile with 1.2s delivery and 30-day automatic rollover.',
    url: '/services/sme-data',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/sme-data.png',
        width: 1200,
        height: 630,
        alt: 'Cheap SME Data Bundles from ₦240/GB — ZuvaPay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheap SME Data Bundles from ₦240/GB — ZuvaPay',
    description:
      'Buy cheap SME data starting from ₦240/GB with automated 1.2s delivery and full refunds on failed transactions.',
    images: ['/og/sme-data.png'],
  },
};

export default function SmeDataPage() {
  return <SmeDataPageView />;
}
