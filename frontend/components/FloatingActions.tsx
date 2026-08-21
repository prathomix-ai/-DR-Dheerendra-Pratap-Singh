'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, Bot } from 'lucide-react'
import Link from 'next/link'

interface Props { whatsappNumber?: string; clinicLat?: string; clinicLng?: string }

export default function FloatingActions({ whatsappNumber='919999999999', clinicLat='28.6139', clinicLng='77.2090' }: Props) {
  const [chatOpen, setChatOpen] = useState(false)
  const waUrl  = `https://wa.me/${whatsappNumber}?text=Hello%20Prathomix%2C%20I%20need%20physiotherapy%20help`
  const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}&travelmode=driving`

  return (
    <>
      {/* MAP — Bottom-Left */}
      <motion.a href={mapUrl} target="_blank" rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="fab fab-map group !bottom-[5.5rem] md:!bottom-6 !left-4 md:!left-6" aria-label="Navigate to Clinic" data-tour="map-fab">
        <span className="fab-label" style={{ left: '60px', bottom: '8px' }}>Get Directions</span>
        <Navigation size={22} className="text-white" />
      </motion.a>

      {/* WHATSAPP — Bottom-Right */}
      <motion.a href={waUrl} target="_blank" rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="fab fab-whatsapp group !bottom-[5.5rem] md:!bottom-6 !right-4 md:!right-6" aria-label="WhatsApp" data-tour="whatsapp-fab">
        <span className="fab-label" style={{ right: '60px', bottom: '8px' }}>WhatsApp Us</span>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>

      {/* AI AGENT — Positioned cleanly above WhatsApp without overlap */}
      <motion.button onClick={() => setChatOpen(open => !open)}
        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
        className="fixed z-50 w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-100 active:scale-95 !bottom-[9.5rem] md:!bottom-[5.5rem] !right-4 md:!right-6"
        style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow: '0 4px 20px rgba(13,148,136,0.5)' }}
        aria-label="AI Agent" data-tour="ai-agent">
        <Bot size={22} className="text-white" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 items-center justify-center">
            <span className="text-white font-mono" style={{ fontSize: '8px' }}>AI</span>
          </span>
        </span>
      </motion.button>

      {/* AI Chat Popup Window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }} transition={{ duration: 0.1, ease: 'easeOut' }}
            className="fixed z-50 w-72 max-w-[calc(100vw-2rem)] glass rounded-2xl shadow-2xl overflow-hidden !bottom-[13.5rem] md:!bottom-[9.5rem] !right-4 md:!right-6">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bot size={16} className="text-white" /><span className="font-display font-700 text-white text-sm">Prathomix AI Agent</span></div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /><span className="text-teal-100 text-xs">Online</span></div>
            </div>
            <div className="p-4">
              <div className="chat-bubble-ai p-3 mb-3 text-sm font-body text-slate-700">
                👋 Namaste! Main Dr. Dheerendra Pratap Singh ka AI assistant hoon. Kya aapko koi dard hai?
              </div>
              <div className="flex gap-2">
                <Link href="/ai-triage" onClick={() => setChatOpen(false)} className="flex-1 btn-teal py-2 px-3 rounded-xl text-xs font-700 text-center">Start Triage</Link>
                <Link href="/appointments" onClick={() => setChatOpen(false)} className="flex-1 btn-glass py-2 px-3 rounded-xl text-xs font-700 text-center text-slate-700 border border-slate-200">Book Now</Link>
              </div>
              <p className="mt-2 text-center text-[10px] font-mono text-slate-400">Powered by Prathomix</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
