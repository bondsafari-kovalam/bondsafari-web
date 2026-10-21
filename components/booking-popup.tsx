'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ArrowRight, Phone, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { contact } from '@/data/site'
import { Picker } from './picker'

const KEY = 'bs-booking-popup-seen'
const ease = [0.19, 1, 0.22, 1] as const
const activityGroups = [{ label: 'Activities', options: experiences.map(e => ({ value: e.title })) }, { label: 'Courses', options: courses.map(c => ({ value: c.title })) }]
const guestGroups = [{ options: [1, 2, 3, 4].map(n => ({ value: String(n), label: `${n} ${n === 1 ? 'guest' : 'guests'}` })) }]

// Detail pages map to the item they show, so the popup can open with it preselected
const detailTitle = (path: string) => {
  const [, section, slug] = path.split('/')
  if (section === 'activities') return experiences.find(e => e.slug === slug)?.title
  if (section === 'courses') return courses.find(c => c.slug === slug)?.title
}

// The page always shows first. On a detail page the popup follows once the visitor has engaged
// (scrolled a little or stayed a while), preselected, once per page per session; elsewhere a general
// promo shows once per session after a short delay.
const DETAIL_DELAY = 8000
const shownKey = (path: string) => `bs-booking-popup:${path}`
const wasShown = (key: string) => { try { return sessionStorage.getItem(key) === '1' } catch { return true } }
const markShown = (key: string) => { try { sessionStorage.setItem(key, '1') } catch {} }

export function BookingPopup() {
  const pathname = usePathname()
  const router = useRouter()
  const reduce = useReducedMotion()
  const preset = detailTitle(pathname)
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  const close = () => setOpen(false)

  // Navigating away closes it, so it never carries over onto the next page
  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (pathname.startsWith('/booking')) { markShown(KEY); return }
    const key = preset ? shownKey(pathname) : KEY
    if (wasShown(key)) return
    let fired = false
    const show = () => {
      if (fired) return
      fired = true
      lastFocus.current = document.activeElement as HTMLElement
      setOpen(true); markShown(key); if (!preset) markShown(KEY)
    }
    // On phones the general promo doesn't interrupt: the sticky Book bar is always in reach instead
    const mobile = window.matchMedia('(max-width: 800px)').matches
    const t = preset || !mobile ? setTimeout(show, preset ? DETAIL_DELAY : pathname === '/' ? 2600 : 1400) : undefined
    // On detail pages, scrolling past the first screen means they're interested: offer to book
    const onScroll = () => { if (preset && window.scrollY > window.innerHeight * 0.6) show() }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  }, [pathname, preset])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'Tab' && dialog.current) {
        const f = dialog.current.querySelectorAll<HTMLElement>('button, select, input, a[href]')
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('.ct-select button')?.focus())
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); lastFocus.current?.focus?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pathname])

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = new URLSearchParams()
    for (const k of ['activity', 'date', 'guests']) { const v = data.get(k); if (v) q.set(k, String(v)) }
    close()
    router.push(`/booking?${q}`)
  }

  return <AnimatePresence>
    {open && <m.div key={pathname} className="bp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={() => close()}>
      <m.div ref={dialog} className="bp-dialog" role="dialog" aria-modal="true" aria-labelledby="bp-title" onClick={e => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }} transition={{ duration: 0.9, ease }}>
        <button className="bp-close" onClick={() => close()} aria-label="Close"><X /></button>
        <div className="bp-media">
          <m.div className="bp-media-inner" initial={reduce ? false : { scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease }}><Image src="/images/scuba.webp" alt="" fill sizes="(max-width: 800px) 100vw, 420px" /></m.div>
          <div className="bp-media-text"><span>Kovalam · Kerala</span><p>Feel the marvels<br /><i>hidden beneath.</i></p></div>
        </div>
        <form className="bp-form" onSubmit={submit}>
          <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.25 }}>
            <p className="eyebrow">Plan your adventure</p>
            <h2 id="bp-title">Book your<br /><i>underwater day.</i></h2>
            <p className="bp-sub">No diving experience needed. Choose an adventure and we’ll take care of the rest.</p>
          </m.div>
          <m.div className="bp-fields" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.4 }}>
            <Picker className="bp-wide" label="Activity" name="activity" groups={activityGroups} defaultValue={preset ?? experiences[0].title} />
            <label>Date<input name="date" type="date" min={today} defaultValue={today} /></label>
            <Picker label="Guests" name="guests" groups={guestGroups} defaultValue="2" />
          </m.div>
          <m.div className="bp-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.55 }}>
            <button type="submit" className="book-cta"><span className="book-cta-label"><strong>Continue</strong><small>Reserve your spot</small></span><span className="book-cta-icon"><ArrowRight /></span></button>
            <button type="button" className="bp-later" onClick={() => close()}>Maybe later</button>
          </m.div>
          <a className="bp-call" href={`tel:${contact.phones[0].replace(/\s/g, '')}`}><Phone /> Or call us · {contact.phones[0]}</a>
        </form>
      </m.div>
    </m.div>}
  </AnimatePresence>
}
