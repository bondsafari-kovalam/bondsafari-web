'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight, CalendarCheck, Clock, Compass, Phone, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { experiences, type Experience } from '@/data/experiences'
import { contact } from '@/data/site'
import { Header } from './site'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.1 } }) }
const tel = contact.phones[0].replace(/\s/g, '')

// Activities sort into three moods; the filter chips are built from these
const groupOf = (e: Experience) => e.category === 'Combo' ? 'Combos' : ['Kayaking', 'Boating'].includes(e.category) ? 'On the water' : 'Underwater'
const groups = ['All', 'Underwater', 'On the water', 'Combos'] as const
const amount = (e: Experience) => Number(e.price?.replace(/[^\d]/g, '') || 0)
const fromPrice = Math.min(...experiences.map(amount).filter(Boolean)).toLocaleString('en-IN')
const bookHref = (title: string) => `/booking?activity=${encodeURIComponent(title)}`

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><motion.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease, delay }}>{children}</motion.span></span>
}

function Card({ e, index, featured }: { e: Experience; index: number; featured: boolean }) {
  return <motion.article layout className={`xp-card${featured ? ' is-featured' : ''}`} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.8, ease, delay: Math.min(index, 6) * 0.06 }}>
    <Link className="xp-card-media" href={`/experiences/${e.slug}`} aria-label={`${e.title} — view details`}>
      <Image src={e.image} alt="" fill sizes={featured ? '(max-width: 800px) 100vw, 66vw' : '(max-width: 800px) 100vw, 33vw'} style={{ objectPosition: e.imagePosition }} />
      <span className="xp-card-num">{String(index + 1).padStart(2, '0')}</span>
      {featured && <span className="xp-card-flag"><Sparkles /> Signature experience</span>}
      <span className="xp-card-price">{e.price ? e.price.replace(' per person', '') : 'Price on request'}{e.price && <small>/ person</small>}</span>
    </Link>
    <div className="xp-card-body">
      <p className="xp-card-meta"><span>{e.category}</span><span><Clock /> {e.duration}</span></p>
      <h3><Link href={`/experiences/${e.slug}`}>{e.title}</Link></h3>
      <p className="xp-card-tag">{e.tagline}</p>
      <div className="xp-card-actions">
        <Link className="book-cta book-cta-sm" href={bookHref(e.title)}><span className="book-cta-label"><strong>Book now</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link>
        <Link className="xp-card-more" href={`/experiences/${e.slug}`}>Details <ArrowUpRight /></Link>
      </div>
    </div>
  </motion.article>
}

