import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cheap SME Data Bundles from ₦240/GB — ZuvaPay",
  description: "Buy cheap MTN, Airtel, Glo & 9mobile SME data with zero delay. Instant auto-delivery 24/7 on Nigeria's most dependable telecom network.",
  openGraph: {
    title: "Cheap SME Data Bundles from ₦240/GB — ZuvaPay",
    description: "Buy cheap MTN, Airtel, Glo & 9mobile SME data with zero delay. Instant auto-delivery 24/7 on Nigeria's most dependable telecom network.",
    url: "/services/data",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/sme-data.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Cheap SME Data Bundles from ₦240/GB",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Cheap SME Data Bundles from ₦240/GB — ZuvaPay",
    description: "Buy cheap MTN, Airtel, Glo & 9mobile SME data with zero delay. Instant auto-delivery 24/7 on Nigeria's most dependable telecom network.",
    images: ["/og/sme-data.png"],
  },
};

export default function ServicesDataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
