'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Minus, Phone, Plus } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { contact, whatsappLink } from '@/data/site'
import { Header } from './header'
import { WhatsAppIcon } from './whatsapp'

const ease = [0.19, 1, 0.22, 1] as const

type Option = { slug: string; title: string; kind: 'activity' | 'course'; image: string; imagePosition?: string; duration: string; price?: string; minAge?: string }
const options: Option[] = [
  ...experiences.map(e => ({ slug: e.slug, title: e.title, kind: 'activity' as const, image: e.image, imagePosition: e.imagePosition, duration: e.duration, price: e.price })),
  ...courses.map(c => ({ slug: c.slug, title: c.title, kind: 'course' as const, image: c.image, imagePosition: c.imagePosition, duration: c.duration, price: c.price, minAge: c.minAge })),
]
const amount = (o?: Option) => Number(o?.price?.replace(/[^\d]/g, '') || 0)
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
const priceLabel = (o: Option) => o.price ? o.price.replace(' per person', '') : 'Price on request'

// Deep links name the product by title (?activity=Scuba+Diving) or slug (?activity=scuba-diving)
const norm = (s: string) => s.trim().toLowerCase().replace(/[+_]/g, ' ').replace(/\s+/g, ' ')
const findOption = (key: string | null) => key ? options.find(o => o.slug === key.trim().toLowerCase() || norm(o.title) === norm(key)) : undefined

// Dates are handled as local yyyy-mm-dd so a guest in India never gets the previous day
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s: string) => { const [y, mo, d] = s.split('-').map(Number); return new Date(y, mo - 1, d) }
const longDate = (s: string) => fromIso(s).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
const times = [{ id: 'Morning', hint: '9 – 12' }, { id: 'Afternoon', hint: '12 – 4' }, { id: 'Evening', hint: '4 – 7' }]
const steps = ['Choose', 'Date & guests', 'Your details']

