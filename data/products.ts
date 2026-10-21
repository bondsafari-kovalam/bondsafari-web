import { experiences, type Experience } from './experiences'
import { courses, type Course } from './courses'

// One lookup across activities and courses, used by booking, related links, the sitemap and structured data

export type Product = ({ kind: 'activity' } & Experience) | ({ kind: 'course' } & Course)

export const products: Product[] = [
  ...experiences.map(e => ({ kind: 'activity' as const, ...e })),
  ...courses.map(c => ({ kind: 'course' as const, ...c })),
]

export const hrefOf = (p: Product) => `/${p.kind === 'activity' ? 'activities' : 'courses'}/${p.slug}`

const norm = (s: string) => s.trim().toLowerCase().replace(/[+_]/g, ' ').replace(/\s+/g, ' ')

// Deep links name the product by title (?activity=Scuba+Diving) or by slug (?activity=scuba-diving)
export function findProduct(key: string | null | undefined): Product | undefined {
  if (!key) return undefined
  const k = norm(key)
  return products.find(p => p.slug === key.trim().toLowerCase() || norm(p.title) === k)
}

export const bySlug = (slug: string) => products.find(p => p.slug === slug)

export const relatedFor = (p: Product): Product[] => (p.related ?? []).map(bySlug).filter((x): x is Product => !!x)

// Products the audit and live catalogue name but which have no approved details yet. They are deliberately NOT
// published (no page, no booking) until the business supplies price, duration, eligibility and copy.
export const pendingProducts: { title: string; group: string; missing: string }[] = [
  { title: 'Second / repeat dive', group: 'Dive — next steps', missing: 'price, duration, eligibility, copy' },
  { title: 'Fun dives for certified divers', group: 'Dive — next steps', missing: 'price, dive sites, certification level required' },
  { title: 'PADI ReActivate', group: 'Dive — next steps', missing: 'price, duration, copy' },
  { title: 'Stand-up paddleboarding lesson (vs rental)', group: 'Paddle & Surf', missing: 'whether the live ₹2,500 SUP product is a lesson or a rental; second tier price' },
  { title: 'Beginner surfing lesson', group: 'Paddle & Surf', missing: 'everything — not on the live site or booking catalogue' },
  { title: 'Three-day surfing course', group: 'Paddle & Surf', missing: 'everything' },
  { title: 'Surfboard rental', group: 'Paddle & Surf', missing: 'everything' },
  { title: 'Dive + Snorkel Day', group: 'Combos & seasonal', missing: 'everything' },
  { title: 'Family Pack', group: 'Combos & seasonal', missing: 'everything' },
  { title: 'PADI Deep / Nitrox / Peak Performance Buoyancy / Underwater Photographer', group: 'Specialty', missing: 'whether offered, prices, durations' },
  { title: 'Swimming course levels and prices', group: 'Swim', missing: 'the six levels, kids vs adult prices, schedule' },
]
