/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'

type DoctorAvatarProps = {
  name: string
  alt?: string
  className?: string
  imageClassName?: string
  initialsClassName?: string
  src?: string
}

const DEFAULT_DOCTOR_IMAGE = '/dr-dheerendra.jpeg'

function buildInitials(name: string) {
  const words = name.trim().split(/\s+/)
  const initials = words.slice(0, 2).map((word) => word[0]).join('')

  return initials ? initials.toUpperCase() : 'DD'
}

export default function DoctorAvatar({
  name,
  alt,
  className = '',
  imageClassName = '',
  initialsClassName = '',
  src,
}: DoctorAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const initials = useMemo(() => buildInitials(name), [name])

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white">
        <div className={`flex h-full w-full items-center justify-center rounded-[inherit] border border-white/10 bg-white/5 font-display font-900 tracking-[0.2em] text-white ${initialsClassName}`.trim()}>
          {initials}
        </div>
      </div>

      {!imageFailed && (
        <img
          src={src || DEFAULT_DOCTOR_IMAGE}
          alt={alt || name}
          className={`relative z-10 h-full w-full rounded-[inherit] ${imageClassName}`.trim()}
          onError={() => setImageFailed(true)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  )
}