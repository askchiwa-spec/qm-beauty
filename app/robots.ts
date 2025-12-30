import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/payment-status', '/order-confirmation'],
    },
    sitemap: 'https://qmbeauty.co.tz/sitemap.xml', // Update with your actual domain
  };
}
