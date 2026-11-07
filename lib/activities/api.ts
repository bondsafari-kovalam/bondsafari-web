import axios from 'axios'
import type { LogoutEvent } from '@/lib/booking/logout'

type ActivityEventsResponse = { events: LogoutEvent[] }

const activitiesApi = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

export async function getActivities() {
  const { data } = await activitiesApi.get<ActivityEventsResponse>('/booking/events')
  return data.events
}
