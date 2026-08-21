'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, AlertTriangle } from 'lucide-react'

interface Region {
  id: string; label: string; cx: number; cy: number
  desc: string; severity?: 'low' | 'medium' | 'high'
  doctorHighlighted?: boolean
}

interface Props {
  onRegionSelect?: (r: Region) => void
  compact?: boolean
  highlightedRegions?: string[]   // from doctor's pain map
}

const REGIONS: Region[] = [
  { id: 'head',          label: 'Head / Cervical', cx: 120, cy: 38,  desc: 'Cervical spondylosis, tension headache, whiplash, TMJ disorders', severity: 'medium' },
  { id: 'left_shoulder', label: 'Left Shoulder',   cx: 68,  cy: 98,  desc: 'Rotator cuff tear, frozen shoulder, AC joint sprain', severity: 'high' },
  { id: 'right_shoulder',label: 'Right Shoulder',  cx: 172, cy: 98,  desc: 'Impingement syndrome, biceps tendinopathy, SLAP lesion', severity: 'high' },
  { id: 'left_elbow',    label: 'Left Elbow',      cx: 52,  cy: 155, desc: 'Medial epicondylitis, cubital tunnel syndrome', severity: 'low' },
  { id: 'right_elbow',   label: 'Right Elbow',     cx: 188, cy: 155, desc: 'Lateral epicondylitis (Tennis Elbow), radial tunnel', severity: 'low' },
  { id: 'left_wrist',    label: 'Left Wrist',      cx: 42,  cy: 208, desc: 'Carpal tunnel syndrome, TFCC tear, de Quervain\'s', severity: 'medium' },
  { id: 'right_wrist',   label: 'Right Wrist',     cx: 198, cy: 208, desc: 'Scaphoid fracture, ECU tendinopathy', severity: 'medium' },
  { id: 'upper_spine',   label: 'Thoracic Spine',  cx: 120, cy: 140, desc: 'Thoracic kyphosis, costovertebral joint pain, rib subluxation', severity: 'medium' },
  { id: 'lower_spine',   label: 'Lumbar Spine',    cx: 120, cy: 195, desc: 'L4-L5 disc herniation, lumbar stenosis, spondylolisthesis, sciatica', severity: 'high' },
  { id: 'left_hip',      label: 'Left Hip',        cx: 88,  cy: 238, desc: 'FAI, labral tear, trochanteric bursitis, OA', severity: 'high' },
  { id: 'right_hip',     label: 'Right Hip',       cx: 152, cy: 238, desc: 'Hip flexor strain, iliotibial band syndrome, gluteal tendinopathy', severity: 'high' },
  { id: 'left_knee',     label: 'Left Knee',       cx: 84,  cy: 315, desc: 'ACL rupture, medial meniscus tear, patellofemoral pain syndrome', severity: 'high' },
  { id: 'right_knee',    label: 'Right Knee',      cx: 156, cy: 315, desc: 'PCL injury, lateral meniscus tear, Osgood-Schlatter disease', severity: 'high' },
  { id: 'left_ankle',    label: 'Left Ankle',      cx: 80,  cy: 392, desc: 'ATFL sprain, Achilles tendinopathy, peroneal tendon tear', severity: 'medium' },
  { id: 'right_ankle',   label: 'Right Ankle',     cx: 160, cy: 392, desc: 'Deltoid ligament injury, posterior tibial tendon dysfunction', severity: 'medium' },
  { id: 'left_foot',     label: 'Left Foot',       cx: 76,  cy: 428, desc: 'Plantar fasciitis, Morton\'s neuroma, hallux valgus', severity: 'low' },
  { id: 'right_foot',    label: 'Right Foot',      cx: 162, cy: 428, desc: 'Metatarsal stress fracture, heel spur, flatfoot', severity: 'low' },
]

const SEV_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }

