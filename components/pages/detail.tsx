'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, FileDown, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'
import { contact, whatsappLink } from '@/data/site'
import { enquiryMessage, statusLabel, type Fact, type Faq, type ItemType, type Status, type Step } from '@/data/programmes'
import { Header } from '@/components/layout/header'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 36 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.08 } }) }

export type DetailItem = { title: string; category: string; duration: string; price?: string; image: string; imagePosition?: string; eyebrow?: string; description?: string; tagline?: string; overview?: string[]; details?: string[]; brochure?: string; section: { label: string; href: string }
  // Course information: each section shows only when the course has it
  type?: ItemType; status?: Status; location?: string; requirements?: Fact[]; performance?: Fact[]; learn?: string[]; training?: Step[]; safety?: string[]; certification?: string; next?: { title: string; href: string }; faqs?: Faq[]; verify?: string }
export type RelatedItem = { title: string; category: string; image: string; href: string; imagePosition?: string; price?: string; duration?: string; tagline?: string; status?: Status }

// Bookable items go to the booking flow; anything else opens a WhatsApp enquiry
export const ctaOf = (title: string, status: Status = 'bookable') => status === 'bookable'
  ? { href: `/booking?activity=${encodeURIComponent(title)}`, label: 'Book now', external: false }
  : { href: whatsappLink(enquiryMessage(title)), label: status === 'coming-soon' ? 'Register interest' : 'Enquire now', external: true }
export function Cta({ cta, className, children }: { cta: ReturnType<typeof ctaOf>; className: string; children: React.ReactNode }) {
  return cta.external ? <a className={className} href={cta.href} target="_blank" rel="noreferrer">{children}</a> : <Link className={className} href={cta.href}>{children}</Link>
}
const Facts = ({ rows }: { rows: Fact[] }) => <dl className="dt-facts-list">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><m.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.5, ease, delay }}>{children}</m.span></span>
}

