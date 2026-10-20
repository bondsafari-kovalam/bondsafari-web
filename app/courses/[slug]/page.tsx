import { notFound } from 'next/navigation'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { Detail } from '@/components/detail'

export const generateStaticParams = () => courses.map(c => ({ slug: c.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = courses.find(x => x.slug === slug)
  return { title: c ? `${c.title} | Bond Safari` : 'Course | Bond Safari', description: c?.description }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = courses.find(x => x.slug === slug)
  if (!c) notFound()
  const related = [
    ...courses.filter(x => x.slug !== slug).map(x => ({ title: x.title, category: 'Course', image: x.image, href: `/courses/${x.slug}` })),
    ...experiences.map(x => ({ title: x.title, category: x.category, image: x.image, href: `/experiences/${x.slug}` })),
  ].slice(0, 3)
  return <Detail item={{ ...c, category: 'Course', section: { label: 'Courses', href: '/courses' } }} related={related} />
}