export default function MedicalAnatomyMap({ onRegionSelect, compact = false, highlightedRegions = [] }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered,  setHovered]  = useState<string | null>(null)

  const handleRegion = useCallback((r: Region) => {
    setSelected(r.id)
    if (onRegionSelect) onRegionSelect(r)
  }, [onRegionSelect])

  const goTriage = useCallback(() => {
    if (selected) router.push(`/ai-triage?region=${selected}`)
  }, [selected, router])

  const active = REGIONS.find(r => r.id === (hovered || selected))

  return (
    <div className={`flex ${compact ? 'flex-col' : 'flex-col xl:flex-row'} items-center gap-6 w-full max-w-full`} data-tour="bento-anatomy">
      {/* Anatomy display */}
      <div className="relative flex-shrink-0 anatomy-container rounded-3xl overflow-hidden mx-auto"
        style={{ width: '100%', maxWidth: compact ? 220 : 260, aspectRatio: '240/470', background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', border: '1px solid rgba(13,148,136,0.3)' }}>

        {/* Scan line */}
        <div className="anatomy-scan-line" />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(13,148,136,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(13,148,136,0.3) 1px,transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        {/* Use a medical anatomy SVG that looks detailed and professional */}
        <svg width="100%" height="100%"
          viewBox="0 0 240 470" xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}>
          <defs>
            <radialGradient id="bodyGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(13,148,136,0.15)" />
              <stop offset="100%" stopColor="rgba(13,148,136,0.03)" />
            </radialGradient>
            <filter id="glow3">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow6">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(13,148,136,0.25)" />
              <stop offset="50%" stopColor="rgba(20,184,166,0.12)" />
              <stop offset="100%" stopColor="rgba(13,148,136,0.08)" />
            </linearGradient>
            <linearGradient id="skeletonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(148,163,184,0.6)" />
              <stop offset="100%" stopColor="rgba(71,85,105,0.4)" />
            </linearGradient>
          </defs>

          {/* ── SKELETON layer ── */}
          {/* Skull */}
          <ellipse cx="120" cy="26" rx="21" ry="24" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.5)" strokeWidth="1"/>
          <ellipse cx="120" cy="22" rx="17" ry="18" fill="rgba(148,163,184,0.08)" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8"/>
          {/* Jaw */}
          <path d="M103 38 Q120 50 137 38" fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth="1"/>
          {/* Cervical spine */}
          <rect x="116" y="50" width="8" height="20" rx="3" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8"/>
          {[55,59,63,67].map((y,i)=><line key={i} x1="112" y1={y} x2="128" y2={y} stroke="rgba(13,148,136,0.3)" strokeWidth="0.6"/>)}
          {/* Clavicles */}
          <path d="M120 70 Q95 68 74 82" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"/>
          <path d="M120 70 Q145 68 166 82" fill="none" stroke="rgba(148,163,184,0.5)" strokeWidth="1.5"/>
          {/* Sternum */}
          <rect x="115" y="70" width="10" height="70" rx="4" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.4)" strokeWidth="0.8"/>
          {/* Ribs */}
          {[78,87,96,105,114,122].map((y,i)=>(
            <g key={i}>
              <path d={`M115 ${y} Q90 ${y+4} 72 ${y+8}`} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8"/>
              <path d={`M125 ${y} Q150 ${y+4} 168 ${y+8}`} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8"/>
            </g>
          ))}
          {/* Thoracic + Lumbar vertebrae */}
          {[90,98,106,114,122,132,142,152,162,175,185,195].map((y,i)=>(
            <g key={i}>
              <rect x="116" y={y} width="8" height="7" rx="2" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.35)" strokeWidth="0.6"/>
            </g>
          ))}
          {/* Pelvis */}
          <path d="M85 205 Q120 215 155 205 L158 240 Q120 252 82 240 Z" fill="rgba(148,163,184,0.12)" stroke="rgba(148,163,184,0.4)" strokeWidth="1"/>
          <ellipse cx="97" cy="228" rx="12" ry="14" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8"/>
          <ellipse cx="143" cy="228" rx="12" ry="14" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="0.8"/>
          {/* Humerus L/R */}
          <line x1="72" y1="97" x2="55" y2="155" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5"/>
          <line x1="168" y1="97" x2="185" y2="155" stroke="rgba(148,163,184,0.45)" strokeWidth="1.5"/>
          {/* Radius/Ulna L/R */}
          <line x1="55" y1="155" x2="44" y2="208" stroke="rgba(148,163,184,0.35)" strokeWidth="1"/>
          <line x1="57" y1="155" x2="48" y2="208" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8"/>
          <line x1="185" y1="155" x2="196" y2="208" stroke="rgba(148,163,184,0.35)" strokeWidth="1"/>
          <line x1="183" y1="155" x2="192" y2="208" stroke="rgba(148,163,184,0.25)" strokeWidth="0.8"/>
          {/* Femur L/R */}
          <line x1="96" y1="240" x2="88" y2="315" stroke="rgba(148,163,184,0.45)" strokeWidth="2"/>
          <line x1="144" y1="240" x2="152" y2="315" stroke="rgba(148,163,184,0.45)" strokeWidth="2"/>
          {/* Tibia L/R */}
          <line x1="87" y1="315" x2="83" y2="392" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5"/>
          <line x1="153" y1="315" x2="157" y2="392" stroke="rgba(148,163,184,0.4)" strokeWidth="1.5"/>

          {/* ── MUSCLE layer (semi-transparent fills) ── */}
          {/* Trapezius */}
          <path d="M72 82 Q120 72 168 82 L155 105 Q120 95 85 105 Z" fill="url(#muscleGrad)" opacity="0.6"/>
          {/* Pectorals */}
          <path d="M115 75 Q95 80 78 98 Q88 105 115 100 Z" fill="url(#muscleGrad)" opacity="0.5"/>
          <path d="M125 75 Q145 80 162 98 Q152 105 125 100 Z" fill="url(#muscleGrad)" opacity="0.5"/>
          {/* Abs */}
          {[75,88,101,114].map((y,i)=>(
            <g key={i}>
              <rect x="110" y={y} width="9" height="11" rx="3" fill="rgba(13,148,136,0.12)" stroke="rgba(13,148,136,0.2)" strokeWidth="0.5"/>
              <rect x="121" y={y} width="9" height="11" rx="3" fill="rgba(13,148,136,0.12)" stroke="rgba(13,148,136,0.2)" strokeWidth="0.5"/>
            </g>
          ))}
          {/* Deltoids */}
          <ellipse cx="71" cy="92" rx="10" ry="12" fill="url(#muscleGrad)" opacity="0.7"/>
          <ellipse cx="169" cy="92" rx="10" ry="12" fill="url(#muscleGrad)" opacity="0.7"/>
          {/* Biceps */}
          <path d="M62 110 Q52 130 54 150" fill="none" stroke="rgba(13,148,136,0.3)" strokeWidth="6" strokeLinecap="round"/>
          <path d="M178 110 Q188 130 186 150" fill="none" stroke="rgba(13,148,136,0.3)" strokeWidth="6" strokeLinecap="round"/>
          {/* Glutes */}
          <ellipse cx="97" cy="230" rx="16" ry="14" fill="url(#muscleGrad)" opacity="0.5"/>
          <ellipse cx="143" cy="230" rx="16" ry="14" fill="url(#muscleGrad)" opacity="0.5"/>
          {/* Quadriceps L/R */}
          <path d="M85 245 Q78 278 80 310" fill="none" stroke="rgba(13,148,136,0.3)" strokeWidth="14" strokeLinecap="round"/>
          <path d="M155 245 Q162 278 160 310" fill="none" stroke="rgba(13,148,136,0.3)" strokeWidth="14" strokeLinecap="round"/>
          {/* Calves */}
          <path d="M83 325 Q77 355 80 390" fill="none" stroke="rgba(13,148,136,0.25)" strokeWidth="9" strokeLinecap="round"/>
          <path d="M157 325 Q163 355 160 390" fill="none" stroke="rgba(13,148,136,0.25)" strokeWidth="9" strokeLinecap="round"/>

          {/* ── INTERACTIVE HOTSPOT NODES ── */}
          {REGIONS.map(r => {
            const isH = hovered   === r.id
            const isS = selected  === r.id
            const isDrHighlight = highlightedRegions.some(h => h.split(':')[0] === r.id)
            const foundRegion = highlightedRegions.find(h => h.split(':')[0] === r.id)
            const regionSeverity = foundRegion && foundRegion.includes(':')
              ? (foundRegion.split(':')[1] as 'low' | 'medium' | 'high')
              : r.severity || 'low'
            const color = isDrHighlight ? SEV_COLORS[regionSeverity] : SEV_COLORS[r.severity || 'low']
            const outerR = isS ? 14 : isH ? 12 : isDrHighlight ? 11 : 8
            const innerR = isS ? 6  : isH ? 5  : 4
            const filter = isS ? 'url(#glow6)' : isH ? 'url(#glow3)' : isDrHighlight ? 'url(#glow3)' : 'none'
            return (
              <g key={r.id} style={{ cursor: 'pointer' }}
                onClick={() => handleRegion(r)}
                onMouseEnter={() => setHovered(r.id)}
                onMouseLeave={() => setHovered(null)}
                filter={filter}>
                {/* Pulse ring */}
                {(isH || isS || isDrHighlight) && (
                  <circle cx={r.cx} cy={r.cy} r={outerR + 7}
                    fill={`${color}12`} stroke={`${color}35`} strokeWidth="0.8"
                    className="pain-pulse" />
                )}
                {/* Outer ring */}
                <circle cx={r.cx} cy={r.cy} r={outerR}
                  fill={isS ? `${color}35` : isH ? `${color}22` : isDrHighlight ? `${color}20` : `${color}15`}
                  stroke={isS ? color : `${color}70`}
                  strokeWidth={isS ? 1.8 : isDrHighlight ? 1.5 : 1}
                  style={{ transition: 'all 0.2s ease' }} />
                {/* Inner dot */}
                <circle cx={r.cx} cy={r.cy} r={innerR}
                  fill={color}
                  style={{ transition: 'all 0.2s ease' }} />
                {/* Crosshair for selected */}
                {isS && (
                  <>
                    <line x1={r.cx - 18} y1={r.cy} x2={r.cx + 18} y2={r.cy} stroke={color} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7" />
                    <line x1={r.cx} y1={r.cy - 18} x2={r.cx} y2={r.cy + 18} stroke={color} strokeWidth="0.8" strokeDasharray="3,2" opacity="0.7" />
                  </>
                )}
                {/* Doctor-highlighted badge */}
                {isDrHighlight && !isS && !isH && (
                  <circle cx={r.cx + outerR - 2} cy={r.cy - outerR + 2} r={4}
                    fill="#ef4444" stroke="white" strokeWidth="1" />
                )}
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-3 px-2 py-1.5 rounded-xl"
          style={{ background: 'rgba(15,23,42,0.8)' }}>
          {[['#22c55e','Low'],['#f59e0b','Med'],['#ef4444','High']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="font-mono text-[9px] text-slate-400">{l}</span>
            </div>
          ))}
          {highlightedRegions.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              <AlertTriangle size={9} className="text-red-400" />
              <span className="font-mono text-[9px] text-red-400">Dr. Marked</span>
            </div>
          )}
        </div>
      </div>

      {/* Info panel */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div key={active.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}
              className="glass-teal rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: SEV_COLORS[active.severity || 'low'] }} />
                <span className="font-display font-800 text-teal-800 text-lg">{active.label}</span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-700 font-mono"
                  style={{ background: `${SEV_COLORS[active.severity || 'low']}20`, color: SEV_COLORS[active.severity || 'low'], border: `1px solid ${SEV_COLORS[active.severity || 'low']}40` }}>
                  {(active.severity || 'low').toUpperCase()} RISK
                </span>
              </div>
              {highlightedRegions.some(h => h.split(':')[0] === active.id) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass-red">
                  <AlertTriangle size={14} className="text-red-500 shrink-0" />
                  <span className="font-body text-xs text-red-700 font-600">Dr. Dheerendra Pratap Singh  has flagged this region for your treatment plan</span>
                </div>
              )}
              <p className="font-body text-sm text-slate-600 leading-relaxed">{active.desc}</p>
              {selected === active.id && (
                <button onClick={goTriage}
                  className="flex items-center justify-center gap-2 btn-teal py-2.5 px-4 rounded-xl font-700 text-sm mt-1">
                  <Zap size={15} /> Start AI Triage for {active.label} <ArrowRight size={14} />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-3 text-center py-8">
              <div className="w-14 h-14 rounded-full glass-teal flex items-center justify-center">
                <Zap size={24} className="text-teal-500" />
              </div>
              <div>
                <p className="font-display font-700 text-slate-700 text-base">Where does it hurt?</p>
                <p className="font-body text-sm text-slate-400 max-w-xs mt-1">
                  Tap on the body parts (like your knee or shoulder) where you feel pain, and our AI will guide you.
                </p>
              </div>
              <p className="font-mono text-xs text-slate-400">{REGIONS.length} regions mapped · Real-time analysis</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
