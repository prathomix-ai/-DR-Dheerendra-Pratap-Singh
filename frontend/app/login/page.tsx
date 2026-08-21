'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Eye, EyeOff, HeartPulse, Loader2, Mail, UserRound, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase, getSupabaseDisplayName } from '@/lib/supabase'
import { storeUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [nextPath, setNextPath] = useState('/dashboard')

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setNextPath(params.get('next') || '/dashboard')
    } catch {
      setNextPath('/dashboard')
    }
  }, [])
  const [mode, setMode] = useState<Mode>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connectionError, setConnectionError] = useState('')

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          router.push('/dashboard')
        }
      })
      .catch(() => {
        // Keep the login screen usable when auth session lookup is unavailable.
      })
  }, [nextPath, router])

  const persistLegacyProfile = async () => {
    try {
      const { data } = await supabase.auth.getUser()
      const user = data.user

      if (!user) {
        return
      }

      storeUser(
        {
          id: user.id,
          email: user.email || '',
          name: getSupabaseDisplayName(user),
          role: 'patient',
          language: 'en',
        },
        (await supabase.auth.getSession()).data.session?.access_token || ''
      )
    } catch {
      // Legacy profile caching is best-effort only.
    }
  }

  const reportAuthError = (error: any, fallbackMessage: string) => {
    const message = error?.message || fallbackMessage
    setConnectionError(message)
    toast.error(message)
  }

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setConnectionError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('SUPABASE AUTH ERROR FULL:', error)
        reportAuthError(error, 'Invalid credentials')
        return
      }

      await persistLegacyProfile()
      toast.success('Signed in successfully')
      router.push('/dashboard')
    } catch (error: any) {
      console.error('SUPABASE AUTH ERROR FULL:', error)
      reportAuthError(error, 'Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setConnectionError('')

    try {
      // Pass full_name and role for custom profile mapping
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            name: fullName,
            role: 'patient', // Default role for signup
          },
        },
      })

      if (error) {
        // Expose raw error visually
        console.error('SUPABASE AUTH ERROR FULL:', error)
        setConnectionError(error.message || 'Signup failed')
        toast.error(error.message || 'Signup failed')
        return
      }

      if (data.session) {
        await persistLegacyProfile()
        toast.success('Account created')
        router.push('/dashboard')
        return
      }

      toast.success('Account created. Check your email to confirm the account.')
      setMode('login')
    } catch (error: any) {
      // Expose raw error visually
      console.error('SUPABASE AUTH ERROR FULL:', error)
      setConnectionError(error.message || 'Connection error. Please try again.')
      toast.error(error.message || 'Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!email) {
      return toast.error('Please enter your email in the field first.')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password reset email sent! Check your inbox.')
    }
  }

  return (
    <div className="mesh-bg min-h-screen px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-slate-900 p-10 text-white lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_35%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                    <HeartPulse size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-100/80">Prathomix</div>
                    <div className="text-2xl font-black tracking-tight">AI Physiotherapy</div>
                  </div>
                </div>
                <h1 className="mt-10 max-w-md text-4xl font-black leading-tight tracking-tight">
                  Secure access for patients, caregivers, and clinic staff.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-teal-50/80">
                  Sign in to view your recovery plan, appointments, prescriptions, and guided exercises with real Supabase authentication.
                </p>
              </div>

              <div className="space-y-3 text-sm text-teal-50/80">
                {[
                  'Real session-based auth with Supabase cookies',
                  'Route protection for private patient pages',
                  'No hardcoded demo passwords or mock sign-out states',
                ].map((line) => (
                  <div key={line} className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <CheckCircle2 size={14} className="text-teal-200" />
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{mode === 'login' ? 'Welcome back' : 'Create account'}</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">
                  {mode === 'login' ? 'Sign in to your account' : 'Start your care journey'}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <UserRound size={20} />
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setConnectionError('')
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setConnectionError('')
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500'}`}
              >
                Signup
              </button>
            </div>

            {connectionError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {connectionError}
              </div>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
              {mode === 'signup' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition-colors focus:border-teal-300"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition-colors focus:border-teal-300"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pl-10 pr-12 text-sm outline-none transition-colors focus:border-teal-300"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button type="button" onClick={handleResetPassword} className="text-sm text-teal-600 hover:text-emerald-500 font-bold transition-colors text-right w-full mt-2">
                  Forgot Password?
                </button>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs leading-6 text-slate-500">
              By continuing you agree to the clinic&apos;s policy pages and safety guidance.
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <Link href="/" className="font-semibold text-teal-700 hover:text-teal-800">Home</Link>
              <Link href="/about" className="font-semibold text-slate-600 hover:text-slate-900">About</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}