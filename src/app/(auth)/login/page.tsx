import type { Metadata } from 'next';
import { LoginPageView } from '@/components/marketing-pages/LoginPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Sign In to Your Account — ZuvaPay',
  },
  description:
    'Sign in to your ZuvaPay account to buy cheap SME data bundles, pay electricity bills, rent foreign OTP lines, and manage digital subscriptions securely.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return <LoginPageView />;
}
