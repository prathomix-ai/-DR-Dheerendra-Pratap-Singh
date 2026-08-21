'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  Activity,
  Bell,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe,
  HeartPulse,
  Mail,
  Moon,
  Phone,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  UserPlus,
  UserRound,
  Users,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import { LANGUAGES, type Lang } from '@/lib/i18n'
import { settingsAPI } from '@/lib/api'
import { getDisplayName } from '@/lib/auth'
import { useStoredUser } from '@/lib/useStoredUser'
import { stopSpeech, speakCustom, getTTSRate, setTTSRate } from '@/lib/tts'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

type SectionId = 'profile' | 'language' | 'notifications' | 'caregiver' | 'privacy' | 'app'

type Caregiver = {
  id: string
  name: string
  phone: string
  relation: string
}

const SECTIONS: Array<{
  id: SectionId
  label: string
  description: string
  icon: LucideIcon
}> = [
  { id: 'profile', label: 'Profile', description: 'Identity and profile link', icon: UserRound },
  { id: 'language', label: 'Language & Region', description: 'Voice cues and prompts', icon: Globe },
  { id: 'notifications', label: 'Notifications', description: 'WhatsApp, SMS and email', icon: Bell },
  { id: 'caregiver', label: 'Caregiver Access', description: 'Trusted linked profiles', icon: Users },
  { id: 'privacy', label: 'Privacy & Security', description: 'Consent and data controls', icon: Shield },
  { id: 'app', label: 'App Preferences', description: 'Tour, theme and legal reset', icon: Smartphone },
]

const LANGUAGE_COPY: Record<Lang, string> = {
  en: 'Clear clinical navigation and system labels in English.',
  hi: 'पूरी तरह हिंदी cues for a familiar and calm experience.',
  hinglish: 'Mixed-language prompts that feel natural during rehab.',
  ta: 'தமிழ் support for a regional, accessible interface.',
}

function ToggleSwitch({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean
  onChange: (next: boolean) => void
  ariaLabel: string
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!value)}
      aria-label={ariaLabel}
      aria-pressed={value}
      whileTap={{ scale: 0.98 }}
      className={`relative inline-flex h-8 w-14 items-center rounded-full p-1 transition-colors duration-300 ${
        value ? 'bg-gradient-to-r from-teal-500 to-sage-500' : 'bg-slate-200'
      }`}
    >
      <motion.span
        className="h-6 w-6 rounded-full bg-white shadow-md"
        animate={{ x: value ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      />
    </motion.button>
  )
}

