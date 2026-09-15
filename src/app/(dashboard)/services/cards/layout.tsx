import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Virtual Dollar Card for International Payments — ZuvaPay",
  description: "Create an instant reloadable Mastercard virtual dollar card to pay on AWS, Apple, Google, Facebook Ads, AliExpress, and international merchants.",
  openGraph: {
    title: "Virtual Dollar Card for International Payments — ZuvaPay",
    description: "Create an instant reloadable Mastercard virtual dollar card to pay on AWS, Apple, Google, Facebook Ads, AliExpress, and international merchants.",
    url: "/services/cards",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/virtual-dollar-card.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Virtual Dollar Card for Global Payments",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Virtual Dollar Card for International Payments — ZuvaPay",
    description: "Create an instant reloadable Mastercard virtual dollar card to pay on AWS, Apple, Google, Facebook Ads, AliExpress, and international merchants.",
    images: ["/og/virtual-dollar-card.png"],
  },
};

export default function ServicesCardsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
