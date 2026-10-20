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
  // Suggest every other course first, then a few experiences
  const related = [
    ...courses.filter(x => x.slug !== slug).map(x => ({ title: x.title, category: x.level, image: x.image, imagePosition: x.imagePosition, price: x.price, duration: x.duration, tagline: x.tagline, href: `/courses/${x.slug}` })),
    ...experiences.slice(0, 3).map(x => ({ title: x.title, category: x.category, image: x.image, imagePosition: x.imagePosition, price: x.price, duration: x.duration, tagline: x.tagline, href: `/experiences/${x.slug}` })),
  ]
  return <Detail item={{ ...c, category: c.level, eyebrow: c.minAge ? `Min. age ${c.minAge}` : c.eyebrow, section: { label: 'Courses', href: '/courses' } }} related={related} />
}
