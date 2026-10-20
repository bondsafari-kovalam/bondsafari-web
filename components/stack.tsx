'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRef } from 'react'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'

const ease = [0.19, 1, 0.22, 1] as const

const find = (slug: string) => experiences.find(e => e.slug === slug)!
const swim = courses.find(c => c.slug === 'swimming-course')!

const items = [
  { ...find('scuba-diving'), href: '/experiences/scuba-diving', short: 'Scuba diving is a mode of underwater diving in which a scuba diver uses a self-contained underwater breathing apparatus (scuba) to breathe underwater.', tagline: 'Discover the unknown world in a day!' },
  { ...find('dive-safari'), href: '/experiences/dive-safari', short: 'Dive along with professional Cool Divers and experience the unique species of aquatic life in just one day!', tagline: 'Be cool, dive cool!' },
  { ...swim, title: 'Swimming Courses', bookAs: swim.title, category: 'Course', price: undefined, href: '/courses/swimming-course', short: 'Bond Safari Kovalam offers swim lessons. Class timings are designed around your convenience. All classes are half an hour long and are held Monday to Sunday.', tagline: 'Swim well, live well!' },
  { ...find('sea-life-safari'), href: '/experiences/sea-life-safari', short: 'Sea Life Safari is one of the most beautiful journeys under water. Explore and experience sea birds and other marine life — if you’re lucky you’ll see all this and much more, as your guide narrates the scenic ride.', tagline: 'The most beautiful journey under water.' },
]

function StackCard({ item, index, last }: { item: typeof items[number]; index: number; last: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  // Entering: the image settles from a zoomed, inset frame to full bleed
  const enter = useScroll({ target: ref, offset: ['start end', 'start start'] }).scrollYProgress
  const imageScale = useTransform(enter, [0, 1], [reduce ? 1 : 1.25, 1])
  const clip = useTransform(enter, p => reduce ? 'inset(0% 0% 0% 0%)' : `inset(${(1 - p) * 6}% ${(1 - p) * 6}% 0% ${(1 - p) * 6}%)`)
  // Leaving: the card recedes and dims as the next one slides over it
  const leave = useScroll({ target: ref, offset: ['start start', 'end start'] }).scrollYProgress
  const cardScale = useTransform(leave, [0, 1], [1, last || reduce ? 1 : 0.88])
  const dim = useTransform(leave, [0, 1], [0, last ? 0 : 0.65])
  // Parallax: the photo travels slower than the page, entering from below and lifting as the next card covers it
  const parallax = useTransform(() => reduce ? '0%' : `${(1 - enter.get()) * 10 - leave.get() * 8}%`)
  // Slow zoom + drift, alternating direction per card
  const drift = index % 2 ? -2.5 : 2.5
  const book = `/booking?activity=${encodeURIComponent('bookAs' in item && item.bookAs ? item.bookAs : item.title)}`
  return <div ref={ref} className="stack-item">
    <m.article className="stack-card" style={{ scale: cardScale, clipPath: clip }}>
      <m.div className="stack-image" style={{ scale: imageScale, y: parallax }}><m.div className="stack-kenburns" animate={reduce ? undefined : { scale: [1, 1.1], x: ['0%', `${drift}%`], y: ['0%', '-2%'] }} transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}><Image src={item.image} alt={item.title} fill sizes="100vw" priority={index === 0} /></m.div></m.div>
      <div className="stack-shade" />
      {!reduce && <m.div className="stack-curtain" initial={{ scaleX: 1 }} whileInView={{ scaleX: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 1.4, ease }} />}
      <Link className="stack-hit" href={item.href} aria-label={`View ${item.title} details`}><span className="stack-view">View<br />details <ArrowUpRight /></span></Link>
      <span className="stack-count">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
      <div className="stack-content">
        <m.p className="eyebrow light" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 1.2, ease }}>{item.category} · {item.duration}</m.p>
        <h2 className="stack-title"><m.span initial={{ y: '101%' }} whileInView={{ y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 1.6, ease, delay: 0.1 }}>{item.title}</m.span></h2>
        <m.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ amount: 0.6 }} transition={{ duration: 1.2, ease, delay: 0.25 }}>
          <p className="stack-text">{item.short}</p>
          <p className="stack-tagline">{item.tagline}</p>
          <div className="stack-actions"><Link className="book-cta" href={book} aria-label={`Book ${item.title}`}><span className="book-cta-label"><strong>Book now</strong>{item.price ? <small>{item.price}</small> : <small>Reserve your spot</small>}</span><span className="book-cta-icon"><ArrowRight /></span></Link><Link className="text-link light" href={item.href}>Learn more <ArrowRight /></Link></div>
        </m.div>
      </div>
      <m.div className="stack-dim" style={{ opacity: dim }} />
    </m.article>
  </div>
}

export function ExperienceStack() {
  return <section className="stack" aria-label="Experiences">
    <div className="stack-intro"><p className="eyebrow">Choose your horizon</p><h2>Experiences<br /><i>worth booking.</i></h2></div>
    {items.map((item, i) => <StackCard key={item.slug} item={item} index={i} last={i === items.length - 1} />)}
  </section>
}
