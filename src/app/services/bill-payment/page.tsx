import type { Metadata } from 'next';
import { BillPaymentPageView } from '@/components/marketing-pages/BillPaymentPageView';

export const metadata: Metadata = {
  title: {
    absolute: 'Airtime Top-Up & Utility Bill Payments in Nigeria — ZuvaPay',
  },
  description:
    'Recharge MTN, Airtel, Glo, and 9mobile airtime with up to 2% instant cashback discount. Instant utility bill settlements, automated printable receipts, and 100% automated refunds.',
  alternates: {
    canonical: '/services/bill-payment',
  },
  keywords: [
    'airtime top up Nigeria',
    'VTU airtime discount',
    'instant bill payment Nigeria',
    'MTN airtime recharge',
    'Airtel airtime discount',
    'Glo recharge cashback',
    '9mobile top up',
    'utility bill payment Nigeria',
    'automated bill refund',
  ],
  openGraph: {
    title: 'Airtime Top-Up & Utility Bill Payments in Nigeria — ZuvaPay',
    description:
      'Instant airtime recharge with 2% cashback and automated utility bill settlements across Nigeria with 100% automated refund guarantee.',
    url: '/services/bill-payment',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Airtime Top-Up & Utility Bill Payments in Nigeria — ZuvaPay',
    description:
      'Instant airtime recharge with 2% cashback and automated utility bill payments across Nigeria.',
  },
};

export default function BillPaymentPage() {
  return <BillPaymentPageView />;
}
