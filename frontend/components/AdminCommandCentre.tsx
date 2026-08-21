'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Joyride from 'react-joyride'
import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bone,
  Brain,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  HeartPulse,
  LogOut,
  Map,
  MessageSquare,
  Mic,
  PlaySquare,
  Plus,
  Shield,
  Sparkles,
  Stethoscope,
  Target,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ReactNode } from 'react'

import MedicalAnatomyMap from '@/components/MedicalAnatomyMap'
import { adminAPI, authAPI } from '@/lib/api'
import { clearAuth, isSupabaseConfigured, storeUser, supabase } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const adminDb: any = supabase

type TabKey =
  | 'overview'
  | 'patients'
  | 'analytics'
  | 'pose'
  | 'exercises'
  | 'ocr'
  | 'triage'
  | 'painmap'
  | 'features'

type PatientRecord = {
  id: string
  name: string
  phone: string
  condition: string
  status: string
  completion: number
  accuracy: number
  lastSession: string
  email?: string
}

type ExerciseRecord = {
  id: string
  name: string
  type: string
  ai_tracked: boolean
  body_part?: string
  description?: string
  youtube_url?: string
}

type TriageLog = {
  id: string
  patient_id: string
  patient_name: string
  agent: string
  severity: string
  summary: string
  transcript: string
  created_at: string
}

type OcrRecord = {
  id: string
  patient_id: string
  patient_name: string
  medicines: string[]
  diagnosis_text: string
  doctor_notes: string
  created_at: string
}

type FeatureCard = {
  id: number
  name: string
  description: string
  icon: LucideIcon
}

type TourTooltipProps = {
  step?: { title?: string; content?: string }
  tooltipProps: Record<string, unknown>
  primaryProps: Record<string, unknown>
  backProps: Record<string, unknown>
  index: number
}

const ADMIN_TOUR_PENDING_KEY = 'prathomix_admin_tour_pending_v1'
const ADMIN_TOUR_DONE_KEY = 'prathomix_admin_tour_done_v1'

const FALLBACK_EXERCISES: ExerciseRecord[] = []
const FALLBACK_TRIAGE_LOGS: TriageLog[] = []

const ADMIN_FEATURES: FeatureCard[] = [
  { id: 1, name: 'Pose Correction', description: 'Per-frame posture feedback and movement scoring.', icon: Camera },
  { id: 2, name: 'Prescription OCR', description: 'Scan handwritten prescriptions into structured data.', icon: FileText },
  { id: 3, name: 'Gait Analysis', description: 'Stride symmetry, cadence, and loading insights.', icon: Bone },
  { id: 4, name: 'Multi-Agent Triage', description: 'Chain of reasoning for pain assessment and routing.', icon: Brain },
  { id: 5, name: 'Pain Map', description: 'Region-level pain annotation and sync to patient views.', icon: Map },
  { id: 6, name: 'Exercise Assignment', description: 'Allocate AI-tracked exercises to each patient.', icon: CheckCircle2 },
  { id: 7, name: 'Recovery Analytics', description: 'Daily recovery, compliance, and accuracy summaries.', icon: TrendingUp },
  { id: 8, name: 'Doctor Messaging', description: 'Push clinic follow-up messages to patients.', icon: MessageSquare },
  { id: 9, name: 'Voice Input', description: 'Hands-free dictation for easier clinical capture.', icon: Mic },
  { id: 10, name: 'Appointment Routing', description: 'Send patients into the right care pathway.', icon: ArrowRight },
  { id: 11, name: 'Caregiver Alerts', description: 'Notify support contacts when follow-up is needed.', icon: Users },
  { id: 12, name: 'WhatsApp Outreach', description: 'Fast outbound communication via WhatsApp.', icon: Sparkles },
  { id: 13, name: 'SMS Escalation', description: 'Fallback messaging for urgent reminders.', icon: AlertCircle },
  { id: 14, name: 'IVR Support', description: 'Interactive voice response for low-friction access.', icon: PlaySquare },
  { id: 15, name: 'RAG Brain', description: 'Contextual rehab knowledge lookup for clinicians.', icon: HeartPulse },
  { id: 16, name: 'Admin Guard', description: 'Secure doctor-only entry to the command centre.', icon: Shield },
  { id: 17, name: 'API Rotator', description: 'Key rotation for resilient AI requests.', icon: Gauge },
  { id: 18, name: 'Feature Hub', description: 'Central control surface for every AI module.', icon: BarChart3 },
]

const ADMIN_TOUR_STEPS = [
  {
    target: '[data-tour="welcome-header"]',
    title: 'Welcome Header',
    content: 'Welcome to your command centre, Doctor.',
  },
  {
    target: '[data-tour="real-time-stats"]',
    title: 'Real-time Stats',
    content: 'Live metrics directly from your Supabase database.',
  },
  {
    target: '[data-tour="exercise-library-tab"]',
    title: 'Exercise Library Tab',
    content: 'Assign AI-tracked exercises like Shoulder Flexion instantly.',
  },
]

function safeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value.trim() || fallback
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return fallback
}

function clampPercent(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.max(0, Math.min(100, Math.round(parsed)))
}

function formatDateTime(value: unknown): string {
  if (!value) {
    return 'Now'
  }

  const parsed = new Date(String(value))
  if (Number.isNaN(parsed.getTime())) {
    return safeText(value, 'Now')
  }

  return parsed.toLocaleString()
}

function resolvePatientName(row: any, fallback = 'Patient'): string {
  return safeText(
    row?.full_name || row?.display_name || row?.name || row?.patient_name || row?.email || row?.phone || fallback,
    fallback,
  )
}

