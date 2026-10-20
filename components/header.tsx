'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, m } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useState } from 'react'

// Kept out of site.tsx so inner pages don't download the home hero's code just to render the header

const nav = [['Home','/'], ['Experiences','/experiences'], ['Courses','/courses'], ['About','/about'], ['Gallery','/gallery'], ['News','/news'], ['Contact','/contact']]

export function Header() {
  const [open, setOpen] = useState(false)
  return <header className="site-header"><Link className="brand brand-logo" href="/" aria-label="Bond Safari home"><Image src="/images/logo.webp" alt="Bond Safari" width={333} height={200} priority /></Link><nav className="desktop-nav">{nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><div className="header-actions"><Link className="pill pill-light" href="/booking">Book now <ArrowRight /></Link><button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X /> : <Menu />}</button></div><AnimatePresence>{open && <m.nav className="mobile-nav" initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>{nav.map(([label, href]) => <Link onClick={() => setOpen(false)} key={href} href={href}>{label}<ArrowRight /></Link>)}<Link className="pill pill-dark" href="/booking">Book your adventure <ArrowRight /></Link></m.nav>}</AnimatePresence></header>
}

export function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) { return <m.div className={className} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true, margin:'-80px'}} transition={{duration:.7, ease:[.22,1,.36,1]}}>{children}</m.div> }
