"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  ArrowRightFromLine,
  BarChart3,
  BookOpenText,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  Stethoscope,
  Users,
  FileText,
  Brain,
  Map,
  Camera,
} from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
      })
    : null

const navigation = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/patients', label: 'Patient Management', icon: Users },
  { href: '/admin/exercises', label: 'Exercise Library', icon: BookOpenText },
  { href: '/admin/ocr', label: 'Prescription OCR', icon: FileText },
  { href: '/admin/triage', label: 'Triage Logs', icon: Brain },
  { href: '/admin/painmap', label: 'Pain Map Sync', icon: Map },
  { href: '/admin/pose', label: 'AI Pose & Gait', icon: Camera },
  { href: '/admin/features', label: 'Feature Controls', icon: BarChart3 },
]

export default function AdminSidebarClient() {
  const pathname = usePathname()
  const router = useRouter()

  // Hide sidebar for the login screen
  if (!pathname || pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return null
  }

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.replace('/admin/login')
  }

  return (
    <aside className="hidden md:block border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col p-5">
        <div className="rounded-[1.75rem] border border-teal-100 bg-teal-50 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">Prathomix</p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">Admin Suite</h1>
            </div>
          </div>
          <p className="text-sm leading-6 text-slate-600">Secure clinical operations for doctors, therapists, and administrators.</p>
        </div>

        <nav className="mt-6 space-y-2">
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active ? 'bg-teal-50 text-teal-800 ring-1 ring-teal-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className={active ? 'text-teal-700' : 'text-slate-400'} />
                  {item.label}
                </span>
                <ChevronRight size={16} className={active ? 'text-teal-600' : 'text-slate-300'} />
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="mb-2 flex items-center gap-2 text-slate-900">
            <Stethoscope size={16} className="text-teal-600" />
            Clinical focus
          </div>
          Dashboard-first navigation for quick access to patient care tools.
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowRightFromLine size={16} />
            Secure Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
