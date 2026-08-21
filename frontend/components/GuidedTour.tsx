'use client'
import { useEffect, useState } from 'react'
import Joyride from 'react-joyride'

const CustomTourTooltip = ({ step, tooltipProps, primaryProps, backProps, index }: any) => (
  <div {...tooltipProps} className="bg-white/90 backdrop-blur-2xl border border-teal-500/30 shadow-[0_20px_60px_-15px_rgba(20,184,166,0.4)] rounded-3xl p-6 w-[350px] z-50">
    <h3 className="text-xl font-extrabold bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent mb-3">{step.title || "✨ Prathomix Physio"}</h3>
    <p className="text-sm text-slate-600 mb-5 leading-relaxed">{step.content}</p>
    <div className="flex justify-between items-center">
      <span className="text-xs font-bold text-teal-600/50">Step {index + 1}</span>
      <div className="flex gap-2">
        {index > 0 && <button {...backProps} className="px-4 py-2 text-sm text-slate-500 font-bold hover:text-teal-600">Back</button>}
        <button {...primaryProps} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-all">Next ➔</button>
      </div>
    </div>
  </div>
)

const TOUR_STEPS = [
  {
    target: '[data-tour="navbar"]',
    title: '✨ Welcome to Prathomix Physio',
    content: 'Your intelligent physiotherapy companion for pain triage, guided recovery, and quick clinic booking.',
  },
  {
    target: '[data-tour="hero-cta"]',
    title: 'Start from the home screen',
    content: 'Use the hero CTA to begin a pain check, or explore the anatomy map for a region-specific start.',
  },
  {
    target: '[data-tour="bento-anatomy"]',
    title: 'Get guided in simple Hinglish',
    content: 'Ask in your own language, and the AI will keep responses short, factual, and clinic-focused.',
  },
  {
    target: '[data-tour="map-fab"]',
    title: 'Track your recovery',
    content: 'Use the dashboard and profile surfaces to review recovery progress and therapy notes.',
  },
  {
    target: '[data-tour="whatsapp-fab"]',
    title: 'Use voice when typing is hard',
    content: 'Voice input helps when pain or mobility makes typing uncomfortable on mobile.',
  },
  {
    target: '[data-tour="ai-agent"]',
    title: 'Book an OPD visit anytime',
    content: 'When needed, jump straight to the clinic flow for a direct physician review and follow-up.',
  },
]

export default function GuidedTour() {
  const [isMounted, setIsMounted] = useState(false)
  const [run, setRun] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    if (!localStorage.getItem('prathomix_tour_v2_done')) {
      const timer = window.setTimeout(() => setRun(true), 1200)
      return () => window.clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem('prathomix_tour_v2_done', 'true')
    setRun(false)
  }

  if (!isMounted) return null

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showSkipButton={false}
      disableOverlayClose
      tooltipComponent={CustomTourTooltip}
      callback={(data: any) => {
        if (data.status === 'finished' || data.status === 'skipped') {
          handleClose()
        }
      }}
      styles={{
        options: {
          zIndex: 60,
        },
      }}
    />
  )
}
