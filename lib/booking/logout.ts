import slugs from '@/data/logout-slugs.json'
import { BackendError } from '@/lib/booking/server'

// Server-only: reads the company's events from logout.world. The raw response carries staff names, phone numbers and
// booking counts, so only the fields in LogoutEvent ever leave this file. LOGOUT_API_TOKEN is sent as a Bearer token.

const EVENTS_URL = 'https://logout.world/api/company/events/'
// Events change rarely, and the booking pages shouldn't wait on logout.world for every visitor
const REVALIDATE_SECONDS = 300

// Our product slug → its logout.world event slug. Our slugs are in URLs and carts, so they stay as they are.
const eventSlugs: Record<string, string> = slugs
const productOf = (eventSlug: string) => Object.keys(eventSlugs).find(k => eventSlugs[k] === eventSlug)

type RawEvent = { id: number; slug: string; name: string; publish: boolean; soldout: boolean; price: number | null; min_booking_price: number | null; number_of_hours: number | null; minimum_age: number | null; meetingpoint: string | null; event_card_tags: string | null }
type EventPage = { total_pages: number; results: RawEvent[] }

export type LogoutEvent = { id: number; slug: string; product?: string; name: string; published: boolean; soldOut: boolean; price?: number; minBooking?: number; hours?: number; minAge?: number; meetingPoint?: string; tag?: string }

async function eventPage(page: number, token: string) {
  let res: Response
  try {
    res = await fetch(`${EVENTS_URL}?page=${page}`, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' }, next: { revalidate: REVALIDATE_SECONDS }, signal: AbortSignal.timeout(10_000) })
  } catch {
    throw new BackendError(502, 'logout_unreachable', 'The booking system is not responding. Please try again in a moment.')
  }
  if (!res.ok) throw new BackendError(502, 'logout_error', 'The booking system returned an error.')
  return await res.json() as EventPage
}

// Events we sell on this site, plus anything published on logout.world. Unpublished events with no product here
// are drafts and private listings, so they stay out.
export async function logoutEvents(): Promise<LogoutEvent[]> {
  const token = process.env.LOGOUT_API_TOKEN?.trim()
  if (!token) throw new BackendError(503, 'not_configured', 'Online booking is not connected yet.')
  const first = await eventPage(1, token)
  const rest = await Promise.all(Array.from({ length: Math.max(first.total_pages - 1, 0) }, (_, i) => eventPage(i + 2, token)))
  return [first, ...rest].flatMap(p => p.results).filter(e => e.publish || productOf(e.slug)).map(e => ({
    id: e.id,
    slug: e.slug,
    product: productOf(e.slug),
    name: e.name,
    published: e.publish,
    soldOut: e.soldout,
    price: e.price ?? undefined,
    minBooking: e.min_booking_price ?? undefined,
    hours: e.number_of_hours ?? undefined,
    minAge: e.minimum_age ?? undefined,
    meetingPoint: e.meetingpoint ?? undefined,
    tag: e.event_card_tags ?? undefined,
  }))
}
