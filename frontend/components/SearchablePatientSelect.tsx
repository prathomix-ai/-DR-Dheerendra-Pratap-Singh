'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search, UserRound } from 'lucide-react'

export type PatientOption = {
  id: string
  name: string
  email: string
  role?: string
}

type SearchablePatientSelectProps = {
  patients: PatientOption[]
  value: string
  onChange: (patientId: string) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export default function SearchablePatientSelect({
  patients,
  value,
  onChange,
  placeholder = 'Search patient by name or email...',
  emptyText = 'No patients found',
  disabled = false,
  className = '',
}: SearchablePatientSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => patients.find((item) => item.id === value) || null, [patients, value])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients

    return patients.filter((item) => {
      return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q)
    })
  }, [patients, query])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev)
          }
        }}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-900 shadow-sm transition hover:border-teal-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        <div className="min-w-0 flex-1">
          {selected ? (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <UserRound size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{selected.name}</p>
                <p className="truncate text-xs text-slate-500">{selected.email}</p>
              </div>
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={16} className="shrink-0 text-slate-400" />
      </button>

      {open ? (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 p-3">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 focus-within:border-teal-300 focus-within:bg-white">
              <Search size={15} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoFocus
                placeholder={placeholder}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="rounded-xl px-3 py-8 text-center text-sm text-slate-500">{emptyText}</div>
            ) : (
              filtered.map((item) => {
                const active = item.id === value
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id)
                      setOpen(false)
                      setQuery('')
                    }}
                    className={`mb-1 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition ${
                      active ? 'bg-teal-50 text-teal-900' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="truncate text-xs text-slate-500">{item.email}</p>
                    </div>
                    {active ? <Check size={16} className="shrink-0 text-teal-700" /> : null}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}