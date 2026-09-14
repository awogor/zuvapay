import type { Metadata } from 'next';
import { VirtualDollarCardPageView } from '@/components/marketing-pages/VirtualDollarCardPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Virtual Dollar Card (Mastercard & Visa) for International Payments — ZuvaPay',
  },
  description:
    'Create dedicated USD virtual cards with official US Delaware billing addresses. Spend on Apple, Google Play, Netflix, AWS, OpenAI ChatGPT Plus, and Spotify with 3DS verification and zero decline.',
  alternates: {
    canonical: '/services/virtual-dollar-card',
  },
  keywords: [
    'virtual dollar card Nigeria',
    'Mastercard virtual dollar card',
    'pay international with dollar card',
    'Visa dollar card Nigeria',
    'fund USD card with Naira',
    'Apple Store virtual card Nigeria',
    'Netflix USD payment Nigeria',
    'ChatGPT Plus virtual card Nigeria',
    'zero decline dollar card',
  ],
  openGraph: {
    title: 'Virtual Dollar Card for International Payments — ZuvaPay',
    description:
      'Create dedicated USD virtual cards with official US Delaware billing addresses. Zero declines on Apple, Netflix, AWS, Spotify & OpenAI.',
    url: '/services/virtual-dollar-card',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Dollar Card for International Payments — ZuvaPay',
    description:
      'Create dedicated USD virtual cards with official Delaware billing address. Zero declines on Apple, Netflix, AWS & OpenAI.',
  },
};

export default function VirtualDollarCardPage() {
  return <VirtualDollarCardPageView />;
}