export function Detail({ item, related }: { item: DetailItem; related: RelatedItem[] }) {
  const reduce = useReducedMotion()
  const router = useRouter()
  // Go back within the site when we came from it, otherwise land on the listing page
  const goBack = () => { if (document.referrer.startsWith(location.origin) && history.length > 1) router.back(); else router.push(item.section.href) }
  const hero = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const slide = (dir: number) => { const t = track.current; if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' }) }
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const y = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const overview = item.overview?.length ? item.overview : item.description ? [item.description] : []
  const details = item.details ?? []
  const cta = ctaOf(item.title, item.status)
  const asked = item.status && item.status !== 'bookable'
  const facts = [['Duration', item.duration], ['Type', item.type ? `${item.type} · ${item.type === 'Activity' ? 'no certificate' : 'certification'}` : item.category], ['Price', item.price ?? (asked ? 'Ask us' : 'On request')], item.location ? ['Location', item.location] : ['Good to know', item.eyebrow ?? 'All ages welcome']]
  const block = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-60px' } } as const

  return <main className="dt">
    <Header />
    <section ref={hero} className="dt-hero">
      <m.div className="dt-hero-media" style={{ scale, y }}><Image src={item.image} alt={item.title} fill sizes="100vw" priority style={{ objectPosition: item.imagePosition }} /></m.div>
      <div className="dt-hero-shade" />
      <m.button type="button" className="dt-back" onClick={goBack} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease, delay: 0.15 }}><span><ArrowLeft /></span>Back</m.button>
      <m.div className="dt-hero-content" style={{ opacity: fade }}>
        <m.nav className="dt-crumbs" aria-label="Breadcrumb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }}><Link href="/">Home</Link><span>/</span><Link href={item.section.href}>{item.section.label}</Link><span>/</span><b>{item.title}</b></m.nav>
        {item.type && <m.span className="pg-type dt-type" data-type={item.type} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.25 }}>{item.type === 'Activity' ? 'Activity · one session, no certificate' : 'Course · training with certification'}</m.span>}
        <h1><Mask delay={0.25}>{item.title}</Mask></h1>
        <m.p className="dt-tagline" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.6 }}>{item.tagline ?? item.description}</m.p>
        <m.div className="dt-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.75 }}>
          <Cta cta={cta} className="book-cta"><span className="book-cta-label"><strong>{cta.label}</strong><small>{item.price ?? (asked ? statusLabel[item.status!] : 'Reserve your spot')}</small></span><span className="book-cta-icon"><ArrowRight /></span></Cta>
          <a className="text-link light" href="#overview">Full details <ArrowDown /></a>
        </m.div>
      </m.div>
      <m.dl className="dt-facts" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease, delay: 0.9 }}>
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </m.dl>
    </section>

    <section id="overview" className="dt-body section">
      <div className="dt-main">
        <m.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <m.p className="eyebrow" variants={rise}>Overview</m.p>
          <m.p className="dt-lead" variants={rise} custom={1}>{overview[0]}</m.p>
          {overview.slice(1).map((p, i) => <m.p key={i} className="dt-copy" variants={rise} custom={2 + i}>{p}</m.p>)}
        </m.div>
        {item.learn?.length ? <m.div className="dt-highlights" {...block}>
          <m.p className="eyebrow" variants={rise}>What you will learn</m.p>
          <ul>{item.learn.map((d, i) => <m.li key={d} variants={rise} custom={i + 1}><span><Check /></span>{d}</m.li>)}</ul>
        </m.div> : null}
        {item.requirements?.length ? <m.div className="dt-block" {...block}>
          <m.p className="eyebrow" variants={rise}>Course requirements</m.p>
          <m.div variants={rise} custom={1}><Facts rows={item.requirements} /></m.div>
          {item.verify && <m.p className="dt-verify" variants={rise} custom={2}><AlertCircle /> {item.verify}</m.p>}
        </m.div> : null}
        {item.performance?.length ? <m.div className="dt-block" {...block}>
          <m.p className="eyebrow" variants={rise}>Training standards</m.p>
          <m.div variants={rise} custom={1}><Facts rows={item.performance} /></m.div>
          <m.p className="dt-note" variants={rise} custom={2}>As published by PADI. Standards can change, so we confirm the current requirements with you before you start.</m.p>
        </m.div> : null}
        {item.training?.length ? <m.div className="dt-block" {...block}>
          <m.p className="eyebrow" variants={rise}>Training structure</m.p>
          <ol className="dt-steps">{item.training.map((t, i) => <m.li key={t.title} variants={rise} custom={i + 1}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{t.title}</b><p>{t.text}</p></div></m.li>)}</ol>
        </m.div> : null}
        {details.length > 0 && <m.div className="dt-highlights" {...block}>
          <m.p className="eyebrow" variants={rise}>What’s included</m.p>
          <ul>{details.map((d, i) => <m.li key={d} variants={rise} custom={i + 1}><span><Check /></span>{d}</m.li>)}</ul>
        </m.div>}
        {item.safety?.length ? <m.div className="dt-highlights" {...block}>
          <m.p className="eyebrow" variants={rise}>Equipment & safety</m.p>
          <ul>{item.safety.map((d, i) => <m.li key={d} variants={rise} custom={i + 1}><span><ShieldCheck /></span>{d}</m.li>)}</ul>
        </m.div> : null}
        {(item.certification || item.next) && <m.div className="dt-block" {...block}>
          <m.p className="eyebrow" variants={rise}>{item.type === 'Activity' ? 'Take it further' : 'Certification & next level'}</m.p>
          {item.certification && <m.p className="dt-copy" variants={rise} custom={1}>{item.certification}</m.p>}
          {item.next && <m.div variants={rise} custom={2}><Link className="dt-next" href={item.next.href}><small>{item.type === 'Activity' ? 'Want a certificate? Course' : 'Next level'}</small><b>{item.next.title}</b><ArrowRight /></Link></m.div>}
        </m.div>}
        {item.faqs?.length ? <m.div className="dt-block" {...block}>
          <m.p className="eyebrow" variants={rise}>Questions</m.p>
          <div className="dt-faq">{item.faqs.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
        </m.div> : null}
      </div>
      <aside className="dt-aside">
        <m.div className="dt-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
          <p className="eyebrow">Reserve your spot</p>
          <p className="dt-card-title">{item.title}</p>
          {asked && <p className="dt-status" data-status={item.status}>{statusLabel[item.status!]}</p>}
          <p className="dt-card-price">{item.price ?? 'Price on request'}</p>
          <ul className="dt-card-meta"><li><Clock /> {item.duration}</li>{item.location && <li><MapPin /> {item.location}</li>}{item.eyebrow && <li><Check /> {item.eyebrow}</li>}</ul>
          <Cta cta={cta} className="book-cta dt-card-cta"><span className="book-cta-label"><strong>{cta.label}</strong></span><span className="book-cta-icon"><ArrowRight /></span></Cta>
          {/* Downloads the PDF once one is placed in public/brochures and named in the catalogue; until then it asks for it on WhatsApp */}
          {item.brochure
            ? <a className="dt-card-brochure" href={item.brochure} target="_blank" rel="noreferrer" download><FileDown /> Download brochure <small>PDF</small></a>
            : <a className="dt-card-brochure" href={whatsappLink(`Hello Bond Safari! Please send me the brochure (PDF) for ${item.title}.`)} target="_blank" rel="noreferrer"><FileDown /> Get brochure <small>PDF</small></a>}
          <div className="dt-card-call"><p>Prefer to talk? We’re open {contact.hours.replace('Monday – Sunday · ', 'daily, ')}.</p>{contact.phones.map(n => <a key={n} href={`tel:${n.replace(/\s/g, '')}`}><Phone /> {n}</a>)}</div>
        </m.div>
      </aside>
    </section>

    {related.length > 0 && <section className="dt-related section">
      <div className="dt-related-head">
        <m.div initial="hidden" whileInView="show" viewport={{ once: true }}><m.p className="eyebrow" variants={rise}>Keep exploring · {related.length} more</m.p><m.h2 variants={rise} custom={1}>You might<br /><i>also love.</i></m.h2></m.div>
        <div className="dt-related-nav">
          <button type="button" aria-label="Previous suggestions" onClick={() => slide(-1)}><ArrowLeft /></button>
          <button type="button" aria-label="Next suggestions" onClick={() => slide(1)}><ArrowRight /></button>
        </div>
      </div>
      <div ref={track} className="dt-related-track">{related.map((r, i) => <m.div key={r.href} className="dt-related-slide" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={Math.min(i, 3)}>
        <Link className="dt-related-card" href={r.href}>
          <div className="dt-related-img"><Image src={r.image} alt={r.title} fill sizes="(max-width: 800px) 80vw, 26vw" style={{ objectPosition: r.imagePosition }} />{r.price && <span className="dt-related-price">{r.price.replace(' per person', '')}</span>}</div>
          <div className="dt-related-info"><span>{r.category}{r.duration && ` · ${r.duration}`}</span><h3>{r.title}</h3>{r.tagline && <p>{r.tagline}</p>}<i><ArrowUpRight /></i></div>
        </Link>
        {(() => { const c = ctaOf(r.title, r.status); return <Cta cta={c} className="dt-related-book">{c.external ? c.label : `Book ${r.title}`} <ArrowRight /></Cta> })()}
      </m.div>)}</div>
    </section>}

    <div className="dt-mobile-bar"><div><b>{item.title}</b><span>{item.price ?? item.duration}</span></div><Cta cta={cta} className="book-cta book-cta-sm"><span className="book-cta-label"><strong>{cta.external ? 'Enquire' : 'Book'}</strong></span><span className="book-cta-icon"><ArrowRight /></span></Cta></div>
  </main>
}
