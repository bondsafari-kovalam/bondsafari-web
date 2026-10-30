import Image from 'next/image'
import { press } from '@/data/site'
import { Reveal, Header } from '@/components/layout/header'

export function PageIntro({ eyebrow, title, copy, image }: { eyebrow: string; title: React.ReactNode; copy: string; image: string }) { return <><Header /><section className="page-intro"><Image src={image} alt="" fill sizes="100vw" priority /><div><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div></section></> }
export function NewsPage() { return <main><PageIntro eyebrow="Bond Safari in the news" title={<>Stories from<br /><i>beneath the waves.</i></>} copy="India’s first underwater wedding, the world’s first underwater CEO conference and our work against ocean plastic." image="/images/coral-reef.webp" /><section className="listing section"><div className="news-list">{press.map(p => <Reveal key={p.title} className="news-row"><p className="eyebrow">{p.topic}</p><h2>{p.title}</h2><p>{p.outlets.join(' · ')}</p></Reveal>)}</div></section></main> }
