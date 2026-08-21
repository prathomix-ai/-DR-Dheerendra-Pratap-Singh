'use client'
import { useEffect, useState } from 'react'
interface Props { value: number; size?: number; stroke?: number; color?: string; label?: string; sublabel?: string }
export default function ProgressRing({ value, size=100, stroke=8, color='#0d9488', label, sublabel }: Props) {
  const [v, setV] = useState(0)
  useEffect(() => { setTimeout(() => setV(value), 100) }, [value])
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, offset = circ - (v / 100) * circ
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs><filter id="rg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke="rgba(13,148,136,0.12)" fill="none"/>
          <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke={color}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" fill="none"
            className="progress-ring-fill" filter="url(#rg)" transform={`rotate(-90 ${size/2} ${size/2})`}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-800 text-slate-800" style={{ fontSize: size * 0.2 }}>{v}%</span>
        </div>
      </div>
      {label    && <p className="font-body font-600 text-sm text-slate-700 text-center">{label}</p>}
      {sublabel && <p className="font-body text-xs text-slate-400 text-center">{sublabel}</p>}
    </div>
  )
}
