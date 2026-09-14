import type { Metadata } from 'next';
import { TermsPageView } from '@/components/marketing-pages/TermsPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Terms & Conditions of Service — ZuvaPay',
  },
  description:
    'ZuvaPay terms and conditions of service. Understand our role as a technology aggregator, third-party vendor fulfillment, wallet usage, and refund commitments.',
  alternates: {
    canonical: '/terms',
  },
  keywords: [
    'ZuvaPay terms of service',
    'ZuvaPay user agreement',
    'utility payment terms Nigeria',
    'ZuvaPay refund policy',
  ],
  openGraph: {
    title: 'Terms & Conditions of Service — ZuvaPay',
    description:
      'Clear, transparent terms governing the use of ZuvaPay utility aggregation, digital services, and automated wallet operations.',
    url: '/terms',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions of Service — ZuvaPay',
    description:
      'Review our service terms, automated wallet policies, and third-party delivery terms.',
  },
};

export default function TermsPage() {
  return <TermsPageView />;
}
