import type { Metadata } from 'next';
import { SignupPageView } from '@/components/marketing-pages/SignupPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Create Free Account & Claim Your @username — ZuvaPay',
  },
  description:
    'Join over 32,000 users on ZuvaPay. Claim your unique @username handle and enjoy wholesale SME data rates, instant electricity tokens, foreign OTP numbers, and digital subscriptions.',
  alternates: {
    canonical: '/signup',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpPage() {
  return <SignupPageView />;
}
