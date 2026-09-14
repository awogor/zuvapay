import type { Metadata } from 'next';
import { PrivacyPageView } from '@/components/marketing-pages/PrivacyPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Privacy Policy & NDPC Compliance — ZuvaPay',
  },
  description:
    'ZuvaPay Privacy Policy compliant with the Nigeria Data Protection Act (NDPA) and NDPC regulations. Understand how your personal and transactional information is protected and routed.',
  alternates: {
    canonical: '/privacy',
  },
  keywords: [
    'ZuvaPay privacy policy',
    'NDPC compliance Nigeria',
    'NDPA data protection',
    'ZuvaPay data safety',
  ],
  openGraph: {
    title: 'Privacy Policy & NDPC Compliance — ZuvaPay',
    description:
      'Learn how ZuvaPay collects, secures, and handles your data in strict alignment with Nigeria Data Protection Commission (NDPC) standards.',
    url: '/privacy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy & NDPC Compliance — ZuvaPay',
    description:
      'Our commitment to privacy, data minimization, and regulatory compliance under the Nigeria Data Protection Act.',
  },
};

export default function PrivacyPage() {
  return <PrivacyPageView />;
}
