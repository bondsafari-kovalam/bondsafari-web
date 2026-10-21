import { Hero } from '@/components/site'
import { TrustStrip } from '@/components/trust'
import { ExperienceStack } from '@/components/stack'
import { NextStep } from '@/components/next-step'
import { ExploreCarousel } from '@/components/explore'
import { PadiPathway } from '@/components/pathway'
import { Reviews } from '@/components/reviews'
import { PressSection } from '@/components/press'
import { TeamSection } from '@/components/team'
import { HomeBar } from '@/components/home-bar'
import { MapSection } from '@/components/map'

export default function Home() { return <main><Hero /><div className="home-body"><TrustStrip /><ExperienceStack /><NextStep /><ExploreCarousel /><PadiPathway eyebrow="Learn with Bond Academy" more /><Reviews /><PressSection /><TeamSection /><MapSection eyebrow="Plan your visit" /><HomeBar /></div></main> }
