import type { Metadata } from 'next';
import { HomePageView } from '@/components/marketing-pages/HomePageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Cheap SME Data, Bill Payments & Communication Tools — ZuvaPay',
  },
  description:
    'ZuvaPay is the all-in-one digital platform for cheap SME data, 20-digit electricity tokens, foreign virtual SMS OTP numbers, and automated utility bill payments in Nigeria.',
  alternates: {
    canonical: '/',
  },
  keywords: [
    'cheap SME data Nigeria',
    'instant electricity tokens',
    'prepaid meter token online',
    'foreign phone number for WhatsApp OTP',
    'automated bill payment Nigeria',
    'ZuvaPay bill payments',
  ],
  openGraph: {
    title: 'Cheap SME Data, Bill Payments & Communication Tools — ZuvaPay',
    description:
      'Power your everyday digital payments with instant fulfillment. Fast SME data, instant prepaid meter tokens, and foreign OTP numbers with zero downtime.',
    url: '/',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/main.png',
        width: 1200,
        height: 630,
        alt: 'ZuvaPay — Fast SME Data, Electricity Tokens & Digital Services',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cheap SME Data, Bill Payments & Communication Tools — ZuvaPay',
    description:
      'Buy cheap SME data from ₦240/GB, instant electricity tokens, and foreign OTP phone numbers in Nigeria.',
    images: ['/og/main.png'],
  },
};

export default function HomePage() {
  return <HomePageView />;
}
