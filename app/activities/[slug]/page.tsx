import { notFound } from 'next/navigation'
import { experiences } from '@/data/experiences'
import { courseNext, homeCategoryOf, listingOf } from '@/data/programmes'
import { Detail, type RelatedItem } from '@/components/pages/detail'
import { JsonLd, breadcrumbLd } from '@/lib/seo'

export const generateStaticParams = () => experiences.map(e => ({ slug: e.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  return { title: e ? `${e.title} | Bond Safari` : 'Activity | Bond Safari', description: e?.description, alternates: { canonical: `/activities/${slug}` } }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  if (!e) notFound()
  const cat = homeCategoryOf(slug)
  const section = cat ? { label: cat.title, href: `/programmes/${cat.slug}` } : { label: 'Activities', href: '/activities' }
  // The rest of this activity's category first, then every other activity
  const slugs = [...new Set([...(cat?.groups.flatMap(g => g.items) ?? []), ...experiences.map(x => x.slug)])].filter(s => s !== slug)
  const related: RelatedItem[] = slugs.map(listingOf).filter(l => !!l && l.status === 'bookable').map(l => ({ title: l!.title, category: `${l!.type} · ${l!.level ?? l!.kind}`, image: l!.image, imagePosition: l!.imagePosition, price: l!.price, duration: l!.duration, tagline: l!.summary, href: l!.href }))
  const listing = listingOf(slug)!
  const next = courseNext[slug] ? listingOf(courseNext[slug]) : undefined
  return <>
    <JsonLd data={breadcrumbLd([['Home', '/'], [section.label, section.href]])} />
    <Detail item={{ ...e, type: 'Activity', location: listing.location, next: next && { title: next.title, href: next.href }, section }} related={related} />
  </>
}
