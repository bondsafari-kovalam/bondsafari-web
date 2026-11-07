'use client'

import { create } from 'zustand'
import { experiences, type Experience } from '@/data/experiences'
import type { LogoutEvent } from '@/lib/booking/logout'
import { getActivities } from './api'

type ActivityState = {
  activities: Experience[]
  isLoading: boolean
  error: string | null
  hasLoaded: boolean
  fetchActivities: () => Promise<void>
}

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')

function toExperience(event: LogoutEvent): Experience {
  const eventSlug = slugify(event.slug || event.name)
  const titleSlug = slugify(event.name)
  const curated = experiences.find(item => item.slug === event.product)
    ?? experiences.find(item => item.slug === eventSlug)
    ?? experiences.find(item => titleSlug.includes(slugify(item.title)) || slugify(item.title).includes(titleSlug))
  const price = event.price ? `₹${event.price.toLocaleString('en-IN')} per person` : undefined

  return {
    ...(curated ?? {
      tagline: event.tag || 'Discover the water around Kovalam.',
      overview: [`Join us for ${event.name} with Bond Safari.`],
      category: 'Activity',
      eyebrow: 'Kovalam, Kerala',
      description: `Discover ${event.name} with Bond Safari.`,
      details: [],
      image: '/images/bond-safari.webp',
    }),
    slug: curated?.slug || event.slug || eventSlug,
    title: event.name,
    tagline: curated?.tagline || event.tag || `Discover ${event.name}.`,
    description: curated?.description || `Discover ${event.name} with Bond Safari.`,
    duration: event.hours ? `${event.hours} hours` : curated?.duration || 'Contact us',
    price: price || curated?.price,
    image: curated?.image ?? '/images/bond-safari.webp',
  }
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: experiences,
  isLoading: false,
  error: null,
  hasLoaded: false,
  fetchActivities: async () => {
    if (get().isLoading || get().hasLoaded) return
    set({ isLoading: true, error: null })
    try {
      const events = await getActivities()
      set({ activities: events.map(toExperience), isLoading: false, hasLoaded: true })
    } catch {
      set({ error: 'Activities could not be refreshed.', isLoading: false, hasLoaded: true })
    }
  },
}))
