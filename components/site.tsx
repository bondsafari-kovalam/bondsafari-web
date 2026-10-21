'use client'

import Image from 'next/image'
import Link from 'next/link'
import { m, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { preload } from 'react-dom'
import { Header, Reveal } from './header'
import { experiences } from '@/data/experiences'
import { whatsappLink } from '@/data/site'
import { WhatsAppIcon } from './whatsapp'


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
  const reduce = useReducedMotion()
  // The video mounts only after hydration, so the poster paints first and the video never competes with it
  const [playVideo, setPlayVideo] = useState(false)
  useEffect(() => { setPlayVideo(!reduce && videoAllowed()) }, [reduce])
  preload('/images/hero-poster.webp', { as: 'image', fetchPriority: 'high', imageSrcSet: posterSrcSet, imageSizes: '100vw' })
  // The video stays fixed behind the page while the content slides over it; once covered it pauses and stops painting
  const scene = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [covered, setCovered] = useState(false)
  useEffect(() => {
    const el = scene.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setCovered(!e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => { const v = video.current; if (!v) return; if (covered) v.pause(); else v.play().catch(() => {}) }, [covered, playVideo])
  return <section ref={scene} className={covered ? 'hero-scene is-covered' : 'hero-scene'}><div className="hero">
    <m.div className="hero-media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 3, ease }}><div className="hero-media-inner">
      <img className="hero-poster" src="/images/hero-poster.webp" srcSet={posterSrcSet} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
      {playVideo && <video ref={video} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source media="(max-width: 800px)" src="/videos/scuba-540.mp4" type="video/mp4" /><source src="/videos/scuba-720.mp4" type="video/mp4" /></video>}
    </div></m.div>
    <div className="hero-shade" />
    {/* Fade only: a transform here would trap the fixed header inside the hero */}
    <m.div className="hero-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, ease, delay: 1.2 }}><Header /></m.div>
    <div className="hero-center">
      <m.span className="hero-mark" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease, delay: 0.4 }}>BS</m.span>
      {/* The tagline sits inside the h1 so the heading carries "scuba diving in Kerala" for search, without changing the look */}
      <h1><span className="hero-title"><Mask delay={0.6}>Bond Safari</Mask></span><span className="hero-tagline"><Mask delay={0.85}>Underwater scooter rides &amp; scuba diving in Kerala</Mask></span></h1>
    </div>
    <div className="hero-scroll">
      <m.span className="hero-ctas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease, delay: 1.4 }}>
        <Link className="pill pill-light hero-book" href="/booking">Book now <ArrowRight /></Link>
        <a className="pill pill-sand hero-wa" href={whatsappLink('Hello Bond Safari! I’d like to book an adventure in Kovalam.')} target="_blank" rel="noreferrer"><WhatsAppIcon /> WhatsApp</a>
      </m.span>
    </div>
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

export function BookingBar() { return <section className="booking-bar"><div><span>01</span><label>Choose your activity<select defaultValue=""><option value="" disabled>Select an activity</option>{experiences.map(e => <option key={e.slug}>{e.title}</option>)}</select></label></div><div><span>02</span><label>When are you joining us?<input type="date" /></label></div><div><span>03</span><label>Guests<select defaultValue="2"><option>1 guest</option><option>2 guests</option><option>3 guests</option><option>4 guests</option></select></label></div><Link className="bar-submit" href="/booking">Continue <ArrowRight /></Link></section> }

export function ExperienceCard({ experience, index = 0 }: { experience: typeof experiences[number]; index?: number }) { return <Reveal className={`experience-card card-${index}`}><Link href={`/activities/${experience.slug}`}><div className="image-wrap"><Image src={experience.image} alt={experience.title} fill sizes="(max-width: 768px) 100vw, 50vw" /></div><div className="card-meta"><span>{experience.category}</span><span>{experience.duration}</span></div><h3>{experience.title}</h3><p>{experience.description}</p><span className="text-link">Discover more <ArrowRight /></span></Link></Reveal> }
