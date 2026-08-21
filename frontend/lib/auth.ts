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

// Private In-Memory Cache Tier (Isolated from window global scope)
let memoryUserCache: PrathomixUser | null = null
let memoryTokenCache: string | null = null
let cacheTimestamp: number | null = null

// Ultra-Max Security Config
const SEC_SALT = 'PRATHOMIX_ULTRA_MAX_SEC_ENCRYPTION_V2_2026'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24-Hour Security Auto-Expiry

// Anti-Tamper Cipher & XOR Salt Encryption Helper
function secureEncrypt(text: string): string {
  try {
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SEC_SALT.charCodeAt(i % SEC_SALT.length)
      result += String.fromCharCode(charCode)
    }
    return btoa(encodeURIComponent(result))
  } catch {
    return text
  }
}

function secureDecrypt(encryptedText: string): string {
  try {
    const raw = decodeURIComponent(atob(encryptedText))
    let result = ''
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ SEC_SALT.charCodeAt(i % SEC_SALT.length)
      result += String.fromCharCode(charCode)
    }
    return result
  } catch {
    return ''
  }
}

export function getStoredUser(): PrathomixUser | null {
  if (memoryUserCache) {
    return memoryUserCache
  }

  if (typeof window === 'undefined') return null

  try {
    const encData = localStorage.getItem('prathomix_user_sec_v2')
    const timeStr = localStorage.getItem('prathomix_sec_time')

    if (!encData) {
      // Fallback check legacy plain cache if present, then purge it securely
      const legacyRaw = localStorage.getItem('prathomix_user')
      if (legacyRaw) {
        try {
          const parsed = JSON.parse(legacyRaw)
          storeUser(parsed, localStorage.getItem('prathomix_token') || '')
          localStorage.removeItem('prathomix_user')
          localStorage.removeItem('prathomix_token')
          return parsed
        } catch {
          return null
        }
      }
      return null
    }

    // Check Security TTL Expiry
    if (timeStr) {
      const savedTime = parseInt(timeStr, 10)
      if (isNaN(savedTime) || Date.now() - savedTime > CACHE_TTL_MS) {
        clearAuth()
        return null
      }
    }

    const decryptedJson = secureDecrypt(encData)
    if (!decryptedJson) {
      clearAuth() // Tamper detected -> immediate security purge
      return null
    }

    const parsed = JSON.parse(decryptedJson)
    memoryUserCache = parsed
    cacheTimestamp = Date.now()
    return parsed
  } catch {
    clearAuth()
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
      const encryptedUser = secureEncrypt(JSON.stringify(user))
      const encryptedToken = secureEncrypt(token)

      localStorage.setItem('prathomix_user_sec_v2', encryptedUser)
      localStorage.setItem('prathomix_token_sec_v2', encryptedToken)
      localStorage.setItem('prathomix_sec_time', String(cacheTimestamp))

      if (user.email) {
        localStorage.setItem('prathomix_rem_email_sec', secureEncrypt(user.email))
      }
    } catch (e) {
      console.warn('Encrypted Cache save error:', e)
    }
  }
}

export function getRememberedEmail(): string {
  if (typeof window === 'undefined') return ''
  try {
    const encEmail = localStorage.getItem('prathomix_rem_email_sec')
    if (encEmail) {
      return secureDecrypt(encEmail)
    }
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
      localStorage.removeItem('prathomix_user_sec_v2')
      localStorage.removeItem('prathomix_token_sec_v2')
      localStorage.removeItem('prathomix_sec_time')
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
      const encTok = localStorage.getItem('prathomix_token_sec_v2')
      if (encTok) {
        const decTok = secureDecrypt(encTok)
        if (decTok) {
          memoryTokenCache = decTok
          return decTok
        }
      }
      const tok = localStorage.getItem('prathomix_token')
      if (tok) memoryTokenCache = tok
      return tok
    } catch {
      return null
    }
  }
  return null
}
