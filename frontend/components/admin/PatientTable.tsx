'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

export type PatientStatus = 'Active' | 'Recovered' | 'Needs Attention'

export type PatientRow = {
  id: string
  name: string
  email: string
  lastSessionDate: string
  status: PatientStatus
}

type PatientTableProps = {
  patients: PatientRow[]
}

const badgeStyles: Record<PatientStatus, string> = {
  Active: 'border-teal-100 bg-teal-50 text-teal-700',
  Recovered: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'Needs Attention': 'border-amber-100 bg-amber-50 text-amber-700',
}

export default function PatientTable({ patients }: PatientTableProps) {
  const [query, setQuery] = useState('')

  const filteredPatients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return patients

    return patients.filter((patient) => patient.name.toLowerCase().includes(normalized))
  }, [patients, query])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Patient management</h2>
          <p className="mt-1 text-sm text-slate-500">Search and review your patient base.</p>
        </div>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 focus-within:border-teal-300 focus-within:bg-white sm:w-80">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search patients by name"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.2fr_1.4fr_1fr_0.8fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          <span>Name</span>
          <span>Email</span>
          <span>Last session</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_0.8fr] items-center px-4 py-3 text-sm transition hover:bg-slate-50">
              <span className="font-medium text-slate-900">{patient.name}</span>
              <span className="truncate text-slate-600">{patient.email}</span>
              <span className="text-slate-600">{patient.lastSessionDate}</span>
              <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[patient.status]}`}>
                {patient.status}
              </span>
            </div>
          ))}

          {!filteredPatients.length ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">No patients match that search.</div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
