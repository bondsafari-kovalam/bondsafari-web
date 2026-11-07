import { errorResponse } from '@/lib/booking/server'
import { logoutEvents } from '@/lib/booking/logout'

// The company's events from logout.world, reduced to the fields that are safe to show
export async function GET() {
  try {
    return Response.json({ events: await logoutEvents() })
  } catch (e) { return errorResponse(e) }
}
