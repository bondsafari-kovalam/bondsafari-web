'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { contact, socials } from '@/data/site'
import { Header } from './site'

const ease = [0.19, 1, 0.22, 1] as const
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.12 } }) }
const tel = (n: string) => `tel:${n.replace(/\s/g, '')}`
const groups = [{ label: 'Experiences', items: experiences.map(e => e.title) }, { label: 'Courses', items: courses.map(c => c.title) }, { label: 'Other', items: ['Something else'] }]
const topics = groups.flatMap(g => g.items)
const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent('Bond Safari, Suseela Tower, Beach Road, Kovalam, Kerala 695527')}&z=16&output=embed`

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><motion.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease, delay }}>{children}</motion.span></span>
}

// A styled stand-in for <select>: a button opening a listbox, with the value carried by a hidden input
function TopicPicker() {
  const id = useId()
  const box = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  useEffect(() => { if (open) list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [open, active])

  const show = () => { setActive(Math.max(0, topics.indexOf(value))); setOpen(true) }
  const pick = (t: string) => { setValue(t); setOpen(false) }
  const onKey = (e: KeyboardEvent) => {
    const move = { ArrowDown: 1, ArrowUp: -1 }[e.key]
    if (move) { e.preventDefault(); if (!open) show(); else setActive(a => (a + move + topics.length) % topics.length) }
    else if (e.key === 'Home' || e.key === 'End') { if (open) { e.preventDefault(); setActive(e.key === 'Home' ? 0 : topics.length - 1) } }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (open) pick(topics[active]); else show() }
    else if (e.key === 'Escape' || e.key === 'Tab') setOpen(false)
  }

  return <div ref={box} className={`ct-select ct-wide${open ? ' is-open' : ''}`}>
    <span id={`${id}-label`}>Interested in</span>
    <button type="button" className={value ? '' : 'is-empty'} aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${id}-label ${id}-btn`} id={`${id}-btn`} aria-controls={`${id}-list`} aria-activedescendant={open ? `${id}-${active}` : undefined} onClick={() => open ? setOpen(false) : show()} onKeyDown={onKey}>
      {value || 'Choose an activity'}<ChevronDown />
    </button>
    <input type="hidden" name="topic" value={value} />
    <AnimatePresence>{open && <motion.ul ref={list} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className="ct-select-list" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.25, ease }}>
      {groups.map(g => <li key={g.label} role="presentation">
        <p className="ct-select-group" aria-hidden="true">{g.label}</p>
        <ul role="group" aria-label={g.label}>{g.items.map(t => { const i = topics.indexOf(t); return <li key={t} id={`${id}-${i}`} data-i={i} role="option" aria-selected={t === value} className={i === active ? 'is-active' : ''} onPointerEnter={() => setActive(i)} onClick={() => pick(t)}>{t}{t === value && <Check />}</li> })}</ul>
      </li>)}
    </motion.ul>}</AnimatePresence>
  </div>
}

const cards = [
  { icon: Phone, label: 'Call us', lines: contact.phones.map(n => ({ text: n, href: tel(n) })) },
  { icon: Mail, label: 'Write to us', lines: [{ text: contact.email.replace('@', '@​'), href: `mailto:${contact.email}` }] },
  { icon: MapPin, label: 'Visit the centre', lines: [{ text: contact.address.join(', '), href: contact.mapUrl }] },
  { icon: Clock, label: 'Opening hours', lines: [{ text: contact.hours }, { text: 'We are open on Sundays too' }] },
]

export function Contact() {
  const reduce = useReducedMotion()
  const hero = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.15])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '25%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  // No backend yet: the enquiry opens in the visitor's mail app, already filled in
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const get = (k: string) => String(f.get(k) ?? '').trim()
    const body = [`Name: ${get('name')}`, `Email: ${get('email')}`, `Phone: ${get('phone')}`, `Interested in: ${get('topic')}`, '', get('message')].join('\n')
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`Enquiry from ${get('name')}`)}&body=${encodeURIComponent(body)}`
  }

  return <main className="ct">
    <Header />

    <section ref={hero} className="ct-hero">
      <motion.div className="ct-hero-media" style={{ scale: heroScale, y: heroY }}><Image src="/images/scuba.webp" alt="" fill sizes="100vw" priority /></motion.div>
      <div className="ct-hero-shade" />
      <motion.div className="ct-hero-content" style={{ opacity: heroFade }}>
        <motion.p className="eyebrow light" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.2 }}>Contact us · Kovalam, Kerala</motion.p>
        <h1><Mask delay={0.3}>Get in touch</Mask><br /><Mask delay={0.45}><i>with us.</i></Mask></h1>
        <motion.div className="ct-hero-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1 }}>
          <p>Please address your queries to our scuba diving centre representative, who is at your service always.</p>
          <span className="ab-scroll">Scroll <ArrowDown /></span>
        </motion.div>
      </motion.div>
    </section>

    <section className="ct-cards">
      {cards.map((c, i) => <motion.article key={c.label} className="ct-card" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={i}>
        <span className="ct-card-icon"><c.icon /></span>
        <p className="ct-card-label">{c.label}</p>
        {c.lines.map(l => 'href' in l && l.href
          ? <a key={l.text} href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{l.text}</a>
          : <span key={l.text}>{l.text}</span>)}
      </motion.article>)}
    </section>

    <section className="ct-enquire section">
      <motion.div className="ct-enquire-copy" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <motion.p className="eyebrow" variants={rise}>01 — Send an enquiry</motion.p>
        <motion.h2 variants={rise} custom={1}>Have a question?<br /><i>We are available.</i></motion.h2>
        <motion.p className="ab-lead" variants={rise} custom={2}>Tell us what you&apos;d like to try and when you&apos;re visiting Kovalam. Our team will get back to you with times, prices and everything you need to know.</motion.p>
        <motion.div className="ct-social" variants={rise} custom={3}>
          <p className="eyebrow">Follow along</p>
          <ul>{socials.map(([label, href]) => <li key={label}><a href={href} target="_blank" rel="noreferrer">{label}<ArrowUpRight /></a></li>)}</ul>
        </motion.div>
      </motion.div>

      <motion.form className="ct-form" onSubmit={submit} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={rise} custom={1}>
        <div className="bp-fields">
          <label>Your name<input name="name" required autoComplete="name" placeholder="Full name" /></label>
          <label>Phone<input name="phone" type="tel" autoComplete="tel" placeholder="+91" /></label>
          <label className="ct-wide">Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
          <TopicPicker />
          <label className="ct-wide">Your message<textarea name="message" rows={5} placeholder="Tell us a little about your plans" /></label>
        </div>
        <button type="submit" className="book-cta"><span className="book-cta-label"><strong>Submit now</strong><small>We reply within a day</small></span><span className="book-cta-icon"><ArrowRight /></span></button>
      </motion.form>
    </section>

    <section className="ct-map">
      <motion.div className="ct-map-frame" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={rise}>
        <iframe src={mapEmbed} title="Bond Safari on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="ct-map-card">
          <p className="eyebrow light">02 — Location</p>
          <p className="ct-map-title">Find us on<br /><i>Beach Road.</i></p>
          <p className="ct-map-address">{contact.address.map(l => <span key={l}>{l}<br /></span>)}</p>
          <a className="text-link light" href={contact.mapUrl} target="_blank" rel="noreferrer">Get directions <ArrowUpRight /></a>
        </div>
      </motion.div>
    </section>
  </main>
}
