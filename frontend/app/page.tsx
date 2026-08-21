'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain, Activity, Bone, Clock, Heart, Globe, Zap, Star,
  ArrowRight, ChevronRight, TrendingUp, Award, Users,
  Shield, ShieldCheck, CheckCircle2, Mic, MessageSquare, Smartphone, Stethoscope, HeartPulse,
} from 'lucide-react'
import Navbar          from '@/components/Navbar'
import Footer          from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import DoctorAvatar    from '@/components/DoctorAvatar'
import BentoCard       from '@/components/BentoCard'
import MedicalAnatomyMap from '@/components/MedicalAnatomyMap'
import ProgressRing    from '@/components/ProgressRing'
import GuidedTour      from '@/components/GuidedTour'
import DisclaimerModal from '@/components/DisclaimerModal'
import { translations, type Language }   from '@/lib/i18n'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const charVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.03 } },
}

const highlightWords = new Set(['Pain', 'Home'])
const gradientText = 'text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-800 drop-shadow-sm'

function AnimatedHeadline({ title }: { title: string }) {
  const words = title.split(/(\s+)/)

  return (
    <motion.h1
      key={title}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="font-display text-4xl sm:text-5xl md:text-7xl leading-tight md:leading-[1.05] mb-4 tracking-tight text-slate-800 font-extrabold break-words"
    >
      {words.map((word, wordIndex) => {
        if (/^\s+$/.test(word)) {
          return <span key={`space-${wordIndex}`} className="inline-block w-2 md:w-4">&nbsp;</span>
        }

        const clean = word.replace(/[^\w\u0900-\u097F]+/g, '')
        const highlight = clean && highlightWords.has(clean)

        return (
          <span key={`word-${wordIndex}`} className="inline-block whitespace-nowrap">
            {Array.from(word).map((char, charIndex) => (
              <motion.span
                key={`${wordIndex}-${charIndex}-${char}`}
                variants={charVariants}
                className={`inline-block ${highlight ? gradientText : 'text-slate-800'}`}
              >
                {char}
              </motion.span>
            ))}
          </span>
        )
      })}
    </motion.h1>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [lang, setLang] = useState<Language>('en')
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [doctorName, setDoctorName] = useState<string>('Dr. Dheerendra Pratap Singh')

  useEffect(() => {
    const accepted = localStorage.getItem('prathomix_disclaimer_v2')
    if (!accepted) {
      const timer = setTimeout(() => setShowDisclaimer(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('name')
          .limit(1)
          .single()
        
        if (error) {
          setDoctorName('Dr. Dheerendra Pratap Singh')
          return
        }
        if (data && (data as any).name) {
          setDoctorName((data as any).name)
        }
      } catch (err) {
        setDoctorName('Dr. Dheerendra Pratap Singh')
      }
    }
    fetchDoctor()
  }, [])

  const handleDisclaimerClose = () => {
    localStorage.setItem('prathomix_disclaimer_v2', 'accepted_' + Date.now())
    setShowDisclaimer(false)
  }

  const heroCopy = translations[lang]

  const metricCards = [
    {
      value: '98%',
      label: 'Patient Satisfaction',
      icon: Heart,
      color: '#ef4444',
      delta: '↑ 4.2% vs Q3 2024',
      sub: 'Based on happy patients treated at our clinic.',
      tag: 'NPS Score: 72',
      bullets: [
        { icon: CheckCircle2, text: 'Top-rated by patients' },
        { icon: CheckCircle2, text: 'Fast recovery results' },
        { icon: CheckCircle2, text: 'Caring & friendly treatment' },
      ],
    },
    {
      value: '2.4s',
      label: 'AI Response Time',
      icon: Zap,
      color: '#0d9488',
      delta: 'Replies feel much faster now',
      sub: 'Our smart system understands your pain and replies in seconds.',
      tag: 'P99: 4.1s',
      bullets: [
        { icon: Clock, text: 'No waiting in lines' },
        { icon: Zap, text: 'Instant help on your phone' },
        { icon: Clock, text: 'Available 24/7 for you' },
      ],
    },
    {
      value: '18+',
      label: 'Complete Care System',
      icon: Brain,
      color: '#8b5cf6',
      delta: 'More helpful tools added',
      sub: 'Everything you need for care, booking, and records in one place.',
      tag: 'All Systems GO',
      bullets: [
        { icon: Smartphone, text: 'Video exercise guides' },
        { icon: Smartphone, text: 'Easy online booking' },
        { icon: Shield, text: 'Digital health records' },
      ],
    },
    {
      value: '4',
      label: 'Languages',
      icon: Globe,
      color: '#f59e0b',
      delta: 'Now with more languages',
      sub: 'Talk to us in your own language. We support Hindi, English, and more.',
      tag: 'Vernacular AI',
      bullets: [
        { icon: Mic, text: 'Talk in Hindi' },
        { icon: MessageSquare, text: 'Talk in English' },
        { icon: Mic, text: 'Send voice messages' },
      ],
    },
  ]

  return (
    <main className="bg-transparent min-h-screen pb-28 md:pb-0">
      <Navbar lang={lang} setLang={setLang} />
      <GuidedTour />
      <DisclaimerModal show={showDisclaimer} onClose={handleDisclaimerClose} />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-8 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-200/25 blur-3xl" />
          <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
          <div className="absolute right-8 top-24 h-72 w-72 rounded-full bg-white/80 blur-3xl" />
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="relative z-10 text-center mb-14">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-4 py-2 text-xs font-700 uppercase tracking-[0.2em] text-teal-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
            <ShieldCheck size={13} /> Premium Physiotherapy Care
          </div>
          <AnimatedHeadline title={heroCopy.heroTitle} />
          <p className="font-body text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-8">
            {heroCopy.heroSub}
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 mt-6 px-6 md:px-0 w-full md:w-auto max-w-md md:max-w-none mx-auto" data-tour="hero-cta">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/ai-triage')}
              className="btn-shine relative overflow-hidden px-8 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-full shadow-[0_15px_40px_-10px_rgba(20,184,166,0.7)] hover:scale-105 transition-all duration-150 ease-out w-full md:w-auto flex justify-center"
            >
              <span className="inline-flex items-center gap-2">
                <Brain size={18} />{heroCopy.btnPrimary}<ArrowRight size={16} />
              </span>
            </motion.button>
            <Link href="/appointments" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/60 px-8 py-3 text-base font-semibold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl transition-all duration-150 ease-out hover:bg-white/80 hover:scale-105 active:scale-95 w-full md:w-auto">
              <Clock size={18} /> {heroCopy.btnSecondary}
            </Link>
          </div>
        </motion.div>

        {/* BENTO GRID */}
        <div className="bento-grid">

          {/* 1 — AI Triage Hero */}
          <BentoCard variant="teal" span="bento-hero" delay={0.1} className="min-h-56" data-tour="bento-anatomy">
            <div className="flex flex-col h-full justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/60 px-3 py-1.5 mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
                    <ShieldCheck size={12} className="text-teal-600" />
                    <span className="font-mono text-[11px] text-teal-700 font-700">VERIFIED PHYSIOTHERAPY CARE</span>
                  </div>
                  <h2 className="font-display text-2xl font-extrabold tracking-tight text-slate-800 leading-tight">Where is the Pain?</h2>
                  <p className="font-body text-sm text-slate-500 mt-1.5 leading-relaxed">{"Just tell us your problem in Hindi or English, using text or voice. We'll guide you to the right next step."}</p>
                </div>
                <div className="shrink-0 ml-3 w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center ring-1 ring-white/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <Stethoscope size={28} className="text-teal-600" />
                </div>
              </div>
              <Link href="/ai-triage" className="mt-4 inline-flex items-center gap-2 btn-teal animate-pulse py-2.5 px-5 rounded-xl text-sm font-700 self-start">
                Start Pain Check <ChevronRight size={15} />
              </Link>
            </div>
          </BentoCard>

          <BentoCard variant="default" span="bento-doctor" delay={0.15} className="min-h-56" data-tour="bento-doctor">
            <div className="flex flex-col sm:flex-row gap-4 h-full">
              <div className="shrink-0 flex sm:block justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/60 p-1.5 backdrop-blur-2xl ring-2 ring-white/40 ring-offset-2 ring-offset-transparent shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <div className="absolute inset-0 rounded-full bg-teal-100/50 blur-2xl" aria-hidden="true" />
                  <DoctorAvatar
                    name="Dr. Dheerendra Pratap Singh"
                    alt="Dr. Dheerendra Pratap Singh"
                    className="relative z-10 h-full w-full rounded-full"
                    imageClassName="object-cover object-top"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-teal-600" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-slate-500">Lead Physiotherapist</span>
                  </div>
                  <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-800">{doctorName}</h3>
                  <p className="mt-1.5 font-body text-sm font-medium text-teal-700">BPT · MPT (Ortho)</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { icon: Bone, text: 'Ortho Care' },
                      { icon: Activity, text: 'Rehab' },
                      { icon: Stethoscope, text: 'Clinical Review' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                        <Icon size={12} />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 px-3 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
                  <HeartPulse size={14} className="text-teal-600" />
                  <span className="text-xs font-semibold text-slate-600">3+ Years Clinical Excellence</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={11} className="fill-amber-400 text-amber-400" />)}</div>
                  <span className="font-mono text-xs text-slate-500">4.9 (1,200+ patients)</span>
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 3 — Medical Anatomy Map */}
          <BentoCard variant="default" span="bento-wide bento-tall" delay={0.2} className="min-h-96">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold tracking-tight text-slate-800">Where does it hurt?</h3>
                <p className="font-body text-xs leading-relaxed text-slate-500">Tap the body part that hurts and our AI will guide you.</p>
              </div>
              <div className="px-2.5 py-1 rounded-full glass-teal border border-white/40">
                <span className="font-mono text-[11px] text-teal-700 font-700">LIVE SCAN</span>
              </div>
            </div>
            <MedicalAnatomyMap compact={true} />
          </BentoCard>

          {metricCards.map((s, i) => {
            const Icon = s.icon

            return (
              <BentoCard key={s.label} variant="default" delay={0.25 + i * 0.05} className="min-h-60">
                <div className="flex h-full flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + '15' }}>
                      <Icon size={20} style={{ color: s.color }} />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-700 font-mono shrink-0"
                      style={{ background: s.color + '15', color: s.color }}>{s.tag}</span>
                  </div>

                  <div>
                    <div className="font-display font-900 text-4xl text-slate-900 leading-none">{s.value}</div>
                    <div className="font-body text-sm font-600 text-slate-700 mt-0.5 leading-relaxed">{s.label}</div>
                      <div className="font-mono text-[11px] mt-1" style={{ color: s.color }}>{s.delta}</div>
                  </div>

                  <div className="flex-1 rounded-2xl border border-white/40 bg-white/60 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-2xl">
                    <div className="space-y-2.5">
                      {s.bullets.map(bullet => {
                        const BulletIcon = bullet.icon

                        return (
                          <div key={bullet.text} className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                              <BulletIcon size={13} />
                            </div>
                            <span className="font-body text-sm font-600 leading-relaxed text-slate-600">{bullet.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <p className="font-body text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-100">
                    {s.sub}
                  </p>
                </div>
              </BentoCard>
            )
          })}

          {/* 5 — Progress snapshot */}
          <BentoCard variant="default" delay={0.4} className="min-h-44">
            <h3 className="font-display font-extrabold tracking-tight text-slate-800 text-base leading-relaxed mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-600" /> My Recovery Progress
            </h3>
            <div className="flex items-center justify-around">
              <ProgressRing value={72} size={80} label="Mobility" sublabel="Hip" />
              <ProgressRing value={88} size={80} label="Strength" sublabel="Knee" />
              <ProgressRing value={61} size={80} label="Posture"  sublabel="Spine" />
            </div>
          </BentoCard>

          {/* 6 — Quick Book */}
          <BentoCard variant="sage" delay={0.42} className="min-h-44">
            <div className="flex flex-col h-full justify-between">
              <div>
                <Clock size={24} className="text-green-700 mb-2" />
                <h3 className="font-display text-lg font-extrabold tracking-tight text-slate-900">Next Available</h3>
                <p className="font-body text-sm text-slate-600 mt-1">Dr. Dheerendra Pratap Singh  · Today 4:30 PM</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge-active px-2 py-0.5 rounded-full text-xs font-700">Available</span>
                  <span className="font-mono text-xs text-slate-400">3 slots left</span>
                </div>
                <p className="font-body text-xs text-slate-500 mt-2">WhatsApp confirmation sent instantly on booking</p>
              </div>
              <Link href="/appointments" className="mt-3 btn-teal py-2 px-4 rounded-xl text-sm font-700 text-center block">Book Now</Link>
            </div>
          </BentoCard>

          {/* 7 — About CTA */}
          <BentoCard variant="dark" delay={0.45} span="bento-wide" className="min-h-36">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between h-full gap-4">
              <div>
                <div className="font-mono text-xs text-teal-400 font-700 uppercase tracking-widest mb-2">18 AI Features · Full Details</div>
                <h3 className="font-display text-xl font-extrabold tracking-tight text-white mb-1">See All Clinic Features</h3>
                <p className="font-body text-slate-400 text-sm">Learn more about our treatments, check patient reviews, and see how our AI helps you heal faster.</p>
              </div>
              <Link href="/about" className="shrink-0 sm:ml-6 btn-teal px-5 py-3 rounded-2xl font-700 inline-flex items-center gap-2 self-start sm:self-auto">
                About <ArrowRight size={16} />
              </Link>
            </div>
          </BentoCard>

          {/* 8 — Trust bar */}
          <BentoCard variant="default" span="bento-full" delay={0.5} className="min-h-24">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: Shield,       label: '100% Safe & Private',   sub: 'Your health data is secure' },
                { icon: Award,        label: 'Trusted Clinic',        sub: 'Highest safety standards' },
                { icon: Brain,        label: 'Smart AI Camera',       sub: 'Checks your exercise posture' },
                { icon: Activity,     label: 'Voice Guidance',        sub: 'Tells you how to move correctly' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg glass-teal flex items-center justify-center">
                    <item.icon size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <div className="font-display font-extrabold tracking-tight text-slate-800 text-xs">{item.label}</div>
                    <div className="font-mono text-[10px] text-slate-400">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

        </div>
      </section>

      <Footer />
      <FloatingActions
        whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
        clinicLat={process.env.NEXT_PUBLIC_CLINIC_LAT}
        clinicLng={process.env.NEXT_PUBLIC_CLINIC_LNG}
      />
    </main>
  )
}
