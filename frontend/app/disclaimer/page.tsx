'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const DISCLAIMER_POINTS = [
  'Prathomix provides supportive physiotherapy guidance and does not replace emergency medical services.',
  'Patients should stop any exercise that causes sharp pain, dizziness, or unusual symptoms and contact the clinic promptly.',
  'All recovery content is intended to support treatment plans made by qualified clinicians.',
  'By using the platform, you acknowledge that exercise at home carries personal risk and should be performed carefully.',
]

export default function DisclaimerPage() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <section className="glass rounded-[2rem] p-8 shadow-glass-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Medical Disclaimer</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-slate-900">Important Safety Notice</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Please review this notice before using the Prathomix platform for any exercise or recovery activity.
          </p>

          <div className="mt-8 space-y-3">
            {DISCLAIMER_POINTS.map((point) => (
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