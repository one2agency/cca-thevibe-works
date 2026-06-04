import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/r/'] },
    sitemap: 'https://cca.thevibe.works/sitemap.xml',
  };
}
