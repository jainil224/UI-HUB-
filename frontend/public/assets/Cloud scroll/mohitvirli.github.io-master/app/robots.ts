import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const baseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/_next/static/chunks/',
    },
    sitemap: `${baseUrl}sitemap.xml`,
  }
}