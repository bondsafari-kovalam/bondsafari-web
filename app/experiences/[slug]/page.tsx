import { notFound } from 'next/navigation'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { Detail } from '@/components/detail'

export const generateStaticParams = () => experiences.map(e => ({ slug: e.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  return { title: e ? `${e.title} | Bond Safari` : 'Experience | Bond Safari', description: e?.description }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  if (!e) notFound()
  const related = [
    ...experiences.filter(x => x.slug !== slug).map(x => ({ title: x.title, category: x.category, image: x.image, href: `/experiences/${x.slug}` })),
    ...courses.filter(c => c.slug === 'swimming-course').map(c => ({ title: c.title, category: 'Course', image: c.image, href: `/courses/${c.slug}` })),
  ].slice(0, 3)
  return <Detail item={{ ...e, section: { label: 'Experiences', href: '/experiences' } }} related={related} />
}