export function Experiences() {
  const reduce = useReducedMotion()
  const hero = useRef<HTMLElement>(null)
  const [group, setGroup] = useState<typeof groups[number]>('All')
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  // The sticky mobile booking bar waits until the hero's own Book button has scrolled away
  const [barShown, setBarShown] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', v => setBarShown(v > 0.75))
  const counts = useMemo(() => Object.fromEntries(groups.map(g => [g, g === 'All' ? experiences.length : experiences.filter(e => groupOf(e) === g).length])), [])
  const shown = group === 'All' ? experiences : experiences.filter(e => groupOf(e) === group)

  const stats = [
    { icon: Compass, value: String(experiences.length), label: 'Experiences' },
    { icon: Sparkles, value: `₹${fromPrice}`, label: 'Starting from' },
    { icon: Users, value: '10+', label: 'Min. age, no experience needed' },
    { icon: ShieldCheck, value: 'PADI', label: 'Certified instructors' },
  ]

  return <main className="xp">
    <Header />

    <section ref={hero} className="xp-hero">
      <motion.div className="xp-hero-media" style={{ scale: heroScale, y: heroY }}><Image src="/images/bond-safari.webp" alt="" fill sizes="100vw" priority /></motion.div>
      <div className="xp-hero-shade" />
      <motion.div className="xp-hero-content" style={{ opacity: heroFade }}>
        <motion.p className="eyebrow light" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.2 }}>Experiences · Kovalam, Kerala</motion.p>
        <h1><Mask delay={0.3}>Choose your</Mask><br /><Mask delay={0.45}><i>adventure.</i></Mask></h1>
        <motion.p className="xp-hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.7 }}>Underwater scooters, guided dives, snorkelling, kayaking and coracle rides — for every age and ability, with all equipment included.</motion.p>
        <motion.div className="xp-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.85 }}>
          <Link className="book-cta" href="/booking"><span className="book-cta-label"><strong>Book an adventure</strong><small>From ₹{fromPrice} per person</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <a className="text-link light" href="#all-experiences">Browse all {experiences.length} <ArrowRight /></a>
        </motion.div>
      </motion.div>
    </section>

    <section className="xp-stats" aria-label="At a glance">
      {stats.map((s, i) => <motion.div key={s.label} className="xp-stat" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={i}>
        <span className="xp-stat-icon"><s.icon /></span>
        <div><b>{s.value}</b><span>{s.label}</span></div>
      </motion.div>)}
    </section>

    <section id="all-experiences" className="xp-list">
      <div className="xp-list-head">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.p className="eyebrow" variants={rise}>01 — All experiences</motion.p>
          <motion.h2 variants={rise} custom={1}>Find the one<br /><i>that moves you.</i></motion.h2>
        </motion.div>
        <motion.p className="ab-lead" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={2}>Every activity is guided by our team, includes all the gear you need, and can be booked in under a minute.</motion.p>
      </div>

      <div className="xp-filter" role="toolbar" aria-label="Filter experiences">
        <div className="xp-filter-chips">
          {groups.filter(g => counts[g]).map(g => <button key={g} type="button" aria-pressed={group === g} className={group === g ? 'is-on' : ''} onClick={() => setGroup(g)}>
            {group === g && <motion.span layoutId="xp-chip" className="xp-chip-bg" transition={{ duration: 0.5, ease }} />}
            <span>{g}</span><em>{counts[g]}</em>
          </button>)}
        </div>
        <p className="xp-filter-count" aria-live="polite">Showing <b>{shown.length}</b> of {experiences.length}</p>
      </div>

      <motion.div layout className="xp-grid">
        <AnimatePresence mode="popLayout">
          {shown.map((e, i) => <Card key={e.slug} e={e} index={i} featured={group === 'All' && i === 0} />)}
        </AnimatePresence>
      </motion.div>
    </section>

    <section className="xp-book">
      <div className="xp-book-inner">
        <motion.div className="xp-book-copy" initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.p className="eyebrow light" variants={rise}>02 — Booking made simple</motion.p>
          <motion.h2 variants={rise} custom={1}>Your day at sea,<br /><i>reserved in a minute.</i></motion.h2>
          <motion.div className="xp-book-actions" variants={rise} custom={2}>
            <Link className="book-cta" href="/booking"><span className="book-cta-label"><strong>Book now</strong><small>Reserve your spot</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
            <a className="xp-book-call" href={`tel:${tel}`}><Phone /><span><small>Prefer to talk?</small>{contact.phones[0]}</span></a>
          </motion.div>
        </motion.div>
        <ol className="xp-steps">
          {[
            { icon: Compass, title: 'Pick an experience', text: 'Choose from underwater, on-the-water or combo adventures.' },
            { icon: CalendarCheck, title: 'Choose date & guests', text: 'Open every day, 9:00 – 19:00 — Sundays too.' },
            { icon: ShieldCheck, title: 'We take care of the rest', text: 'Briefing, gear and certified guides are all included.' },
          ].map((s, i) => <motion.li key={s.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={i}>
            <span className="xp-step-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="xp-step-icon"><s.icon /></span>
            <div><h3>{s.title}</h3><p>{s.text}</p></div>
          </motion.li>)}
        </ol>
      </div>
    </section>

    <div className={`dt-mobile-bar xp-bar${barShown ? ' is-shown' : ''}`} inert={!barShown}><div><b>{experiences.length} experiences</b><span>From ₹{fromPrice} per person</span></div><Link className="book-cta book-cta-sm" href="/booking"><span className="book-cta-label"><strong>Book</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link></div>
  </main>
}
