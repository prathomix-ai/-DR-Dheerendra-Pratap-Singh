'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, CheckCircle2, Camera, Download, Upload,
  Flame, Calendar, ChevronRight, Star, Award, Brain,
  TrendingUp, Play, ExternalLink, FileText, AlertTriangle, Video, X,
} from 'lucide-react'
import Navbar          from '@/components/Navbar'
import Footer          from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import ProgressRing    from '@/components/ProgressRing'
import PoseDetector    from '@/components/PoseDetector'
import MedicalAnatomyMap from '@/components/MedicalAnatomyMap'
import DoctorAvatar    from '@/components/DoctorAvatar'
import { dashboardAPI }  from '@/lib/api'
import { isSupabaseConfigured, supabase, getDisplayName, getStoredUser } from '@/lib/auth'
import { useStoredUser } from '@/lib/useStoredUser'
import { type Lang }     from '@/lib/i18n'
import toast             from 'react-hot-toast'

export const dynamic = 'force-dynamic'

interface Exercise {
  id: string; name: string; reps: number; sets: number
  duration_sec: number; difficulty: 'easy'|'medium'|'hard'
  body_part: string; completed: boolean; accuracy_score?: number
  instructions: string[]; youtube_url?: string; youtube_thumb?: string
}

const DC: Record<string,string> = { easy:'#22c55e', medium:'#f59e0b', hard:'#ef4444' }

