import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/dashboard'],
    },
    sitemap: 'https://frontend-production-167e.up.railway.app/sitemap.xml',
  }
}
