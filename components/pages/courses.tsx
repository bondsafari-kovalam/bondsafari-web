'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Award, Briefcase, Clock, GraduationCap, Phone, Ship, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useRef, useState } from 'react'
import { courses, levels, pathway, type Course } from '@/data/courses'
import { contact } from '@/data/site'
import { Header } from '@/components/layout/header'
import { LayoutMotion } from '@/components/layout/motion-provider'
import { PadiPathway } from '@/components/sections/pathway'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.1 } }) }
const tel = contact.phones[0].replace(/\s/g, '')
const bookHref = (title: string) => `/booking?activity=${encodeURIComponent(title)}`
const filters = ['All', ...levels] as const
const hero = courses.find(c => c.slug === 'zero-to-hero')!

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><m.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease, delay }}>{children}</m.span></span>
}

function Card({ c, index }: { c: Course; index: number }) {
  return <m.article layout className="xp-card cs-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.8, ease, delay: Math.min(index, 6) * 0.06 }}>
    <Link className="xp-card-media" href={`/courses/${c.slug}`} aria-label={`${c.title} — view details`}>
      <Image src={c.image} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" style={{ objectPosition: c.imagePosition }} />
      <span className="cs-level" data-level={c.level}>{c.level}</span>
      <span className="xp-card-price">{c.price ?? 'Ask us'}{c.price && <small>incl. taxes</small>}</span>
    </Link>
    <div className="xp-card-body">
      <p className="xp-card-meta"><span>{c.eyebrow}</span><span><Clock /> {c.duration}</span></p>
      <h3><Link href={`/courses/${c.slug}`}>{c.title}</Link></h3>
      <p className="xp-card-tag">{c.tagline}</p>
      <dl className="cs-req">
        {c.minAge && <div><dt>Min. age</dt><dd>{c.minAge}</dd></div>}
        <div><dt>You need</dt><dd>{c.prerequisite}</dd></div>
      </dl>
      <div className="xp-card-actions">
        <Link className="book-cta book-cta-sm" href={bookHref(c.title)}><span className="book-cta-label"><strong>Enrol now</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link>
        <Link className="xp-card-more" href={`/courses/${c.slug}`}>Details <ArrowUpRight /></Link>
      </div>
    </div>
  </m.article>
}

