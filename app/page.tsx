import { Hero } from '@/components/site'
import { TrustStrip } from '@/components/trust'
import { ExperienceStack } from '@/components/stack'
import { NextStep } from '@/components/next-step'
import { ExploreCarousel } from '@/components/explore'
import { PadiPathway } from '@/components/pathway'
import { Reviews } from '@/components/reviews'
import { TeamSection } from '@/components/team'
import { HomeBar } from '@/components/home-bar'

export default function Home() { return <main><Hero /><TrustStrip /><ExperienceStack /><NextStep /><ExploreCarousel /><PadiPathway eyebrow="Learn with Bond Academy" more /><Reviews /><TeamSection /><HomeBar /></main> }
