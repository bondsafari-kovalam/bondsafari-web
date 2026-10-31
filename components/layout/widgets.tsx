'use client'

import dynamic from 'next/dynamic'

// The chatbot and booking popup aren't needed for first paint: load their code after the page is interactive
const ChatBot = dynamic(() => import('@/components/layout/chatbot').then(m => m.ChatBot), { ssr: false })
const BookingPopup = dynamic(() => import('@/components/booking/booking-popup').then(m => m.BookingPopup), { ssr: false })
// The between-pages loading screen is only needed once the visitor starts clicking around
const PageLoader = dynamic(() => import('@/components/layout/page-loader').then(m => m.PageLoader), { ssr: false })

export function Widgets() {
  return <><BookingPopup /><ChatBot /><PageLoader /></>
}
