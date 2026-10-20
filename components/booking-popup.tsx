'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Phone, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'
import { contact } from '@/data/site'

const KEY = 'bs-booking-popup-seen'
const ease = [0.19, 1, 0.22, 1] as const
const options = [...experiences.map(e => e.title), ...courses.map(c => c.title)]

// Detail pages map to the item they show, so the popup can open with it preselected
const detailTitle = (path: string) => {
  const [, section, slug] = path.split('/')
  if (section === 'experiences') return experiences.find(e => e.slug === slug)?.title
  if (section === 'courses') return courses.find(c => c.slug === slug)?.title
}

// Detail pages stay hidden behind the popup until it is dismissed for that path; the page's intro waits for it
let dismissed: string | null = null
const subs = new Set<() => void>()
const setDismissed = (path: string | null) => { dismissed = path; subs.forEach(f => f()) }
export function usePageRevealed() {
  const pathname = usePathname()
  const [path, setPath] = useState<string | null>(null)
  useEffect(() => { const f = () => setPath(dismissed); f(); subs.add(f); return () => { subs.delete(f) } }, [])
  return path === pathname
}

// Every arrival on a detail page (direct or by clicking) opens it first, preselected; elsewhere it shows once per session
export function BookingPopup() {
  const pathname = usePathname()
  const router = useRouter()
  const reduce = useReducedMotion()
  const preset = detailTitle(pathname)
  const [done, setDone] = useState<string | null>(null)
  const [promo, setPromo] = useState(false)
  const gate = !!preset && done !== pathname
  const open = gate || promo
  const dialog = useRef<HTMLDivElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  const close = () => { if (gate) { setDone(pathname); setDismissed(pathname) } setPromo(false) }

  // Leaving a dismissed page re-arms the gate, so coming back to it shows the popup again
  useEffect(() => { if (done && done !== pathname) { setDone(null); setDismissed(null) } }, [pathname, done])

  useEffect(() => {
    if (preset || pathname.startsWith('/booking')) { try { sessionStorage.setItem(KEY, '1') } catch {} ; return }
    let seen = false
    try { seen = sessionStorage.getItem(KEY) === '1' } catch {}
    if (seen) return
    const t = setTimeout(() => { lastFocus.current = document.activeElement as HTMLElement; setPromo(true); try { sessionStorage.setItem(KEY, '1') } catch {} }, pathname === '/' ? 2600 : 1400)
    return () => clearTimeout(t)
    // Only on first load, not on every client-side navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('select')?.focus())
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); lastFocus.current?.focus?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, gate, pathname])

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const q = new URLSearchParams()
    for (const k of ['activity', 'date', 'guests']) { const v = data.get(k); if (v) q.set(k, String(v)) }
    close()
    router.push(`/booking?${q}`)
  }

  return <AnimatePresence>
    {open && <motion.div key={gate ? pathname : 'promo'} className={gate ? 'bp bp-gate' : 'bp'} initial={gate ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: gate ? 0.7 : 0.4 }} onClick={() => close()}>
      <motion.div ref={dialog} className="bp-dialog" role="dialog" aria-modal="true" aria-labelledby="bp-title" onClick={e => e.stopPropagation()}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 60, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }} transition={{ duration: 0.9, ease }}>
        <button className="bp-close" onClick={() => close()} aria-label="Close"><X /></button>
        <div className="bp-media">
          <motion.div className="bp-media-inner" initial={reduce ? false : { scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 2.2, ease }}><Image src="/images/scuba.webp" alt="" fill sizes="(max-width: 800px) 100vw, 420px" /></motion.div>
          <div className="bp-media-text"><span>Kovalam · Kerala</span><p>Feel the marvels<br /><i>hidden beneath.</i></p></div>
        </div>
        <form className="bp-form" onSubmit={submit}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.25 }}>
            <p className="eyebrow">Plan your adventure</p>
            <h2 id="bp-title">Book your<br /><i>underwater day.</i></h2>
            <p className="bp-sub">No diving experience needed. Choose an adventure and we’ll take care of the rest.</p>
          </motion.div>
          <motion.div className="bp-fields" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.4 }}>
            <label className="bp-wide">Experience<select name="activity" defaultValue={preset ?? options[0]}>{options.map(o => <option key={o}>{o}</option>)}</select></label>
            <label>Date<input name="date" type="date" min={today} defaultValue={today} /></label>
            <label>Guests<select name="guests" defaultValue="2">{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select></label>
          </motion.div>
          <motion.div className="bp-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 0.55 }}>
            <button type="submit" className="book-cta"><span className="book-cta-label"><strong>Continue</strong><small>Reserve your spot</small></span><span className="book-cta-icon"><ArrowRight /></span></button>
            <button type="button" className="bp-later" onClick={() => close()}>{gate ? 'View details first' : 'Maybe later'}</button>
          </motion.div>
          <a className="bp-call" href={`tel:${contact.phones[0].replace(/\s/g, '')}`}><Phone /> Or call us · {contact.phones[0]}</a>
        </form>
      </motion.div>
    </motion.div>}
  </AnimatePresence>
}
