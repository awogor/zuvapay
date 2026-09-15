import type { Metadata } from 'next';
import { ElectricityPageView } from '@/components/marketing-pages/ElectricityPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Prepaid Electricity Meter Tokens (0% Convenience Fee) — ZuvaPay',
  },
  description:
    'Pay prepaid and postpaid electricity bills across IKEDC, EKEDC, AEDC, IBEDC, KEDCO, and all Nigerian Discos with ₦0 convenience fee. Real-time meter name validation and instant 20-digit tokens.',
  alternates: {
    canonical: '/services/electricity',
  },
  keywords: [
    'prepaid electricity token',
    'buy NEPA token online',
    'IKEDC prepaid meter token',
    'EKEDC token recharge',
    'AEDC meter token',
    'zero fee electricity payment',
    'prepaid meter token Nigeria',
    'IBEDC token recharge',
    'meter token SMS',
  ],
  openGraph: {
    title: 'Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay',
    description:
      'Generate 20-digit prepaid meter tokens in 1.5 seconds across all Nigerian Discos with ₦0 convenience fee and instant owner name validation.',
    url: '/services/electricity',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/electricity.png',
        width: 1200,
        height: 630,
        alt: 'Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay',
    description:
      'Instant 20-digit NEPA tokens with real-time meter pre-validation and ₦0 extra charges across all Nigerian Discos.',
    images: ['/og/electricity.png'],
  },
};

export default function ElectricityPage() {
  return <ElectricityPageView />;
}
