'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Clock, Sparkles } from 'lucide-react'
import { experiences, type Experience } from '@/data/experiences'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.08 } }) }

// The most-booked activities lead; every other activity follows as a compact, priced card
// Bond Safari (underwater scooter) is paused for now, so it sits at the end of the list instead
const bestsellerSlugs = ['scuba-diving', 'snorkeling']
const bestsellers = bestsellerSlugs.map(s => experiences.find(e => e.slug === s)!)
const others = experiences.filter(e => !bestsellerSlugs.includes(e.slug))

const amount = (e: Experience) => Number(e.price?.replace(/[^\d]/g, '') || 0)
const fromPrice = Math.min(...experiences.map(amount).filter(Boolean)).toLocaleString('en-IN')
const priceOf = (e: Experience) => e.price ? e.price.replace(' per person', '') : 'Price on request'
const bookHref = (e: Experience) => `/booking?activity=${encodeURIComponent(e.title)}`

function Bestseller({ e, i }: { e: Experience; i: number }) {
  return <m.article className="hs-best" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} variants={rise} custom={i}>
    <Link className="hs-best-media" href={`/activities/${e.slug}`} aria-label={`${e.title}, view details`}>
      <Image src={e.image} alt="" fill sizes="(max-width: 800px) 100vw, 33vw" style={{ objectPosition: e.imagePosition }} />
    </Link>
    {/* Flat corner ribbon and plain-text price, so the only thing that looks tappable is the Book button */}
    <span className="hs-ribbon"><Sparkles /> Bestseller</span>
    <div className="hs-best-body">
      <p className="hs-meta"><span>{e.category}</span><span><Clock /> {e.duration}</span></p>
      <h3><Link href={`/activities/${e.slug}`}>{e.title}</Link></h3>
      <p className="hs-tag">{e.tagline}</p>
      <div className="hs-best-foot">
        <Link className="book-cta book-cta-sm" href={bookHref(e)} aria-label={`Book ${e.title}`}><span className="book-cta-label"><strong>Book now</strong></span><span className="book-cta-icon"><ArrowRight /></span></Link>
        <p className="hs-price-text">{e.price ? <><b>{priceOf(e)}</b><small>per person</small></> : <small>Price on request</small>}</p>
      </div>
    </div>
  </m.article>
}

function Compact({ e, i }: { e: Experience; i: number }) {
  return <m.article className="hs-item" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={rise} custom={i % 3}>
    <Link className="hs-item-thumb" href={`/activities/${e.slug}`} tabIndex={-1} aria-hidden="true">
      <Image src={e.image} alt="" fill sizes="104px" style={{ objectPosition: e.imagePosition }} />
    </Link>
    <div className="hs-item-body">
      <h3><Link href={`/activities/${e.slug}`}>{e.title}</Link></h3>
      <p><Clock /> {e.duration}</p>
      <b>{priceOf(e)}{e.price && <small>/ person</small>}</b>
    </div>
    <Link className="hs-item-book" href={bookHref(e)} aria-label={`Book ${e.title}`}><ArrowUpRight /></Link>
  </m.article>
}

export function ExperienceStack() {
  return <section className="hs" aria-label="Activities">
    <m.div className="hs-head" initial="hidden" whileInView="show" viewport={{ once: true }}>
      <div><m.p className="eyebrow" variants={rise}>Choose your horizon</m.p><m.h2 variants={rise} custom={1}>Activities<br /><i>worth booking.</i></m.h2></div>
      <m.div className="hs-head-side" variants={rise} custom={2}>
        <p>{experiences.length} activities on Kovalam beach, all gear included. From <b>₹{fromPrice}</b> per person.</p>
        <Link className="text-link" href="/activities">View all activities <ArrowRight /></Link>
      </m.div>
    </m.div>
    <div className="hs-best-grid">{bestsellers.map((e, i) => <Bestseller key={e.slug} e={e} i={i} />)}</div>
    <div className="hs-list">{others.map((e, i) => <Compact key={e.slug} e={e} i={i} />)}</div>
    <div className="hs-foot"><Link className="pill pill-dark" href="/activities">View all activities <ArrowRight /></Link></div>
  </section>
}
