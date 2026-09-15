import type { Metadata } from 'next';
import { AgentPageView } from '@/components/marketing-pages/AgentPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Become a ZuvaPay POS & Digital Agent (Request Access) — ZuvaPay',
  },
  description:
    'Request to become an authorized ZuvaPay digital or POS agent. Earn daily commissions reselling wholesale SME data, electricity tokens, cable TV, and airtime with zero signup obligations.',
  alternates: {
    canonical: '/agent',
  },
  keywords: [
    'become an agent ZuvaPay',
    'POS agent request Nigeria',
    'resell SME data agent',
    'bill payment agent Lagos Abuja Port Harcourt',
    'ZuvaPay merchant partner',
  ],
  openGraph: {
    title: 'Become a ZuvaPay POS & Digital Agent (Request Access) — ZuvaPay',
    description:
      'Submit an agent onboarding request. No forced sign-up, zero franchise fee, wholesale margin discounts, and 24/7 dedicated support.',
    url: '/agent',
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: '/og/agent.png',
        width: 1200,
        height: 630,
        alt: 'Become a ZuvaPay Agent & Reseller',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become a ZuvaPay POS & Digital Agent (Request Access) — ZuvaPay',
    description:
      'Join thousands of merchants earning daily commissions across Nigeria with ZuvaPay.',
    images: ['/og/agent.png'],
  },
};

export default function AgentPage() {
  return <AgentPageView />;
}
