export { supabase, isSupabaseConfigured } from './supabase'

export interface PrathomixUser {
  id: string
  email: string
  name: string
  role: 'patient' | 'caregiver' | 'admin'
  language: string
  user_metadata?: Record<string, any>
  phone?: string
}

// In-Memory Cache Tier (0ms instant access)
let memoryUserCache: PrathomixUser | null = null
let memoryTokenCache: string | null = null
let cacheTimestamp: number | null = null

export function getStoredUser(): PrathomixUser | null {
  if (memoryUserCache) {
    return memoryUserCache
  }

  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem('prathomix_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    memoryUserCache = parsed
    cacheTimestamp = Date.now()
    return parsed
  } catch {
    return null
  }
}

export function getDisplayName(user: PrathomixUser | null): string {
  const name = user?.name?.trim()
  if (name) return name

  const emailName = user?.email?.split('@')[0]?.trim()
  if (emailName) return emailName

  return user?.role === 'admin' ? 'Admin' : 'Patient'
}

export function storeUser(user: PrathomixUser, token: string) {
  memoryUserCache = user
  memoryTokenCache = token
  cacheTimestamp = Date.now()

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('prathomix_user', JSON.stringify(user))
      localStorage.setItem('prathomix_token', token)
      localStorage.setItem('prathomix_last_login_time', String(cacheTimestamp))
      if (user.email) {
        localStorage.setItem('prathomix_remembered_email', user.email)
      }
    } catch (e) {
      console.warn('LocalStorage save warning:', e)
    }
  }
}

export function getRememberedEmail(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem('prathomix_remembered_email') || ''
  } catch {
    return ''
  }
}

export function clearAuth() {
  memoryUserCache = null
  memoryTokenCache = null
  cacheTimestamp = null

  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('prathomix_user')
      localStorage.removeItem('prathomix_token')
      localStorage.removeItem('prathomix_last_login_time')
    } catch {
      // Ignore cleanup errors
    }
  }
}

export function getToken(): string | null {
  if (memoryTokenCache) return memoryTokenCache
  if (typeof window !== 'undefined') {
    try {
      const tok = localStorage.getItem('prathomix_token')
      if (tok) memoryTokenCache = tok
      return tok
    } catch {
      return null
    }
  }
  return null
}
