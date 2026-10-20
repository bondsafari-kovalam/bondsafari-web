'use client'

import Image from 'next/image'
import Link from 'next/link'
import { animate, m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { Header, Reveal } from './header'
import { experiences } from '@/data/experiences'


// Small local posters (the first thing painted) and a lighter video for phones
const posterSrcSet = '/images/hero-poster-mobile.webp 800w, /images/hero-poster.webp 1280w'

// Skip the video on data saver, slow connections and reduced motion: the poster stays instead
type NetInfo = { saveData?: boolean; effectiveType?: string }
const videoAllowed = () => {
  const c = (navigator as Navigator & { connection?: NetInfo }).connection
  return !(c?.saveData || ['slow-2g', '2g', '3g'].includes(c?.effectiveType ?? ''))
}

const ease = [0.19, 1, 0.22, 1] as const

function Mask({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) { return <span className={`mask ${className}`}><m.span className="mask-inner" initial={{ y: '101%' }} animate={{ y: 0 }} transition={{ duration: 2, ease, delay }}>{children}</m.span></span> }

export function Hero() {
  const video = useRef<HTMLVideoElement>(null)
  const section = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  // The hero stays pinned while the video shrinks into its bottom-right corner (as on casangelina.com)
  const [mobile, setMobile] = useState(false)
  useEffect(() => { const mq = window.matchMedia('(max-width: 800px)'); const update = () => setMobile(mq.matches); update(); mq.addEventListener('change', update); return () => mq.removeEventListener('change', update) }, [])
  const corner = reduce ? { sx: 1, sy: 1, x: 0, y: 0 } : mobile ? { sx: 0.44, sy: 0.2, x: 52, y: 66 } : { sx: 0.26, sy: 0.26, x: 69, y: 66 }
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const mediaX = useTransform(progress, p => `${corner.x * p}vw`)
  const mediaY = useTransform(progress, p => `${corner.y * p}vh`)
  const mediaSX = useTransform(progress, p => 1 + (corner.sx - 1) * p)
  const mediaSY = useTransform(progress, p => 1 + (corner.sy - 1) * p)
  const videoSX = useTransform(() => Math.max(mediaSX.get(), mediaSY.get()) / mediaSX.get())
  const videoSY = useTransform(() => Math.max(mediaSX.get(), mediaSY.get()) / mediaSY.get())
  const shadeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // The video mounts only after hydration, so the poster paints first and the video never competes with it
  const [playVideo, setPlayVideo] = useState(false)
  useEffect(() => { setPlayVideo(!reduce && videoAllowed()) }, [reduce])
  preload('/images/hero-poster.webp', { as: 'image', fetchPriority: 'high', imageSrcSet: posterSrcSet, imageSizes: '100vw' })
  // One scroll gesture glides the whole way: down from the top lands the video in the corner, up from there returns to full screen
  useEffect(() => {
    if (reduce) return
    let busy = false, touchY = 0
    const end = () => (section.current?.offsetHeight ?? window.innerHeight * 2) - window.innerHeight
    const glide = (dir: number) => {
      const y = window.scrollY, stop = end()
      const target = dir > 0 && y < stop - 2 ? stop : dir < 0 && y > 0 && y <= stop + 2 ? 0 : null
      if (target === null) return false
      busy = true
      animate(y, target, { duration: 1.4, ease, onUpdate: v => window.scrollTo({ top: v, behavior: 'instant' }), onComplete: () => { busy = false } })
      return true
    }
    const onWheel = (e: WheelEvent) => { if (busy || (Math.abs(e.deltaY) > 1 && glide(Math.sign(e.deltaY)))) e.preventDefault() }
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => { const d = touchY - e.touches[0].clientY; if (busy || (Math.abs(d) > 8 && glide(Math.sign(d)))) e.preventDefault() }
    const onKey = (e: KeyboardEvent) => { if ((e.target as HTMLElement).closest('input, select, textarea, button, a')) return; const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) && !e.shiftKey ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0; if (dir && (busy || glide(dir))) e.preventDefault() }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('wheel', onWheel); window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('keydown', onKey) }
  }, [reduce])
  return <section ref={section} className="hero-scene"><div className="hero">
    <m.div className="hero-media" style={{ x: mediaX, y: mediaY, scaleX: mediaSX, scaleY: mediaSY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3, ease }}><m.div className="hero-media-inner" style={{ scaleX: videoSX, scaleY: videoSY }}>
      <img className="hero-poster" src="/images/hero-poster.webp" srcSet={posterSrcSet} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
      {playVideo && <video ref={video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source media="(max-width: 800px)" src="/videos/scuba-540.mp4" type="video/mp4" /><source src="/videos/scuba-720.mp4" type="video/mp4" /></video>}
    </m.div></m.div>
    <m.div className="hero-shade" style={{ opacity: shadeOpacity }} />
    {/* Fade only: a transform here would trap the fixed header inside the hero */}
    <m.div className="hero-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease, delay: 1.2 }}><Header /></m.div>
    <div className="hero-center">
      <m.span className="hero-mark" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease, delay: 0.4 }}>BS</m.span>
      <h1><Mask delay={0.6}>Bond Safari</Mask></h1>
      <p className="hero-tagline"><Mask delay={0.85}>Discover a world beneath the waves</Mask></p>
    </div>
    <m.div className="hero-scroll" style={{ opacity: contentOpacity }}>
      <m.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease, delay: 1.4 }}><ArrowDown /></m.span>
      <Mask delay={1.5}>Scroll down<br />to start the experience</Mask>
    </m.div>
  </div></section>
}