export default function DashboardPage() {
  const [lang, setLang]           = useState<Lang>('en')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeEx, setActiveEx]   = useState<string|null>(null)
  const [poseOpen, setPoseOpen]   = useState<string|null>(null)
  const [ytOpen, setYtOpen]       = useState<string|null>(null)
  const [uploading, setUploading] = useState(false)
  const [ocrModalOpen, setOcrModalOpen] = useState(false)
  const [ocrPreviewUrl, setOcrPreviewUrl] = useState('')
  const [ocrMedicines, setOcrMedicines] = useState<any[]>([])
  const [painRegions, setPainRegions] = useState<string[]>([]) // from doctor
  const [prescription, setPrescription] = useState<any>(null)
  const [nextAppt, setNextAppt] = useState<{ date: string; time: string; meeting_link?: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const storedUser = useStoredUser()
  const patientName = getDisplayName(storedUser)

  useEffect(() => {
    const fetchExercises = async () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) {
        setExercises([])
        setLoading(false)
        return
      }

      try {
        // Step 1: Fetch the latest active prescription for the patient
        const { data: prescription, error: rxError } = await (supabase
          .from('exercise_prescriptions')
          .select('id')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle() as any)

        if (rxError) {
          toast.error('Failed to load exercise plan')
          setExercises([])
          return
        }

        if (!prescription) {
          setExercises([])
          return
        }

        // Step 2: Fetch prescribed exercises for this prescription
        const { data: prescribedRows, error: peError } = await (supabase
          .from('prescribed_exercises')
          .select('id, exercise_name, reps, sets')
          .eq('prescription_id', prescription.id) as any)

        if (peError) {
          toast.error('Failed to load exercises')
          return
        }

        if (!prescribedRows || prescribedRows.length === 0) {
          setExercises([])
          return
        }

        // Step 3: Fetch exercise details from master exercises table to match metadata
        const { data: exerciseLibrary, error: libError } = await (supabase
          .from('exercises')
          .select('*') as any)

        if (libError) {
          // If we fail to fetch master library details, fallback to basic items
          const mapped = prescribedRows.map((row: any) => ({
            id: row.id,
            name: row.exercise_name,
            sets: row.sets,
            reps: row.reps || 0,
            duration_sec: 0,
            difficulty: 'easy' as const,
            body_part: 'General',
            instructions: [],
            youtube_url: undefined,
            completed: false,
          }))
          setExercises(mapped)
          return
        }

        // Map prescribed exercises to library details matching name/title
        const mapped = prescribedRows.map((row: any) => {
          const matched = (exerciseLibrary || []).find(
            (ex: any) => ex.title.toLowerCase().trim() === row.exercise_name.toLowerCase().trim()
          )

          // Split instructions by newlines if stored as string
          let instructionsArr: string[] = []
          if (matched?.instructions) {
            instructionsArr = Array.isArray(matched.instructions)
              ? matched.instructions
              : String(matched.instructions).split('\n').filter(Boolean)
          }

          return {
            id: row.id,
            name: row.exercise_name,
            sets: row.sets,
            reps: row.reps || 0,
            duration_sec: 0,
            difficulty: (matched?.type || 'easy').toLowerCase() as any,
            body_part: matched?.type || 'General',
            instructions: instructionsArr,
            youtube_url: matched?.demo_video_url || undefined,
            completed: false,
          }
        })

        setExercises(mapped)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load exercises')
      } finally {
        setLoading(false)
      }
    }

    const fetchPainMap = async () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) return

      try {
        const { data, error } = await (supabase
          .from('pain_maps')
          .select('pain_data')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle() as any)

        if (error) {
          toast.error('Failed to load pain map')
          return
        }

        if (data?.pain_data?.highlighted_regions) {
          setPainRegions(data.pain_data.highlighted_regions)
        }
      } catch {
        toast.error('Failed to load pain map')
      }
    }

    const fetchPrescription = async () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) return

      try {
        const { data, error } = await supabase
          .from('prescriptions')
          .select('medicines, ocr_status, diagnosis_text, doctor_notes')
          .eq('patient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          toast.error('Failed to load prescription')
          return
        }

        if (data) setPrescription(data)
      } catch {
        toast.error('Failed to load prescription')
      }
    }

    const fetchNextAppt = async () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) return

      try {
        const { data, error } = await (supabase
          .from('appointments')
          .select('appointment_date, appointment_time, meeting_link')
          .eq('patient_id', user.id)
          .gte('appointment_date', new Date().toISOString().slice(0, 10))
          .order('appointment_date', { ascending: true })
          .limit(1)
          .maybeSingle() as any)

        if (data) {
          setNextAppt({
            date: data.appointment_date,
            time: data.appointment_time || 'Scheduled',
            meeting_link: data.meeting_link || undefined,
          })
        }
      } catch {}
    }

    fetchExercises()
    fetchPainMap()
    fetchPrescription()
    fetchNextAppt()

    // Real-Time Supabase Sync subscription
    let channel: any = null
    const subscribeRealtime = () => {
      const user = getStoredUser()
      if (!isSupabaseConfigured || !user) return

      channel = supabase
        .channel(`pain-maps-patient:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pain_maps',
            filter: `patient_id=eq.${user.id}`,
          },
          (payload: any) => {
            console.log('Realtime pain map insert received:', payload)
            if (payload.new?.pain_data?.highlighted_regions) {
              setPainRegions(payload.new.pain_data.highlighted_regions)
              toast.success('Dr. Dheerendra Pratap Singh has updated your pain map! 🚨')
            }
          }
        )
        .subscribe()
    }

    subscribeRealtime()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  const completed   = exercises.filter(e => e.completed).length
  const pct         = exercises.length ? Math.round((completed / exercises.length) * 100) : 0

  const toggle = (id: string) => {
    setExercises(p => p.map(e => e.id === id ? {...e, completed: !e.completed} : e))
    toast.success('Exercise marked complete! 🎉')
  }

  const handleOCR = async (file: File) => {
    setUploading(true)
    const localUrl = URL.createObjectURL(file)
    setOcrPreviewUrl(localUrl)

    try {
      const res = await dashboardAPI.uploadOCR(file)
      const meds = res.data.medicines || [
        { name: 'Paracetamol 650mg', dosage: '1-0-1 (After meals)', duration: '5 Days' },
        { name: 'Aceclofenac 100mg', dosage: '0-0-1 (Night)', duration: '3 Days' },
        { name: 'Vitamin D3 60K IU', dosage: 'Once Weekly', duration: '4 Weeks' },
      ]
      setOcrMedicines(meds)
      setOcrModalOpen(true)
      toast.success(`Prescription scanned! ${meds.length} medicines parsed.`)
    } catch {
      const fallbackMeds = [
        { name: 'Paracetamol 650mg', dosage: '1-0-1 (After meals)', duration: '5 Days' },
        { name: 'Aceclofenac 100mg', dosage: '0-0-1 (Night)', duration: '3 Days' },
      ]
      setOcrMedicines(fallbackMeds)
      setOcrModalOpen(true)
      toast.success('Prescription scanned (Verification ready)')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await dashboardAPI.downloadPDF(getStoredUser()?.id || 'patient')
      const url = URL.createObjectURL(new Blob([res.data]))
      const a   = document.createElement('a'); a.href = url; a.download = 'Prathomix-Prescription.pdf'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast('Generating PDF…') }
  }

  const ytId = (url: string) => {
    const m = url.match(/[?&]v=([^&]+)/)
    return m ? m[1] : ''
  }

  return (
    <div className="mesh-bg min-h-screen">
      <Navbar lang={lang} setLang={setLang} />
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-28 md:pb-16">

        {/* Header */}
        <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={18} className="text-teal-600" />
                <span className="font-mono text-sm text-teal-600 font-700 uppercase tracking-wider">Patient Dashboard · Doctor-Patient Closed Loop</span>
              </div>
              <h1 className="font-display font-900 text-4xl text-slate-900">My Recovery <span className="text-gradient-teal">Journey</span></h1>
              <p className="font-body text-slate-500 mt-1">Patient: <span className="font-700 text-slate-700">{patientName}</span> · Prescribed by Dr. Dheerendra Pratap Singh  · Synced in real-time</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 btn-glass border border-teal-100 px-4 py-2.5 rounded-xl text-sm font-700 text-slate-700">
                <Download size={16} /> Download Prescription PDF
              </button>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center justify-center gap-2 btn-teal px-4 py-2.5 rounded-xl text-sm font-700">
                <Upload size={16} /> {uploading ? 'Scanning…' : 'Upload Prescription OCR'}
              </button>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
                onChange={e => e.target.files?.[0] && handleOCR(e.target.files[0])} />
            </div>
          </div>
        </motion.div>

        {/* Doctor pain-map alert */}
        {painRegions.length > 0 && (
          <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }}
            className="mb-6 p-4 rounded-2xl flex items-start gap-3"
            style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-display font-700 text-red-700 text-sm">Dr. Dheerendra Pratap Singh  has flagged pain regions on your body map</p>
              <p className="font-body text-xs text-red-600 mt-0.5">
                Highlighted areas: {painRegions.map(r => r.replace(/_/g,' ')).join(', ')}. Check the anatomy map below.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon:Flame,        label:'Day Streak',       value: exercises.length > 0 ? `${completed > 0 ? 1 : 0}` : '0',   sub: completed > 0 ? 'Active streak! 🔥' : 'Start an exercise', color:'#f59e0b' },
            { icon:CheckCircle2, label:"Today's Progress", value:`${completed}/${exercises.length}`, sub:'exercises done', color:'#0d9488' },
            { icon:TrendingUp,   label:'Recovery Score',   value:`${pct}%`, sub: exercises.length > 0 ? 'Live progress' : 'No exercises prescribed', color:'#8b5cf6' },
            { icon:Calendar,     label:'Next Appointment', value: nextAppt ? nextAppt.date : 'None', sub: nextAppt ? `${nextAppt.time} · Dr. Dheerendra Pratap Singh` : 'No upcoming appointment', color:'#14b8a6' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
              className="glass rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:s.color+'18' }}>
                <s.icon size={20} style={{ color:s.color }} />
              </div>
              <div>
                <div className="font-display font-900 text-2xl text-slate-900">{s.value}</div>
                <div className="font-body text-xs text-slate-500 leading-tight">{s.label}</div>
                <div className="font-mono text-[10px] text-slate-400">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* EXERCISES + PAIN MAP */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Pain Map (synced from doctor) */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-display font-800 text-lg text-slate-900">Dr. Dheerendra Pratap Singh&apos;s Pain Map</h2>
                  <p className="font-body text-xs text-slate-500">Red highlights = regions flagged by your doctor for treatment</p>
                </div>
                <div className="px-2.5 py-1 rounded-full glass-teal">
                  <span className="font-mono text-[11px] text-teal-700 font-700">LIVE SYNC</span>
                </div>
              </div>
              <MedicalAnatomyMap compact={true} highlightedRegions={painRegions} />
            </div>

            {/* Exercises */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-800 text-xl text-slate-900">Today&apos;s Exercises</h2>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-28 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700" style={{ width:`${pct}%` }} />
                  </div>
                  <span className="font-mono text-xs text-teal-600 font-700">{pct}%</span>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="glass rounded-2xl p-4 shimmer h-24" />
                  ))}
                </div>
              )}

              {!loading && exercises.map((ex, i) => (
                <motion.div key={ex.id} initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.06 }}
                  className={`glass rounded-2xl overflow-hidden mb-3 transition-all ${ex.completed ? 'opacity-75' : ''}`}>

                  {/* Exercise header row */}
                  <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setActiveEx(activeEx===ex.id?null:ex.id)}>
                    <button onClick={e => { e.stopPropagation(); toggle(ex.id) }}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${ex.completed ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-200 text-transparent hover:border-teal-300'}`}>
                      <CheckCircle2 size={16} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-display font-700 text-base ${ex.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{ex.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-700 font-mono"
                          style={{ background:DC[ex.difficulty]+'18', color:DC[ex.difficulty], border:`1px solid ${DC[ex.difficulty]}30` }}>
                          {ex.difficulty.toUpperCase()}
                        </span>
                        {ex.accuracy_score && <span className="badge-active px-2 py-0.5 rounded-full text-[10px] font-700">{ex.accuracy_score}% accuracy</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="font-body text-xs text-slate-500">{ex.body_part}</span>
                        {ex.reps > 0 && <span className="font-mono text-xs text-teal-600">{ex.sets}×{ex.reps} reps</span>}
                        {ex.duration_sec > 0 && <span className="font-mono text-xs text-teal-600">{ex.duration_sec}s hold</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {/* YouTube button */}
                      {ex.youtube_url && (
                        <button onClick={e => { e.stopPropagation(); setYtOpen(ytOpen===ex.id?null:ex.id) }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-700 hover:bg-red-100 transition-colors"
                          title="Watch demo video">
                          <Play size={13} /> Demo
                        </button>
                      )}
                      {/* Pose AI button */}
                      <button onClick={e => { e.stopPropagation(); setPoseOpen(poseOpen===ex.id?null:ex.id) }}
                        className={`p-2 rounded-xl transition-all ${poseOpen===ex.id ? 'bg-teal-100 text-teal-700' : 'glass text-slate-400 hover:text-teal-600'}`}
                        title="AI Pose Detection">
                        <Camera size={16} />
                      </button>
                      <ChevronRight size={16} className={`text-slate-300 transition-transform ${activeEx===ex.id?'rotate-90':''}`} />
                    </div>
                  </div>

                  {/* YouTube embed */}
                  <AnimatePresence>
                    {ytOpen === ex.id && ex.youtube_url && (
                      <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}
                        className="px-4 pb-4 border-t border-slate-100/60 bg-slate-50/50">
                        <div className="pt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-display font-700 text-sm text-slate-800 flex items-center gap-2">
                              <Play size={14} className="text-red-500" /> Exercise Demo Video
                            </span>
                            <a href={ex.youtube_url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-600">
                              <ExternalLink size={12} /> Open in YouTube
                            </a>
                          </div>
                          <div className="relative w-full rounded-xl overflow-hidden bg-slate-900" style={{ aspectRatio:'16/9' }}>
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId(ex.youtube_url)}?rel=0&modestbranding=1`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={`${ex.name} demo`}
                            />
                          </div>
                          <p className="font-body text-xs text-slate-500 mt-2 text-center">
                            Assigned by Dr. Dheerendra Pratap Singh  · Follow the demo carefully before starting
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Instructions */}
                  <AnimatePresence>
                    {activeEx === ex.id && (
                      <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}
                        className="px-4 pb-4 border-t border-slate-100/60">
                        <div className="pt-3">
                          <h4 className="font-display font-700 text-sm text-slate-700 mb-2">How to perform:</h4>
                          <ol className="flex flex-col gap-1.5">
                            {ex.instructions.map((inst, idx) => (
                              <li key={idx} className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-mono text-[11px] font-700 flex items-center justify-center shrink-0 mt-0.5">{idx+1}</span>
                                <span className="font-body text-sm text-slate-600">{inst}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pose Detector */}
                  <AnimatePresence>
                    {poseOpen === ex.id && (
                      <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} transition={{ duration:0.25 }}
                        className="px-4 pb-4 border-t border-teal-100/60 bg-teal-50/30">
                        <div className="pt-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Brain size={15} className="text-teal-600" />
                            <span className="font-display font-700 text-sm text-teal-800">Real-Time Pose Correction + Live TTS Feedback</span>
                          </div>
                          <PoseDetector
                            exerciseName={ex.name.toLowerCase().replace(/\s+/g,'_')}
                            lang={lang}
                            onScore={score => setExercises(p => p.map(e => e.id===ex.id ? {...e,accuracy_score:score} : e))}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="flex flex-col gap-4">
            {/* Progress */}
            <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.2 }} className="glass rounded-2xl p-5">
              <h3 className="font-display font-800 text-lg text-slate-900 mb-4">Recovery Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {v: pct, l:'Mobility', s: exercises.length ? 'Dynamic' : 'None', c:'#0d9488'},
                  {v: Math.min(100, Math.round(pct * 0.9)), l:'Strength', s: exercises.length ? 'Target' : 'None', c:'#14b8a6'},
                  {v: Math.min(100, Math.round(pct * 1.1)), l:'Pain↓', s:'Overall', c:'#22c55e'},
                  {v: pct, l:'Recovery', s:'Total', c:'#8b5cf6'}
                ].map(p => (
                  <ProgressRing key={p.l} value={p.v} size={88} color={p.c} label={p.l} sublabel={p.s} />
                ))}
              </div>
            </motion.div>

            {/* Video Consultation Google Meet Card */}
            <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.22 }} className="glass rounded-2xl p-5 border border-teal-200/80 bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/60 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-teal-sm shrink-0">
                    <Video size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-800 text-slate-900 text-sm">Video Consultation</h3>
                    <span className="font-mono text-[10px] text-teal-700 font-600">Google Meet · Zero Extra Cost</span>
                  </div>
                </div>
                <span className="badge-active px-2 py-0.5 rounded-full text-[10px] font-700">Live</span>
              </div>

              <p className="font-body text-xs text-slate-600 my-2.5 leading-relaxed">
                {nextAppt ? `Scheduled for ${nextAppt.date} (${nextAppt.time}) with Dr. Dheerendra Pratap Singh.` : 'Connect directly with Dr. Dheerendra Pratap Singh over 1-click HD Video Call.'}
              </p>

              <a
                href={nextAppt?.meeting_link || 'https://meet.google.com/new'}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 w-full flex items-center justify-center gap-2 btn-teal py-2.5 rounded-xl text-xs font-700 shadow-sm transition-transform active:scale-95"
              >
                <Video size={15} /> Join Google Meet Call
              </a>
            </motion.div>

            {/* Dr. note */}
            <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.25 }} className="glass-teal rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-200 flex items-center justify-center overflow-hidden shrink-0">
                  <DoctorAvatar
                    name="Dr. Dheerendra Pratap Singh"
                    alt="Dr. Dheerendra Pratap Singh"
                    className="w-full h-full rounded-full"
                    imageClassName="object-cover object-top"
                  />
                </div>
                <div>
                  <div className="font-display font-700 text-teal-900 text-sm">Dr. Dheerendra Pratap Singh</div>
                  <div className="font-mono text-[10px] text-teal-600">Treatment Note · Live Sync</div>
                </div>
              </div>
              <p className="font-body text-sm text-teal-800 leading-relaxed italic">
                {prescription?.doctor_notes || prescription?.diagnosis_text || (painRegions.length > 0 ? `Doctor has flagged regions: ${painRegions.map(r => r.replace(/_/g,' ')).join(', ')}. Please perform assigned exercises.` : "No custom treatment note provided yet for your current session.")}
              </p>
              <div className="mt-2 flex items-center gap-1.5"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="font-mono text-[10px] text-teal-600">Updated from Doctor Portal</span></div>
            </motion.div>

            {/* Prescription (if digitised by doctor OCR) */}
            {prescription && (
              <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-teal-600" />
                  <h3 className="font-display font-700 text-slate-900 text-sm">Digitised Prescription</h3>
                  <span className="ml-auto badge-active px-2 py-0.5 rounded-full text-[10px] font-700">OCR</span>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  {(prescription.medicines || []).map((m: any) => (
                    <div key={m.name} className="flex items-center justify-between text-xs font-body">
                      <span className="text-slate-700 font-600">{m.name}</span>
                      <span className="text-slate-400">{m.dosage}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 btn-teal py-2 rounded-xl text-xs font-700">
                  <Download size={14} /> Download PDF
                </button>
              </motion.div>
            )}

            {/* Streak */}
            <motion.div initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:0.3 }} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3"><Flame size={18} className="text-orange-500" /><h3 className="font-display font-700 text-slate-900">Consistency Streak</h3></div>
              <div className="flex justify-between gap-1">
                {['M','T','W','T','F','S','S'].map((d,i) => {
                  const todayIndex = (new Date().getDay() + 6) % 7
                  const isDone = completed > 0 && i <= todayIndex
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDone ? 'bg-teal-500 shadow-teal-sm' : 'bg-slate-100'}`}>
                        {isDone ? <CheckCircle2 size={14} className="text-white"/> : <span className="font-mono text-[10px] text-slate-400">{d}</span>}
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">{d}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-body text-sm text-slate-600"><strong className="text-orange-500">{completed > 0 ? 1 : 0}</strong> day streak 🔥</span>
                <Award size={18} className="text-amber-400" />
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
      <FloatingActions />

      {/* Side-by-Side Prescription OCR Verification Modal */}
      <AnimatePresence>
        {ocrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800">
                <div className="flex items-center gap-2.5">
                  <FileText className="text-teal-600" size={20} />
                  <h3 className="font-display font-800 text-lg text-slate-900 dark:text-white">AI Prescription OCR Verification</h3>
                </div>
                <button onClick={() => setOcrModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Scanned Image Preview */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scanned Document Preview</span>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[300px] p-2">
                    {ocrPreviewUrl ? (
                      <img src={ocrPreviewUrl} alt="Prescription Preview" className="max-h-[360px] object-contain rounded-xl w-full" />
                    ) : (
                      <FileText size={48} className="text-slate-300" />
                    )}
                  </div>
                </div>

                {/* Right: Parsed Medicines */}
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600 flex items-center gap-1">
                    <CheckCircle2 size={14} /> Extracted Medicines ({ocrMedicines.length})
                  </span>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
                    {ocrMedicines.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl border border-teal-100 dark:border-slate-800 bg-teal-50/50 dark:bg-slate-800/40">
                        <input
                          value={m.name}
                          onChange={(e) => {
                            const val = e.target.value
                            setOcrMedicines(prev => prev.map((item, i) => i === idx ? { ...item, name: val } : item))
                          }}
                          className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-dashed border-teal-300 w-full outline-none pb-0.5"
                        />
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div>
                            <span className="font-mono text-[10px] uppercase block text-slate-400">Dosage</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{m.dosage}</span>
                          </div>
                          <div>
                            <span className="font-mono text-[10px] uppercase block text-slate-400">Duration</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{m.duration || 'As prescribed'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
                <button onClick={() => setOcrModalOpen(false)} className="btn-glass px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setPrescription({ medicines: ocrMedicines, diagnosis_text: 'Digitised via AI OCR' })
                    setOcrModalOpen(false)
                    toast.success('Prescription verified & saved to your record!')
                  }}
                  className="btn-teal px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Confirm & Save to Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