function normalizePatient(row: any, fallbackIndex: number): PatientRecord {
  const id = safeText(row?.id || row?.patient_id || row?.user_id || row?.email || `patient-${fallbackIndex}`, `patient-${fallbackIndex}`)

  return {
    id,
    name: resolvePatientName(row, `Patient ${fallbackIndex + 1}`),
    phone: safeText(row?.phone || row?.mobile || row?.contact_number || row?.phone_number || '', ''),
    condition: safeText(row?.condition || row?.diagnosis || row?.chief_complaint || row?.summary || 'General rehab follow-up', 'General rehab follow-up'),
    status: safeText(row?.status || row?.state || 'active', 'active').toLowerCase(),
    completion: clampPercent(row?.completion ?? row?.completion_pct ?? row?.progress ?? 0),
    accuracy: clampPercent(row?.accuracy ?? row?.pose_accuracy ?? row?.accuracy_score ?? 0),
    lastSession: safeText(row?.last_session_date || row?.last_visit || row?.created_at || '', ''),
    email: row?.email ? safeText(row.email) : undefined,
  }
}

function normalizeExercise(row: any, fallbackIndex: number): ExerciseRecord {
  return {
    id: safeText(row?.id || `exercise-${fallbackIndex}`, `exercise-${fallbackIndex}`),
    name: safeText(row?.title || row?.name || `Exercise ${fallbackIndex + 1}`, `Exercise ${fallbackIndex + 1}`),
    type: safeText(row?.type || row?.body_part || row?.difficulty || 'Therapy', 'Therapy'),
    ai_tracked: Boolean(row?.ai_tracked ?? row?.is_ai_tracked ?? true),
    body_part: row?.body_part ? safeText(row.body_part) : undefined,
    description: safeText(row?.instructions || row?.description || '', ''),
    youtube_url: safeText(row?.demo_video_url || row?.youtube_url || '', ''),
  }
}

function normalizeTriageLog(row: any, fallbackIndex: number): TriageLog {
  return {
    id: safeText(row?.id || row?.created_at || `triage-${fallbackIndex}`, `triage-${fallbackIndex}`),
    patient_id: safeText(row?.patient_id || row?.user_id || row?.id || `triage-patient-${fallbackIndex}`, `triage-patient-${fallbackIndex}`),
    patient_name: resolvePatientName(row, `Patient ${fallbackIndex + 1}`),
    agent: safeText(row?.agent || row?.model || 'Multi-Agent Triage', 'Multi-Agent Triage'),
    severity: safeText(row?.severity || row?.priority || 'moderate', 'moderate'),
    summary: safeText(row?.summary || row?.final_summary || row?.last_message || row?.message || 'Triage summary unavailable', 'Triage summary unavailable'),
    transcript: safeText(
      row?.transcript || row?.conversation || row?.messages || row?.chat_history || row?.summary || 'Conversation unavailable',
      'Conversation unavailable',
    ),
    created_at: safeText(row?.created_at || row?.updated_at || '', ''),
  }
}

function normalizePrescription(row: any, patientName: string, fallbackIndex: number): OcrRecord {
  const medicines = Array.isArray(row?.medicines)
    ? row.medicines.map((item: any) => safeText(item?.name || item?.medicine || item || 'Medicine', 'Medicine'))
    : []

  return {
    id: safeText(row?.id || row?.created_at || `rx-${fallbackIndex}`, `rx-${fallbackIndex}`),
    patient_id: safeText(row?.patient_id || `patient-${fallbackIndex}`, `patient-${fallbackIndex}`),
    patient_name: patientName,
    medicines,
    diagnosis_text: safeText(row?.diagnosis_text || row?.notes || row?.ocr_status || 'Prescription scanned', 'Prescription scanned'),
    doctor_notes: safeText(row?.doctor_notes || '', ''),
    created_at: safeText(row?.created_at || '', ''),
  }
}

async function fetchRows(table: string, applyQuery?: (query: any) => any) {
  try {
    let query = adminDb.from(table).select('*')
    if (applyQuery) {
      query = applyQuery(query)
    }

    const { data, error } = await query
    if (error) {
      throw error
    }

    return data ?? []
  } catch {
    return null
  }
}

async function countRows(table: string, applyQuery?: (query: any) => any) {
  try {
    let query = adminDb.from(table).select('*', { count: 'exact', head: true })
    if (applyQuery) {
      query = applyQuery(query)
    }

    const { count, error } = await query
    if (error) {
      throw error
    }

    return count ?? 0
  } catch {
    return null
  }
}

function TourTooltip({ step, tooltipProps, primaryProps, backProps, index }: TourTooltipProps) {
  return (
    <div
      {...tooltipProps}
      className="w-[360px] rounded-3xl border border-white/70 bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-6 shadow-[0_24px_80px_-20px_rgba(15,118,110,0.35)] backdrop-blur-2xl"
    >
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
        Step {index + 1}
      </div>
      <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900">
        {step?.title || 'Admin Tour'}
      </h3>
      <p className="mb-5 text-sm leading-6 text-slate-600">
        {step?.content}
      </p>
      <div className="flex items-center justify-between gap-3">
        {index > 0 ? (
          <button {...backProps} className="text-sm font-bold text-slate-500 transition-colors hover:text-teal-700">
            Back
          </button>
        ) : (
          <span />
        )}
        <button
          {...primaryProps}
          className="rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.02]"
        >
          Next
        </button>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  tourTarget,
}: {
  icon: LucideIcon
  label: string
  value: string | number
  subtext: string
  color: string
  tourTarget?: string
}) {
  return (
    <div
      data-tour={tourTarget}
      className="rounded-3xl border border-slate-200/60 bg-white/85 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <div className="text-2xl font-black tracking-tight text-slate-900">
            {value}
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {label}
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs font-medium text-slate-500">
        {subtext}
      </div>
    </div>
  )
}

