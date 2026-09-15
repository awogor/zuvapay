import type { Metadata } from 'next';
import { VirtualNumberPageView } from '@/components/marketing-pages/VirtualNumberPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay',
  },
  description:
    'Rent real physical carrier foreign phone numbers from the US, UK, Canada, Kenya, and 150+ countries for international verification. Dedicated 15-minute window with automated full refund guarantee.',
  alternates: {
    canonical: '/services/virtual-number',
  },
  keywords: [
    'virtual phone number Nigeria',
    'rent US phone number',
    'UK virtual phone number',
    'non-VoIP phone numbers',
    'temporary phone numbers Nigeria',
    'foreign phone number verification',
    'international phone line rental',
    'receive SMS online',
    'automated phone number refund',
  ],
  openGraph: {
    title: 'Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay',
    description:
      'Rent real non-VoIP temporary foreign phone numbers from the US, UK, Canada, and 150+ countries with 100% automated refund guarantee.',
    url: '/services/virtual-number',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/virtual-number.png',
        width: 1200,
        height: 630,
        alt: 'Virtual Phone Numbers for 150+ Countries — ZuvaPay',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Phone Numbers for 150+ Countries (Non-VoIP) — ZuvaPay',
    description:
      'Rent real non-VoIP temporary foreign phone numbers from 150+ countries with automated refunds if no verification code arrives.',
    images: ['/og/virtual-number.png'],
  },
};

export default function VirtualNumberPage() {
  return <VirtualNumberPageView />;
}