function Words({ text, delay = 0, step = 0.1, duration = 2 }: { text: string; delay?: number; step?: number; duration?: number }) { const words = text.split(' '); return <>{words.map((word, i) => <m.span key={i} initial={{ y: '101%' }} whileInView={{ y: 0 }} viewport={{ amount: 0.5 }} transition={{ duration, ease, delay: delay + i * step }}>{word}{i < words.length - 1 ? '\u00a0' : ''}</m.span>)}</> }

export function HeroStatement() {
  const strip = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: strip, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  return <section className="statement" aria-label="Dive beyond limits. Find another world.">
    <div className="statement-look">{'DIVE'.split('').map((ch, i) => <m.span key={i} initial={{ y: '101%' }} whileInView={{ y: 0 }} viewport={{ amount: 0.5 }} transition={{ duration: 2, ease, delay: i * 0.1 }}>{ch}</m.span>)}<span className="statement-limits"><Words text="BEYOND LIMITS." delay={0.4} duration={3} /></span></div>
    <div ref={strip} className="statement-strip"><m.div style={{ y }} className="statement-strip-img"><Image src="/images/coral-reef.webp" alt="Coral reef in clear blue water" fill sizes="75vw" /></m.div></div>
    <div className="statement-find"><Words text="FIND" /></div>
    <div className="statement-world"><Words text="ANOTHER WORLD." step={0.15} /></div>
  </section>
}

export function BookingBar() { return <section className="booking-bar"><div><span>01</span><label>Choose your experience<select defaultValue=""><option value="" disabled>Select an activity</option>{experiences.map(e => <option key={e.slug}>{e.title}</option>)}</select></label></div><div><span>02</span><label>When are you joining us?<input type="date" /></label></div><div><span>03</span><label>Guests<select defaultValue="2"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label></div><Link className="bar-submit" href="/booking">Continue <ArrowRight /></Link></section> }

export function ExperienceCard({ experience, index = 0 }: { experience: typeof experiences[number]; index?: number }) { return <Reveal className={`experience-card card-${index}`}><Link href={`/experiences/${experience.slug}`}><div className="image-wrap"><Image src={experience.image} alt={experience.title} fill sizes="(max-width: 768px) 100vw, 50vw" /></div><div className="card-meta"><span>{experience.category}</span><span>{experience.duration}</span></div><h3>{experience.title}</h3><p>{experience.description}</p><span className="text-link">Discover more <ArrowRight /></span></Link></Reveal> }
