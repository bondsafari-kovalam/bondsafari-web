import { notFound } from 'next/navigation'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { Detail } from '@/components/pages/detail'

export const generateStaticParams = () => experiences.map(e => ({ slug: e.slug }))

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  return { title: e ? `${e.title} | Bond Safari` : 'Activity | Bond Safari', description: e?.description }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const e = experiences.find(x => x.slug === slug)
  if (!e) notFound()
  // Suggest every other experience, then the swimming course
  const related = [
    ...experiences.filter(x => x.slug !== slug).map(x => ({ title: x.title, category: x.category, image: x.image, imagePosition: x.imagePosition, price: x.price, duration: x.duration, tagline: x.tagline, href: `/activities/${x.slug}` })),
    ...courses.filter(c => c.slug === 'swimming-course').map(c => ({ title: c.title, category: 'Course', image: c.image, duration: c.duration, href: `/courses/${c.slug}` })),
  ]
  return <Detail item={{ ...e, section: { label: 'Activities', href: '/activities' } }} related={related} />
}
