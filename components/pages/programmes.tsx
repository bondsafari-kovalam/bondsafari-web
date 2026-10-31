'use client'

import Image from '@/components/ui/photo'
import Link from 'next/link'
import { AnimatePresence, m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Clock, MapPin } from 'lucide-react'
import { useRef, useState } from 'react'
import { categories, categoryOf, freediverRoutes, freedivingSafety, listingOf, statusLabel, typeInfo, tecBeforeYouStart, tecInstructorNote, tecInstructorRatings, tecLoggedDives, zeroToHeroNote, zeroToHeroStages, type Category, type CategorySlug, type ItemType, type Listing } from '@/data/programmes'
import { Header } from '@/components/layout/header'
import { LayoutMotion } from '@/components/layout/motion-provider'
import { Cta, ctaOf } from '@/components/pages/detail'
import { PadiPathway } from '@/components/sections/pathway'
import { MuzirisSection } from '@/components/sections/muziris'
import { Mask as CssMask, enter } from '@/components/layout/intro'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.1 } }) }
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-40px' } } as const
const itemsOf = (c: Category) => [...new Set(c.groups.flatMap(g => g.items))]
// "3 activities · 9 courses" — says what the numbers are instead of a bare count
const countsOf = (c: Category) => (['Activity', 'Course'] as const).map(t => { const n = itemsOf(c).filter(s => listingOf(s)?.type === t).length; return n ? `${n} ${n === 1 ? t.toLowerCase() : typeInfo[t].plural.toLowerCase()}` : '' }).filter(Boolean).join(' · ')

// Title lines slide up from behind their masks, in CSS so they show without waiting for JavaScript
const Mask = (props: { children: React.ReactNode; delay?: number }) => <CssMask from="105%" duration={1.6} {...props} />

function Hero({ eyebrow, lines, sub, image, imagePosition, crumbs, title }: { eyebrow: string; lines: [string, string]; sub: string; image: string; imagePosition?: string; crumbs?: [string, string][]; title?: string }) {
  const reduce = useReducedMotion()
  const hero = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  return <section ref={hero} className="xp-hero pg-hero">
    <m.div className="xp-hero-media" style={{ scale, y }}><Image src={image} alt="" fill sizes="100vw" priority style={{ objectPosition: imagePosition }} /></m.div>
    <div className="xp-hero-shade" />
    <m.div className="xp-hero-content" style={{ opacity: fade }}>
      {crumbs && <nav className="dt-crumbs" aria-label="Breadcrumb">{crumbs.map(([label, href], i) => <span key={href}>{i > 0 && <span>/</span>}<Link href={href}>{label}</Link></span>)}<span>/</span><b>{title}</b></nav>}
      <p className={`eyebrow light ${enter({ y: 12, duration: 1, delay: 0.2 }).className}`} style={enter({ y: 12, duration: 1, delay: 0.2 }).style}>{eyebrow}</p>
      <h1><Mask delay={0.3}>{lines[0]}</Mask><br /><Mask delay={0.45}><i>{lines[1]}</i></Mask></h1>
      <p className={`xp-hero-sub ${enter({ y: 16, duration: 1.2 }).className}`} style={enter({ y: 16, duration: 1.2 }).style}>{sub}</p>
    </m.div>
  </section>
}

// The four categories as tiles; the current one is marked so the strip doubles as navigation between them
export function CategoryStrip({ current, heading = true }: { current?: CategorySlug; heading?: boolean }) {
  return <section className="pg-cats-wrap" aria-label="Activities and courses by category">
    {heading && <div className="xp-list-head"><m.div {...inView}><m.p className="eyebrow" variants={rise}>Browse by sport</m.p><m.h2 variants={rise} custom={1}>Choose<br /><i>your sport.</i></m.h2></m.div><m.p className="ab-lead" {...inView} variants={rise} custom={2}>Each sport shows its activities and its courses separately, so you can see at a glance what you can try today and what you can learn.</m.p></div>}
    <ul className="pg-cats">{categories.map((c, i) => <m.li key={c.slug} {...inView} variants={rise} custom={i}>
      <Link href={`/programmes/${c.slug}`} className={c.slug === current ? 'is-current' : ''} aria-current={c.slug === current ? 'page' : undefined}>
        <Image src={c.image} alt="" fill sizes="(max-width: 800px) 50vw, 25vw" style={{ objectPosition: c.imagePosition }} />
        <span className="pg-cat-shade" />
        <span className="pg-cat-num">{String(i + 1).padStart(2, '0')}</span>
        <span className="pg-cat-body"><b>{c.title}</b><span className="pg-cat-desc">{c.eyebrow}</span><small>{countsOf(c)}</small></span>
      </Link>
    </m.li>)}</ul>
  </section>
}

