import { notFound } from 'next/navigation'
import { categoryPages, categoryOf, type CategorySlug } from '@/data/programmes'
import { CategoryPage } from '@/components/pages/programmes'
import { JsonLd, breadcrumbLd } from '@/lib/seo'

export const generateStaticParams = () => categoryPages.map(c => ({ category: c.slug }))
export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const c = categoryOf(category)
  return { title: c ? `${c.title} in Kovalam — Courses & Activities | Bond Safari` : 'Bond Safari', description: c?.intro, alternates: { canonical: `/programmes/${category}` } }
}

export default async function Page({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const c = categoryOf(category)
  if (!c) notFound()
  return <><JsonLd data={breadcrumbLd([['Home', '/'], ['Activities & courses', '/programmes'], [c.title, `/programmes/${c.slug}`]])} /><CategoryPage slug={c.slug as CategorySlug} /></>
}