export function BookingFlow() {
  const reduce = useReducedMotion()
  const top = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(1)
  const [tab, setTab] = useState<'activity' | 'course'>('activity')
  const [slug, setSlug] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState(2)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [tried, setTried] = useState(false)
  const [sent, setSent] = useState('')

  const today = useMemo(() => new Date(), [])
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return iso(d) }), [today])
  const chosen = options.find(o => o.slug === slug)
  const isCourse = chosen?.kind === 'course'
  const total = amount(chosen) * guests

  // A deep link (Book buttons, the booking popup, WhatsApp shares) skips straight to the date step
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const o = findOption(q.get('activity'))
    const d = q.get('date'); const g = Number(q.get('guests'))
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= iso(new Date())) setDate(d)
    if (g >= 1 && g <= 20) setGuests(g)
    if (o) { setSlug(o.slug); setTab(o.kind); setStep(2) }
  }, [])

  // A preselected date (deep link) may sit off-screen in the chip row: bring it into view
  const dayRow = useCallback((el: HTMLDivElement | null) => { const on = el?.querySelector<HTMLElement>('.is-on'); if (el && on) el.scrollLeft = on.offsetLeft - (el.clientWidth - on.offsetWidth) / 2 }, [])

  const go = (n: number) => { setStep(n); setTried(false); top.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }) }
  const pick = (o: Option) => { setSlug(o.slug); go(2) }

  const phoneOk = phone.replace(/\D/g, '').length >= 10
  const nameOk = name.trim().length >= 2
  const canNext = step === 1 ? !!chosen : step === 2 ? !!date : nameOk && phoneOk

  const message = () => [
    'Hello Bond Safari! I’d like to book:',
    `• ${chosen?.title}`,
    `• ${isCourse ? 'Preferred start' : 'Date'}: ${longDate(date)}${time ? ` (${time})` : ''}`,
    `• ${isCourse ? 'Participants' : 'Guests'}: ${guests}`,
    total ? `• Total: ${inr(total)} (${inr(amount(chosen))} × ${guests})` : '',
    `Name: ${name.trim()}`,
    `WhatsApp: ${phone.trim()}`,
    email.trim() ? `Email: ${email.trim()}` : '',
  ].filter(Boolean).join('\n')

  const next = () => {
    if (!canNext) { setTried(true); return }
    if (step < 3) return go(step + 1)
    const url = whatsappLink(message())
    window.open(url, '_blank', 'noopener')
    setSent(url)
    top.current?.scrollIntoView({ block: 'start' })
  }

  const fade = { initial: { opacity: 0, y: reduce ? 0 : 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.45, ease } }

  if (sent) return <main className="booking-page bk"><Header /><div className="bk-shell" ref={top}>
    <m.section className="bk-done" {...fade}>
      <span className="bk-done-icon"><Check /></span>
      <p className="eyebrow">Request ready</p>
      <h1>Send it on <i>WhatsApp.</i></h1>
      <p>WhatsApp has opened with your booking details. Tap send, and our team will confirm your slot and how to pay.</p>
      <div className="bk-recap">
        <b>{chosen?.title}</b>
        <span>{longDate(date)}{time && ` · ${time}`} · {guests} {guests === 1 ? 'person' : 'people'}</span>
        {total > 0 && <strong>{inr(total)}</strong>}
      </div>
      <div className="bk-done-actions">
        <a className="book-cta" href={sent} target="_blank" rel="noreferrer"><span className="book-cta-label"><strong>Open WhatsApp</strong><small>If it didn’t open</small></span><span className="book-cta-icon"><WhatsAppIcon /></span></a>
        <Link className="text-link" href="/">Back to home <ArrowRight /></Link>
      </div>
    </m.section>
  </div></main>

  return <main className="booking-page bk">
    <Header />
    <div className="bk-shell" ref={top}>
      <div className="bk-head">
        <h1>Book your <i>adventure</i></h1>
        <ol className="bk-progress" aria-label="Booking steps">
          {steps.map((s, i) => <li key={s} className={step === i + 1 ? 'is-now' : step > i + 1 ? 'is-done' : ''} aria-current={step === i + 1 ? 'step' : undefined}>
            <span>{step > i + 1 ? <Check /> : i + 1}</span><em>{s}</em>
          </li>)}
        </ol>
      </div>

      {chosen && step > 1 && <div className="bk-chosen">
        <span className="bk-thumb"><Image src={chosen.image} alt="" fill sizes="56px" style={{ objectPosition: chosen.imagePosition }} /></span>
        <div><b>{chosen.title}</b><small>{chosen.duration} · {priceLabel(chosen)}</small></div>
        <button type="button" onClick={() => go(1)}>Change</button>
      </div>}

      <AnimatePresence mode="wait">
        {step === 1 && <m.section key="s1" className="bk-step" {...fade}>
          <h2>What would you like to do?</h2>
          <div className="bk-tabs" role="tablist">
            {(['activity', 'course'] as const).map(k => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
              {k === 'activity' ? 'Activities' : 'Courses'}<em>{options.filter(o => o.kind === k).length}</em>
            </button>)}
          </div>
          <div className="bk-list">
            {options.filter(o => o.kind === tab).map(o => <button key={o.slug} type="button" className={o.slug === slug ? 'bk-option is-on' : 'bk-option'} onClick={() => pick(o)}>
              <span className="bk-thumb"><Image src={o.image} alt="" fill sizes="64px" style={{ objectPosition: o.imagePosition }} /></span>
              <span className="bk-option-body"><b>{o.title}</b><small><Clock /> {o.duration}</small></span>
              <span className="bk-option-price">{priceLabel(o)}{o.price && <small>/ person</small>}</span>
            </button>)}
          </div>
        </m.section>}

        {step === 2 && <m.section key="s2" className="bk-step" {...fade}>
          <h2>{isCourse ? 'When would you like to start?' : 'When are you coming?'}</h2>
          <p className="bk-label"><CalendarDays /> {isCourse ? 'Preferred start date' : 'Choose a date'}</p>
          <div className="bk-days" ref={dayRow}>
            {days.map((d, i) => { const dt = fromIso(d); return <button key={d} type="button" className={date === d ? 'bk-day is-on' : 'bk-day'} onClick={() => setDate(d)} aria-pressed={date === d}>
              <small>{i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dt.toLocaleDateString('en-IN', { weekday: 'short' })}</small>
              <b>{dt.getDate()}</b>
              <small>{dt.toLocaleDateString('en-IN', { month: 'short' })}</small>
            </button> })}
          </div>
          <label className="bk-other">Other date <input type="date" min={days[0]} value={date && !days.includes(date) ? date : ''} onChange={e => setDate(e.target.value)} /></label>
          {tried && !date && <p className="bk-error">Please choose a date.</p>}

          {!isCourse && <>
            <p className="bk-label"><Clock /> Preferred time <span>(optional)</span></p>
            <div className="bk-times">
              {times.map(t => <button key={t.id} type="button" className={time === t.id ? 'is-on' : ''} aria-pressed={time === t.id} onClick={() => setTime(time === t.id ? '' : t.id)}><b>{t.id}</b><small>{t.hint}</small></button>)}
            </div>
          </>}

          <div className="bk-guests">
            <div><b>{isCourse ? 'Participants' : 'Guests'}</b><small>{chosen?.price ? `${priceLabel(chosen)} per person` : 'Price confirmed on WhatsApp'}{chosen?.minAge && ` · Min. age ${chosen.minAge}`}</small></div>
            <div className="bk-stepper">
              <button type="button" onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="One less"><Minus /></button>
              <output aria-live="polite">{guests}</output>
              <button type="button" onClick={() => setGuests(g => Math.min(20, g + 1))} disabled={guests >= 20} aria-label="One more"><Plus /></button>
            </div>
          </div>
        </m.section>}

        {step === 3 && <m.section key="s3" className="bk-step" {...fade}>
          <h2>Who should we confirm with?</h2>
          <div className="bk-fields">
            <label className={tried && !nameOk ? 'is-bad' : ''}>Your name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" placeholder="Full name" />{tried && !nameOk && <em>Please enter your name.</em>}</label>
            <label className={tried && !phoneOk ? 'is-bad' : ''}>WhatsApp number<input value={phone} onChange={e => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91 98765 43210" />{tried && !phoneOk && <em>Please enter a valid number.</em>}</label>
            <label><span className="bk-field-name">Email <i>(optional)</i></span><input value={email} onChange={e => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" /></label>
          </div>
          <div className="bk-recap">
            <b>{chosen?.title}</b>
            <span>{longDate(date)}{time && ` · ${time}`} · {guests} {guests === 1 ? 'person' : 'people'}</span>
            {total > 0 && <strong>{inr(total)}</strong>}
          </div>
          <p className="bk-note">No payment now. We confirm your slot on WhatsApp first, then share how to pay.</p>
        </m.section>}
      </AnimatePresence>

      <div className="bk-actions">
        {step > 1 ? <button type="button" className="bk-back" onClick={() => go(step - 1)} aria-label="Back"><ArrowLeft /></button> : <a className="bk-back" href={`tel:${contact.phones[0].replace(/\s/g, '')}`} aria-label="Call us"><Phone /></a>}
        <div className="bk-total">{step === 1 ? <><b>Pick an option</b><small>Prices per person</small></> : total > 0 ? <><b>{inr(total)}</b><small>{guests} × {inr(amount(chosen))}</small></> : <><b>{guests} {guests === 1 ? 'person' : 'people'}</b><small>Price on request</small></>}</div>
        {step > 1 && <button type="button" className={`book-cta book-cta-sm${canNext ? '' : ' is-off'}`} onClick={next}>
          <span className="book-cta-label"><strong>{step === 3 ? 'Send request' : 'Continue'}</strong></span>
          <span className="book-cta-icon">{step === 3 ? <WhatsAppIcon /> : <ArrowRight />}</span>
        </button>}
      </div>
    </div>
  </main>
}
