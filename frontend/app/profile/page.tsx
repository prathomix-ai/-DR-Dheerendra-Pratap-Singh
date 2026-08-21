'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Activity,
  Brain,
  Cake,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Droplets,
  Edit3,
  Flame,
  HeartPulse,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import DoctorAvatar from '@/components/DoctorAvatar'
import { getDisplayName, getStoredUser, isSupabaseConfigured, supabase } from '@/lib/auth'
import { useStoredUser } from '@/lib/useStoredUser'
import { type Lang } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

type MetricCard = {
  label: string
  value: string
  note: string
  icon: LucideIcon
  bubbleClass: string
  accentClass: string
}

type ActivityItem = {
  exercise: string
  date: string
  accuracy: string
  note: string
  icon: LucideIcon
}

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>('en')
  const currentUser = useStoredUser()
  const displayName = getDisplayName(currentUser)
  const email = currentUser?.email || 'Not provided'
  const [profileData, setProfileData] = useState<any>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) return

      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (data) setProfileData(data)
      } catch {}
    }

    fetchProfile()
  }, [])

  const patientId = currentUser?.id ? `PT-${currentUser.id.slice(0, 8).toUpperCase()}` : 'PT-PENDING'
  const age = profileData?.age ? String(profileData.age) : 'Not specified'
  const gender = profileData?.gender || 'Not specified'
  const bloodGroup = profileData?.blood_group || 'Not specified'
  const phone = profileData?.phone || (currentUser as any)?.phone || 'Not provided'
  const diagnosis = profileData?.condition || profileData?.diagnosis || 'General Physiotherapy & Rehab'
  const physician = 'Dr. Dheerendra Pratap Singh'
  const therapyStartDate = profileData?.created_at
    ? new Date(profileData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recently'

  const METRICS: MetricCard[] = [
    {
      label: 'Total AI Sessions Completed',
      value: profileData?.sessions_count != null ? String(profileData.sessions_count) : '0',
      note: 'Across this recovery cycle',
      icon: Activity,
      bubbleClass: 'bg-teal-50 text-teal-700',
      accentClass: 'from-teal-500/20 via-teal-500/10 to-white',
    },
    {
      label: 'Average Pose Accuracy',
      value: profileData?.average_accuracy != null ? `${profileData.average_accuracy}%` : '0%',
      note: 'Monitored movement score',
      icon: Brain,
      bubbleClass: 'bg-slate-100 text-slate-700',
      accentClass: 'from-slate-100 via-white to-teal-50/70',
    },
    {
      label: 'Current Day Streak',
      value: profileData?.streak != null ? String(profileData.streak) : '0',
      note: 'Consecutive rehab days',
      icon: Flame,
      bubbleClass: 'bg-amber-50 text-amber-600',
      accentClass: 'from-amber-100/60 via-white to-teal-50/60',
    },
    {
      label: 'Exercises Logged',
      value: profileData?.exercises_count != null ? String(profileData.exercises_count) : '0',
      note: 'Unique movement patterns tracked',
      icon: Target,
      bubbleClass: 'glass-sage text-sage-600',
      accentClass: 'from-green-50/80 via-white to-teal-50/70',
    },
  ]

  const displayInitials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mesh-bg min-h-screen relative overflow-hidden text-slate-800">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-teal-300/15 blur-3xl"
          animate={{ y: [0, -16, 0], x: [0, 10, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-0 top-28 h-80 w-80 rounded-full bg-sky-200/15 blur-3xl"
          animate={{ y: [0, 14, 0], x: [0, -12, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/30 blur-3xl"
          animate={{ opacity: [0.55, 0.8, 0.55] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <Navbar lang={lang} setLang={setLang} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-col gap-4"
        >
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
            <HeartPulse size={14} /> Patient Profile
          </div>

          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black tracking-tight text-slate-800 leading-[1.05] sm:text-5xl lg:text-6xl">
              My Health Profile
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Your personal health records and recovery progress, safely stored in one place.
            </p>
          </div>
        </motion.div>

        <div className="bento-grid">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="bento-hero glass relative overflow-hidden rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/60 to-teal-50/30" />
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-teal-200/20 blur-3xl" />
            <div className="relative grid gap-6 lg:grid-cols-[170px_1fr]">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-300/60 via-teal-100/60 to-sage-300/40 blur-xl" />
                  <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-sky-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-2 ring-teal-100 ring-offset-2 ring-offset-white">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/60 bg-white/18 backdrop-blur-md">
                      <span className="font-display text-3xl font-black tracking-[0.22em] text-white">{displayInitials}</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 -right-1 inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-sage-500" /> Active
                  </div>
                </div>

                <div className="mt-5 inline-flex items-center rounded-full border border-slate-200/50 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  Patient ID · {patientId}
                </div>
              </div>

              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                        My Health Summary
                      </p>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-800 leading-[1.05] sm:text-3xl">
                        {displayName}
                      </h2>
                      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                        A simple view of your health details, recovery progress, and clinic notes.
                      </p>
                    </div>

                    <Link
                      href="/settings"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/50 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-[background-color,color,transform] duration-100 hover:border-teal-200 hover:text-teal-700 active:scale-[0.98]"
                    >
                      <Edit3 size={15} />
                      Edit Profile
                    </Link>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: 'Age', value: age, icon: Cake },
                      { label: 'Gender', value: gender, icon: UserRound },
                      { label: 'Blood Group', value: bloodGroup, icon: Droplets },
                      { label: 'Patient ID', value: patientId, icon: ShieldCheck },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200/50 bg-white/80 px-4 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <item.icon size={14} className="text-teal-600" />
                          {item.label}
                        </div>
                        <div className="mt-2 break-words text-sm font-bold text-slate-800 leading-relaxed sm:text-base">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/50 bg-white/80 px-4 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Phone size={14} className="text-teal-600" />
                        Contact Phone
                      </div>
                      <div className="mt-2 text-sm font-semibold text-slate-800 leading-relaxed">{phone}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/50 bg-white/80 px-4 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        <Mail size={14} className="text-teal-600" />
                        Email Address
                      </div>
                      <div className="mt-2 break-words text-sm font-semibold text-slate-800 leading-relaxed">{email}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full glass-sage px-3 py-1.5 font-semibold text-sage-600">
                    <Sparkles size={13} /> Safe and private
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 font-semibold text-slate-600">
                    <Clock3 size={13} /> Last synced 2 minutes ago
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="bento-doctor glass relative overflow-hidden rounded-[2rem] p-6 shadow-glass-lg"
          >
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-200/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-sage-500/10 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">
                      Medical Context
                    </p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                      My Health Summary
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full glass-sage px-3 py-1.5 text-xs font-semibold text-sage-600">
                    <ShieldCheck size={14} /> Therapy Active
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-slate-200/40 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <Stethoscope size={14} className="text-teal-600" />
                      Main Problem
                    </div>
                    <div className="mt-2 text-lg font-black tracking-tight text-slate-900">
                      {diagnosis}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/40 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-white/80 ring-1 ring-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <DoctorAvatar
                          name="Dr. Dheerendra Pratap Singh"
                          alt="Dr. Dheerendra Pratap Singh"
                          className="h-full w-full rounded-full"
                          imageClassName="object-cover object-top"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                          <HeartPulse size={14} className="text-teal-600" />
                          My Doctor
                        </div>
                        <div className="mt-2 text-lg font-black tracking-tight text-slate-900">
                          {physician}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Lead Physiotherapist · BPT, MPT (Ortho)</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/40 bg-white/70 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      <CalendarClock size={14} className="text-teal-600" />
                      Treatment Started On
                    </div>
                    <div className="mt-2 text-lg font-black tracking-tight text-slate-900">
                      {therapyStartDate}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl glass-sage p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={16} className="mt-0.5 text-sage-600" />
                  <div>
                    <p className="text-sm font-semibold text-sage-600">Recovery note</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Right knee loading is improving, balance response remains stable, and the current
                      plan is focused on controlled strength rebuilding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {METRICS.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.section
                key={metric.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.16 + index * 0.05 }}
                whileHover={{ y: -4 }}
                className="glass relative overflow-hidden rounded-[1.75rem] p-5 shadow-sm transition-shadow hover:shadow-glass-lg"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accentClass}`} />
                <div className="relative flex h-full flex-col justify-between">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${metric.bubbleClass}`}>
                    <Icon size={19} />
                  </div>
                  <div className="mt-5">
                    <div className="text-3xl font-black tracking-tight text-slate-900">{metric.value}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">{metric.label}</div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">{metric.note}</div>
                  </div>
                </div>
              </motion.section>
            )
          })}

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
            className="bento-full glass relative overflow-hidden rounded-[2rem] p-6 shadow-glass-lg"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-teal-200/15 blur-3xl" />
            <div className="relative">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
                    Recent Activity
                  </p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                    Recent exercise log
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Activity size={13} className="text-teal-600" />
                  Simple session timeline
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                {activities.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No recent exercise activity logged yet.
                  </div>
                ) : (
                  activities.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.exercise + index}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.32, delay: 0.4 + index * 0.05 }}
                        className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                            <Icon size={18} />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">{item.exercise}</h4>
                            <p className="mt-1 text-sm text-slate-500">{item.note}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 sm:justify-end">
                          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <Clock3 size={14} className="text-slate-400" />
                            {item.date}
                          </div>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700 ring-1 ring-teal-100">
                            <CheckCircle2 size={14} />
                            {item.accuracy}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}