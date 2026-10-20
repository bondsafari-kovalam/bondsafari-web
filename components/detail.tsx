'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock, Phone } from 'lucide-react'
import { useRef } from 'react'
import { contact } from '@/data/site'
import { Header } from './site'
import { usePageRevealed } from './booking-popup'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 36 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.08 } }) }

export type DetailItem = { title: string; category: string; duration: string; price?: string; image: string; imagePosition?: string; eyebrow?: string; description?: string; tagline?: string; overview?: string[]; details?: string[]; section: { label: string; href: string } }
export type RelatedItem = { title: string; category: string; image: string; href: string; imagePosition?: string; price?: string; duration?: string; tagline?: string }

function Mask({ children, delay = 0, play = true }: { children: React.ReactNode; delay?: number; play?: boolean }) {
  return <span className="mask"><motion.span className="mask-inner" initial={{ y: '105%' }} animate={play ? { y: 0 } : undefined} transition={{ duration: 1.5, ease, delay }}>{children}</motion.span></span>
}

export function Detail({ item, related }: { item: DetailItem; related: RelatedItem[] }) {
  const reduce = useReducedMotion()
  const router = useRouter()
  const revealed = usePageRevealed()
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
  const book = `/booking?activity=${encodeURIComponent(item.title)}`
  const facts = [['Duration', item.duration], ['Type', item.category], ['Price', item.price ?? 'On request'], ['Good to know', item.eyebrow ?? 'All ages welcome']]

  return <main className="dt">
    <Header />
    <section ref={hero} className="dt-hero">
      <motion.div className="dt-hero-media" style={{ scale, y }}><Image src={item.image} alt={item.title} fill sizes="100vw" priority style={{ objectPosition: item.imagePosition }} /></motion.div>
      <div className="dt-hero-shade" />
      <motion.button type="button" className="dt-back" onClick={goBack} initial={{ opacity: 0, x: -16 }} animate={revealed ? { opacity: 1, x: 0 } : undefined} transition={{ duration: 1, ease, delay: 0.15 }}><span><ArrowLeft /></span>Back</motion.button>
      <motion.div className="dt-hero-content" style={{ opacity: fade }}>
        <motion.nav className="dt-crumbs" aria-label="Breadcrumb" initial={{ opacity: 0 }} animate={revealed ? { opacity: 1 } : undefined} transition={{ duration: 1, delay: 0.2 }}><Link href="/">Home</Link><span>/</span><Link href={item.section.href}>{item.section.label}</Link><span>/</span><b>{item.title}</b></motion.nav>
        <h1><Mask delay={0.25} play={revealed}>{item.title}</Mask></h1>
        <motion.p className="dt-tagline" initial={{ opacity: 0, y: 16 }} animate={revealed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.2, ease, delay: 0.6 }}>{item.tagline ?? item.description}</motion.p>
        <motion.div className="dt-hero-actions" initial={{ opacity: 0, y: 16 }} animate={revealed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.2, ease, delay: 0.75 }}>
          <Link className="book-cta" href={book}><span className="book-cta-label"><strong>Book now</strong><small>{item.price ?? 'Reserve your spot'}</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <a className="text-link light" href="#overview">Full details <ArrowDown /></a>
        </motion.div>
      </motion.div>
      <motion.dl className="dt-facts" initial={{ opacity: 0, y: 30 }} animate={revealed ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 1.2, ease, delay: 0.9 }}>
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </motion.dl>
    </section>

    <section id="overview" className="dt-body section">
      <div className="dt-main">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p className="eyebrow" variants={rise}>Overview</motion.p>
          <motion.p className="dt-lead" variants={rise} custom={1}>{overview[0]}</motion.p>
          {overview.slice(1).map((p, i) => <motion.p key={i} className="dt-copy" variants={rise} custom={2 + i}>{p}</motion.p>)}
        </motion.div>
        {details.length > 0 && <motion.div className="dt-highlights" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
          <motion.p className="eyebrow" variants={rise}>What’s included</motion.p>
          <ul>{details.map((d, i) => <motion.li key={d} variants={rise} custom={i + 1}><span><Check /></span>{d}</motion.li>)}</ul>
        </motion.div>}
      </div>
      <aside className="dt-aside">
        <motion.div className="dt-card" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
          <p className="eyebrow">Reserve your spot</p>
          <p className="dt-card-title">{item.title}</p>
          <p className="dt-card-price">{item.price ?? 'Price on request'}</p>
          <ul className="dt-card-meta"><li><Clock /> {item.duration}</li>{item.eyebrow && <li><Check /> {item.eyebrow}</li>}</ul>
          <Link className="book-cta dt-card-cta" href={book}><span className="book-cta-label"><strong>Book now</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <div className="dt-card-call"><p>Prefer to talk? We’re open {contact.hours.replace('Monday – Sunday · ', 'daily, ')}.</p>{contact.phones.map(n => <a key={n} href={`tel:${n.replace(/\s/g, '')}`}><Phone /> {n}</a>)}</div>
        </motion.div>
      </aside>
    </section>

    {related.length > 0 && <section className="dt-related section">
      <div className="dt-related-head">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}><motion.p className="eyebrow" variants={rise}>Keep exploring · {related.length} more</motion.p><motion.h2 variants={rise} custom={1}>You might<br /><i>also love.</i></motion.h2></motion.div>
        <div className="dt-related-nav">
          <button type="button" aria-label="Previous suggestions" onClick={() => slide(-1)}><ArrowLeft /></button>
          <button type="button" aria-label="Next suggestions" onClick={() => slide(1)}><ArrowRight /></button>
        </div>
      </div>
      <div ref={track} className="dt-related-track">{related.map((r, i) => <motion.div key={r.href} className="dt-related-slide" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={Math.min(i, 3)}>
        <Link className="dt-related-card" href={r.href}>
          <div className="dt-related-img"><Image src={r.image} alt={r.title} fill sizes="(max-width: 800px) 80vw, 26vw" style={{ objectPosition: r.imagePosition }} />{r.price && <span className="dt-related-price">{r.price.replace(' per person', '')}</span>}</div>
          <div className="dt-related-info"><span>{r.category}{r.duration && ` · ${r.duration}`}</span><h3>{r.title}</h3>{r.tagline && <p>{r.tagline}</p>}<i><ArrowUpRight /></i></div>
        </Link>
        <Link className="dt-related-book" href={`/booking?activity=${encodeURIComponent(r.title)}`}>Book {r.title} <ArrowRight /></Link>
      </motion.div>)}</div>
    </section>}

    <div className="dt-mobile-bar"><div><b>{item.title}</b><span>{item.price ?? item.duration}</span></div><Link className="book-cta book-cta-sm" href={book}><span className="book-cta-label"><strong>Book</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link></div>
  </main>
}
