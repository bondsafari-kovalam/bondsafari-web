'use client'

import dynamic from 'next/dynamic'

// The chatbot and booking popup aren't needed for first paint: load their code after the page is interactive
const ChatBot = dynamic(() => import('./chatbot').then(m => m.ChatBot), { ssr: false })
const BookingPopup = dynamic(() => import('./booking-popup').then(m => m.BookingPopup), { ssr: false })

export function Widgets() {
  return <><BookingPopup /><ChatBot /></>
}
