import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay",
  description: "Generate 20-digit prepaid meter tokens instantly for IKEDC, EKEDC, AEDC, IBEDC, PHED, and all Nigerian DISCOs with 0% extra convenience fee.",
  openGraph: {
    title: "Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay",
    description: "Generate 20-digit prepaid meter tokens instantly for IKEDC, EKEDC, AEDC, IBEDC, PHED, and all Nigerian DISCOs with 0% extra convenience fee.",
    url: "/services/power",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/electricity.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay — Instant Prepaid Electricity Tokens",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Prepaid Electricity Tokens (0% Convenience Fee) — ZuvaPay",
    description: "Generate 20-digit prepaid meter tokens instantly for IKEDC, EKEDC, AEDC, IBEDC, PHED, and all Nigerian DISCOs with 0% extra convenience fee.",
    images: ["/og/electricity.png"],
  },
};

export default function ServicesPowerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
