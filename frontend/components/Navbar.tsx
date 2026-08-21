'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Menu, X, Globe, User, Bell, ChevronDown, Zap, LogOut, Settings2, Home, Brain, Calendar, LayoutDashboard } from 'lucide-react'
import { LANGUAGES, type Language } from '@/lib/i18n'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { clearAuth } from '@/lib/auth'
import { getSupabaseDisplayName, supabase } from '@/lib/supabase'

interface Props { lang: Language; setLang: (l: Language) => void }
const NAV = [
  { href: '/',              label: 'Home' },
  { href: '/ai-triage',     label: 'AI Triage' },
  { href: '/appointments',  label: 'Appointments' },
  { href: '/dashboard',     label: 'Dashboard' },
  { href: '/profile',       label: 'Profile' },
  { href: '/about',         label: 'About' },
]

export default function Navbar({ lang, setLang }: Props) {
  const path = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [sessionUser, setSessionUser] = useState<SupabaseUser | null>(null)
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Dr. Note Updated', desc: 'Dr. Dheerendra Pratap Singh updated your treatment plan.', time: '10m ago', unread: true },
    { id: '2', title: 'Video Consult Ready', desc: 'Google Meet link available for your video session.', time: '1h ago', unread: true },
    { id: '3', title: 'Pain Map Flagged', desc: 'New pain region marked on your 3D body map.', time: '3h ago', unread: false },
  ])
  const userMenuRef = useRef<HTMLDivElement | null>(null)
  const userName = sessionUser ? getSupabaseDisplayName(sessionUser) : 'Guest'
  const userInitials = userName
    .split(' ')
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    // Check dark mode preference on load
    if (typeof window !== 'undefined' && localStorage.getItem('prathomix_dark_mode') === 'true') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
    }
  }, [])

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSessionUser(data.session?.user ?? null)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null)
    })

    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      active = false
      listener.subscription.unsubscribe()
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      // Always clear local state even if the backend is unavailable.
    } finally {
      clearAuth()
      setUserMenuOpen(false)
      setSessionUser(null)
      router.replace('/login')
    }
  }

  const cur = LANGUAGES.find(l => l.code === lang)

  const getMobileIcon = (href: string) => {
    switch (href) {
      case '/': return Home
      case '/ai-triage': return Brain
      case '/appointments': return Calendar
      case '/dashboard': return LayoutDashboard
      case '/profile': return User
      default: return Activity
    }
  }

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 navbar-glass px-3.5 py-2.5 flex items-center justify-between shadow-sm">
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
            <Activity size={15} />
          </div>
          <span className="font-display font-800 text-sm text-slate-900 tracking-tight">Dr. Dheerendra PhysioCare</span>
        </Link>
        {/* Right Side: Language & Profile Option */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLangOpen(prev => !prev)}
            className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-600 text-slate-700 shadow-sm"
          >
            <Globe size={13} className="text-teal-600" />
            <span>{cur?.flag}</span>
          </button>

          {/* Profile Option on Top-Right */}
          <Link
            href="/profile"
            className="flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/90 p-1 pr-2.5 text-xs font-700 text-teal-800 shadow-sm active:scale-95 transition-transform"
            aria-label="Profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {sessionUser ? userInitials : <User size={14} />}
            </div>
            <span className="font-display font-700 text-teal-900">{sessionUser ? userName.split(' ')[0] : 'Profile'}</span>
          </Link>
        </div>
      </div>

      <motion.nav initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-all duration-300 navbar-glass ${scrolled ? 'py-2' : 'py-3'}`}
        data-tour="navbar">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-teal">
                <Activity size={20} className="text-white" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>
            <div>
              <span className="font-display font-800 text-base text-slate-900 tracking-tight">Dr. Dheerendra</span>
              <div className="text-[10px] font-mono text-teal-600 font-600 -mt-0.5 tracking-wider uppercase leading-none">PhysioCare</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV.map(({ href, label }) => {
              const active = path === href
              return (
                <Link key={href} href={href}
                  className={`relative px-3 py-2 rounded-xl text-sm font-600 transition-all duration-200 ${active ? 'text-teal-700 bg-teal-50/80' : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/60'}`}>
                  {label}
                  {active && <motion.div layoutId="nav-ind" className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-teal-600 rounded-full" />}
                </Link>
              )
            })}
          </div>

            <div className="hidden lg:flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  setLangOpen(prev => !prev)
                }}
                className="flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3.5 py-2 text-sm font-600 text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all hover:bg-white/75 hover:shadow-[0_10px_40px_rgba(15,23,42,0.08)]">
                <Globe size={14} className="text-teal-600" />{cur?.flag} {cur?.label}
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl ring-1 ring-white/40 z-50">
                    {LANGUAGES.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className={`w-full flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-sm font-600 transition-[background-color,color,transform] duration-100 active:scale-[0.98] ${lang === l.code ? 'bg-teal-50/90 text-teal-700' : 'text-slate-700 hover:bg-teal-50/70 hover:text-teal-700'}`}>
                        <span className="text-base">{l.flag}</span>{l.label}
                        {lang === l.code && <Zap size={12} className="ml-auto text-teal-600" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => {
                setLangOpen(false)
                setUserMenuOpen(false)
                setNotifOpen(prev => !prev)
              }}
              className="relative p-2 rounded-xl glass text-slate-500 hover:text-teal-600 active:scale-95 transition-transform"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              )}
            </button>

            {!sessionUser ? (
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-700 text-white transition-colors hover:bg-teal-700"
              >
                Sign In
              </Link>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLangOpen(false)
                    setUserMenuOpen(prev => !prev)
                  }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass cursor-pointer text-left transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/5"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 via-teal-500 to-cyan-700 flex items-center justify-center text-[11px] font-700 text-white shadow-sm ring-1 ring-white/60">
                    {userInitials}
                  </div>
                  <span className="text-sm font-600 text-slate-700 truncate max-w-28">{userName}</span>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.1, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl ring-1 ring-white/40 z-50"
                      role="menu"
                      aria-label="User menu"
                    >
                      <div className="px-3 py-2">
                        <p className="text-[10px] font-700 uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
                        <p className="mt-1 text-sm font-700 text-slate-800 break-all">{userName}</p>
                      </div>

                      <div className="my-1 h-px bg-white/70" />

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-600 text-slate-700 transition-[background-color,color,transform] duration-100 hover:bg-teal-50/80 hover:text-teal-700 active:scale-[0.98]"
                        role="menuitem"
                      >
                        <User size={15} className="text-slate-500" />
                        Profile
                      </Link>

                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-600 text-slate-700 transition-[background-color,color,transform] duration-100 hover:bg-teal-50/80 hover:text-teal-700 active:scale-[0.98]"
                        role="menuitem"
                      >
                        <Settings2 size={15} className="text-slate-500" />
                        Settings
                      </Link>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-600 text-slate-700 transition-[background-color,color,transform] duration-100 hover:bg-rose-50/80 hover:text-rose-600 active:scale-[0.98]"
                        role="menuitem"
                      >
                        <LogOut size={15} className="text-rose-500/80" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button onClick={() => {
            setLangOpen(false)
            setUserMenuOpen(false)
            setOpen(prev => !prev)
          }} className="lg:hidden p-2 rounded-xl glass text-slate-600 transition-transform duration-100 active:scale-95" type="button">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
              className="lg:hidden border-t border-white/40 bg-white/90 backdrop-blur-lg">
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                {NAV.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-600 transition-colors ${path === href ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-teal-50/60'}`}>
                    {label}
                  </Link>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${lang === l.code ? 'bg-teal-50 text-teal-700 font-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
                {!sessionUser && (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-3 text-sm font-700 text-white"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Floating Bottom Navigation Bar for Mobile */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-[2rem] shadow-[0_16px_50px_rgba(15,23,42,0.12)] flex items-center justify-around py-3 px-4 md:hidden z-50">
        {NAV.map(({ href, label }) => {
          const active = path === href
          const Icon = getMobileIcon(href)

          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
              <div className={`p-2.5 rounded-2xl transition-all duration-150 active:scale-95 ${active ? 'bg-teal-500/10 text-teal-600' : 'text-slate-400 hover:text-teal-600'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[9px] font-bold tracking-tight transition-colors ${active ? 'text-teal-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Slide-over Notification Drawer */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-5 flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-teal-600" />
                  <h3 className="font-display font-800 text-slate-900 dark:text-white text-base">Notifications</h3>
                  <span className="bg-teal-500/10 text-teal-600 font-mono text-xs px-2 py-0.5 rounded-full font-700">
                    {notifications.filter(n => n.unread).length} New
                  </span>
                </div>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      n.unread
                        ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/40'
                        : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-display font-700 text-sm text-slate-900 dark:text-slate-100">{n.title}</h4>
                      <span className="font-mono text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="font-body text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                  className="flex-1 btn-glass py-2 rounded-xl text-xs font-700 text-slate-700 dark:text-slate-200"
                >
                  Mark All Read
                </button>
                <Link
                  href="/dashboard"
                  onClick={() => setNotifOpen(false)}
                  className="flex-1 btn-teal py-2 rounded-xl text-xs font-700 text-center"
                >
                  View Dashboard
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
