import { BookingFlow } from '@/components/booking/booking'
export const metadata = { title: 'Book your adventure | Bond Safari', description: 'Choose a date, your group and your activities in Kovalam. We confirm your slots on WhatsApp before you pay.', alternates: { canonical: '/booking' } }
// Keyed by the link, so a new Book link (e.g. from the header while already here) starts a fresh booking
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { const q = await searchParams; return <BookingFlow key={JSON.stringify(q)} /> }