export function Card({ l, index }: { l: Listing; index: number }) {
  const cta = ctaOf(l.title, l.status)
  return <m.article layout className="xp-card cs-card pg-card" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.8, ease, delay: Math.min(index, 6) * 0.06 }}>
    <Link className="xp-card-media" href={l.href} aria-label={`${l.title} — view details`}>
      <Image src={l.image} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" style={{ objectPosition: l.imagePosition }} />
      <span className="pg-type" data-type={l.type}>{l.type}</span>
      {l.status !== 'bookable' && <span className="cs-level pg-status" data-status={l.status}>{statusLabel[l.status]}</span>}
      <span className="xp-card-price">{l.price ?? 'Contact for price'}</span>
    </Link>
    <div className="xp-card-body">
      <p className="xp-card-meta"><span>{l.type === 'Activity' ? 'No certificate needed' : l.kind === 'Professional rating' ? 'Professional rating' : l.kind === 'Programme' ? 'Lessons' : 'Certification'}</span>{l.duration && <span><Clock /> {l.duration}</span>}</p>
      <h3><Link href={l.href}>{l.title}</Link></h3>
      <p className="xp-card-tag">{l.summary}</p>
      <p className="pg-card-loc"><MapPin /> {l.location}</p>
      <div className="xp-card-actions">
        <Cta cta={cta} className="book-cta book-cta-sm"><span className="book-cta-label"><strong>{cta.label}</strong></span><span className="book-cta-icon"><ArrowRight /></span></Cta>
        <Link className="xp-card-more" href={l.href}>View details <ArrowUpRight /></Link>
      </div>
    </div>
  </m.article>
}

// Two plain definitions so nobody has to guess whether something is a one-off experience or a certification course
export function TypeKey({ links = false, current }: { links?: boolean; current?: ItemType }) {
  return <div className="pg-key">{(['Activity', 'Course'] as const).map(t => {
    const here = t === current
    const body = <><span className="pg-type" data-type={t}>{here ? `You’re viewing ${typeInfo[t].plural.toLowerCase()}` : t}</span><p>{typeInfo[t].hint}</p>{links && !here && <b>See all {typeInfo[t].plural.toLowerCase()} <ArrowRight /></b>}</>
    return links && !here ? <Link key={t} href={t === 'Activity' ? '/activities' : '/courses'}>{body}</Link> : <div key={t} className={here ? 'is-current' : undefined}>{body}</div>
  })}</div>
}

function Head({ eyebrow, title, lead }: { eyebrow: string; title: [string, string]; lead?: string }) {
  return <div className="xp-list-head">
    <m.div {...inView}><m.p className="eyebrow" variants={rise}>{eyebrow}</m.p><m.h2 variants={rise} custom={1}>{title[0]}<br /><i>{title[1]}</i></m.h2></m.div>
    {lead && <m.p className="ab-lead" {...inView} variants={rise} custom={2}>{lead}</m.p>}
  </div>
}