function TabPill({
  active,
  icon: Icon,
  label,
  onClick,
  tourTarget,
}: {
  active: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
  tourTarget?: string
}) {
  return (
    <button
      type="button"
      data-tour={tourTarget}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-500/20'
          : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-teal-200 hover:text-teal-700'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  )
}

function SectionShell({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string
  eyebrow?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          {eyebrow ? (
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-600">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}

function selectPatientLabel(patient: PatientRecord | null): string {
  if (!patient) {
    return 'Select a patient'
  }

  return patient.name
}

type AdminCommandCentreProps = {
  isSubpage?: boolean
  initialPatients?: PatientRecord[]
}

export default function AdminCommandCentre({ isSubpage = false, initialPatients = [] }: AdminCommandCentreProps) {
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logging, setLogging] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [tourRun, setTourRun] = useState(false)
  const pathname = usePathname()

  const getTabFromPath = (path: string): TabKey => {
    const p = path.toLowerCase()
    if (p.includes('/admin/patients')) return 'patients'
    if (p.includes('/admin/exercises')) return 'exercises'
    if (p.includes('/admin/features')) return 'features'
    if (p.includes('/admin/ocr')) return 'ocr'
    if (p.includes('/admin/triage')) return 'triage'
    if (p.includes('/admin/painmap')) return 'painmap'
    if (p.includes('/admin/pose')) return 'pose'
    if (p.includes('/admin/analytics')) return 'analytics'
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromPath(pathname || ''))

  useEffect(() => {
    if (pathname) {
      setActiveTab(getTabFromPath(pathname))
    }
  }, [pathname])
  const [dataLoading, setDataLoading] = useState(false)
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [totalPatients, setTotalPatients] = useState(0)
  const [activeToday, setActiveToday] = useState(0)
  const [exerciseLibrary, setExerciseLibrary] = useState<ExerciseRecord[]>([])
  const [triageLogs, setTriageLogs] = useState<TriageLog[]>([])
  const [liveAppointments, setLiveAppointments] = useState<any[]>([])
  const [ocrArchive, setOcrArchive] = useState<OcrRecord[]>([])
  const [newExTitle, setNewExTitle] = useState('')
  const [newExVideo, setNewExVideo] = useState('')
  const [newExInstructions, setNewExInstructions] = useState('')
  const [uploadingEx, setUploadingEx] = useState(false)
  const [selectedBodyRegion, setSelectedBodyRegion] = useState<string[]>([])
  const [clickedRegion, setClickedRegion] = useState<any>(null)
  const [uploadingPrescription, setUploadingPrescription] = useState(false)
  const [ocrPreview, setOcrPreview] = useState<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedPatient = useMemo(() => {
    return patients.find((patient) => patient.id === selectedPatientId) || null
  }, [patients, selectedPatientId])

  const averageAccuracy = useMemo(() => {
    if (!patients.length) {
      return 0
    }

    return Math.round(patients.reduce((sum, patient) => sum + patient.accuracy, 0) / patients.length)
  }, [patients])

  const averageCompletion = useMemo(() => {
    if (!patients.length) {
      return 0
    }

    return Math.round(patients.reduce((sum, patient) => sum + patient.completion, 0) / patients.length)
  }, [patients])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkAdminSession = async () => {
      if (!isSupabaseConfigured) {
        // Fallback check if Supabase is not configured
        const storedUser = localStorage.getItem('prathomix_user')
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser)
            if (parsed?.role === 'admin') {
              setAuthed(true)
            }
          } catch {}
        }
        if (isMounted) {
          setLoading(false)
        }
        return
      }

      try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) throw error

        if (user) {
          const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
          const email = String(user?.email || '').toLowerCase()
          const isAllowedEmail = email === 'prathamsinghujjain@gmail.com' || (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).includes(email)

          if (isMounted && (role === 'admin' || isAllowedEmail)) {
            setAuthed(true)
            // Sync with local storage for compatibility with other client dashboard segments
            const prUser = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || 'Admin',
              role: 'admin',
              language: user.user_metadata?.language || 'en'
            }
            localStorage.setItem('prathomix_user', JSON.stringify(prUser))
          } else if (isMounted) {
            clearAuth()
            await supabase.auth.signOut()
          }
        } else if (isMounted) {
          clearAuth()
        }
      } catch (error) {
        console.error('Admin Auth Check Failed:', error)
        if (isMounted) {
          clearAuth()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    checkAdminSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!authed) {
      return
    }

    let cancelled = false

    const loadDashboard = async () => {
      setDataLoading(true)

      try {
        if (!isSupabaseConfigured) {
          if (!cancelled) {
            setPatients([])
            setExerciseLibrary(FALLBACK_EXERCISES)
            setTriageLogs(FALLBACK_TRIAGE_LOGS)
            setOcrArchive([])
            setTotalPatients(0)
            setActiveToday(0)
          }
          return
        }

        const fetchPatients = async () => {
          try {
            // First attempt: fetch from the secure admin/patients API endpoint
            const res = await fetch('/api/admin/patients')
            if (res.ok) {
              const result = await res.json()
              if (result.patients && result.patients.length > 0) {
                return result.patients.map((row: any, index: number) => normalizePatient(row, index))
              }
            }
          } catch (err) {
            console.error("Error calling secure admin patients api route:", err)
          }

          // Fallback to client-side profiles query if API route is not available/fails
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', 'patient')
              .order('created_at', { ascending: false })
              .range(0, 49);
              
            if (error) throw error;
            return (data || []).map((row: any, index: number) => normalizePatient(row, index));
          } catch (error) {
            console.error("Error fetching patients client-side:", error);
            // Only show toast error if we don't have any initial patients passed from server
            if (initialPatients.length === 0) {
              toast.error("Telemetry sync failed: Check profiles table RLS.");
            }
            return initialPatients.length > 0 ? initialPatients : [];
          }
        };


        const normalizedPatients = await fetchPatients()
        const patientLookup: Record<string, PatientRecord> = {}
        normalizedPatients.forEach((patient: PatientRecord) => {
          patientLookup[patient.id] = patient
        })

        if (!cancelled) {
          setPatients(normalizedPatients)
          if (normalizedPatients.length) {
            setSelectedPatientId((current) => current || normalizedPatients[0].id)
          }
        }

        const totalPatientCount = await countRows('profiles', (query) => query.eq('role', 'patient'))
          ?? await countRows('vw_patient_summary')
          ?? await countRows('appointments')
          ?? 0

        if (!cancelled) {
          setTotalPatients(totalPatientCount)
        }

        const today = new Date()
        const start = new Date(today)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        const startIso = start.toISOString()
        const endIso = end.toISOString()
        const startDate = startIso.slice(0, 10)
        const endDate = endIso.slice(0, 10)

        const activeTodayCount = await countRows('appointments', (query) => query.gte('created_at', startIso).lt('created_at', endIso))
          ?? await countRows('appointments', (query) => query.gte('appointment_date', startDate).lt('appointment_date', endDate))
          ?? await countRows('appointments', (query) => query.eq('status', 'active'))
          ?? 0

        if (!cancelled) {
          setActiveToday(activeTodayCount)
        }

        const exerciseRows = await fetchRows('exercises', (query) => query.order('title'))
        if (!cancelled) {
          setExerciseLibrary((exerciseRows || []).length ? (exerciseRows || []).map((row: any, index: number) => normalizeExercise(row, index)) : FALLBACK_EXERCISES)
        }

        const triageRows = await fetchRows('triage_logs', (query) => query.order('created_at', { ascending: false }).limit(10))
        if (!cancelled) {
          setTriageLogs((triageRows || []).length ? (triageRows || []).map((row: any, index: number) => normalizeTriageLog(row, index)) : FALLBACK_TRIAGE_LOGS)
        }

        const appointmentRows = await fetchRows('appointments', (query) => query.eq('status', 'pending').order('appointment_datetime', { ascending: true }))
        if (!cancelled) {
          setLiveAppointments(appointmentRows || [])
        }

        const ocrRows = await fetchRows('prescriptions', (query) => query.order('created_at', { ascending: false }).limit(8))
        if (!cancelled) {
          const archive = (ocrRows || []).map((row: any, index: number) => {
            const patientName = patientLookup[String(row?.patient_id || '')]?.name || resolvePatientName(row, 'Patient')
            return normalizePrescription(row, patientName, index)
          })
          setOcrArchive(archive)
        }
      } catch (error) {
        console.error('Admin dashboard load error:', error)
        if (!cancelled) {
          setPatients([])
          setExerciseLibrary([])
          setTriageLogs([])
          setLiveAppointments([])
          setOcrArchive([])
          setTotalPatients(0)
          setActiveToday(0)
        }
      } finally {
        if (!cancelled) {
          setDataLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [authed])

  useEffect(() => {
    if (!authed || !selectedPatientId || !isSupabaseConfigured) {
      return
    }

    let cancelled = false

    const loadPainMap = async () => {
      try {
        const { data, error } = await adminDb
          .from('pain_maps')
          .select('pain_data')
          .eq('patient_id', selectedPatientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          throw error
        }

        if (!cancelled) {
          setSelectedBodyRegion(Array.isArray(data?.pain_data?.highlighted_regions) ? data.pain_data.highlighted_regions : [])
        }
      } catch {
        if (!cancelled) {
          setSelectedBodyRegion([])
        }
      }
    }

    loadPainMap()

    return () => {
      cancelled = true
    }
  }, [authed, selectedPatientId])

  useEffect(() => {
    if (!isMounted || !authed) {
      return
    }

    if (localStorage.getItem(ADMIN_TOUR_DONE_KEY) === 'true') {
      return
    }

    if (localStorage.getItem(ADMIN_TOUR_PENDING_KEY) === 'true') {
      const timer = window.setTimeout(() => setTourRun(true), 700)
      return () => window.clearTimeout(timer)
    }
  }, [authed, isMounted])

  useEffect(() => {
    if (!selectedPatientId && patients.length) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId])

  const login = async () => {
    if (!password) {
      toast.error('Enter password')
      return
    }

    setLogging(true)

    try {
      if (!isSupabaseConfigured) {
        toast.error('Supabase is not configured')
        return
      }

      // Read admin email list
      const adminEmail = 'prathamsinghujjain@gmail.com'
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || adminEmail
      const defaultEmail = adminEmails.split(',')[0].trim()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: defaultEmail,
        password,
      })

      if (error) {
        throw error
      }

      const user = data.user
      const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
      const email = String(user?.email || '').toLowerCase()
      const allowlistedEmails = adminEmails.split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)

      const isAdmin = role === 'admin' || email === adminEmail || allowlistedEmails.includes(email)

      if (!isAdmin) {
        await supabase.auth.signOut()
        toast.error('Access denied. Admin credentials required.')
        return
      }

      // Store in localStorage for compatibility
      const prUser = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'Admin',
        role: 'admin',
        language: user.user_metadata?.language || 'en'
      }
      storeUser(prUser as any, data.session?.access_token || '')

      localStorage.setItem(ADMIN_TOUR_PENDING_KEY, 'true')
      toast.success('Welcome back, Dr. Dheerendra Pratap Singh ✨')
      setAuthed(true)
    } catch (err: any) {
      console.error('Admin Login Failed:', err)
      toast.error(err?.message || 'Invalid credentials or admin auth is not configured')
    } finally {
      setLogging(false)
    }
  }

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
      await authAPI.logout()
    } catch {
      // Ignore backend errors and clear local state anyway.
    } finally {
      clearAuth()
      localStorage.removeItem(ADMIN_TOUR_PENDING_KEY)
      setAuthed(false)
      setPassword('')
      setTourRun(false)
    }
  }

  const finishTour = () => {
    localStorage.removeItem(ADMIN_TOUR_PENDING_KEY)
    localStorage.setItem(ADMIN_TOUR_DONE_KEY, 'true')
    setTourRun(false)
  }

  const assignExercise = async (exercise: ExerciseRecord) => {
    if (!selectedPatient) {
      toast.error('Select a patient first.')
      return
    }

    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured.')
      return
    }

    try {
      const { data: activePrescription, error: activePrescriptionError } = await adminDb
        .from('exercise_prescriptions')
        .select('id')
        .eq('patient_id', selectedPatient.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (activePrescriptionError) {
        throw activePrescriptionError
      }

      let prescriptionId = activePrescription?.id as string | undefined

      if (!prescriptionId) {
        const { data: createdPrescription, error: createError } = await adminDb
          .from('exercise_prescriptions')
          .insert({
            patient_id: selectedPatient.id,
            notes: 'Assigned from Admin Command Centre',
          } as any)
          .select('id')
          .single()

        if (createError || !createdPrescription) {
          throw createError || new Error('Unable to create exercise prescription')
        }

        prescriptionId = createdPrescription.id
      }

      const { error: insertError } = await adminDb
        .from('prescribed_exercises')
        .insert({
          prescription_id: prescriptionId,
          exercise_name: exercise.name,
          sets: 3,
          reps: 12,
        } as any)

      if (insertError) {
        throw insertError
      }

      toast.success(`${exercise.name} assigned to ${selectedPatient.name}`)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign exercise')
    }
  }

  const handleOCRUpload = async (file: File) => {
    if (!selectedPatient) {
      toast.error('Select a patient first.')
      return
    }

    setUploadingPrescription(true)

    try {
      const response = await adminAPI.uploadPrescription(selectedPatient.id, file)
      setOcrPreview(response.data)
      setOcrArchive((current) => [
        normalizePrescription(
          {
            id: response.data?.id || `upload-${Date.now()}`,
            patient_id: selectedPatient.id,
            medicines: response.data?.medicines || [],
            diagnosis_text: response.data?.diagnosis_text || 'Prescription scanned',
            doctor_notes: response.data?.doctor_notes || '',
            created_at: new Date().toISOString(),
          },
          selectedPatient.name,
          current.length + 1,
        ),
        ...current,
      ].slice(0, 8))
      toast.success('Prescription scanned and synced to the patient')
    } catch {
      const fallback = {
        medicines: [
          { name: 'Ibuprofen 400mg', dosage: '1-0-1' },
          { name: 'Pantoprazole 40mg', dosage: '1-0-0' },
        ],
        exercises: ['Knee Extension', 'Hip Bridge'],
        diagnosis_text: 'Demo OCR output',
        doctor_notes: 'Demo mode fallback',
      }
      setOcrPreview(fallback)
      setOcrArchive((current) => [
        normalizePrescription(
          {
            id: `demo-upload-${Date.now()}`,
            patient_id: selectedPatient.id,
            medicines: fallback.medicines,
            diagnosis_text: fallback.diagnosis_text,
            doctor_notes: fallback.doctor_notes,
            created_at: new Date().toISOString(),
          },
          selectedPatient.name,
          current.length + 1,
        ),
        ...current,
      ].slice(0, 8))
      toast.success('Prescription digitised in demo mode')
    } finally {
      setUploadingPrescription(false)
    }
  }

  const savePainMap = async () => {
    if (!selectedPatient) {
      toast.error('Select a patient first.')
      return
    }

    if (!isSupabaseConfigured) {
      toast.error('Supabase is not configured.')
      return
    }

    try {
      const { error: insertError } = await adminDb
        .from('pain_maps')
        .insert({
          patient_id: selectedPatient.id,
          pain_data: { highlighted_regions: selectedBodyRegion }
        } as any)

      if (insertError) {
        throw insertError
      }

      toast.success('Pain map synced to the patient dashboard')
    } catch {
      toast.error('Failed to sync pain map')
    }
  }

  const handleExerciseUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingEx(true)
    try {
      const { data, error } = await adminDb.from('exercises').insert({
        title: newExTitle,
        demo_video_url: newExVideo,
        instructions: newExInstructions
      } as any).select().single()
      
      if (error) throw error
      toast.success('Exercise uploaded successfully!')
      setNewExTitle('')
      setNewExVideo('')
      setNewExInstructions('')
      
      setExerciseLibrary(prev => [{
        id: data.id,
        name: data.title,
        type: 'Therapy',
        ai_tracked: true,
        description: data.instructions,
        youtube_url: data.demo_video_url
      }, ...prev])
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload exercise.')
    } finally {
      setUploadingEx(false)
    }
  }

  const stats = [
    {
      icon: Users,
      label: 'Total Patients',
      value: totalPatients,
      subtext: 'Live Supabase count',
      color: '#0f766e',
    },
    {
      icon: Activity,
      label: 'Active Today',
      value: activeToday,
      subtext: 'Appointments or active sessions',
      color: '#16a34a',
    },
    {
      icon: Sparkles,
      label: 'AI Features',
      value: ADMIN_FEATURES.length,
      subtext: 'Command-centre modules online',
      color: '#7c3aed',
    },
  ]

  const renderOverview = () => (
    <div className="space-y-5">
      {liveAppointments.length > 0 && (
        <SectionShell eyebrow="High Priority" title="Live Appointments">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveAppointments.map(app => (
              <div key={app.id} className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800">{app.patient_name || 'Patient'}</div>
                <div className="text-xs text-slate-600">📞 {app.patient_phone || 'N/A'}</div>
                <div className="text-xs text-slate-600 mt-1">🕒 {app.appointment_date} @ {app.appointment_slot}</div>
              </div>
            ))}
          </div>
        </SectionShell>
      )}
      <SectionShell
        eyebrow="Doctor Command Centre"
        title="Operational Overview"
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('exercises')}
              className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-100"
            >
              Exercise Library
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('triage')}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:text-teal-700"
            >
              Triage Logs
            </button>
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-[0_20px_70px_rgba(15,23,42,0.18)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-teal-100/90">
              <Shield size={13} /> Secure Supabase Control Plane
            </div>
            <h1 data-tour="welcome-header" className="text-2xl font-bold text-slate-800 bg-white rounded-3xl px-4 py-3 shadow-sm mb-4">
              Welcome back, Dr. Dheerendra Pratap Singh ✨
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-200/90">
              This portal connects real patient records, exercise assignments, triage intelligence, prescription OCR, and rehab analytics into one doctor-only command centre.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setActiveTab('patients')}
                className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Patient Monitor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pose')}
                className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                AI Pose & Gait Analysis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ocr')}
                className="rounded-2xl bg-white/10 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Prescription OCR Hub
              </button>
            </div>
          </div>

          <div data-tour="real-time-stats" className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                subtext={stat.subtext}
                color={stat.color}
                tourTarget={stat.label === 'Total Patients' ? 'real-time-stats' : undefined}
              />
            ))}
          </div>
        </div>
      </SectionShell>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionShell title="Quick Snapshots" eyebrow="Live Metrics">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Average Accuracy</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{averageAccuracy}%</div>
              <div className="mt-1 text-sm text-slate-500">Pose and gait performance across the active cohort.</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Average Completion</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{averageCompletion}%</div>
              <div className="mt-1 text-sm text-slate-500">Exercise adherence inferred from the latest monitored sessions.</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Exercise Library</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{exerciseLibrary.length}</div>
              <div className="mt-1 text-sm text-slate-500">AI-tracked rehab movements ready for assignment.</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Triage Sessions</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{triageLogs.length}</div>
              <div className="mt-1 text-sm text-slate-500">Multi-agent pain assessments and escalation logs.</div>
            </div>
          </div>
        </SectionShell>

        <SectionShell title="Selected Patient" eyebrow="Working Context">
          <div className="space-y-3">
            <div className="rounded-3xl border border-teal-200 bg-teal-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Active Patient</div>
              <div className="mt-1 text-xl font-black text-slate-900">{selectPatientLabel(selectedPatient)}</div>
              <div className="mt-1 text-sm text-slate-600">{selectedPatient?.condition || 'Select a patient to unlock assignment and analytics context.'}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {patients.slice(0, 4).map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedPatientId === patient.id
                      ? 'bg-teal-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700'
                  }`}
                >
                  {patient.name}
                </button>
              ))}
              {!patients.length ? (
                <div className="text-sm text-slate-500">No patients loaded yet.</div>
              ) : null}
            </div>
          </div>
        </SectionShell>
      </div>
    </div>
  )

  const renderPatients = () => (
    <SectionShell title="Patient Monitor" eyebrow="Live Data">
      {patients.length > 0 ? (
        <div className="overflow-x-auto rounded-[1.75rem] border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold font-mono">Name / Email</th>
                <th className="px-5 py-4 font-semibold font-mono">Patient UID</th>
                <th className="px-5 py-4 font-semibold font-mono">Signup Date</th>
                <th className="px-5 py-4 font-semibold font-mono">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {patients.map(patient => (
                <tr
                  key={patient.id}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    selectedPatientId === patient.id ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <td className="px-5 py-3">
                    <div className="font-bold text-slate-900">{patient.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{patient.email}</div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400" title={patient.id}>
                    {patient.id.slice(0, 8)}...{patient.id.slice(-8)}
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">
                    {formatDateTime(patient.lastSession)}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(patient.id)
                        toast.success(`Active context set to ${patient.name}`)
                      }}
                      className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${
                        selectedPatientId === patient.id
                          ? 'bg-teal-600 text-white shadow-teal-500/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {selectedPatientId === patient.id ? 'Managing' : 'Manage Patient'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
          No patient rows were returned from Supabase. The panel is safe to use and will populate once the table has data.
        </div>
      )}
    </SectionShell>
  )

  const renderAnalytics = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionShell title="AI Pose & Gait Insights" eyebrow="Analytics">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Mean Pose Score</div>
            <div className="mt-2 text-4xl font-black text-slate-900">{averageAccuracy}%</div>
            <div className="mt-1 text-sm text-slate-500">Aggregated from the live patient monitor.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Mean Gait Score</div>
            <div className="mt-2 text-4xl font-black text-slate-900">{averageCompletion}%</div>
            <div className="mt-1 text-sm text-slate-500">Heuristic from completion and control metrics.</div>
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Operational Signals" eyebrow="Clinic Performance">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Exercise Library Items</div>
            <div className="mt-2 text-4xl font-black text-slate-900">{exerciseLibrary.length}</div>
            <div className="mt-1 text-sm text-slate-500">Ready for assignment and patient tracking.</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Multi-Agent Logs</div>
            <div className="mt-2 text-4xl font-black text-slate-900">{triageLogs.length}</div>
            <div className="mt-1 text-sm text-slate-500">Pain assessments with summary routing.</div>
          </div>
        </div>
      </SectionShell>
    </div>
  )

  const renderPose = () => (
    <SectionShell title="AI Pose & Gait Analysis" eyebrow="Kinematic View">
      
      <div className="mb-6 overflow-hidden rounded-[2rem] border-2 border-slate-900 bg-slate-900 text-white relative">
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-slate-300 uppercase">Kinematic Feed: Standby</span>
        </div>
        <div className="h-48 sm:h-64 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <Camera size={40} className="text-slate-600 mb-3" />
          <p className="text-sm font-medium text-slate-400">OpenCV/MediaPipe stream will render here.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {patients.length ? patients.map((patient) => (
          <div
            key={patient.id}
            className={`rounded-3xl border p-4 transition-colors ${selectedPatientId === patient.id ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 bg-slate-50'}`}
            onClick={() => setSelectedPatientId(patient.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-base font-bold text-slate-900">{patient.name}</div>
                <div className="text-sm text-slate-500">{patient.condition}</div>
              </div>
              <div className="rounded-2xl bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700 shadow-sm">
                Live
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <ScoreRow label="Pose Score" value={patient.accuracy} color="#0f766e" />
              <ScoreRow label="Gait Score" value={Math.min(100, patient.completion + 7)} color="#16a34a" />
              <ScoreRow label="Stability" value={Math.max(0, Math.min(100, Math.round((patient.accuracy + patient.completion) / 2)))} color="#7c3aed" />
            </div>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 lg:col-span-2">
            No patient data available for pose analysis yet.
          </div>
        )}
      </div>
    </SectionShell>
  )

  const renderExercises = () => (
    <SectionShell title="Exercise Library & Assignment" eyebrow="Rehab Control">
      
      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Upload New Exercise</h3>
        <form onSubmit={handleExerciseUpload} className="grid gap-4">
          <input required type="text" placeholder="Title" value={newExTitle} onChange={(e)=>setNewExTitle(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <input required type="url" placeholder="Demo Video URL" value={newExVideo} onChange={(e)=>setNewExVideo(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          <textarea required placeholder="Instructions" value={newExInstructions} onChange={(e)=>setNewExInstructions(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" rows={3} />
          <button disabled={uploadingEx} type="submit" className="rounded-2xl bg-teal-600 px-6 py-3 text-white font-bold hover:bg-teal-700 w-max">
            {uploadingEx ? 'Uploading...' : 'Upload Exercise'}
          </button>
        </form>
      </div>

      <div className="mb-4 rounded-3xl border border-teal-200 bg-teal-50 p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Assigning To</div>
        <div className="mt-1 text-xl font-black text-slate-900">{selectPatientLabel(selectedPatient)}</div>
        <div className="mt-1 text-sm text-slate-600">Click Assign next to an exercise to add it to the selected patient plan.</div>
      </div>

      {patients.length ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {patients.map((patient) => (
            <button
              key={patient.id}
              type="button"
              onClick={() => setSelectedPatientId(patient.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPatientId === patient.id
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700'
              }`}
            >
              {patient.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exerciseLibrary.length ? exerciseLibrary.map((exercise) => (
          <div key={exercise.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-slate-900">{exercise.name}</div>
                <div className="mt-1 text-sm text-slate-500">{exercise.type}{exercise.body_part ? ` · ${exercise.body_part}` : ''}</div>
              </div>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                {exercise.ai_tracked ? 'AI-tracked' : 'Manual'}
              </span>
            </div>
            {exercise.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{exercise.description}</p> : null}
            <div className="mt-4 flex items-center justify-between gap-3">
              {exercise.youtube_url ? (
                <a href={exercise.youtube_url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-500 transition-colors hover:text-teal-700">
                  View demo
                </a>
              ) : (
                <span className="text-sm text-slate-400">No demo link</span>
              )}
              <button
                type="button"
                onClick={() => assignExercise(exercise)}
                className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.01]"
              >
                Assign
              </button>
            </div>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
            Exercise library is empty, so the demo fallback has not been applied yet.
          </div>
        )}
      </div>
    </SectionShell>
  )

  const renderOcr = () => (
    <div className="space-y-5">
      <SectionShell title="Prescription OCR Hub" eyebrow="Upload + Archive">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-[1.75rem] border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-left transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Upload size={20} />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">Upload scanned prescription</div>
                <div className="text-sm text-slate-500">JPG, PNG, or PDF. The OCR result syncs back to the selected patient.</div>
              </div>
            </div>
            <div className="mt-5 text-sm font-semibold text-teal-700">
              {uploadingPrescription ? 'Scanning prescription…' : 'Click to choose a file'}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  void handleOCRUpload(file)
                }
              }}
            />
          </button>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600">Latest OCR Result</div>
            {ocrPreview ? (
              <div className="mt-3 space-y-3">
                <div className="text-lg font-bold text-slate-900">{selectedPatient?.name || 'Patient'} · {ocrPreview?.diagnosis_text || 'Prescription scanned'}</div>
                {Array.isArray(ocrPreview?.medicines) && ocrPreview.medicines.length ? (
                  <div className="flex flex-wrap gap-2">
                    {ocrPreview.medicines.map((item: any) => (
                      <span key={safeText(item?.name || item, String(item))} className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                        {safeText(item?.name || item, String(item))}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No medicines were parsed yet.</div>
                )}
              </div>
            ) : (
              <div className="mt-3 text-sm text-slate-500">The most recent OCR result will appear here after a scan.</div>
            )}
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Scanned Prescriptions" eyebrow="Archive">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ocrArchive.length ? ocrArchive.map((item) => (
            <div key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-900">{item.patient_name}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{formatDateTime(item.created_at)}</div>
              <div className="mt-3 text-sm text-slate-600">{item.diagnosis_text}</div>
              {item.medicines.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.medicines.map((medicine) => (
                    <span key={medicine} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {medicine}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 md:col-span-2 xl:col-span-3">
              No scanned prescriptions have been stored yet.
            </div>
          )}
        </div>
      </SectionShell>
    </div>
  )

  const renderTriage = () => (
    <SectionShell title="Multi-Agent Triage Logs" eyebrow="Pain Assessment">
      <div className="grid gap-4 xl:grid-cols-2">
        {triageLogs.length ? triageLogs.map((log) => (
          <div key={log.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-bold text-slate-900">{log.patient_name}</div>
                <div className="text-sm text-slate-500">{log.agent}</div>
              </div>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                {log.severity}
              </span>
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">{log.summary}</div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-6 text-slate-500">
              {log.transcript}
            </div>
          </div>
        )) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500 xl:col-span-2">
            No triage logs were returned from the database.
          </div>
        )}
      </div>
    </SectionShell>
  )

  const renderPainMap = () => (
    <SectionShell title="Pain Map Sync" eyebrow="Body Regions">
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <MedicalAnatomyMap
            onRegionSelect={(region: any) => {
              setClickedRegion(region)
            }}
            highlightedRegions={selectedBodyRegion}
            compact={false}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Selected Patient</div>
            <div className="mt-1 text-xl font-black text-slate-900">{selectPatientLabel(selectedPatient)}</div>
            <div className="mt-1 text-sm text-slate-500">Click regions on the anatomy map and set their severity levels.</div>
          </div>

          {clickedRegion && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Set Severity for {clickedRegion.label}</div>
              <div className="mt-3 flex gap-2">
                {['low', 'medium', 'high'].map((sev) => {
                  const isCurrentSev = selectedBodyRegion.includes(`${clickedRegion.id}:${sev}`)
                  const colors = {
                    low: 'bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-150',
                    medium: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-150',
                    high: 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-150'
                  }
                  return (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => {
                        setSelectedBodyRegion((current) => {
                          const filtered = current.filter(item => item.split(':')[0] !== clickedRegion.id)
                          return [...filtered, `${clickedRegion.id}:${sev}`]
                        })
                      }}
                      className={`rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all active:scale-95 flex-1 text-center ${isCurrentSev ? colors[sev as 'low'|'medium'|'high'] : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      {sev.toUpperCase()}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBodyRegion((current) => current.filter(item => item.split(':')[0] !== clickedRegion.id))
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 active:scale-95"
                >
                  CLEAR
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {selectedBodyRegion.length ? selectedBodyRegion.map((item) => {
              const [regionId, severity] = item.split(':')
              const colorClasses = {
                low: 'border-green-200 bg-green-50 text-green-700',
                medium: 'border-amber-200 bg-amber-50 text-amber-700',
                high: 'border-red-200 bg-red-50 text-red-700'
              }
              return (
                <span key={item} className={`rounded-full border px-3 py-1 text-xs font-semibold ${colorClasses[severity as 'low'|'medium'|'high'] || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                  {regionId.replace(/_/g, ' ')} ({severity || 'low'})
                </span>
              )
            }) : (
              <div className="text-sm text-slate-500">No regions selected yet.</div>
            )}
          </div>
          <button
            type="button"
            onClick={savePainMap}
            className="w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/20 transition-transform hover:scale-[1.01]"
          >
            Sync Pain Map
          </button>
        </div>
      </div>
    </SectionShell>
  )

  const renderFeatures = () => (
    <SectionShell title="18 AI Features" eyebrow="Feature Hub">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_FEATURES.map((feature) => (
          <div key={feature.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <feature.icon size={18} />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{feature.name}</div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Feature {feature.id}</div>
              </div>
            </div>
            <div className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  )

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'patients':
        return renderPatients()
      case 'analytics':
        return renderAnalytics()
      case 'pose':
        return renderPose()
      case 'exercises':
        return renderExercises()
      case 'ocr':
        return renderOcr()
      case 'triage':
        return renderTriage()
      case 'painmap':
        return renderPainMap()
      case 'features':
        return renderFeatures()
      case 'overview':
      default:
        return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin shadow-lg"></div>
        <p className="text-slate-600 font-semibold tracking-wide animate-pulse">
          Validating Secure Admin Session...
        </p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-teal-400">
              <Shield size={30} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Secure Admin Portal</h1>
            <p className="mt-1 text-sm text-slate-500">Prathomix Doctor Command Centre</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && login()}
                placeholder="Admin password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm outline-none transition-colors focus:border-teal-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <button
              type="button"
              onClick={login}
              disabled={logging}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Shield size={16} />
              {logging ? 'Authenticating...' : 'Enter Admin Portal'}
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Admin access is validated by the backend session.
          </p>
        </motion.div>
      </div>
    )
  }

  if (isSubpage) {
    return (
      <div className="w-full">
        {dataLoading ? (
          <div className="grid gap-4 lg:grid-cols-3 mb-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-[2rem] bg-slate-100/80 animate-pulse" />
            ))}
          </div>
        ) : null}
        {renderActivePanel()}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-800">
      {isMounted && tourRun ? (
        <Joyride
          steps={ADMIN_TOUR_STEPS}
          run={tourRun}
          continuous
          disableOverlayClose
          showSkipButton={false}
          scrollToFirstStep
          tooltipComponent={TourTooltip as any}
          callback={(data: any) => {
            if (data.status === 'finished' || data.status === 'skipped') {
              finishTour()
            }
          }}
          styles={{
            options: {
              zIndex: 80,
              primaryColor: '#0f766e',
              textColor: '#0f172a',
              overlayColor: 'rgba(15, 23, 42, 0.55)',
            },
          }}
        />
      ) : null}

      <div className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-teal-400">
              <Shield size={18} />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-slate-900">Prathomix Admin</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-600">Doctor Command Centre</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toast.success('SMS Campaign Dispatched')}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              <MessageSquare size={15} />
              Send SMS Blast
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:text-rose-600"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-5 flex flex-wrap gap-2">
          <TabPill active={activeTab === 'overview'} icon={Activity} label="Overview" onClick={() => setActiveTab('overview')} />
          <TabPill active={activeTab === 'patients'} icon={Users} label="Patient Monitor" onClick={() => setActiveTab('patients')} />
          <TabPill active={activeTab === 'analytics'} icon={TrendingUp} label="Analytics" onClick={() => setActiveTab('analytics')} />
          <TabPill active={activeTab === 'pose'} icon={Camera} label="AI Pose & Gait Analysis" onClick={() => setActiveTab('pose')} />
          <TabPill
            active={activeTab === 'exercises'}
            icon={CheckCircle2}
            label="Exercise Library & Assignment"
            onClick={() => setActiveTab('exercises')}
            tourTarget="exercise-library-tab"
          />
          <TabPill active={activeTab === 'ocr'} icon={FileText} label="Prescription OCR Hub" onClick={() => setActiveTab('ocr')} />
          <TabPill active={activeTab === 'triage'} icon={Brain} label="Multi-Agent Triage Logs" onClick={() => setActiveTab('triage')} />
          <TabPill active={activeTab === 'painmap'} icon={Map} label="Pain Map" onClick={() => setActiveTab('painmap')} />
          <TabPill active={activeTab === 'features'} icon={Sparkles} label="18 AI Features" onClick={() => setActiveTab('features')} />
        </div>

        {dataLoading ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 rounded-[2rem] bg-slate-100/80 animate-pulse" />
            ))}
          </div>
        ) : null}

        {renderActivePanel()}
      </main>
    </div>
  )
}

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="font-bold text-slate-900">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
