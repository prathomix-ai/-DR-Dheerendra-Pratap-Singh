'use client'
import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, CameraOff, Zap, Volume2, VolumeX, CheckCircle2, AlertCircle } from 'lucide-react'
import { poseAPI } from '@/lib/api'
import { speakFeedback, speakCustom, stopSpeech } from '@/lib/tts'
import { type Lang } from '@/lib/i18n'
import toast from 'react-hot-toast'

interface Props {
  exerciseName?: string
  lang?: Lang
  onScore?: (score: number) => void
}

const FEEDBACK_COLOR: Record<string, string> = {
  excellent: '#22c55e', good: '#84cc16', fair: '#f59e0b', poor: '#ef4444'
}

const POSE_TTS_MAP: Record<string, string> = {
  'back_alignment': 'back_straight',
  'knee_angle':     'knee_extend',
  'core':           'core_engage',
  'speed':          'too_fast',
  'hip_position':   'lower_hips',
}

export default function PoseDetector({ exerciseName = 'squat', lang = 'en', onScore }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef= useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const repTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [active,    setActive]    = useState(false)
  const [score,     setScore]     = useState<number | null>(null)
  const [feedback,  setFeedback]  = useState('')
  const [grade,     setGrade]     = useState<string>('')
  const [reps,      setReps]      = useState(0)
  const [ttsOn,     setTtsOn]     = useState(true)
  const [speaking,  setSpeaking]  = useState(false)
  const [lastKey,   setLastKey]   = useState('')

  const drawSkeletonOverlay = useCallback((landmarks: any[]) => {
    const canvas = overlayRef.current
    const video  = videoRef.current
    if (!canvas || !video || !landmarks?.length) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const CONNECTIONS = [
      [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
      [5,11],[6,12],[11,12],[11,13],[13,15],[12,14],[14,16],
      [11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28],
    ]
    const W2 = canvas.width, H2 = canvas.height

    // Draw connections
    ctx.strokeStyle = 'rgba(13,184,166,0.85)'
    ctx.lineWidth = 2.5
    CONNECTIONS.forEach(([a, b]) => {
      if (landmarks[a] && landmarks[b] && landmarks[a].visibility > 0.5 && landmarks[b].visibility > 0.5) {
        ctx.beginPath()
        ctx.moveTo(landmarks[a].x * W2, landmarks[a].y * H2)
        ctx.lineTo(landmarks[b].x * W2, landmarks[b].y * H2)
        ctx.stroke()
      }
    })
    // Draw joints
    landmarks.forEach((lm: any) => {
      if (lm.visibility > 0.5) {
        ctx.beginPath()
        ctx.arc(lm.x * W2, lm.y * H2, 5, 0, 2 * Math.PI)
        ctx.fillStyle = 'rgba(13,148,136,0.9)'
        ctx.fill()
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    })
  }, [])

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    canvasRef.current.width  = videoRef.current.videoWidth  || 640
    canvasRef.current.height = videoRef.current.videoHeight || 480
    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.5)
    try {
      const res = await poseAPI.analyze(imageData, exerciseName)
      const { accuracy_score, feedback: fb, grade: g, rep_count, landmarks, tts_key } = res.data
      const sc = Math.round(accuracy_score * 100)
      setScore(sc)
      setFeedback(fb || '')
      setGrade(g || '')
      if (rep_count !== undefined) setReps(rep_count)
      if (landmarks) drawSkeletonOverlay(landmarks)
      if (onScore) onScore(sc)

      // TTS Feedback
      if (ttsOn && tts_key) {
        const mappedKey = POSE_TTS_MAP[tts_key] || tts_key
        if (mappedKey !== lastKey) {
          setLastKey(mappedKey)
          setSpeaking(true)
          speakFeedback(mappedKey, lang)
          setTimeout(() => setSpeaking(false), 3000)
        }
      } else if (ttsOn && g === 'poor' && lastKey !== 'back_straight') {
        setLastKey('back_straight')
        setSpeaking(true)
        speakFeedback('back_straight', lang)
        setTimeout(() => setSpeaking(false), 3000)
      } else if (ttsOn && sc >= 88 && lastKey !== 'good_form') {
        setLastKey('good_form')
        setSpeaking(true)
        speakFeedback('good_form', lang)
        setTimeout(() => setSpeaking(false), 3000)
      }
    } catch (_) { /* silent fail */ }
  }, [exerciseName, lang, ttsOn, lastKey, drawSkeletonOverlay, onScore])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play() }
      setActive(true)
      setReps(0); setScore(null); setFeedback(''); setGrade('')
      timerRef.current = setInterval(analyzeFrame, 1800)
      if (ttsOn) {
        setTimeout(() => {
          speakCustom(
            lang === 'hi' ? 'व्यायाम शुरू करें। अपनी पीठ सीधी रखें।' :
            lang === 'hinglish' ? 'Exercise shuru karo. Back seedhi raho.' :
            lang === 'ta' ? 'பயிற்சி தொடங்கவும். முதுகை நேராக வையுங்கள்.' :
            'Starting exercise. Keep your back straight and core engaged.', lang)
        }, 500)
      }
    } catch (_) { toast.error('Camera permission denied') }
  }, [analyzeFrame, ttsOn, lang])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (timerRef.current) clearInterval(timerRef.current)
    stopSpeech()
    setActive(false); setScore(null); setFeedback(''); setGrade(''); setLastKey('')
    const overlay = overlayRef.current
    if (overlay) { const ctx = overlay.getContext('2d'); ctx?.clearRect(0, 0, overlay.width, overlay.height) }
    if (ttsOn && reps > 0) {
      setTimeout(() => speakFeedback('exercise_done', lang), 300)
    }
  }, [ttsOn, lang, reps])

  useEffect(() => () => { stopCamera() }, [stopCamera])

  const gc = grade ? FEEDBACK_COLOR[grade] : '#0d9488'

  return (
    <div className="flex flex-col gap-3">
      {/* Webcam + Skeleton Overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video">
        <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" playsInline muted />
        {/* Skeleton overlay canvas */}
        <canvas ref={overlayRef}
          className="absolute inset-0 w-full h-full scale-x-[-1]"
          style={{ pointerEvents: 'none' }} />
        {/* Hidden analysis canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Inactive state */}
        {!active && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80">
            <div className="w-16 h-16 rounded-full bg-teal-900/60 flex items-center justify-center">
              <Camera size={32} className="text-teal-400" />
            </div>
            <p className="text-slate-300 text-sm font-body">Click Start to enable camera</p>
            <p className="text-slate-500 text-xs font-mono">Real-time MediaPipe + TTS Feedback</p>
          </div>
        )}

        {/* Score overlay */}
        {active && score !== null && (
          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl font-mono font-700 text-sm"
            style={{ background: `${gc}22`, border: `1px solid ${gc}55`, color: gc }}>
            {score}% {grade.toUpperCase()}
          </div>
        )}

        {/* Rep counter */}
        {active && (
          <div className="absolute top-3 left-3 glass-dark px-3 py-1.5 rounded-xl">
            <span className="font-display font-800 text-white text-xl">{reps}</span>
            <span className="font-body text-slate-400 text-xs ml-1">reps</span>
          </div>
        )}

        {/* TTS indicator */}
        {active && speaking && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="absolute bottom-12 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(13,148,136,0.85)' }}>
            <Volume2 size={14} className="text-white tts-active shrink-0" />
            <span className="text-white font-body text-xs leading-snug">{feedback}</span>
          </motion.div>
        )}

        {/* Status bar */}
        {active && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-xl glass-dark">
            <div className="flex items-center gap-1.5">
              <Zap size={11} className="text-teal-400 animate-pulse" />
              <span className="text-teal-300 font-mono text-[10px]">MediaPipe + TTS Active</span>
            </div>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${speaking ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'}`} />
              <span className="font-mono text-[10px] text-slate-400">Voice {ttsOn ? 'ON' : 'OFF'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Feedback text (non-TTS) */}
      <AnimatePresence>
        {feedback && !speaking && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 p-3 rounded-xl"
            style={{ background: `${gc}12`, border: `1px solid ${gc}30` }}>
            {grade === 'excellent' || grade === 'good'
              ? <CheckCircle2 size={15} style={{ color: gc }} className="mt-0.5 shrink-0" />
              : <AlertCircle  size={15} style={{ color: gc }} className="mt-0.5 shrink-0" />}
            <p className="font-body text-sm text-slate-700">{feedback}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex gap-2">
        {!active ? (
          <button onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 btn-teal py-2.5 rounded-xl font-700 text-sm">
            <Camera size={16} /> Start Pose Analysis
          </button>
        ) : (
          <button onClick={stopCamera}
            className="flex-1 flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl font-700 text-sm hover:bg-red-100 transition-colors">
            <CameraOff size={16} /> Stop
          </button>
        )}
        <button onClick={() => { setTtsOn(!ttsOn); if (ttsOn) stopSpeech() }}
          className={`px-3.5 py-2.5 rounded-xl border font-700 text-sm transition-all ${ttsOn ? 'bg-teal-50 border-teal-200 text-teal-700' : 'glass border-slate-200 text-slate-500'}`}
          title="Toggle voice feedback">
          {ttsOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
      <p className="text-center text-[11px] font-mono text-slate-400">
        MediaPipe Pose · Live TTS Feedback · Powered by Prathomix
      </p>
    </div>
  )
}
