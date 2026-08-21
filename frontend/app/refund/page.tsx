'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const REFUND_POINTS = [
  'Consultation and treatment fees follow the clinic&apos;s appointment policy and the schedule shared at booking time.',
  'If a paid booking needs to be rescheduled, the clinic will help transfer the appointment where possible.',
  'Digital services, completed consultations, and used medical records may not be eligible for refund except where required by law.',
  'For billing questions, contact the clinic support team with your appointment reference and payment details.',
]

export default function RefundPage() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <section className="glass rounded-[2rem] p-8 shadow-glass-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Refund Policy</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-slate-900">Billing and Refunds</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This summary explains how refunds and appointment adjustments are handled for Prathomix services.
          </p>

          <div className="mt-8 space-y-3">
            {REFUND_POINTS.map((point) => (
              <div key={point} className="rounded-2xl border border-white/70 bg-white/70 p-4 text-sm leading-7 text-slate-600 shadow-sm backdrop-blur-sm">
                {point}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  )
}