// Category-specific explainers, from the PADI pathway decks
function ScubaExtras() {
  return <>
    <PadiPathway eyebrow="The PADI pathway" id="pathway" />
    <section className="pg-info">
      <Head eyebrow="Zero to Hero" title={['Five stages,', 'one programme.']} lead={zeroToHeroNote} />
      <ol className="dt-steps pg-steps">{zeroToHeroStages.map((s, i) => { const l = listingOf(s.slug)!; return <m.li key={s.slug} {...inView} variants={rise} custom={i}><span>{String(i + 1).padStart(2, '0')}</span><div><b><Link href={l.href}>{l.title}</Link></b><p>{s.text}</p></div></m.li> })}</ol>
    </section>
  </>
}
function FreedivingExtras() {
  return <>
    <section className="pg-info">
      <Head eyebrow="Routes to instructor" title={['Three ways', 'to teach.']} lead="Freediving has no Divemaster stage — the first professional rating is Freediver Instructor. Advanced, Master and Instructor Trainer ratings are then earned by teaching, not in a classroom." />
      <div className="pg-table" role="table" aria-label="Routes to Freediver Instructor">
        {freediverRoutes.map(r => <div key={r.title} role="row"><b role="cell">{r.title}</b><span role="cell">{r.who}</span><span role="cell">{r.needs}</span></div>)}
      </div>
      <p className="dt-verify">The first-aid prerequisite for Freediver Instructor is being confirmed in writing with PADI Asia Pacific. Ask us before you plan around it.</p>
    </section>
    <section className="pg-info">
      <Head eyebrow="Breath-hold safety" title={['Our standard,', 'every session.']} />
      <ol className="dt-steps pg-steps">{freedivingSafety.map((s, i) => <m.li key={s.title} {...inView} variants={rise} custom={i}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{s.title}</b><p>{s.text}</p></div></m.li>)}</ol>
    </section>
  </>
}
function TecExtras() {
  return <>
    <section className="pg-info">
      <Head eyebrow="Before you start" title={['Logged dives,', 'not weeks.']} lead="Every technical level asks for a minimum number of logged dives to enrol. They cannot be bought or compressed — plan a technical career in years." />
      <dl className="dt-facts-list pg-dives">{tecLoggedDives.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
      <ol className="dt-steps pg-steps">{tecBeforeYouStart.map((s, i) => <m.li key={s.title} {...inView} variants={rise} custom={i}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{s.title}</b><p>{s.text}</p></div></m.li>)}</ol>
    </section>
    <section className="pg-info">
      <Head eyebrow="Technical instructor pathway" title={['You must already', 'be an instructor.']} lead={tecInstructorNote} />
      <div className="pg-table" role="table" aria-label="Technical instructor ratings">
        {tecInstructorRatings.map(r => <div key={r.title} role="row"><b role="cell">{r.title}</b><span role="cell">{r.needs}</span><span role="cell">Teaches: {r.teaches}</span></div>)}
      </div>
      <p className="dt-note">Standards as read from PADI’s published TecRec course pages; we verify each against the current TecRec standards before a course runs.</p>
    </section>
  </>
}

export function CategoryPage({ slug }: { slug: CategorySlug }) {
  const c = categoryOf(slug)!
  const all = itemsOf(c).map(listingOf).filter(l => !!l)
  const count = (t: ItemType) => all.filter(l => l.type === t).length
  const types = (['Activity', 'Course'] as const).filter(count)
  const [show, setShow] = useState<'All' | ItemType>('All')
  const total = all.length
  return <main className="xp cs pg">
    <Header />
    <Hero eyebrow={c.eyebrow} lines={c.headline} sub={c.intro} image={c.image} imagePosition={c.imagePosition} crumbs={[['Home', '/'], ['Activities & courses', '/programmes']]} title={c.title} />
    <CategoryStrip current={slug} heading={false} />

    <section id="list" className="xp-list">
      <Head eyebrow={`${c.title} · ${total} ${total === 1 ? 'option' : 'options'}`} title={['Activity or course?', 'Start here.']} />
      <TypeKey />
      <LayoutMotion>
        {types.length > 1 && <div className="xp-filter" role="toolbar" aria-label={`Show ${c.title} activities or courses`}>
          <div className="xp-filter-chips">
            {(['All', ...types] as const).map(t => <button key={t} type="button" aria-pressed={show === t} className={show === t ? 'is-on' : ''} onClick={() => setShow(t)}>
              {show === t && <m.span layoutId="pg-chip" className="xp-chip-bg" transition={{ duration: 0.5, ease }} />}
              <span>{t === 'All' ? 'All' : typeInfo[t].plural}</span><em>{t === 'All' ? total : count(t)}</em>
            </button>)}
          </div>
        </div>}
        {types.filter(t => show === 'All' || show === t).map(t => <div key={t} className="pg-type-section" data-type={t}>
          <div className="pg-type-head"><span className="pg-type" data-type={t}>{typeInfo[t].plural}</span><h2>{typeInfo[t].title[0]} <i>{typeInfo[t].title[1]}</i></h2><p>{typeInfo[t].hint}</p></div>
          {c.groups.map(g => ({ ...g, list: g.items.map(listingOf).filter(l => !!l && l.type === t) as Listing[] })).filter(g => g.list.length).map(g => <div key={g.heading} className="pg-group">
            <div className="pg-group-head"><h3>{g.heading}</h3>{g.note && <p>{g.note}</p>}</div>
            <m.div layout className="xp-grid">
              <AnimatePresence mode="popLayout">{g.list.map((l, i) => <Card key={l.slug} l={l} index={i} />)}</AnimatePresence>
            </m.div>
          </div>)}
        </div>)}
      </LayoutMotion>
    </section>

    {slug === 'scuba-diving' && <ScubaExtras />}
    {slug === 'freediving' && <FreedivingExtras />}
    {slug === 'advanced-sports' && <TecExtras />}
    {slug === 'parasports' && <MuzirisSection />}
  </main>
}

export function ProgrammesHub() {
  return <main className="xp cs pg">
    <Header />
    <Hero eyebrow="Activities & courses · Kovalam" lines={['Four ways', 'into the water.']} sub="Scuba diving, parasports, freediving and technical diving — choose a category to see every activity and course in it, from first try to professional." image="/images/underwater-light.webp" />
    <section className="pg-info pg-key-wrap"><TypeKey links /></section>
    <CategoryStrip />
    <section className="pg-info">
      {categories.map((c, i) => <m.div key={c.slug} className="pg-hub-row" {...inView} variants={rise} custom={Math.min(i, 2)}>
        <div><p className="eyebrow">{String(i + 1).padStart(2, '0')} — {c.eyebrow}</p><h2><Link href={`/programmes/${c.slug}`}>{c.title}</Link></h2><p className="ab-lead">{c.intro}</p></div>
        <ul>{(['Activity', 'Course'] as const).map(t => { const list = itemsOf(c).map(listingOf).filter(l => l?.type === t); return list.length ? <li key={t}><b>{typeInfo[t].plural}</b><span>{list.map(l => l!.title).join(' · ')}</span></li> : null })}</ul>
        <Link className="text-link" href={`/programmes/${c.slug}`}>See {c.title.toLowerCase()} <ArrowRight /></Link>
      </m.div>)}
    </section>
  </main>
}
