'use client'

import Image from '@/components/ui/photo'
import Link from 'next/link'
import { m, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, Award, Briefcase, GraduationCap, Phone, Ship, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { courses, pathway } from '@/data/courses'
import { coursesPage, coursesPageAliases, enquiryMessage, listingOf, type Listing } from '@/data/programmes'
import { Card } from '@/components/pages/programmes'
import { contact, whatsappLink } from '@/data/site'
import { Header } from '@/components/layout/header'
import { LayoutMotion } from '@/components/layout/motion-provider'
import { PadiPathway } from '@/components/sections/pathway'
import { Mask as CssMask, enter } from '@/components/layout/intro'

const ease = [0.19, 1, 0.22, 1] as const
// The four course categories, each subcategory resolved to its course cards
const sections = coursesPage.map(g => {
  const subs = g.subcategories.map(s => ({ ...s, list: s.items.map(listingOf).filter((l): l is Listing => !!l) }))
  return { ...g, subs, total: subs.reduce((n, s) => n + s.list.length, 0) }
})
const courseCount = new Set(sections.flatMap(g => g.subs.flatMap(s => s.items))).size
const numOf = (i: number) => String(i + 1).padStart(2, '0')
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.1 } }) }
const tel = contact.phones[0].replace(/\s/g, '')
const bookHref = (title: string) => `/booking?activity=${encodeURIComponent(title)}`
const hero = courses.find(c => c.slug === 'zero-to-hero')!

// Title lines slide up from behind their masks, in CSS so they show without waiting for JavaScript
const Mask = (props: { children: React.ReactNode; delay?: number }) => <CssMask from="105%" duration={1.6} {...props} />

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
    const open = () => { const h = coursesPageAliases[location.hash.slice(1)] ?? location.hash.slice(1); if (sections.some(g => g.slug === h)) { setChosen(h); document.getElementById('categories')?.scrollIntoView() } }
    open()
    addEventListener('hashchange', open)
    return () => removeEventListener('hashchange', open)
  }, [])
  const choose = (slug: string) => {
    setChosen(slug)
    history.replaceState(null, '', `#${slug}`)
    // Bring the chosen category's course list into view (it stops below the sticky header via scroll-margin-top)
    requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }))
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
        <p className={`eyebrow light ${enter({ y: 12, duration: 1, delay: 0.2 }).className}`} style={enter({ y: 12, duration: 1, delay: 0.2 }).style}>Bond Academy · PADI 5 Star IDC</p>
        <h1><Mask delay={0.3}>Learn to dive.</Mask><br /><Mask delay={0.45}><i>Then lead.</i></Mask></h1>
        <p className={`xp-hero-sub ${enter({ y: 16, duration: 1.2 }).className}`} style={enter({ y: 16, duration: 1.2 }).style}>Internationally recognised PADI courses in Kovalam — from your very first breath underwater to becoming an instructor.</p>
        <div className={`xp-hero-actions ${enter({ y: 16, duration: 1.2, delay: 0.85 }).className}`} style={enter({ y: 16, duration: 1.2, delay: 0.85 }).style}>
          <Link className="book-cta" href={bookHref(pathway[0].title)}><span className="book-cta-label"><strong>Start with Open Water</strong><small>{pathway[0].duration} · {pathway[0].price}</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <a className="text-link light" href="#pathway">See the pathway <ArrowRight /></a>
        </div>
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
        <m.p className="ab-lead" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={2}>Tap a category to see its courses. Each one opens to the full requirements, training and next level.</m.p>
      </div>

      {/* The four categories as cards; the chosen one's courses show underneath */}
      <div className="pg-cats cp-cats" role="tablist" aria-label="Course categories">
        {sections.map((g, i) => {
          const here = g.slug === current.slug
          return <button key={g.slug} type="button" role="tab" id={`tab-${g.slug}`} aria-selected={here} aria-controls="category-courses" className={here ? 'is-current' : ''} onClick={() => choose(g.slug)}>
            <Image src={g.image} alt="" fill sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 25vw" style={{ objectPosition: g.imagePosition }} />
            <span className="pg-cat-shade" />
            <span className="pg-cat-num">{numOf(i)}</span>
            <span className="pg-cat-body">
              <b>{g.title.replace(/ Courses$/, '')} <i>Courses</i></b>
              <span className="cp-explore"><span>{here ? 'Viewing courses' : 'Explore courses'}</span><span className="cp-explore-icon">{here ? <ArrowDown /> : <ArrowRight />}</span></span>
            </span>
          </button>
        })}
      </div>

      <div id="category-courses" ref={panel} className="cp-panel" role="tabpanel" aria-labelledby={`tab-${current.slug}`}>
        <div className="cp-head">
          <div>
            <p className="cp-num">{numOf(sections.indexOf(current))}.</p>
            <h2>{current.title}</h2>
            <p className="cp-sub">{current.subs.length} subcategories · {current.total} courses</p>
          </div>
          {current.guide && <Link className="text-link" href={current.guide}>Full {current.title.replace(/ Courses$/, '').toLowerCase()} guide <ArrowRight /></Link>}
        </div>
        <LayoutMotion>
          {/* Keyed by category so switching swaps the whole grid instead of animating old cards out.
              Single-course subcategories share one grid; a subcategory of several courses gets its own heading */}
          <div key={current.slug}>
            <div className="xp-grid">{current.subs.filter(s => s.list.length === 1).map((s, n) => <Card key={s.title} l={s.list[0]} index={n} />)}</div>
            {current.subs.filter(s => s.list.length > 1).map(s => <div key={s.title} className="cp-group">
              <div className="pg-group-head"><h3>{s.title}</h3><p>{s.list.length} courses</p></div>
              <div className="xp-grid">{s.list.map((l, n) => <Card key={l.slug} l={l} index={n} />)}</div>
            </div>)}
          </div>
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
            <a className="book-cta" href={whatsappLink(enquiryMessage(hero.title))} target="_blank" rel="noopener noreferrer"><span className="book-cta-label"><strong>Apply now</strong><small>Booking from ₹5,000</small></span><span className="book-cta-icon"><ArrowRight /></span></a>
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

    <div className={`dt-mobile-bar xp-bar${barShown ? ' is-shown' : ''}`} inert={!barShown}><div><b>{courseCount} courses</b><span>Mermaid · Freediving · Tec · Scuba</span></div><Link className="book-cta book-cta-sm" href="/booking"><span className="book-cta-label"><strong>Enrol</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link></div>
  </main>
}
