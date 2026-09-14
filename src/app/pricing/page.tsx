import type { Metadata } from 'next';
import { PricingPageView } from '@/components/marketing-pages/PricingPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Wholesale Utility Rates & Free Account Tiers — ZuvaPay',
  },
  description:
    'Transparent wholesale rates on Nigerian utility payments. Zero maintenance fee, SME data from ₦240/GB, 0% electricity surcharge, and reseller tiers for businesses and agencies.',
  alternates: {
    canonical: '/pricing',
  },
  keywords: [
    'data pricing Nigeria',
    'wholesale SME data rates',
    'cheap data reseller price',
    'ZuvaPay pricing tiers',
  ],
  openGraph: {
    title: 'Wholesale Utility Rates & Free Account Tiers — ZuvaPay',
    description:
      'Transparent pricing for individuals, student creators, and high-volume digital agencies in Nigeria.',
    url: '/pricing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wholesale Utility Rates & Free Account Tiers — ZuvaPay',
    description:
      'Transparent wholesale pricing for Nigerian utility bills, SME data bundles, and digital subscriptions.',
  },
};

export default function PricingPage() {
  return <PricingPageView />;
}
