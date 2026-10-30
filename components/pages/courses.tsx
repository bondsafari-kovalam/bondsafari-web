'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Award, Briefcase, GraduationCap, Phone, Ship, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { courses, pathway } from '@/data/courses'
import { coursesPage, listingOf, type Listing } from '@/data/programmes'
import { Card } from '@/components/pages/programmes'
import { contact } from '@/data/site'
import { Header } from '@/components/layout/header'
import { LayoutMotion } from '@/components/layout/motion-provider'
import { PadiPathway } from '@/components/sections/pathway'

const ease = [0.19, 1, 0.22, 1] as const
// Courses only: activities live on the Activities page. A section with no courses left is skipped
const sections = coursesPage.map(g => ({ ...g, list: g.items.map(listingOf).filter((l): l is Listing => l?.type === 'Course') })).filter(g => g.list.length)
const courseCount = new Set(sections.flatMap(g => g.list.map(l => l.slug))).size
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.1 } }) }
const tel = contact.phones[0].replace(/\s/g, '')
const bookHref = (title: string) => `/booking?activity=${encodeURIComponent(title)}`
const hero = courses.find(c => c.slug === 'zero-to-hero')!

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><m.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease, delay }}>{children}</m.span></span>
}

export function Courses() {
  const reduce = useReducedMotion()
  const top = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: top, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const [barShown, setBarShown] = useState(false)
  // Which category's courses are showing; a link like /courses#freediving opens that one
  const [chosen, setChosen] = useState<string>(sections[0].slug)
  const current = sections.find(g => g.slug === chosen) ?? sections[0]
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const open = () => { const h = location.hash.slice(1); if (sections.some(g => g.slug === h)) { setChosen(h); document.getElementById('categories')?.scrollIntoView() } }
    open()
    addEventListener('hashchange', open)
    return () => removeEventListener('hashchange', open)
  }, [])
  const choose = (slug: string) => {
    setChosen(slug)
    history.replaceState(null, '', `#${slug}`)
    // On phones the cards fill the screen, so bring the course list into view
    if (window.innerWidth < 800) requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }))
  }
  useMotionValueEvent(scrollYProgress, 'change', v => setBarShown(v > 0.75))

  const stats = [
    { icon: Award, value: 'PADI 5★', label: 'Instructor Development Center' },
    { icon: ShieldCheck, value: 'ASAP', label: 'Kerala Govt. training partner' },
    { icon: GraduationCap, value: String(courseCount), label: 'Courses, beginner to pro' },
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

    <section id="categories" className="xp-list cp-pick">
      <div className="xp-list-head">
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <m.p className="eyebrow" variants={rise}>{courseCount} courses · 4 categories</m.p>
          <m.h2 variants={rise} custom={1}>Choose a<br /><i>category.</i></m.h2>
        </m.div>
        <m.p className="ab-lead" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={2}>Tap a card to see its courses. Each one opens to the full requirements, training and next level.</m.p>
      </div>

      {/* The four categories as cards; the chosen one's courses show underneath */}
      <div className="pg-cats cp-cats" role="tablist" aria-label="Course categories">
        {sections.map((g, i) => <button key={g.slug} type="button" role="tab" id={`tab-${g.slug}`} aria-selected={g.slug === current.slug} aria-controls="category-courses" className={g.slug === current.slug ? 'is-current' : ''} onClick={() => choose(g.slug)}>
          <Image src={g.list[0].image} alt="" fill sizes="(max-width: 800px) 50vw, 25vw" style={{ objectPosition: g.list[0].imagePosition }} />
          <span className="pg-cat-shade" />
          <span className="pg-cat-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="pg-cat-body"><b>{g.title}</b><span className="pg-cat-desc">{g.subtitle}</span><small>{g.list.length} {g.list.length === 1 ? 'course' : 'courses'}</small></span>
        </button>)}
      </div>

      <div id="category-courses" ref={panel} className="cp-panel" role="tabpanel" aria-labelledby={`tab-${current.slug}`}>
        <div className="cp-head">
          <div>
            <p className="cp-num">{String(sections.indexOf(current) + 1).padStart(2, '0')}.</p>
            <h2>{current.title}</h2>
            <p className="cp-sub">{current.subtitle}</p>
          </div>
          <Link className="text-link" href={`/programmes/${current.slug}`}>Full {current.title.toLowerCase()} guide <ArrowRight /></Link>
        </div>
        <LayoutMotion>
          {/* Keyed by category so switching swaps the whole grid instead of animating old cards out */}
          <div key={current.slug} className="xp-grid">{current.list.map((l, n) => <Card key={l.slug} l={l} index={n} />)}</div>
        </LayoutMotion>
      </div>
    </section>

    <PadiPathway id="pathway" eyebrow="Scuba · The PADI pathway" />

    <section className="cs-hero-course">
      <m.div className="cs-feature" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={rise}>
        <div className="cs-feature-media"><Image src={hero.image} alt="Bond Academy trainees in a confined water session" fill sizes="(max-width: 800px) 100vw, 50vw" /><span className="xp-card-flag"><Sparkles /> Career programme</span></div>
        <div className="cs-feature-body">
          <p className="eyebrow light">Scuba · Go pro</p>
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

    <section className="xp-book">
      <div className="xp-book-inner">
        <m.div className="xp-book-copy" initial="hidden" whileInView="show" viewport={{ once: true }}>
          <m.p className="eyebrow light" variants={rise}>Not sure where to start?</m.p>
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

    <div className={`dt-mobile-bar xp-bar${barShown ? ' is-shown' : ''}`} inert={!barShown}><div><b>{courseCount} courses</b><span>Scuba · Parasports · Freediving · Tec</span></div><Link className="book-cta book-cta-sm" href="/booking"><span className="book-cta-label"><strong>Enrol</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link></div>
  </main>
}
