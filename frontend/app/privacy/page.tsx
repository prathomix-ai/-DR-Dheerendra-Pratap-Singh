'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const POLICY_POINTS = [
  'We collect only the details needed to provide physiotherapy support, appointment booking, and care coordination.',
  'Health notes, prescription data, and caregiver access are used only for patient care and secure clinic workflows.',
  'We do not sell personal health information. Access is limited to authorized clinic staff and approved caregivers.',
  'You can request corrections or deletion through the settings area or by contacting the clinic team.',
]

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <section className="glass rounded-[2rem] p-8 shadow-glass-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Privacy Policy</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-slate-900">Patient Privacy at Prathomix</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This policy explains how Dr. Dheerendra Pratap Singh&apos;s Clinic handles patient information on the Prathomix platform.
          </p>

          <div className="mt-8 space-y-3">
            {POLICY_POINTS.map((point) => (
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