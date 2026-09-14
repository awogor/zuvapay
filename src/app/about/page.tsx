import type { Metadata } from 'next';
import { AboutPageView } from '@/components/marketing-pages/AboutPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Our Story, Mission & Infrastructure — ZuvaPay',
  },
  description:
    'Learn why ZuvaPay was built by Nigerians to fix slow utility payments, failing airtime switches, delayed power tokens, and international verification barriers.',
  alternates: {
    canonical: '/about',
  },
  keywords: [
    'about ZuvaPay',
    'reliable utility app Nigeria',
    'instant SME data Nigeria',
    'ZuvaPay team and story',
  ],
  openGraph: {
    title: 'Our Story, Mission & Infrastructure — ZuvaPay',
    description:
      'Engineered from the ground up to solve Nigerian payment bottlenecks with automated fulfillment and direct telecom routing.',
    url: '/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Story, Mission & Infrastructure — ZuvaPay',
    description:
      'Why thousands of Nigerians trust ZuvaPay for instant bill payments and digital subscriptions.',
  },
};

export default function AboutPage() {
  return <AboutPageView />;
}
