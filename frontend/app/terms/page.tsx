'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

const TERMS = [
  'Prathomix is an assistive care platform and does not replace in-person medical judgment or emergency care.',
  'Appointments, prescriptions, and exercise plans are provided subject to clinic review and availability.',
  'Users are responsible for providing accurate health information and following exercise instructions safely.',
  'The clinic may update platform features, availability, or policies when needed for safety, compliance, or service quality.',
]

export default function TermsPage() {
  const [lang, setLang] = useState<Lang>('en')

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <section className="glass rounded-[2rem] p-8 shadow-glass-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Terms of Use</p>
          <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-slate-900">Platform Terms</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            These terms apply to all patients, caregivers, and clinic staff using Prathomix for treatment coordination.
          </p>

          <div className="mt-8 space-y-3">
            {TERMS.map((point) => (
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