'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowDown, ArrowRight, Backpack, Clock, Compass, Eye, Gauge, Glasses, MapPin, ShieldCheck, Shirt, Store, Target } from 'lucide-react'
import { useRef } from 'react'
import { contact } from '@/data/site'
import { Header } from './site'

const ease = [0.19, 1, 0.22, 1] as const
const teamPhoto = '/images/team.webp'

const history = 'Bond Safari Kovalam is a team of adventurous and experienced Indian businessmen, partnered with Cool Divers SL from Spain to bring a state-of-the-art scuba diving experience to Kerala, India.'

const pillars = [
  { icon: Target, label: 'Our goal', title: 'State-of-the-art adventure', text: 'To develop state-of-the-art adventure tourism products in India.' },
  { icon: Eye, label: 'Our vision', title: 'Revolutionise adventure tourism', text: 'To revolutionise the adventure tourism industry in India through innovative and exciting adventure tourism products.' },
  { icon: Compass, label: 'Our mission', title: 'World-class partners', text: 'To partner with companies operating across the world with revolutionary, adrenaline-pumping yet absolutely safe adventure products — and bring them to the right Indian market.' },
]

const activities = ['Snorkel', 'Dive', 'Swim', 'Sail', 'Get suntanned']

const store = [
  { icon: Backpack, title: 'Rental equipment', text: 'Quality gear, ready for the day' },
  { icon: Compass, title: 'Diving & snorkelling gear', text: 'A fully stocked retail shop' },
  { icon: Gauge, title: 'Dive computers', text: 'Track every descent' },
  { icon: Shirt, title: 'Wetsuits', text: 'For warm tropical waters' },
  { icon: ShieldCheck, title: 'Rash guards', text: 'Sun and reef protection' },
  { icon: Glasses, title: 'Goggles', text: 'See the marine world clearly' },
]

function Mask({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <span className="mask"><motion.span className="mask-inner" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 1.6, ease, delay }}>{children}</motion.span></span>
}

// Words brighten one by one as the paragraph scrolls through the viewport
function Word({ word, i, total, progress }: { word: string; i: number; total: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / total, (i + 1) / total], [0.14, 1])
  return <motion.span style={{ opacity }}>{word} </motion.span>
}
function ScrollText({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] })
  const words = text.split(' ')
  if (reduce) return <p className="ab-history-text">{text}</p>
  return <p ref={ref} className="ab-history-text" aria-label={text}>{words.map((w, i) => <Word key={i} word={w} i={i} total={words.length} progress={scrollYProgress} />)}</p>
}

const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 1, ease, delay: i * 0.12 } }) }

