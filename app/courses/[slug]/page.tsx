import { notFound } from 'next/navigation'
import { courses } from '@/data/courses'
import { courseNext, homeCategoryOf, levelOf, listingOf, programmeOf, programmes, statusLabel, statusOf, typeOfKind, zeroToHeroStages } from '@/data/programmes'
import { Detail, type RelatedItem } from '@/components/pages/detail'
import { JsonLd, breadcrumbLd, faqLd } from '@/lib/seo'

// Existing PADI courses and the freediving, mermaid and technical programmes share one /courses/[slug] route
export const generateStaticParams = () => [...courses, ...programmes].map(c => ({ slug: c.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = courses.find(x => x.slug === slug) ?? programmeOf(slug)
  return { title: c ? `${c.title} | Bond Safari` : 'Course | Bond Safari', description: c?.description, alternates: { canonical: `/courses/${slug}` } }
}

// The rest of the course's own category first (next level leading), then the remaining categories' courses
function relatedFor(slug: string, next?: string): RelatedItem[] {
  const cat = homeCategoryOf(slug)
  const slugs = [...new Set([...(next ? [next] : []), ...(cat?.groups.flatMap(g => g.items) ?? [])])].filter(s => s !== slug)
  return slugs.map(listingOf).filter(l => !!l).map(l => ({ title: l.title, category: l.status === 'bookable' ? l.type : `${l.type} · ${statusLabel[l.status]}`, image: l.image, imagePosition: l.imagePosition, price: l.price, duration: l.duration, tagline: l.summary, href: l.href, status: l.status }))
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = homeCategoryOf(slug)
  const section = cat ? { label: cat.title, href: `/programmes/${cat.slug}` } : { label: 'Courses', href: '/courses' }
  const crumbs = breadcrumbLd([['Home', '/'], [section.label, section.href]])
  const c = courses.find(x => x.slug === slug)
  if (c) {
    const next = courseNext[slug] ? listingOf(courseNext[slug]) : undefined
    const requirements = [...(c.minAge ? [['Minimum age', c.minAge] as [string, string]] : []), ['Prerequisite', c.prerequisite] as [string, string]]
    // Zero to Hero is a programme of five stages: list them on its own page as well as on the Scuba page
    const training = slug === 'zero-to-hero' ? zeroToHeroStages.map(s => ({ title: listingOf(s.slug)!.title, text: s.text })) : undefined
    return <><JsonLd data={crumbs} /><Detail item={{ ...c, type: 'Course', status: statusOf(slug), level: levelOf(slug), category: c.level, eyebrow: c.minAge ? `Min. age ${c.minAge}` : c.eyebrow, location: 'Kovalam', requirements, training, next: next && { title: next.title, href: next.href }, section }} related={relatedFor(slug, courseNext[slug])} /></>
  }
  const p = programmeOf(slug)
  if (!p) notFound()
  const next = p.next ? listingOf(p.next) : undefined
  return <>
    <JsonLd data={p.faqs?.length ? [crumbs, faqLd(p.faqs)] : crumbs} />
    <Detail item={{ ...p, type: typeOfKind(p.kind), level: levelOf(slug), category: p.kind, duration: p.duration ?? 'Schedule varies', eyebrow: statusLabel[p.status], next: next && { title: next.title, href: next.href }, section }} related={relatedFor(slug, p.next)} />
  </>
}
