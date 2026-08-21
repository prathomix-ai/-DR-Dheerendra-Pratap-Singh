'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Mic, Stethoscope, Activity, Bone, Camera, FileText,
  Phone, MessageCircle, Send, Users, Printer, Repeat,
  Globe, Shield, Cpu, Map, Zap, Star, X,
  ChevronLeft, ChevronRight, Award, CheckCircle2, AlertTriangle,
  ShieldCheck, HeartPulse,
} from 'lucide-react'
import Navbar          from '@/components/Navbar'
import Footer          from '@/components/Footer'
import FloatingActions from '@/components/FloatingActions'
import DoctorAvatar    from '@/components/DoctorAvatar'
import { isSupabaseConfigured, supabase }    from '@/lib/auth'
import { translations, type Lang }   from '@/lib/i18n'
import toast           from 'react-hot-toast'

export const dynamic = 'force-dynamic'

const FEATURES = [
  { icon: Brain,        title: 'RAG Brain',         tag: 'Feature 1',  color: '#8b5cf6', detail: 'ChromaDB-powered physiotherapy knowledge base containing thousands of curated medical documents, treatment protocols, and exercise science research. Retrieval-Augmented Generation ensures every AI response is grounded in real medical knowledge, not hallucinations.', tech: ['ChromaDB', 'SentenceTransformers', 'FastAPI', 'all-MiniLM-L6-v2'] },
  { icon: Stethoscope,  title: 'Multi-Agent Triage', tag: 'Feature 2',  color: '#0d9488', detail: 'A chain of specialised AI agents: Pain Intake Agent → Physiology Explainer Agent → Diagnosis Agent → Treatment Planner Agent. Tool Calling auto-navigates patients to the right page (/dashboard for exercises, /appointments for booking).', tech: ['Gemini 1.5 Flash', 'HuggingFace Mistral', 'Tool Calling', 'RAG'] },
  { icon: Mic,          title: 'Hinglish Voice AI',  tag: 'Feature 3',  color: '#06b6d4', detail: "Multilingual voice recognition and TTS (Text-to-Speech) supporting English, Hindi, Hinglish, and Tamil. During live pose correction, the AI speaks corrective cues aloud using window.speechSynthesis in the user's native language.", tech: ['Web Speech API', 'SpeechSynthesis', 'Whisper (planned)', 'MediaRecorder'] },
  { icon: Map,          title: 'Medical Anatomy Map', tag: 'Feature 4', color: '#10b981', detail: "A high-resolution medical anatomy model with detailed skeletal and muscular structures. Interactive invisible SVG hotspot overlay on 17 anatomical regions. Features an animated scanning effect. Doctor-highlighted regions sync in red to the patient's view.", tech: ['SVG Overlay', 'Framer Motion', 'CSS Scan Animation', 'Doctor-Patient Sync'] },
  { icon: Globe,        title: 'Multi-Language UI',  tag: 'Feature 5',  color: '#f59e0b', detail: 'Full UI translation across English, Hindi, Hinglish, and Tamil. Language selection persists across sessions and is applied to TTS voice cues, AI responses, and all UI elements. Easily extensible to any Indian regional language.', tech: ['i18n.ts', 'React Context', 'localStorage', 'Dynamic fonts'] },
  { icon: Camera,       title: 'Pose Correction AI', tag: 'Feature 6',  color: '#ef4444', detail: 'Real-time pose correction using MediaPipe Pose Landmarker. Draws a full skeletal overlay on the webcam feed. Calculates joint angles and compares against exercise-specific thresholds. Fires TTS voice cues for corrective feedback every 1.8 seconds.', tech: ['MediaPipe', 'OpenCV', 'Canvas API', 'SpeechSynthesis'] },
  { icon: Activity,     title: 'Gait Analysis AI',   tag: 'Feature 7',  color: '#f97316', detail: 'Vision AI analyses walking patterns from a 10-second video recording. Evaluates stride symmetry, cadence, foot strike pattern, and lateral sway. Generates a detailed gait report with personalised correction exercises.', tech: ['MediaPipe', 'OpenCV', 'NumPy', 'Custom Gait Model'] },
  { icon: FileText,     title: 'Prescription OCR',   tag: 'Feature 8',  color: '#64748b', detail: 'Doctor uploads a photo of a handwritten prescription in the Admin portal. Tesseract OCR (with Hindi support) extracts medicines, dosages, and instructions. Patient can view the digitised prescription and download it as a formatted PDF.', tech: ['Tesseract OCR', 'pytesseract', 'PIL', 'ReportLab'] },
  { icon: Phone,        title: 'IVR Calling',         tag: 'Feature 9',  color: '#3b82f6', detail: 'Automated IVR phone calls to patients for appointment reminders. Uses Twilio Programmable Voice with TwiML. Patient presses 1 to confirm, 2 to reschedule, 3 to cancel. Supports Polly.Aditi voice in Hindi.', tech: ['Twilio', 'TwiML', 'Polly.Aditi', 'FastAPI Webhooks'] },
  { icon: Users,        title: 'Caregiver Proxy',     tag: 'Feature 10', color: '#ec4899', detail: "Family members or caregivers can be granted read-only access to a patient's dashboard. They can view exercise completion, accuracy scores, and Dr. Dheerendra Pratap Singh 's notes without the patient's credentials. Managed from /settings.", tech: ['Supabase RLS', 'JWT', 'Role-based Access', 'Supabase Auth'] },
  { icon: Printer,      title: 'AI Printouts',        tag: 'Feature 11', color: '#0d9488', detail: "One-click PDF generation of a beautifully formatted prescription and exercise plan. Uses ReportLab for professional A4 layout with clinic branding, doctor's note, exercise table, and Prathomix footer. Downloadable from the patient dashboard.", tech: ['ReportLab', 'fpdf2', 'FastAPI StreamingResponse', 'Blob Download'] },
  { icon: MessageCircle,title: 'WhatsApp Routing',    tag: 'Feature 12', color: '#25D366', detail: 'Smart WhatsApp messaging via Twilio. Appointment confirmations sent instantly on booking. Incoming WhatsApp messages are parsed and routed to AI triage or human support. Follow-up bot sends personalised exercise reminders in Hinglish.', tech: ['Twilio WhatsApp API', 'TwiML', 'FastAPI Webhooks', 'Smart Routing'] },
  { icon: Repeat,       title: 'Follow-Up Bot',       tag: 'Feature 13', color: '#6366f1', detail: "Automated follow-up system that monitors exercise completion gaps. If a patient hasn't logged a session in 2+ days, the bot sends a personalised Hinglish message via WhatsApp (or SMS fallback) encouraging them to resume their recovery journey.", tech: ['Scheduler', 'Twilio', 'FastAPI Background Tasks', 'Supabase Triggers'] },
  { icon: Send,         title: 'SMS Fallback',         tag: 'Feature 14', color: '#84cc16', detail: 'Automatic SMS fallback system. If WhatsApp delivery fails (user not on WhatsApp, number invalid, etc.), the system automatically retries via standard SMS within 60 seconds. Guarantees 99.9% message delivery for appointment-critical communications.', tech: ['Twilio SMS', 'Delivery Webhooks', 'Retry Logic', 'FastAPI'] },
  { icon: Zap,          title: 'Settings Hub',         tag: 'Feature 15', color: '#f59e0b', detail: 'Centralised settings panel with Language switching, Voice AI toggle, Notification preferences (WhatsApp/SMS/Email), Caregiver management, Privacy & data deletion, and Guided tour reset. All preferences persist in Supabase.', tech: ['Supabase', 'React State', 'localStorage', 'FastAPI Settings API'] },
  { icon: Shield,       title: 'Secure Admin Portal',  tag: 'Feature 16', color: '#ef4444', detail: 'Ghost route at /admin — zero public navigation links. Accessible only via direct URL. Protected by JWT authentication + Supabase Row-Level Security (RLS). Doctor assigns exercises with YouTube links, uploads prescriptions, highlights pain regions, and monitors MediaPipe accuracy scores in real-time.', tech: ['JWT', 'Supabase RLS', 'Ghost Route', 'No-Nav Security'] },
  { icon: Cpu,          title: 'API Key Rotator',      tag: 'Feature 17', color: '#0d9488', detail: 'Advanced multi-key rotator for the Gemini API. GEMINI_KEYS env var accepts a comma-separated list of API keys. The rotator cycles through keys in round-robin, tracks per-key error counts, and automatically skips keys that return 429 (rate limit) errors. Falls back to HuggingFace Mistral.', tech: ['Gemini 1.5 Flash', 'HuggingFace', 'Round-Robin Rotator', 'Async Python'] },
  { icon: Star,         title: 'Guided Tour',          tag: 'Feature 18', color: '#f59e0b', detail: 'Interactive onboarding tour using driver.js. Highlights all major UI elements with popovers explaining each feature. Fires automatically on first visit after disclaimer acceptance. Can be reset at any time from /settings. Supports all 4 languages.', tech: ['driver.js', 'localStorage', 'React Hooks', 'Framer Motion'] },
]

