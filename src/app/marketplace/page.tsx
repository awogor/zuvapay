import type { Metadata } from 'next';
import { PublicMarketplaceView } from '@/components/marketplace/PublicMarketplaceView';

export const metadata: Metadata = {
  title: {
    absolute: 'AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay',
  },
  description:
    'Save up to 70% on premium digital subscriptions in Nigeria with guaranteed replacement warranty. Instant activation on Google Gemini Pro, CapCut Pro, xAI Grok, ChatGPT Plus, Canva Pro, and developer tools in Naira.',
  alternates: {
    canonical: '/marketplace',
  },
  keywords: [
    'AI marketplace Nigeria',
    'buy Gemini Pro Nigeria',
    'cheap CapCut Pro subscription',
    'xAI Grok 2 account',
    'ChatGPT Plus Naira payment',
    'Canva Pro lifetime',
    'software subscriptions Nigeria',
    'ZuvaPay marketplace',
  ],
  openGraph: {
    title: 'AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay',
    description:
      'Save up to 70% on premium AI assistants, creative tools, and developer subscriptions. Instant activation, guaranteed warranties, and fast 1-click checkout in Naira.',
    url: '/marketplace',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay',
    description:
      'Buy verified Gemini Pro, CapCut Pro, Grok, and 50+ software subscriptions with replacement warranty and instant delivery in Nigeria.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicMarketplacePage() {
  return <PublicMarketplaceView />;
}
