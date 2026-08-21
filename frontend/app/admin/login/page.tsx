'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck, AlertTriangle, KeyRound, Mail, CheckCircle2, ShieldAlert } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import { clearAuth, storeUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const ADMIN_EMAIL = 'prathamsinghujjain@gmail.com'
const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ADMIN_EMAIL
const DEFAULT_EMAIL = ADMIN_EMAILS.split(',')[0].trim()

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

function isAdminUser(user: any) {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  const email = String(user?.email || '').toLowerCase()
  const allowlistedEmails = ADMIN_EMAILS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  return role === 'admin' || email === ADMIN_EMAIL || allowlistedEmails.includes(email)
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutTimer, setLockoutTimer] = useState(0)
  const [customEmailMode, setCustomEmailMode] = useState(false)

  // Wipe low-privilege tokens on load for session hygiene
  useEffect(() => {
    clearAuth()
  }, [])

  // Cooldown timer effect for brute-force prevention
  useEffect(() => {
    if (lockoutTimer <= 0) return

    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutTimer])

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (lockoutTimer > 0) {
      toast.error(`Security lockout active. Please wait ${lockoutTimer} seconds.`)
      return
    }

    if (!supabase) {
      const message = 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      setError(message)
      toast.error(message)
      return
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide both admin email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      })

      if (signInError) {
        const nextAttempts = attempts + 1
        setAttempts(nextAttempts)

        if (nextAttempts >= 3) {
          setLockoutTimer(30)
          const lockMsg = 'Security Lockout: 3 failed attempts detected. Cooldown active for 30s.'
          setError(lockMsg)
          toast.error(lockMsg)
        } else {
          const warnMsg = `Invalid credentials (${3 - nextAttempts} attempt${3 - nextAttempts === 1 ? '' : 's'} remaining)`
          setError(warnMsg)
          toast.error(warnMsg)
        }
        return
      }

      const user = data.user
      if (!isAdminUser(user)) {
        await supabase.auth.signOut()
        clearAuth()
        const msg = 'Access denied. Account lacks administrative privileges.'
        setError(msg)
        toast.error(msg)
        return
      }

      // Reset security metrics & cache admin session on successful authentication
      setAttempts(0)
      if (user && data.session) {
        storeUser(
          {
            id: user.id,
            email: user.email || '',
            name: 'Dr. Dheerendra (Admin)',
            role: 'admin',
            language: 'en',
          },
          data.session.access_token
        )
      }
      toast.success('Ultra Security Verified · Welcome Admin')
      router.refresh()
      window.location.href = '/admin/dashboard'
    } catch (loginError: any) {
      const message = loginError?.message || 'Unable to authenticate admin'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.12),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)] px-4 py-8 flex flex-col items-center justify-center text-slate-900">
      <div className="w-full max-w-md">
        {/* Security Shield Header Badge */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-teal-200/80 bg-teal-50/90 px-4 py-2 text-xs font-700 uppercase tracking-widest text-teal-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-600" />
            <span>ULTRA MAX PRO SECURITY</span>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-700 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 256-BIT TLS
          </span>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-white/90 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-slate-900/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Logo/Icon */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-600/20">
              <ShieldCheck size={34} strokeWidth={1.75} />
            </div>

            <p className="text-xs font-800 uppercase tracking-[0.25em] text-teal-700">CLINICAL COMMAND CENTER</p>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight text-slate-900">ADMIN CONTROL</h1>
            <p className="mt-1 text-xs text-slate-500 font-mono max-w-[280px]">
              Encrypted Doctor & Practice Portal
            </p>

            {/* Error & Lockout Banners */}
            {lockoutTimer > 0 ? (
              <div className="mt-5 w-full rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-700 text-amber-800 text-left flex items-start gap-2.5 shadow-sm">
                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Brute-Force Cooldown Active</p>
                  <p className="font-mono text-[11px] mt-0.5">Form locked for {lockoutTimer}s to prevent unauthorized attempts.</p>
                </div>
              </div>
            ) : error ? (
              <div className="mt-5 w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-600 text-rose-700 text-left flex items-start gap-2 shadow-sm">
                <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="mt-6 w-full space-y-4">
              {/* Admin Email Selector */}
              <div className="block text-left">
                <div className="flex items-center justify-between mb-1.5 pl-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin Email</span>
                  <button
                    type="button"
                    onClick={() => setCustomEmailMode((prev) => !prev)}
                    className="text-[11px] font-700 text-teal-600 hover:text-teal-800 underline"
                  >
                    {customEmailMode ? 'Use default' : 'Change email'}
                  </button>
                </div>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    readOnly={!customEmailMode}
                    className={`w-full rounded-2xl border border-slate-200 px-4 py-3.5 pl-12 pr-4 text-sm outline-none transition ${
                      customEmailMode
                        ? 'bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                        : 'bg-slate-50 text-slate-700 cursor-not-allowed'
                    }`}
                    placeholder="admin@prathomix.in"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="block text-left">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 pl-1">Admin Security Key</span>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    disabled={lockoutTimer > 0}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] disabled:opacity-50"
                    placeholder="Enter security key"
                    autoComplete="current-password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Authenticate Submit Button */}
              <button
                type="submit"
                disabled={loading || lockoutTimer > 0}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:from-teal-700 hover:to-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
                {loading ? 'Verifying Credentials...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Secure Authenticate'}
              </button>
            </form>

            {/* Footer Audit Metadata */}
            <div className="mt-6 pt-5 border-t border-slate-100 w-full flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" /> Zero-Trust Guard
              </span>
              <Link href="/" className="font-bold text-teal-700 hover:text-teal-800">
                Return to Site →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