export function About() {
  const reduce = useReducedMotion()
  const hero = useRef<HTMLElement>(null)
  const collage = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLElement>(null)
  const { scrollYProgress: heroP } = useScroll({ target: hero, offset: ['start start', 'end start'] })
  const heroScale = useTransform(heroP, [0, 1], [1, reduce ? 1 : 1.18])
  const heroY = useTransform(heroP, [0, 1], ['0%', reduce ? '0%' : '30%'])
  const heroFade = useTransform(heroP, [0, 0.7], [1, 0])
  const { scrollYProgress: colP } = useScroll({ target: collage, offset: ['start end', 'end start'] })
  const backY = useTransform(colP, [0, 1], reduce ? ['0%', '0%'] : ['10%', '-10%'])
  const frontY = useTransform(colP, [0, 1], reduce ? ['0%', '0%'] : ['30%', '-25%'])
  const { scrollYProgress: bandP } = useScroll({ target: band, offset: ['start end', 'end start'] })
  const bandY = useTransform(bandP, [0, 1], reduce ? ['0%', '0%'] : ['-12%', '12%'])
  const bandClip = useTransform(bandP, [0, 0.45], reduce ? ['inset(0% 0% round 0px)', 'inset(0% 0% round 0px)'] : ['inset(8% 10% round 32px)', 'inset(0% 0% round 0px)'])

  return <main className="ab">
    <Header />

    <section ref={hero} className="ab-hero">
      <motion.div className="ab-hero-media" style={{ scale: heroScale, y: heroY }}><Image src="/images/dive-safari.webp" alt="" fill sizes="100vw" priority /></motion.div>
      <div className="ab-hero-shade" />
      <motion.div className="ab-hero-content" style={{ opacity: heroFade }}>
        <motion.p className="eyebrow light" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease, delay: 0.2 }}>Our history · Kovalam, Kerala</motion.p>
        <h1><Mask delay={0.3}>Born in Kerala.</Mask><br /><Mask delay={0.45}><i>Built for the deep.</i></Mask></h1>
        <motion.div className="ab-hero-foot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1 }}>
          <span className="ab-partner"><b>In partnership with</b>Cool Divers SL · Spain</span>
          <span className="ab-scroll">Scroll <ArrowDown /></span>
        </motion.div>
      </motion.div>
    </section>

    <section className="ab-history section">
      <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise}>01 — Our history</motion.p>
      <ScrollText text={history} />
    </section>

    <section className="ab-pillars section">
      <div className="ab-pillars-head">
        <motion.p className="eyebrow light" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise}>02 — What drives us</motion.p>
        <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={1}>Goal, vision<br /><i>&amp; mission.</i></motion.h2>
      </div>
      <div className="ab-pillar-grid">
        {pillars.map((p, i) => <motion.article key={p.label} className="ab-pillar" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={rise} custom={i}>
          <div className="ab-pillar-top"><span className="ab-pillar-num">{String(i + 1).padStart(2, '0')}</span><span className="ab-pillar-icon"><p.icon /></span></div>
          <p className="ab-pillar-label">{p.label}</p>
          <h3>{p.title}</h3>
          <p>{p.text}</p>
        </motion.article>)}
      </div>
    </section>

    <div className="ab-marquee" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{activities.map(a => <em key={a}>{a}<i>✦</i></em>)}</span>)}</div></div>

    <section className="ab-welcome section">
      <div ref={collage} className="ab-collage">
        <motion.div className="ab-collage-back" style={{ y: backY }}><Image src="/images/sea-life.webp" alt="Marine life at Kovalam" fill sizes="(max-width: 800px) 80vw, 34vw" /></motion.div>
        <motion.div className="ab-collage-front" style={{ y: frontY }}><Image src="/images/scuba.webp" alt="A diver exploring underwater" fill sizes="(max-width: 800px) 55vw, 22vw" /></motion.div>
        <span className="ab-collage-badge">On &amp;<br /><i>under</i><br />the water</span>
      </div>
      <motion.div className="ab-welcome-copy" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
        <motion.p className="eyebrow" variants={rise}>03 — Welcome aboard</motion.p>
        <motion.h2 variants={rise} custom={1}>Explore a world<br /><i>on &amp; under the water.</i></motion.h2>
        <motion.p className="ab-lead" variants={rise} custom={2}>Come visit us and spend some time with our professional, courteous and fun-loving scuba diving team in Kerala. Let us take you on a wonderful journey on one of our beautiful, well-maintained boats.</motion.p>
        <motion.ul className="ab-chips" variants={rise} custom={3}>{activities.map(a => <li key={a}>{a}</li>)}</motion.ul>
        <motion.p className="ab-note" variants={rise} custom={4}>No matter which water activity you choose, we have all the quality equipment and supplies you need to get the most out of your vacation.</motion.p>
      </motion.div>
    </section>

    <section ref={band} className="ab-band">
      <motion.div className="ab-band-frame" style={{ clipPath: bandClip }}>
        <motion.div className="ab-band-media" style={{ y: bandY }}><Image src={teamPhoto} alt="The Bond Safari dive team taking an ocean pledge on Kovalam beach" fill sizes="100vw" /></motion.div>
        <div className="ab-band-caption"><p className="eyebrow light">The team</p><p>Professional, courteous &amp; fun-loving.</p></div>
      </motion.div>
    </section>

    <section className="ab-centre section">
      <div className="ab-centre-head">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.p className="eyebrow" variants={rise}>04 — Visit our scuba diving centre</motion.p>
          <motion.h2 variants={rise} custom={1}>Everything you need,<br /><i>in one place.</i></motion.h2>
        </motion.div>
        <motion.p className="ab-lead" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise} custom={2}>Our diving centre has quality rental equipment and a fully stocked retail shop, with just about anything you need for the beautiful tropical waters of Kerala.</motion.p>
      </div>
      <div className="ab-store">
        {store.map((s, i) => <motion.div key={s.title} className="ab-store-item" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} variants={rise} custom={i % 3}>
          <span className="ab-store-icon"><s.icon /></span>
          <div><h3>{s.title}</h3><p>{s.text}</p></div>
        </motion.div>)}
      </div>
      <motion.div className="ab-visit" initial="hidden" whileInView="show" viewport={{ once: true }} variants={rise}>
        <p className="ab-visit-extra"><Store /> Our store also carries shirts, shorts, shoes and caps for when you aren’t on the water.</p>
        <div className="ab-visit-info">
          <a href={contact.mapUrl} target="_blank" rel="noreferrer"><MapPin /><span>{contact.address.join(', ')}</span></a>
          <span><Clock /><span>{contact.hours}</span></span>
        </div>
      </motion.div>
    </section>

    <section className="ab-cta">
      <Image src="/images/sea-life.webp" alt="" fill sizes="100vw" />
      <motion.div className="ab-cta-inner" initial="hidden" whileInView="show" viewport={{ once: true }}>
        <motion.p className="eyebrow light" variants={rise}>Your next story</motion.p>
        <motion.h2 variants={rise} custom={1}>Start your underwater<br /><i>adventure now.</i></motion.h2>
        <motion.div className="ab-cta-actions" variants={rise} custom={2}>
          <Link className="book-cta" href="/booking"><span className="book-cta-label"><strong>Book now</strong><small>Reserve your spot</small></span><span className="book-cta-icon"><ArrowRight /></span></Link>
          <Link className="text-link light" href="/contact">Get in touch <ArrowRight /></Link>
        </motion.div>
      </motion.div>
    </section>
  </main>
}
