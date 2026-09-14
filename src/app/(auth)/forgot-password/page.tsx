import type { Metadata } from 'next';
import { ForgotPasswordPageView } from '@/components/marketing-pages/ForgotPasswordPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Reset Your Password — ZuvaPay',
  },
  description:
    'Reset your ZuvaPay account password securely via email recovery link.',
  alternates: {
    canonical: '/forgot-password',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordPageView />;
}