const getFallbackReviews = (lang: Lang) => {
  const reviews: Record<Lang, any[]> = {
    en: [
      {
        id: 'review-1',
        name: 'Amit Sharma',
        city: 'Delhi',
        condition: 'Sciatica Recovery',
        rating: 5,
        weeks: 6,
        text: 'Dr. Dheerendra Pratap Singh\'s guidance was amazing. The AI exercises helped me maintain correct posture at home. Highly recommended for back pain!'
      },
      {
        id: 'review-2',
        name: 'Rajesh Patel',
        city: 'Ahmedabad',
        condition: 'Knee Rehab',
        rating: 5,
        weeks: 8,
        text: 'After my knee surgery, I was struggling with mobility. The clinic\'s physiotherapy plan and video feedback got me walking comfortably in 2 months.'
      },
      {
        id: 'review-3',
        name: 'Priya Sundaram',
        city: 'Chennai',
        condition: 'Frozen Shoulder',
        rating: 5,
        weeks: 4,
        text: 'Very professional clinic. The ₹300 OPD fee is very affordable, and the care provided is top-notch. My shoulder mobility has improved significantly.'
      }
    ],
    hi: [
      {
        id: 'review-1',
        name: 'अमित शर्मा',
        city: 'दिल्ली',
        condition: 'साइटिका से रिकवरी',
        rating: 5,
        weeks: 6,
        text: 'डॉ. धीरेंद्र प्रताप सिंह का मार्गदर्शन अद्भुत था। एआई एक्सरसाइज ने मुझे घर पर सही मुद्रा बनाए रखने में मदद की। पीठ दर्द के लिए अत्यधिक अनुशंसित!'
      },
      {
        id: 'review-2',
        name: 'राजेश पटेल',
        city: 'अहमदाबाद',
        condition: 'घुटने का पुनर्वास',
        rating: 5,
        weeks: 8,
        text: 'घुटने की सर्जरी के बाद, मुझे चलने-फिरने में कठिनाई हो रही थी। क्लिनिक की फिजियोथेरेपी योजना और वीडियो फीडबैक ने मुझे 2 महीने में आराम से चलना सिखा दिया।'
      },
      {
        id: 'review-3',
        name: 'प्रिया सुंदरम',
        city: 'चेन्नई',
        condition: 'फ्रोजन शोल्डर',
        rating: 5,
        weeks: 4,
        text: 'बहुत ही पेशेवर क्लिनिक। ₹300 ओपीडी शुल्क बहुत ही किफायती है, और दी जाने वाली देखभाल बेहतरीन है। मेरे कंधे के मूवमेंट में काफी सुधार हुआ है।'
      }
    ],
    hinglish: [
      {
        id: 'review-1',
        name: 'Amit Sharma',
        city: 'Delhi',
        condition: 'Sciatica Recovery',
        rating: 5,
        weeks: 6,
        text: 'Dr. Dheerendra Pratap Singh ki guidance bahut acchi thi. AI exercises ne ghar pe sahi posture maintain karne me help ki. Back pain ke liye best clinic hai!'
      },
      {
        id: 'review-2',
        name: 'Rajesh Patel',
        city: 'Ahmedabad',
        condition: 'Knee Rehab',
        rating: 5,
        weeks: 8,
        text: 'Knee surgery ke baad chalne me dikkat thi. Clinic ke exercise plan aur live camera feedback se main 2 mahine me bilkul thik se chalne laga.'
      },
      {
        id: 'review-3',
        name: 'Priya Sundaram',
        city: 'Chennai',
        condition: 'Frozen Shoulder',
        rating: 5,
        weeks: 4,
        text: 'Bahut hi professional treatment. ₹300 OPD fee bahut affordable hai, aur rehabilitation process best hai. Shoulder movement ab bilkul free hai.'
      }
    ],
    ta: [
      {
        id: 'review-1',
        name: 'அமித் சர்மா',
        city: 'டெல்லி',
        condition: ' sciatica மீட்பு',
        rating: 5,
        weeks: 6,
        text: 'டாக்டர். தீரேந்திர பிரதாப் சிங்கின் வழிகாட்டுதல் அருமையாக இருந்தது. AI பயிற்சிகள் வீட்டில் சரியான தோரணையை பராமரிக்க உதவியது. முதுகு வலிக்கு மிகவும் பரிந்துரைக்கப்படுகிறது!'
      },
      {
        id: 'review-2',
        name: 'ராஜேஷ் படேல்',
        city: 'அகமதாபாத்',
        condition: 'முழங்கால் மறுவாழ்வு',
        rating: 5,
        weeks: 8,
        text: 'எனது முழங்கால் அறுவை சிகிச்சைக்குப் பிறகு, நான் நடப்பதற்கு சிரமப்பட்டேன். கிளினிக்கின் உடற்பயிற்சி சிகிச்சை திட்டம் என்னை 2 மாதங்களில் வசதியாக நடக்க வைத்தது.'
      },
      {
        id: 'review-3',
        name: 'பிரியா சுந்தரம்',
        city: 'சென்னை',
        condition: 'தோள்பட்டை வலிமை',
        rating: 5,
        weeks: 4,
        text: 'மிகவும் தொழில்முறை கிளினிக். ₹300 கட்டணம் மிகவும் மலிவானது, மேலும் வழங்கப்படும் சிகிச்சை தரம் வாய்ந்தது. எனது தோள்பட்டை இயக்கம் கணிசமாக மேம்பட்டுள்ளது.'
      }
    ]
  }
  return reviews[lang] || reviews['en']
}

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>('en')
  const copy = translations[lang] || translations['en']
  const [selectedFeature, setSelectedFeature] = useState<typeof FEATURES[0] | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)

  const fallbackReviews = useMemo(() => getFallbackReviews(lang), [lang])
  const activeReviews = reviews.length > 0 ? reviews : fallbackReviews

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isSupabaseConfigured) {
        setLoadingReviews(false)
        return
      }

      try {
        // Implement a timeout of 3 seconds using Promise.race to prevent slow page load if DB is asleep
        const dbQuery = supabase
          .from('patient_reviews')
          .select('*')
          .eq('is_featured', true)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Supabase query timed out after 3000ms')), 3000)
        )

        const { data, error } = await Promise.race([dbQuery, timeoutPromise as any])

        if (error) {
          console.warn('Failed to load reviews from Supabase, using local fallback:', error)
          return
        }

        if (data && data.length > 0) {
          setReviews(data)
        }
      } catch (err) {
        console.warn('Error loading reviews, using fallback:', err)
      } finally {
        setLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [])

  const nextReview = () => setReviewIdx(i => (activeReviews.length ? (i + 1) % activeReviews.length : 0))
  const prevReview = () => setReviewIdx(i => (activeReviews.length ? (i - 1 + activeReviews.length) % activeReviews.length : 0))
  const currentReview = activeReviews[reviewIdx] || activeReviews[0] || null

  return (
    <div className="mesh-bg min-h-screen text-slate-800">
      <Navbar lang={lang} setLang={setLang} />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-teal-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md mb-4">
            <ShieldCheck size={14} className="text-teal-600" />
            <span>{copy.verifiedCare}</span>
          </div>
          <h1 className="font-display font-900 text-5xl text-slate-800 mb-3 leading-[1.05]">
            {copy.aboutTitle}
          </h1>
          <p className="font-body text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {copy.aboutSubtitle}
          </p>
        </motion.div>

        {/* Dr. Dheerendra Pratap Singh  FULL BIO */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8 md:p-10 mb-12 border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-40 h-48 rounded-3xl overflow-hidden bg-white/80 ring-2 ring-teal-100 ring-offset-2 ring-offset-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-4">
                <DoctorAvatar
                  name="Dr. Dheerendra Pratap Singh"
                  alt="Dr. Dheerendra Pratap Singh"
                  className="w-full h-full rounded-full"
                  imageClassName="object-cover object-top"
                />
              </div>
              <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-amber-400 text-amber-400" />)}</div>
              <p className="font-mono text-xs text-slate-500 mt-1">4.9 · 1,200+ patients</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-teal-600" />
                <span className="font-mono text-sm text-teal-700 font-700 uppercase tracking-wider">{copy.leadPhysio}</span>
              </div>
              <h2 className="font-display font-900 text-4xl text-slate-800 mb-1 leading-[1.05]">Dr. Dheerendra Pratap Singh </h2>
              <p className="font-body text-sm font-medium text-teal-700 mb-4">{copy.specialistTitle}</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { icon: Bone, text: copy.orthoCare },
                  { icon: Activity, text: copy.rehab },
                  { icon: HeartPulse, text: copy.followUp },
                ].map(({ icon: Icon, text }) => (
                  <span key={text} className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                    <Icon size={12} />
                    {text}
                  </span>
                ))}
              </div>
              <p className="font-body text-slate-700 leading-relaxed mb-4">
                {copy.doctorBioParagraph1}
              </p>
              <p className="font-body text-slate-600 leading-relaxed mb-5">
                {copy.doctorBioParagraph2}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { v: copy.experienceVal, l: copy.experienceLabel }, { v: copy.healingVal, l: copy.healingLabel },
                  { v: copy.focusVal, l: copy.focusLabel }, { v: copy.feeVal, l: copy.feeLabel },
                ].map(s => (
                  <div key={s.l} className="rounded-2xl border border-slate-200/50 bg-white/70 p-3 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="font-display font-900 text-2xl text-slate-800">{s.v}</div>
                    <div className="font-mono text-[11px] text-teal-700 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* 18 FEATURES GRID */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-900 text-3xl text-slate-800 leading-[1.05]">
                <span className="text-gradient-teal">18</span> AI-Powered Features
              </h2>
              <p className="font-body text-slate-500 mt-1 leading-relaxed">Click any feature card for a detailed breakdown</p>
            </div>
            <span className="font-mono text-xs text-teal-600 font-700 px-3 py-1 rounded-full glass-teal">ALL OPERATIONAL</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {FEATURES.map((f, i) => (
              <motion.button key={f.tag}
                type="button"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.1, delay: 0.08 + i * 0.01 }}
                whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
                onClick={() => setSelectedFeature(f)}
                className="group p-4 rounded-2xl glass border-slate-200/50 hover:shadow-glass-lg cursor-pointer transition-[transform,box-shadow,opacity] duration-100 hover:-translate-y-0.5 active:scale-[0.98] text-left">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors"
                  style={{ background: f.color + '18' }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <div className="font-mono text-[9px] font-700 mb-0.5" style={{ color: f.color }}>{f.tag}</div>
                <div className="font-display font-700 text-slate-800 text-xs leading-relaxed">{f.title}</div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* PATIENT REVIEWS CAROUSEL */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
          <h2 className="font-display font-900 text-3xl text-slate-800 leading-[1.05] mb-6">Patient Reviews</h2>
          <div className="glass rounded-3xl p-8 relative overflow-hidden border-slate-200/50">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 blur-3xl"
              style={{ background: 'radial-gradient(circle,#0d9488,transparent)' }} />
            {loadingReviews && (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="glass rounded-2xl p-4 shimmer h-24" />
                ))}
              </div>
            )}
            {!loadingReviews && currentReview && (
              <AnimatePresence mode="wait">
                <motion.div key={reviewIdx}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center font-display font-800 text-white text-xl shrink-0 ring-2 ring-teal-100 ring-offset-2 ring-offset-white">
                      {(currentReview.name || 'P')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-700 text-slate-900">{currentReview.name}</span>
                        <span className="font-body text-sm text-slate-500">· {currentReview.city}</span>
                        <span className="badge-active px-2 py-0.5 rounded-full text-xs font-700">{currentReview.condition}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: currentReview.rating }).map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                        <span className="font-mono text-xs text-slate-400 ml-1">Recovered in {currentReview.weeks} weeks</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-slate-700 text-lg leading-relaxed italic">
                    &quot;{currentReview.text}&quot;
                  </p>
                </motion.div>
              </AnimatePresence>
            )}
            <div className="flex items-center justify-between mt-6">
              <div className="flex gap-1.5">
                {activeReviews.map((_, i) => (
                    <button key={i} type="button" aria-label={`Show review ${i + 1}`} onClick={() => setReviewIdx(i)}
                      className="w-2 h-2 rounded-full transition-all duration-100 active:scale-95"
                    style={{ background: i === reviewIdx ? '#0d9488' : '#cbd5e1' }} />
                ))}
              </div>
              <div className="flex gap-2">
                  <button type="button" aria-label="Previous review" onClick={prevReview} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:shadow-teal transition-all duration-100 active:scale-95">
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                  <button type="button" aria-label="Next review" onClick={nextReview} className="w-9 h-9 rounded-full glass flex items-center justify-center hover:shadow-teal transition-all duration-100 active:scale-95">
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* SECURITY & LEGAL */}
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="font-display font-900 text-3xl text-slate-800 leading-[1.05] mb-6">Your Safety & Privacy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
                { icon: Shield, color: '#0d9488', title: '100% Safe & Private', body: 'Your medical details are fully locked and encrypted. No outsider can ever see or read your personal health records.' },
                { icon: Shield, color: '#8b5cf6', title: 'Government Safety Rules', body: 'We strictly follow Indian data safety laws. Your phone camera video is processed privately on your own device and is never saved on any server.' },
                { icon: AlertTriangle, color: '#ef4444', title: 'Important Guidelines', body: "This smart AI system is built to help you practice your exercises. Please follow your doctor's advice carefully. The clinic and platform are not responsible for accidental injuries at home." },
                { icon: CheckCircle2, color: '#22c55e', title: 'Double Lock Protection', body: 'Only you and Dr. Dheerendra Pratap Singh can open your files. Your login is fully protected with advanced security systems.' },
            ].map(item => (
              <div key={item.title} className="glass rounded-2xl p-6 border-slate-200/50">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: item.color + '15' }}>
                    <item.icon size={18} style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display font-700 text-slate-800 leading-relaxed">{item.title}</h3>
                </div>
                <p className="font-body text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFeature(null)}>
            <motion.div initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="glass rounded-3xl w-full max-w-lg shadow-glass-lg overflow-hidden">
              <div className="px-6 py-5 flex items-start justify-between"
                style={{ background: `${selectedFeature.color}12`, borderBottom: `1px solid ${selectedFeature.color}25` }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: selectedFeature.color + '20' }}>
                    <selectedFeature.icon size={26} style={{ color: selectedFeature.color }} />
                  </div>
                  <div>
                    <div className="font-mono text-xs font-700" style={{ color: selectedFeature.color }}>{selectedFeature.tag}</div>
                    <h3 className="font-display font-800 text-xl text-slate-900">{selectedFeature.title}</h3>
                  </div>
                </div>
                <button onClick={() => setSelectedFeature(null)}
                  className="w-8 h-8 rounded-full glass flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-6">
                <p className="font-body text-slate-700 leading-relaxed mb-5">{selectedFeature.detail}</p>
                <div>
                  <h4 className="font-display font-700 text-slate-800 text-sm mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeature.tech.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-full glass-teal text-xs font-mono font-600 text-teal-700">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
      <FloatingActions />
    </div>
  )
}
