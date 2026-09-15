import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay",
  description: "Save up to 70% on premium digital subscriptions in Nigeria with guaranteed replacement warranty. Instant activation on Google Gemini Pro, CapCut Pro, xAI Grok, ChatGPT Plus, Canva Pro, and developer tools in Naira.",
  openGraph: {
    title: "AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay",
    description: "Save up to 70% on premium digital subscriptions in Nigeria with guaranteed replacement warranty. Instant activation on Google Gemini Pro, CapCut Pro, xAI Grok, ChatGPT Plus, Canva Pro, and developer tools in Naira.",
    url: "/services/marketplace",
    type: 'website',
    siteName: 'ZuvaPay',
    locale: 'en_NG',
    images: [
      {
        url: "/og/marketplace.png",
        width: 1200,
        height: 630,
        alt: "ZuvaPay AI Marketplace — Gemini Pro, CapCut, Grok at Wholesale Rates",
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Tools & Software Subscriptions Marketplace (Gemini, CapCut, Grok) — ZuvaPay",
    description: "Save up to 70% on premium digital subscriptions in Nigeria with guaranteed replacement warranty. Instant activation on Google Gemini Pro, CapCut Pro, xAI Grok, ChatGPT Plus, Canva Pro, and developer tools in Naira.",
    images: ["/og/marketplace.png"],
  },
};

export default function ServicesMarketplaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