export function Courses() {
  const reduce = useReducedMotion()
  const top = useRef<HTMLElement>(null)
  const [filter, setFilter] = useState<typeof filters[number]>('All')
  const { scrollYProgress } = useScroll({ target: top, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const [barShown, setBarShown] = useState(false)
  useMotionValueEvent(scrollYProgress, 'change', v => setBarShown(v > 0.75))
  const shown = filter === 'All' ? courses : courses.filter(c => c.level === filter)
  const count = (f: typeof filters[number]) => f === 'All' ? courses.length : courses.filter(c => c.level === f).length

  const stats = [
    { icon: Award, value: 'PADI 5★', label: 'Instructor Development Center' },
    { icon: ShieldCheck, value: 'ASAP', label: 'Kerala Govt. training partner' },
    { icon: GraduationCap, value: String(courses.length), label: 'Courses, beginner to pro' },
    { icon: Ship, value: 'Own boat', label: 'Dedicated dive boat' },
  ]

  return <main className="xp cs">
    <Header />

    <section ref={top} className="xp-hero">
      <m.div className="xp-hero-media" style={{ scale: heroScale, y: heroY }}><Image src="/images/course-open-water-hd.webp" alt="" fill sizes="100vw" priority style={{ objectPosition: "center 70%" }} /></m.div>
      <div className="xp-hero-shade" />
      <m.div className="xp-hero-content" style={{ opacity: heroFade }}>
        <m.p className="eyebrow light" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.2 }}>Bond Academy · PADI 5 Star IDC</m.p>
        <h1><Mask delay={0.3}>Learn to dive.</Mask><br /><Mask delay={0.45}><i>Then lead.</i></Mask></h1>
        <m.p className="xp-hero-sub" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.7 }}>Internationally recognised PADI courses in Kovalam — from your very first breath underwater to becoming an instructor.</m.p>
        <m.div className="xp-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.85 }}>
          <Link className="book-cta" href={bookHref(pathway[0].title)}><span className="book-cta-label"><strong>Start with Open Water</strong><small>{pathway[0].duration} · {pathway[0].price}</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <a className="text-link light" href="#pathway">See the pathway <ArrowRight /></a>
        </m.div>
      </m.div>
    </section>

    <section className="xp-stats" aria-label="Why Bond Academy">
      {stats.map((s, i) => <m.div key={s.label} className="xp-stat" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={i}>
        <span className="xp-stat-icon"><s.icon /></span>
        <div><b>{s.value}</b><span>{s.label}</span></div>
      </m.div>)}
    </section>

    <PadiPathway id="pathway" eyebrow="01 — The PADI pathway" />

    <section className="cs-hero-course">
      <m.div className="cs-feature" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={rise}>
        <div className="cs-feature-media"><Image src={hero.image} alt="Bond Academy trainees in a confined water session" fill sizes="(max-width: 800px) 100vw, 50vw" /><span className="xp-card-flag"><Sparkles /> Career programme</span></div>
        <div className="cs-feature-body">
          <p className="eyebrow light">02 — Go pro</p>
          <h2>Zero to Hero.<br /><i>Your career starts here.</i></h2>
          <p className="cs-feature-lead">{hero.description}</p>
          <ul className="cs-feature-points">
            {[{ icon: GraduationCap, t: '5 PADI certifications' }, { icon: Sparkles, t: 'Unlimited dives' }, { icon: Briefcase, t: '1-month internship' }, { icon: UserRound, t: '100% placement assistance' }].map(p => <li key={p.t}><p.icon />{p.t}</li>)}
          </ul>
          <div className="cs-feature-foot">
            <div className="cs-feature-price"><small>{hero.duration} · all taxes included</small><b>{hero.price}</b></div>
            <Link className="book-cta" href={bookHref(hero.title)}><span className="book-cta-label"><strong>Apply now</strong><small>Booking from ₹5,000</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          </div>
        </div>
      </m.div>
    </section>

    <section id="all-courses" className="xp-list">
      <div className="xp-list-head">
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <m.p className="eyebrow" variants={rise}>03 — All courses</m.p>
          <m.h2 variants={rise} custom={1}>Find your<br /><i>next level.</i></m.h2>
        </m.div>
        <m.p className="ab-lead" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={2}>Taught by PADI 5★ instructors with all equipment, learning materials and certification fees included.</m.p>
      </div>

      <LayoutMotion>
      <div className="xp-filter" role="toolbar" aria-label="Filter courses">
        <div className="xp-filter-chips">
          {filters.filter(f => count(f)).map(f => <button key={f} type="button" aria-pressed={filter === f} className={filter === f ? 'is-on' : ''} onClick={() => setFilter(f)}>
            {filter === f && <m.span layoutId="cs-chip" className="xp-chip-bg" transition={{ duration: 0.5, ease }} />}
            <span>{f}</span><em>{count(f)}</em>
          </button>)}
        </div>
        <p className="xp-filter-count" aria-live="polite">Showing <b>{shown.length}</b> of {courses.length}</p>
      </div>

      <m.div layout className="xp-grid">
        <AnimatePresence mode="popLayout">
          {shown.map((c, i) => <Card key={c.slug} c={c} index={i} />)}
        </AnimatePresence>
      </m.div>
      </LayoutMotion>
    </section>

    <section className="xp-book">
      <div className="xp-book-inner">
        <m.div className="xp-book-copy" initial="hidden" whileInView="show" viewport={{ once: true }}>
          <m.p className="eyebrow light" variants={rise}>04 — Not sure where to start?</m.p>
          <m.h2 variants={rise} custom={1}>Talk to our<br /><i>course advisor.</i></m.h2>
          <m.div className="xp-book-actions" variants={rise} custom={2}>
            <Link className="book-cta" href="/booking"><span className="book-cta-label"><strong>Enrol now</strong><small>Secure your batch</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
            <a className="xp-book-call" href={`tel:${tel}`}><Phone /><span><small>Call or WhatsApp</small>{contact.phones[0]}</span></a>
          </m.div>
        </m.div>
        <ol className="xp-steps">
          {[
            { icon: GraduationCap, title: 'Choose your course', text: 'Never dived? Start with Open Water. Already certified? Level up.' },
            { icon: ShieldCheck, title: 'Pay a booking amount', text: 'Reserve your batch with a part payment — the balance before you start.' },
            { icon: Award, title: 'Train & get certified', text: 'Learn with PADI 5★ instructors and earn a certification recognised worldwide.' },
          ].map((s, i) => <m.li key={s.title} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={i}>
            <span className="xp-step-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="xp-step-icon"><s.icon /></span>
            <div><h3>{s.title}</h3><p>{s.text}</p></div>
          </m.li>)}
        </ol>
      </div>
    </section>

    <div className={`dt-mobile-bar xp-bar${barShown ? ' is-shown' : ''}`} inert={!barShown}><div><b>{courses.length} PADI courses</b><span>Beginner to instructor</span></div><Link className="book-cta book-cta-sm" href="/booking"><span className="book-cta-label"><strong>Enrol</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link></div>
  </main>
}
