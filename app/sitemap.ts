import type { MetadataRoute } from 'next'
import { products, hrefOf } from '@/data/products'
import { landingPages } from '@/data/landing'
import { abs } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/activities', '/courses', '/booking', '/about', '/gallery', '/news', '/contact']
  return [
    ...pages.map(p => ({ url: abs(p), changeFrequency: 'weekly' as const, priority: p === '/' ? 1 : 0.8 })),
    ...products.map(p => ({ url: abs(hrefOf(p)), changeFrequency: 'weekly' as const, priority: 0.7, images: [abs(p.image)] })),
    ...landingPages.map(l => ({ url: abs(`/${l.slug}`), changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]
}
