import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zuvapay.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/transactions/', '/profile/', '/admin/'],
      },
      {
        // Explicitly grant AI search & answer engines crawling access to public catalog
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'PerplexityBot',
          'ClaudeBot',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: ['/', '/services', '/marketplace', '/pricing', '/agent', '/about'],
        disallow: ['/api/', '/dashboard/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
