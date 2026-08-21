'use client'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight } from 'lucide-react'
interface Joint { id:string; label:string; cx:number; cy:number; desc:string }
const JOINTS:Joint[]=[
  {id:'head',         label:'Head / Neck',    cx:120,cy:40,  desc:'Cervical pain, headaches, whiplash, TMJ disorders'},
  {id:'left_shoulder',label:'L Shoulder',     cx:72, cy:100, desc:'Rotator cuff tear, frozen shoulder, AC joint pain'},
  {id:'right_shoulder',label:'R Shoulder',    cx:168,cy:100, desc:'Rotator cuff tear, impingement, instability'},
  {id:'left_elbow',   label:'L Elbow',        cx:58, cy:155, desc:'Tennis elbow, golfer\'s elbow, cubital tunnel'},
  {id:'right_elbow',  label:'R Elbow',        cx:182,cy:155, desc:'Lateral epicondylitis, bursitis'},
  {id:'left_wrist',   label:'L Wrist',        cx:48, cy:208, desc:'Carpal tunnel, TFCC injury, de Quervain\'s'},
  {id:'right_wrist',  label:'R Wrist',        cx:192,cy:208, desc:'Carpal tunnel syndrome, wrist fracture'},
  {id:'spine',        label:'Spine / Back',   cx:120,cy:170, desc:'Lumbar pain, disc herniation, scoliosis, sciatica'},
  {id:'left_hip',     label:'L Hip',          cx:90, cy:235, desc:'Hip impingement, bursitis, labral tear, OA'},
  {id:'right_hip',    label:'R Hip',          cx:150,cy:235, desc:'Hip osteoarthritis, hip flexor strain'},
  {id:'left_knee',    label:'L Knee',         cx:85, cy:310, desc:'ACL/MCL tear, meniscus injury, patellofemoral pain'},
  {id:'right_knee',   label:'R Knee',         cx:155,cy:310, desc:'Runner\'s knee, PCL injury, knee OA'},
  {id:'left_ankle',   label:'L Ankle',        cx:80, cy:390, desc:'Ankle sprain, Achilles tendinitis, plantar fasciitis'},
  {id:'right_ankle',  label:'R Ankle',        cx:160,cy:390, desc:'Lateral sprain, peroneal tendinopathy'},
  {id:'left_foot',    label:'L Foot',         cx:78, cy:425, desc:'Plantar fasciitis, bunion, flat foot'},
  {id:'right_foot',   label:'R Foot',         cx:162,cy:425, desc:'Metatarsalgia, Morton\'s neuroma, heel spur'},
]
interface Props { onJointSelect?:(j:Joint)=>void; compact?:boolean }
export default function AnatomyMap({onJointSelect,compact=false}:Props){
  const router=useRouter()
  const [selected,setSelected]=useState<string|null>(null)
  const [hovered,setHovered]=useState<string|null>(null)
  const handleJoint=useCallback((j:Joint)=>{ setSelected(j.id); if(onJointSelect)onJointSelect(j) },[onJointSelect])
  const handleTriage=useCallback(()=>{ if(selected)router.push(`/ai-triage?region=${selected}`) },[selected,router])
  const activeJoint=JOINTS.find(j=>j.id===(hovered||selected))
  return (
    <div className={`flex ${compact?'flex-col':'flex-col lg:flex-row'} items-center gap-6 w-full max-w-full`} data-tour="bento-anatomy">
      <div className="relative flex-shrink-0 mx-auto" style={{ width: '100%', maxWidth: compact ? 220 : 240, aspectRatio: '240/460' }}>
        <svg width="100%" height="100%" viewBox="0 0 240 460" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="jg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="jgs"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <radialGradient id="bg" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="rgba(13,148,136,0.08)"/><stop offset="100%" stopColor="rgba(13,148,136,0.02)"/></radialGradient>
            <linearGradient id="sl" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0d9488" stopOpacity="0.18"/><stop offset="100%" stopColor="#14b8a6" stopOpacity="0.06"/></linearGradient>
          </defs>
          {/* Silhouette */}
          <ellipse cx="120" cy="28" rx="22" ry="26" fill="url(#bg)" stroke="rgba(13,148,136,0.25)" strokeWidth="1.5"/>
          <rect x="113" y="52" width="14" height="18" rx="5" fill="url(#bg)" stroke="rgba(13,148,136,0.2)" strokeWidth="1"/>
          <path d="M78 70 Q120 62 162 70 L168 200 Q120 210 72 200 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.22)" strokeWidth="1.5"/>
          <path d="M78 72 Q60 90 56 135 Q58 145 66 148 Q74 145 76 135 Q78 100 90 80 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.18)" strokeWidth="1.2"/>
          <path d="M58 140 Q50 175 46 208 Q50 214 56 212 Q62 212 66 208 Q70 175 68 140 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <path d="M162 72 Q180 90 184 135 Q182 145 174 148 Q166 145 164 135 Q162 100 150 80 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.18)" strokeWidth="1.2"/>
          <path d="M182 140 Q190 175 194 208 Q190 214 184 212 Q178 212 174 208 Q170 175 172 140 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <ellipse cx="50" cy="218" rx="8" ry="10" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <ellipse cx="190" cy="218" rx="8" ry="10" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <path d="M80 198 Q120 208 160 198 L158 240 Q120 248 82 240 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.2)" strokeWidth="1.5"/>
          <path d="M88 238 Q80 275 80 315 Q84 322 90 322 Q96 322 100 315 Q100 275 96 238 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.18)" strokeWidth="1.2"/>
          <path d="M152 238 Q160 275 160 315 Q156 322 150 322 Q144 322 140 315 Q140 275 148 238 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.18)" strokeWidth="1.2"/>
          <path d="M82 318 Q78 358 76 393 Q80 398 86 398 Q92 398 96 393 Q94 358 90 318 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <path d="M158 318 Q162 358 164 393 Q160 398 154 398 Q148 398 144 393 Q146 358 150 318 Z" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <ellipse cx="82" cy="428" rx="16" ry="8" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          <ellipse cx="158" cy="428" rx="16" ry="8" fill="url(#bg)" stroke="rgba(13,148,136,0.15)" strokeWidth="1"/>
          {/* Skeleton guides */}
          <line x1="120" y1="68" x2="120" y2="200" stroke="url(#sl)" strokeWidth="1.5" strokeDasharray="4,3"/>
          <line x1="80" y1="200" x2="160" y2="200" stroke="url(#sl)" strokeWidth="1.2" strokeDasharray="3,3"/>
          <line x1="90" y1="235" x2="90" y2="390" stroke="url(#sl)" strokeWidth="1.2" strokeDasharray="3,3"/>
          <line x1="150" y1="235" x2="150" y2="390" stroke="url(#sl)" strokeWidth="1.2" strokeDasharray="3,3"/>
          {/* Joint nodes */}
          {JOINTS.map(j=>{
            const isH=hovered===j.id, isS=selected===j.id
            const or=isS?13:isH?11:9, ir=isS?6:isH?5:4
            return (
              <g key={j.id} style={{cursor:'pointer'}} onClick={()=>handleJoint(j)} onMouseEnter={()=>setHovered(j.id)} onMouseLeave={()=>setHovered(null)} filter={isS?'url(#jgs)':isH?'url(#jg)':'none'}>
                {(isS||isH)&&<circle cx={j.cx} cy={j.cy} r={or+6} fill="rgba(13,148,136,0.08)" stroke="rgba(13,148,136,0.2)" strokeWidth="0.8" className="joint-pulse"/>}
                <circle cx={j.cx} cy={j.cy} r={or} fill={isS?'rgba(20,184,166,0.25)':isH?'rgba(13,148,136,0.18)':'rgba(13,148,136,0.10)'} stroke={isS?'#14b8a6':'rgba(13,148,136,0.4)'} strokeWidth={isS?1.5:1} style={{transition:'all 0.2s ease'}}/>
                <circle cx={j.cx} cy={j.cy} r={ir} fill={isS?'#14b8a6':'#0d9488'} style={{transition:'all 0.2s ease'}}/>
                {isS&&<><line x1={j.cx-16} y1={j.cy} x2={j.cx+16} y2={j.cy} stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6"/><line x1={j.cx} y1={j.cy-16} x2={j.cx} y2={j.cy+16} stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6"/></>}
              </g>
            )
          })}
        </svg>
        <AnimatePresence>
          {hovered&&!selected&&(
            <motion.div key={hovered} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}} transition={{duration:0.15}}
              className="absolute left-full ml-3 top-1/3 z-20 w-44 glass rounded-xl px-3 py-2.5 shadow-glass pointer-events-none">
              <p className="font-display font-700 text-teal-700 text-sm">{JOINTS.find(j=>j.id===hovered)?.label}</p>
              <p className="font-body text-xs text-slate-500 mt-0.5">Click to select</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        {activeJoint?(
          <motion.div key={activeJoint.id} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} transition={{duration:0.25}} className="flex-1 min-w-0">
            <div className="glass-teal rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"/><span className="font-display font-800 text-teal-800 text-lg">{activeJoint.label}</span></div>
              <p className="font-body text-sm text-slate-600 leading-relaxed">{activeJoint.desc}</p>
              {selected===activeJoint.id&&(
                <button onClick={handleTriage} className="flex items-center justify-center gap-2 btn-teal py-2.5 px-4 rounded-xl font-700 text-sm mt-1">
                  <Zap size={15}/>Start AI Triage for {activeJoint.label}<ArrowRight size={14}/>
                </button>
              )}
            </div>
          </motion.div>
        ):(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-6">
            <div className="w-12 h-12 rounded-full glass-teal flex items-center justify-center mb-1"><Zap size={22} className="text-teal-500"/></div>
            <p className="font-display font-700 text-slate-700">Where does it hurt?</p>
            <p className="font-body text-sm text-slate-400 max-w-xs">Tap on the body parts (like your knee or shoulder) where you feel pain, and our AI will guide you.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
