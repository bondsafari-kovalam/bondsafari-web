'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'

// Friendly robot head: antenna light pulses and the eyes blink, so it reads as an AI assistant
function RobotIcon({ className = '' }: { className?: string }) {
  return <svg className={`cb-robot ${className}`} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <line x1="16" y1="4.5" x2="16" y2="8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle className="cb-robot-light" cx="16" cy="3.6" r="2" />
    <rect x="5.5" y="8.5" width="21" height="16" rx="6" stroke="currentColor" strokeWidth="1.8" />
    <rect x="2" y="13.5" width="3.5" height="6" rx="1.5" fill="currentColor" />
    <rect x="26.5" y="13.5" width="3.5" height="6" rx="1.5" fill="currentColor" />
    <g className="cb-robot-eyes"><circle cx="12" cy="15.5" r="2.1" fill="currentColor" /><circle cx="20" cy="15.5" r="2.1" fill="currentColor" /></g>
    <path d="M12.5 20.2c1.9 1.4 5.1 1.4 7 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M11 24.5v2.5h10v-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
}

type Message = { role: 'user' | 'assistant'; text: string }

const ease = [0.19, 1, 0.22, 1] as const
const greeting: Message = { role: 'assistant', text: 'Hi! I’m the Bond Safari AI assistant 🤖 Ask me about our dives, the underwater scooter, courses or bookings.' }
const suggestions = ['How do I book?', 'Do I need to swim?', 'Opening hours']

// Placeholder until the AI integration lands: replace with a call to the chat API, given the full history
async function getReply(history: Message[]): Promise<string> {
  void history
  await new Promise(r => setTimeout(r, 900))
  return 'Thanks for your message! Our AI assistant is coming soon. Meanwhile, call us on +91 84484 48846 or use Book now.'
}

export function ChatBot() {
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([greeting])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLInputElement>(null)

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }) }, [messages, typing, reduce])
  useEffect(() => {
    if (!open) return
    field.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text: string) => {
    const t = text.trim()
    if (!t || typing) return
    const history = [...messages, { role: 'user' as const, text: t }]
    setMessages(history); setInput(''); setTyping(true)
    try { const reply = await getReply(history); setMessages(m => [...m, { role: 'assistant', text: reply }]) }
    finally { setTyping(false) }
  }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); send(input) }

  return <>
    <AnimatePresence>
      {open && <motion.section className="cb-panel" role="dialog" aria-label="Chat with Bond Safari" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }} transition={{ duration: 0.5, ease }}>
        <header className="cb-head">
          <span className="cb-avatar"><RobotIcon /></span>
          <div><b>Bond Safari AI assistant</b><span><i /> AI powered · online</span></div>
          <button onClick={() => setOpen(false)} aria-label="Close chat"><X /></button>
        </header>
        <div ref={list} className="cb-list" aria-live="polite">
          {messages.map((m, i) => <motion.p key={i} className={`cb-msg cb-${m.role}`} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>{m.text}</motion.p>)}
          {typing && <p className="cb-msg cb-assistant cb-typing" aria-label="Assistant is typing"><i /><i /><i /></p>}
          {messages.length === 1 && <div className="cb-suggest">{suggestions.map(s => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>}
        </div>
        <form className="cb-form" onSubmit={onSubmit}>
          <input ref={field} value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message…" aria-label="Message" />
          <button type="submit" disabled={!input.trim() || typing} aria-label="Send"><ArrowUp /></button>
        </form>
      </motion.section>}
    </AnimatePresence>
    <button className={open ? 'cb-launcher open' : 'cb-launcher'} onClick={() => setOpen(o => !o)} aria-label={open ? 'Close AI assistant' : 'Chat with our AI assistant'} aria-expanded={open}>
      <span className="cb-icon cb-icon-chat"><RobotIcon /></span>
      <span className="cb-icon cb-icon-close"><X /></span>
      {!open && <span className="cb-badge" aria-hidden="true">AI</span>}
      {!open && <span className="cb-tip" aria-hidden="true">Ask our AI assistant</span>}
    </button>
  </>
}