export default function SettingsPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [voice, setVoice] = useState(true)
  const [dark, setDark] = useState(false)
  const [ttsSpeed, setTtsSpeed] = useState(0.92)
  const [sms, setSms] = useState(true)
  const [wa, setWa] = useState(true)
  const [email, setEmail] = useState(false)
  const [section, setSection] = useState<SectionId>('profile')
  const [saving, setSaving] = useState(false)
  const [caregivers, setCaregivers] = useState<Caregiver[]>([])
  const [cgName, setCgName] = useState('')
  const [cgPhone, setCgPhone] = useState('')
  const [cgRelation, setCgRelation] = useState('')

  const currentUser = useStoredUser()
  const currentLanguage = LANGUAGES.find((item) => item.code === lang)
  const displayName = getDisplayName(currentUser)
  const settingsUserId = currentUser?.id || ''
  const userInitials = displayName.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleDarkToggle = (nextDark: boolean) => {
    setDark(nextDark)
    if (typeof window !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark-mode')
        localStorage.setItem('prathomix_dark_mode', 'true')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark-mode')
        localStorage.setItem('prathomix_dark_mode', 'false')
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('prathomix_dark_mode') === 'true'
      setDark(isDark)
      setTtsSpeed(getTTSRate())
      if (isDark) {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark-mode')
      }
    }
  }, [])

  useEffect(() => {
    if (!settingsUserId) return

    const loadSettings = async () => {
      try {
        const { data } = await settingsAPI.get(settingsUserId)
        const saved = data?.settings || {}

        setLang(saved.language || 'en')
        setVoice(Boolean(saved.voice_enabled))
        setSms(Boolean(saved.sms_notif))
        setWa(Boolean(saved.wa_notif))
        if (saved.dark_mode !== undefined) {
          handleDarkToggle(Boolean(saved.dark_mode))
        }
      } catch {
        toast.error('Failed to load saved settings')
      }
    }

    loadSettings()
  }, [settingsUserId])

  const saveSettings = async () => {
    if (!settingsUserId) {
      toast.error('Please sign in to save settings')
      return
    }

    setSaving(true)
    try {
      await settingsAPI.update(settingsUserId, {
        language: lang,
        voice_enabled: voice,
        sms_notif: sms,
        wa_notif: wa,
        dark_mode: dark,
      })
      toast.success('Settings saved!')
    } catch {
      toast.error('Unable to save settings')
    } finally {
      setSaving(false)
    }
  }

  const addCaregiver = () => {
    if (!cgName || !cgPhone) {
      toast.error('Fill name and phone')
      return
    }

    setCaregivers((previous) => [
      ...previous,
      {
        id: Date.now().toString(),
        name: cgName,
        phone: cgPhone,
        relation: cgRelation || 'Family',
      },
    ])
    setCgName('')
    setCgPhone('')
    setCgRelation('')
    toast.success('Caregiver added!')
  }

  const revokeCaregiver = (id: string) => {
    setCaregivers((previous) => previous.filter((caregiver) => caregiver.id !== id))
    toast.success('Caregiver access revoked')
  }

  const resetTour = () => {
    localStorage.removeItem('prathomix_tour_v2_done')
    toast.success('Tour reset! Reload to start.')
  }

  const resetDisclaimer = () => {
    localStorage.removeItem('prathomix_disclaimer_v2')
    toast.success('Disclaimer reset! Reload to show.')
  }

  const renderSection = () => {
    switch (section) {
      case 'profile':
        return (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-full bg-teal-300/25 blur-2xl" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-sage-500 text-white shadow-teal-lg ring-1 ring-white/70">
                      <UserRound size={40} />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Profile</p>
                    <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      {displayName}
                    </h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      Identity snapshot that matches the patient profile page and the navbar dropdown.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full glass-sage px-3 py-1.5 text-xs font-semibold text-sage-600">
                        <ShieldCheck size={13} /> Patient ID · {settingsUserId ? settingsUserId.slice(0, 8).toUpperCase() : 'VERIFIED'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-600">
                        <Activity size={13} className="text-teal-600" /> Active rehab plan
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-teal-200 hover:text-teal-700 hover:shadow-sm"
                >
                  <HeartPulse size={15} />
                  Open Full Profile
                  <ChevronRight size={15} />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Age', value: (currentUser as any)?.user_metadata?.age || '29' },
                  { label: 'Gender', value: (currentUser as any)?.user_metadata?.gender || 'Male' },
                  { label: 'Blood Group', value: (currentUser as any)?.user_metadata?.blood_group || 'O+' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{item.label}</div>
                    <div className="mt-2 text-lg font-black text-slate-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Phone size={13} className="text-teal-600" /> {(currentUser as any)?.user_metadata?.phone || (currentUser as any)?.phone || 'Not provided'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Mail size={13} className="text-teal-600" /> {currentUser?.email || 'patient@prathomix.in'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full glass-sage px-3 py-1.5 text-xs font-semibold text-sage-600">
                  <Clock3 size={13} /> Synced via Supabase Auth
                </span>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="glass-sage rounded-[2rem] p-6 shadow-glass-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Profile Integration</p>
              <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">One identity, multiple surfaces</h4>

              <div className="mt-5 space-y-3">
                {[
                  'The navbar dropdown routes directly to /profile.',
                  'The settings sidebar keeps the same patient name and avatar language.',
                  'This page mirrors the teal-and-sage glass treatment used on the profile screen.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-600" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] glass bg-white/75 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Activity size={14} className="text-teal-600" /> Clinical Snapshot
                </div>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-500">Primary Diagnosis</span>
                    <span className="text-sm font-bold text-slate-900">{(currentUser as any)?.user_metadata?.condition || 'Physical Rehab Program'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-500">Treating Physician</span>
                    <span className="text-sm font-bold text-slate-900">Dr. Dheerendra Pratap Singh</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-500">Therapy Status</span>
                    <span className="text-sm font-bold text-slate-900">Active</span>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        )

      case 'language':
        return (
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Language & Region</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Visual language cards</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Replace dropdowns with distinct Bento cards that highlight the current region and language.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full glass-sage px-3 py-1.5 text-xs font-semibold text-sage-600">
                  <Globe size={13} /> {currentLanguage?.flag} {currentLanguage?.label}
                </div>
              </div>

              <LayoutGroup>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                  {LANGUAGES.map((language) => {
                    const active = lang === language.code

                    return (
                      <motion.button
                        key={language.code}
                        type="button"
                        onClick={() => setLang(language.code)}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative overflow-hidden rounded-[1.5rem] border p-4 text-left transition-colors ${
                          active ? 'border-teal-500/30 bg-white/85 shadow-teal-sm' : 'border-white/70 bg-white/60 hover:border-teal-200'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="settings-language-active"
                            className="absolute inset-0 rounded-[1.5rem] border border-teal-500/20 bg-teal-50/70"
                          />
                        )}

                        <div className="relative flex items-start justify-between gap-3">
                          <div>
                            <div className="text-2xl">{language.flag}</div>
                            <div className="mt-3 text-base font-bold text-slate-900">{language.label}</div>
                            <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-400">{language.code}</div>
                          </div>
                          {active && <Check size={16} className="text-teal-600" />}
                        </div>

                        <p className="relative mt-4 text-sm leading-6 text-slate-500">
                          {LANGUAGE_COPY[language.code]}
                        </p>
                      </motion.button>
                    )
                  })}
                </div>
              </LayoutGroup>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Voice AI (Hinglish)</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Spoken rehab cues</h4>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Volume2 size={18} />
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Voice feedback</div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">
                      The assistant speaks corrective cues aloud during rehab sessions.
                    </div>
                  </div>
                  <ToggleSwitch
                    value={voice}
                    onChange={(next) => {
                      setVoice(next)
                      if (!next) {
                        stopSpeech()
                      }
                    }}
                    ariaLabel="Toggle Voice AI Hinglish"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] glass-sage p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">Current region</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{currentLanguage?.label}</div>
                  <div className="mt-1 text-sm text-slate-500">Selected in the language grid.</div>
                </div>
                <div className="rounded-[1.5rem] glass p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    <Brain size={14} className="text-teal-600" /> TTS profile
                  </div>
                  <div className="mt-2 text-lg font-black text-slate-900">Clinical hints</div>
                  <div className="mt-1 text-sm text-slate-500">Optimized for guided movement feedback.</div>
                </div>
              </div>
            </motion.section>
          </div>
        )

      case 'notifications':
        return (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Notifications</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Delivery channels</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Keep reminders premium and calm with iOS-style controls for every active notification channel.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <Bell size={13} className="text-teal-600" /> Smart reminders
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    title: 'WhatsApp Reminders',
                    description: 'Exercise and appointment reminders.',
                    icon: Bell,
                    value: wa,
                    onChange: setWa,
                  },
                  {
                    title: 'SMS Fallback',
                    description: 'Activates when WhatsApp delivery is unavailable.',
                    icon: Smartphone,
                    value: sms,
                    onChange: setSms,
                  },
                  {
                    title: 'Email Updates',
                    description: 'Weekly progress and prescription summaries.',
                    icon: Mail,
                    value: email,
                    onChange: setEmail,
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.title}
                      className={`flex items-center justify-between gap-4 rounded-[1.5rem] border px-4 py-4 transition-colors ${
                        item.value ? 'border-teal-500/20 bg-white/85' : 'border-white/70 bg-white/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-1 text-sm leading-6 text-slate-500">{item.description}</div>
                        </div>
                      </div>

                      <ToggleSwitch value={item.value} onChange={item.onChange} ariaLabel={`Toggle ${item.title}`} />
                    </div>
                  )
                })}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="glass-sage rounded-[2rem] p-6 shadow-glass-lg"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Delivery summary</p>
              <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">How updates reach the patient</h4>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">WhatsApp primary</span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">SMS fallback</span>
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">Email digest</span>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  { label: 'Primary channel', value: 'WhatsApp' },
                  { label: 'Fallback', value: 'SMS' },
                  { label: 'Weekly digest', value: 'Email' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-500">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-white/75 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Clock3 size={14} className="text-teal-600" /> Reminder cadence
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  WhatsApp remains the primary channel for timely reminders. SMS steps in if delivery fails, and email captures the broader weekly story.
                </p>
              </div>
            </motion.section>
          </div>
        )

      case 'caregiver':
        return (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Caregiver Access</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Linked profiles</h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Modern avatar circles, crisp names, and direct revoke controls for trusted support accounts.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full glass-sage px-3 py-1.5 text-xs font-semibold text-sage-600">
                  <Users size={13} /> {caregivers.length} linked
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {caregivers.map((caregiver) => (
                  <div
                    key={caregiver.id}
                    className="flex flex-col gap-4 rounded-[1.5rem] border border-white/70 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-sage-500 text-sm font-black text-white shadow-teal">
                        {caregiver.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-base font-bold text-slate-900">{caregiver.name}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span>{caregiver.phone}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300" />
                          <span>{caregiver.relation}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => revokeCaregiver(caregiver.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      <Trash2 size={15} />
                      Revoke Access
                    </button>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="glass-sage rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/75 text-teal-700 shadow-sm">
                  <UserPlus size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Add Caregiver</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Invite trusted support</h4>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  value={cgName}
                  onChange={(event) => setCgName(event.target.value)}
                  placeholder="Full Name"
                  className="input-glass rounded-2xl px-4 py-3 text-sm font-body placeholder:text-slate-400"
                />
                <input
                  value={cgPhone}
                  onChange={(event) => setCgPhone(event.target.value)}
                  placeholder="+91 Phone Number"
                  type="tel"
                  className="input-glass rounded-2xl px-4 py-3 text-sm font-body placeholder:text-slate-400"
                />
                <input
                  value={cgRelation}
                  onChange={(event) => setCgRelation(event.target.value)}
                  placeholder="Relationship"
                  className="input-glass rounded-2xl px-4 py-3 text-sm font-body placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={addCaregiver}
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-sage-500 px-4 py-3 text-sm font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5 hover:shadow-teal-lg"
              >
                <UserPlus size={16} />
                Add Caregiver
              </button>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Caregivers can monitor recovery progress without editing clinical notes or prescriptions.
              </p>
            </motion.section>
          </div>
        )

      case 'privacy':
        return (
          <div className="grid gap-4 xl:grid-cols-3">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Privacy & Security</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Security architecture</h4>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {['JWT', 'Supabase RLS', 'AES-256', 'Private routes'].map((item) => (
                  <span key={item} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {[
                  'The admin portal remains hidden from public navigation.',
                  'Patient and caregiver data stay separated by role-aware access rules.',
                  'Clinical content keeps a low-noise, glass-first visual language.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-600" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Compliance & Consent</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Health-grade guardrails</h4>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {['HIPAA awareness', 'DPDP 2023', 'Audit trail', 'Consent logs'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-white/75 px-4 py-3">
                    <span className="text-sm font-semibold text-slate-500">{item}</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] glass-sage p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">Status</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Identity, caregiver access, and profile data remain separated by the same demo-first security model used across the app.
                </p>
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Trash2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">Data Control</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Request deletion</h4>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Request deletion of all personal and health data from Prathomix servers when needed.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-100"
              >
                <Trash2 size={16} />
                Request Data Deletion
              </button>

              <div className="mt-5 rounded-[1.5rem] bg-white/75 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Activity size={14} className="text-teal-600" /> Ghost route
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The /admin route stays hidden from the public navigation and remains role-protected.
                </p>
              </div>
            </motion.section>
          </div>
        )

      case 'app':
        return (
          <div className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass rounded-[2rem] p-6 shadow-glass-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  {dark ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">App Preferences</p>
                  <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Appearance</h4>
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Dark Mode</div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">
                      A visual preference for the demo settings shell.
                    </div>
                  </div>
                  <ToggleSwitch value={dark} onChange={handleDarkToggle} ariaLabel="Toggle dark mode" />
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] glass-sage p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-600">Accessibility note</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The interface stays light, glass-first, and low-noise to match the rest of the Prathomix experience.
                </p>
              </div>
            </motion.section>

            <div className="space-y-4">
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="glass rounded-[2rem] p-6 shadow-glass-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Guided Tour</p>
                    <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Reset onboarding</h4>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Replay the interactive onboarding tour and re-open the premium feature walkthrough.
                </p>

                <button
                  type="button"
                  onClick={resetTour}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-sage-500 px-4 py-3 text-sm font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5 hover:shadow-teal-lg"
                >
                  <Sparkles size={16} />
                  Reset Tour
                </button>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                className="glass rounded-[2rem] p-6 shadow-glass-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-500">Legal Disclaimer</p>
                    <h4 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Reset modal state</h4>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Show the zero-liability disclaimer again on the next visit.
                </p>

                <button
                  type="button"
                  onClick={resetDisclaimer}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                >
                  <Shield size={16} />
                  Reset Disclaimer
                </button>
              </motion.section>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="mesh-bg min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl"
          animate={{ y: [0, -14, 0], x: [0, 10, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute right-0 top-36 h-80 w-80 rounded-full bg-sage-500/15 blur-3xl"
          animate={{ y: [0, 12, 0], x: [0, -12, 0], scale: [1, 1.04, 1] }}
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

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              <Settings size={14} /> macOS Control Center
            </div>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Settings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Split-view preferences with Bento cards, glassmorphic surfaces, and motion-first controls.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold text-slate-700">
              <Activity size={14} className="text-teal-600" /> {(currentUser as any)?.user_metadata?.condition || 'Physical Rehab Program'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full glass-sage px-4 py-2 text-sm font-semibold text-sage-600">
              <ShieldCheck size={14} /> Profile linked
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="glass relative self-start overflow-hidden rounded-[2rem] p-4 shadow-glass-lg lg:sticky lg:top-24">
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-teal-50/60" />
            <div className="relative">
              <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-sage-500 text-lg font-black text-white shadow-teal">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Profile</p>
                    <h2 className="mt-1 truncate text-lg font-black text-slate-900">{displayName}</h2>
                    <p className="mt-1 text-xs text-slate-500">Patient ID · {settingsUserId ? settingsUserId.slice(0, 8).toUpperCase() : 'VERIFIED'}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/75 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Age</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{(currentUser as any)?.user_metadata?.age || '29'}</div>
                  </div>
                  <div className="rounded-2xl bg-white/75 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Mode</div>
                    <div className="mt-1 text-sm font-black text-slate-900">ACL Rehab</div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white/85 px-4 py-2.5 text-sm font-semibold text-teal-700 transition-all hover:border-teal-300 hover:bg-white"
                >
                  <HeartPulse size={15} />
                  Open Full Profile
                </Link>
              </div>

              <LayoutGroup>
                <div className="mt-4 space-y-2">
                  {SECTIONS.map((item) => {
                    const Icon = item.icon
                    const active = section === item.id

                    return (
                      <motion.button
                        key={item.id}
                        type="button"
                        onClick={() => setSection(item.id)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        className={`relative flex w-full items-center gap-3 overflow-hidden rounded-[1.35rem] px-4 py-3 text-left transition-colors ${
                          active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="settings-sidebar-active"
                            className="absolute inset-0 rounded-[1.35rem] bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-teal-500/10"
                          />
                        )}

                        <span
                          className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${
                            active ? 'bg-teal-50 text-teal-700' : 'bg-slate-100/80 text-slate-500'
                          }`}
                        >
                          <Icon size={18} />
                        </span>

                        <span className="relative min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className="block text-[11px] leading-4 text-slate-400">{item.description}</span>
                        </span>

                        {active && <ChevronRight size={16} className="relative text-teal-500" />}
                      </motion.button>
                    )
                  })}
                </div>
              </LayoutGroup>

              <div className="relative mt-4 rounded-[1.5rem] glass-sage px-4 py-3 text-xs font-semibold text-sage-600">
                <div className="flex items-center gap-2">
                  <Clock3 size={13} /> Autosaves locally before API sync
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <LayoutGroup>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {renderSection()}
                </motion.div>
              </AnimatePresence>
            </LayoutGroup>

            <div className="mt-6 flex flex-col gap-3 rounded-[1.6rem] glass px-5 py-4 shadow-glass-lg sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">Ready to sync your changes?</div>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Language, reminders, and access preferences can be saved in one calm pass.
                </p>
              </div>

              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-sage-500 px-5 py-3 text-sm font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5 hover:shadow-teal-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  )
}
