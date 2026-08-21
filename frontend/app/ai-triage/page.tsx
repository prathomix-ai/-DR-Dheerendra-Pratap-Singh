'use client'
import { useState, useRef, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Brain, Download, RefreshCw, Bot, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import FloatingActions from '@/components/FloatingActions'
import MedicalAnatomyMap from '@/components/MedicalAnatomyMap'
import { isSupabaseConfigured, supabase, getStoredUser } from '@/lib/auth'
import { triageAPI } from '@/lib/api'
import { type Lang } from '@/lib/i18n'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'

interface Message { role: 'user'|'ai'; content: string; timestamp?: Date; suggestions?: string[] }

const QUICK_REPLIES: Record<Lang, string[]> = {
  en:       ['I have sharp pain 🔴','Dull aching pain 🟡','Pain when moving 🔵','Stiffness in morning ⚪','Numbness / tingling ⚡','Post-surgery pain 🏥','Sports injury 🏃','Chronic pain 3+ months ⏳'],
  hi:       ['तेज दर्द है 🔴','हल्का दर्द है 🟡','हिलने पर दर्द 🔵','सुबह अकड़न ⚪','सुन्नपन / झनझनाहट ⚡','सर्जरी के बाद दर्द 🏥','खेल में चोट 🏃','3+ महीने से दर्द ⏳'],
  hinglish: ['Sharp dard hai 🔴','Halka dard hai 🟡','Hilne pe dard 🔵','Subah akdan ⚪','Numbness hai ⚡','Surgery ke baad 🏥','Sports injury 🏃','3+ mahine se dard ⏳'],
  ta:       ['கூர்மையான வலி 🔴','மந்தமான வலி 🟡','நகரும்போது வலி 🔵','காலை விறைப்பு ⚪','உணர்வின்மை ⚡','அறுவை சிகிச்சைக்கு பின் 🏥','விளையாட்டு காயம் 🏃','நாள்பட்ட வலி ⏳'],
}

const STARTERS: Record<string, string> = {
  head: 'I have head and neck pain with stiffness',
  left_shoulder: 'My left shoulder aches constantly for 2 weeks — difficulty lifting arm',
  right_shoulder: 'Right shoulder painful when raising arm above head',
  lower_spine: 'Lower back pain radiates down my left leg — possible sciatica',
  left_knee: 'Left knee swells after walking and feels stiff in the morning',
  right_knee: 'Right knee pain while climbing stairs — clicking sound',
  left_ankle: 'Twisted left ankle 1 week ago — still swollen and tender',
}

function TriageContent() {
  const params   = useSearchParams()
  const regionId = params.get('region') || ''
  const [lang, setLang]       = useState<Lang>('en')
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    content: `Namaste! Main Prathomix AI Agent hoon, Dr. Dheerendra Pratap Singh ke clinic ka digital receptionist. ${regionId ? `Aapne **${regionId.replace(/_/g, ' ')}** region select kiya hai. ` : ''}Pain area, duration, aur swelling/numbness/fever batayein.`,
    suggestions: ['Tell me more about my condition', 'What exercises can help?', 'Is this serious?', 'Book an appointment'],
  }])
  const [input, setInput]         = useState(STARTERS[regionId] || '')
  const [isLoading, setIsLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [selectedR, setSelectedR] = useState(regionId)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showMap, setShowMap]     = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mrRef      = useRef<MediaRecorder | null>(null)
  const acRef      = useRef<Blob[]>([])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const createSession = async () => {
      if (!isSupabaseConfigured) {
        return
      }

      const user = getStoredUser()
      if (!user) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('triage_sessions')
          .insert({
            patient_id:      user?.id || null,
            selected_region: regionId || null,
            language_used:   lang,
          } as any)
          .select()
          .single()

        if (error || !data) return

        setSessionId((data as any).id)
      } catch {
        // Silent fallback: continue chat in memory when logging is unavailable.
      }
    }

    createSession()
  }, [regionId, lang])

  const send = useCallback(async (text?: string) => {
    const msg = text ?? input
    if (!msg.trim() || isLoading) return
    const wasQuickReply = !!text && text !== input
    setInput('')
    const userTurn = { role: 'user' as const, content: msg, timestamp: new Date() }
    const nextMessages = [...messages, userTurn]
    setMessages(nextMessages)
    setIsLoading(true)

    if (sessionId && isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('triage_messages').insert({
          session_id:      sessionId,
          role:            'user',
          content:         msg,
          was_quick_reply: wasQuickReply,
        } as any)

        if (error) {
          // Ignore logging failures so the patient can continue chatting.
        }
      } catch {
        // Ignore logging failures so the patient can continue chatting.
      }
    }

    try {
      const res  = await triageAPI.chat(msg, selectedR, lang, nextMessages)
      const { reply, suggestions, navigate_to } = res.data
      setMessages(p => [...p, { role: 'ai', content: reply, timestamp: new Date(), suggestions }])

      if (sessionId && isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('triage_messages').insert({
            session_id:  sessionId,
            role:        'assistant',
            content:     reply,
            suggestions: suggestions,
            navigate_to: navigate_to,
          } as any)

          if (error) {
            // Ignore logging failures so the patient can continue chatting.
          }
        } catch {
          // Ignore logging failures so the patient can continue chatting.
        }
      }

      if (navigate_to) { toast.success(`Navigating to ${navigate_to}…`); setTimeout(() => { window.location.href = navigate_to }, 1500) }
    } catch {
      setMessages(p => [...p, { role: 'ai', content: 'Network issue aa gayi hai, but main yahin hoon. Please try again ya WhatsApp use karein.', timestamp: new Date(), suggestions: ['Try again', 'Book appointment', 'WhatsApp support'] }])
    } finally { setIsLoading(false) }
  }, [input, isLoading, messages, selectedR, lang, sessionId])

  const startRec = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec    = new MediaRecorder(stream); acRef.current = []
      rec.ondataavailable = e => acRef.current.push(e.data)
      rec.onstop = async () => {
        const blob = new Blob(acRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        try { const r = await triageAPI.voice(blob, lang); setInput(r.data.transcript || ''); toast.success('Voice transcribed!') }
        catch { toast('Could not transcribe right now. Please type your pain instead.') }
        setRecording(false)
      }
      rec.start(); mrRef.current = rec; setRecording(true)
    } catch { toast('Microphone access is needed for voice input. You can type instead.') }
  }, [lang])

  const stopRec = useCallback(() => { mrRef.current?.stop() }, [])

  const downloadPDF = () => {
    const doc = new jsPDF(); doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('Prathomix AI Triage Report', 14, 20); doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()} | Region: ${selectedR || 'General'}`, 14, 30)
    let y = 42
    messages.forEach(m => {
      const prefix = m.role === 'user' ? 'Patient: ' : 'AI: '
      const lines = doc.splitTextToSize(prefix + m.content, 180)
      doc.setFont('helvetica', m.role === 'user' ? 'bold' : 'normal')
      doc.text(lines, 14, y); y += lines.length * 6 + 4
      if (y > 270) { doc.addPage(); y = 20 }
    })
    doc.setFontSize(8); doc.text('Powered by Prathomix AI · prathomix.in', 14, 285)
    doc.save(`Prathomix-Triage-${Date.now()}.pdf`); toast.success('PDF downloaded!')
  }

  const quickReplies = QUICK_REPLIES[lang] || QUICK_REPLIES['en']

  return (
    <div className="mesh-bg min-h-screen text-slate-800">
      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md mb-4">
            <Bot size={14} className="text-teal-600" />
            <span>Verified Physiotherapy Care</span>
          </div>
          <h1 className="font-display font-900 text-3xl sm:text-4xl md:text-5xl text-slate-800 leading-[1.05] mb-2">AI Pain <span className="text-gradient-teal">Triage</span></h1>
          <p className="font-body text-sm sm:text-base leading-relaxed text-slate-500 px-2 sm:px-0">Select a body region, use quick replies, and get empathetic guidance in your language.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
          {/* Anatomy Map */}
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/50 md:w-[36%] md:max-w-[28rem]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display font-800 text-lg sm:text-xl text-slate-800 leading-[1.05]">Medical Body Map</h2>
                <p className="font-body text-xs leading-relaxed text-slate-500">Tap a region to start the chat</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap((value) => !value)}
                className="md:hidden min-h-[44px] rounded-full border border-teal-100 bg-teal-50 px-3 text-xs font-700 text-teal-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                {showMap ? 'Hide map' : 'Show map'}
              </button>
              {selectedR && <span className="badge-active px-2.5 py-1 rounded-full text-xs font-700 hidden sm:inline-flex">{selectedR.replace(/_/g,' ')} selected</span>}
            </div>
            <div className={`${showMap ? 'block' : 'hidden'} md:block`}>
              <div className="max-h-[56vh] overflow-y-auto pr-1 md:max-h-none">
                <MedicalAnatomyMap
                  onRegionSelect={r => { setSelectedR(r.id); setInput(STARTERS[r.id] || `I have pain in my ${r.label}`) }}
                  compact={true} />
              </div>
            </div>
          </motion.div>

          {/* Chat */}
          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/50 flex flex-col overflow-hidden flex-1 h-[78vh] md:h-auto md:min-h-[72vh]">

            {/* Chat header */}
            <div className="px-4 sm:px-5 py-4 border-b border-slate-200/50 flex items-center justify-between bg-gradient-to-r from-teal-50/80 to-white/60 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center"><Brain size={18} className="text-white" /></div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-700 text-slate-800 text-sm leading-relaxed">Prathomix AI Agent</div>
                  <div className="font-mono text-[10px] text-teal-600">RAG · Multi-Agent · Hinglish · Tool Calling</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={downloadPDF} className="min-h-[44px] min-w-[44px] rounded-xl glass text-slate-500 hover:text-teal-600 flex items-center justify-center"><Download size={15} /></button>
                <button onClick={() => setMessages([{ role:'ai',content:'Ready to chat. Tell me about your pain.',suggestions:['New complaint','Follow-up','Exercise help'] }])}
                  className="min-h-[44px] min-w-[44px] rounded-xl glass text-slate-500 hover:text-teal-600 flex items-center justify-center"><RefreshCw size={15} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 scroll-smooth p-4 sm:p-5 flex flex-col gap-4 md:max-h-none">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mt-1">
                        <Brain size={14} className="text-white" />
                      </div>
                    )}
                    <div className={`max-w-[82%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 ${msg.role === 'ai' ? 'chat-bubble-ai text-slate-800' : 'chat-bubble-user'}`}>
                        <p className="font-body text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                      {msg.timestamp && (
                        <span className="font-mono text-[10px] text-slate-400 px-1">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                      {msg.suggestions && msg.role === 'ai' && i === messages.length - 1 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                          {msg.suggestions.map(s => (
                            <button key={s} onClick={() => send(s)}
                              className="min-h-[44px] px-3 py-2 rounded-full glass-teal text-xs font-600 text-teal-700 hover:shadow-teal transition-all">{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                    <Brain size={14} className="text-white" />
                  </div>
                  <div className="chat-bubble-ai px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                      <span className="font-mono text-xs text-teal-600 ml-2">AI analysing…</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* QUICK REPLIES ROW */}
            <div className="px-4 py-3 border-t border-slate-200/50 bg-white/30">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={11} className="text-teal-500" />
                <span className="font-mono text-[10px] text-slate-400">Quick Replies</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {quickReplies.map(qr => (
                  <button key={qr} type="button" onClick={() => send(qr)} disabled={isLoading}
                    className="shrink-0 min-h-[44px] px-3 py-2 rounded-full glass border border-teal-100 text-xs font-600 text-teal-700 hover:bg-teal-50 transition-all whitespace-nowrap">
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200/50 bg-white/35">
              <div className="flex gap-2 items-end">
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Describe your pain… (Hindi/Hinglish/English/Tamil)"
                  rows={2}
                  className="flex-1 resize-none input-glass rounded-2xl px-3.5 py-3 text-base sm:text-[16px] font-body text-slate-800 placeholder:text-slate-400 leading-relaxed" />
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={recording ? stopRec : startRec} disabled={isLoading}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all disabled:opacity-40 ${recording ? 'bg-red-500 text-white animate-pulse' : 'glass text-slate-500 hover:text-teal-600'}`}>
                    {recording ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button type="button" onClick={() => send()} disabled={isLoading || !input.trim()}
                    className="min-h-[44px] min-w-[44px] rounded-xl btn-teal flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                    <Send size={16} className="text-white" />
                  </button>
                </div>
              </div>
              <p className="font-mono text-[10px] text-slate-400 mt-1.5 text-center leading-relaxed">Powered by Prathomix · Multi-Agent + RAG + Hinglish Voice AI</p>
            </div>
          </motion.div>
        </div>
      </main>
      <FloatingActions />
    </div>
  )
}

export default function AITriagePage() {
  return (
    <Suspense fallback={<div className="mesh-bg min-h-screen flex items-center justify-center"><div className="text-teal-600 font-display font-700 text-xl">Loading AI Triage…</div></div>}>
      <TriageContent />
    </Suspense>
  )
}
