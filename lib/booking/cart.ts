import { experiences } from '@/data/experiences'
import { courses } from '@/data/courses'

// Multi-activity booking rules: pricing, people limits, time clashes and the request message.
// Pure functions with no UI, so a booking server can re-run exactly the same checks later.

export type Option = {
  slug: string; title: string; kind: 'activity' | 'course'; image: string; imagePosition?: string
  duration: string; price?: string; minAge?: string; minPeople?: number; maxPeople?: number
}
export type CartItem = { slug: string; people: number; time: string }
export type Cart = { date: string; group: number; items: CartItem[] }

export const options: Option[] = [
  ...experiences.map(e => ({ slug: e.slug, title: e.title, kind: 'activity' as const, image: e.image, imagePosition: e.imagePosition, duration: e.duration, price: e.price, minPeople: e.minPeople, maxPeople: e.maxPeople })),
  ...courses.map(c => ({ slug: c.slug, title: c.title, kind: 'course' as const, image: c.image, imagePosition: c.imagePosition, duration: c.duration, price: c.price, minAge: c.minAge, minPeople: c.minPeople, maxPeople: c.maxPeople })),
]
export const optionOf = (slug: string) => options.find(o => o.slug === slug)

// Online requests cover up to this many guests; larger groups are better arranged with the team directly
export const MAX_GROUP = 20
// Preferred times until real slots come from a booking engine (opening hours are 9:00 – 19:00)
export const TIMES = [{ id: 'Morning', hint: '9 – 12' }, { id: 'Afternoon', hint: '12 – 4' }, { id: 'Evening', hint: '4 – 7' }]

export const unitPrice = (o?: Option) => Number(o?.price?.replace(/[^\d]/g, '') || 0)
export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`
export const priceLabel = (o: Option) => o.price ? o.price.replace(' per person', '') : 'Price on request'

// People allowed on one activity: never more than the group, and within the activity's own limits when set
export const peopleRange = (o: Option | undefined, group: number) => ({ min: Math.max(1, o?.minPeople ?? 1), max: Math.max(1, Math.min(group, o?.maxPeople ?? MAX_GROUP)) })

export function totals(cart: Cart) {
  const lines = cart.items.map(i => { const o = optionOf(i.slug); const unit = unitPrice(o); return { item: i, option: o, unit, subtotal: unit * i.people } })
  return {
    lines,
    total: lines.reduce((s, l) => s + l.subtotal, 0),
    // Activity places, not guests: one guest can take part in several activities
    places: cart.items.reduce((s, i) => s + i.people, 0),
    unpriced: lines.filter(l => !l.unit).map(l => l.option?.title ?? l.item.slug),
  }
}

// Activities in the same time window need different people: if they add up to more than the group, someone
// would have to be in two places at once
export function clashes(cart: Cart) {
  const byTime = new Map<string, CartItem[]>()
  for (const i of cart.items) if (i.time) byTime.set(i.time, [...(byTime.get(i.time) ?? []), i])
  return [...byTime].filter(([, list]) => list.length > 1 && list.reduce((s, i) => s + i.people, 0) > cart.group)
    .map(([time, list]) => ({ time, titles: list.map(i => optionOf(i.slug)?.title ?? i.slug) }))
}

// A cart holds several activities, or a single course (courses run on their own start dates and deposits)
export function addItem(items: CartItem[], slug: string, group: number): CartItem[] {
  const o = optionOf(slug)
  if (!o || items.some(i => i.slug === slug)) return items
  const item = { slug, people: Math.min(group, peopleRange(o, group).max), time: '' }
  if (o.kind === 'course') return [item]
  return [...items.filter(i => optionOf(i.slug)?.kind === 'activity'), item]
}

export function problems(cart: Cart, step: number): string[] {
  const out: string[] = []
  if (step >= 1 && !cart.date) out.push('Please choose a date.')
  if (step >= 2 && !cart.items.length) out.push('Add at least one activity.')
  if (step >= 2) for (const i of cart.items) {
    const o = optionOf(i.slug); const r = peopleRange(o, cart.group)
    if (i.people < r.min || i.people > r.max) out.push(`${o?.title}: choose ${r.min === r.max ? r.min : `${r.min}–${r.max}`} ${r.max === 1 ? 'person' : 'people'}.`)
  }
  if (step >= 3) for (const c of clashes(cart)) out.push(`${c.titles.join(' and ')} are both in the ${c.time.toLowerCase()}, but your group has ${cart.group} ${cart.group === 1 ? 'person' : 'people'}. Choose different times.`)
  return out
}

const longDate = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) }
export { longDate }

export function requestMessage(cart: Cart, customer: { name: string; phone: string; email: string }) {
  const t = totals(cart)
  const course = t.lines.length === 1 && t.lines[0].option?.kind === 'course'
  return [
    `Hello Bond Safari! I’d like to book for ${course ? 'a start date of ' : ''}${longDate(cart.date)}:`,
    `Group: ${cart.group} ${cart.group === 1 ? 'person' : 'people'}`,
    ...t.lines.map((l, n) => `${n + 1}. ${l.option?.title} — ${l.item.people} ${l.item.people === 1 ? 'person' : 'people'}${l.item.time ? ` · ${l.item.time}` : course ? '' : ' · any time'} · ${l.unit ? inr(l.subtotal) : 'price on request'}`),
    t.total ? `Total: ${inr(t.total)}${t.unpriced.length ? ' + items priced on request' : ''}` : '',
    `Name: ${customer.name.trim()}`,
    `WhatsApp: ${customer.phone.trim()}`,
    customer.email.trim() ? `Email: ${customer.email.trim()}` : '',
  ].filter(Boolean).join('\n')
}
