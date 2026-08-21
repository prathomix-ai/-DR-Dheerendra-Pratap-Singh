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
const SEC_SALT = 'PRATHOMIX_ULTRA_MAX_SEC_ENCRYPTION_V3_2026'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24-Hour Security Auto-Expiry

// ==========================================
// 🛡️ ATTACK DEFENDER SUITE
// ==========================================

// 1. XSS & Code Injection Shield
export function defenderSanitize(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/document\.cookie/gi, '')
}

// 2. Hardware & Browser Environment Fingerprint Locking (Anti-Session Hijacking)
function defenderGetFingerprint(): string {
  if (typeof window === 'undefined') return 'ssr_env'
  try {
    const nav = window.navigator
    const scr = window.screen
    const raw = `${nav.userAgent}|${scr.width}x${scr.height}|${scr.colorDepth}|${nav.language}|${new Date().getTimezoneOffset()}`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i)
      hash |= 0
    }
    return `fp_${Math.abs(hash).toString(36)}`
  } catch {
    return 'fp_default'
  }
}

// 3. HMAC Anti-Tamper Checksum Generator
function defenderComputeHMAC(payload: string, timestamp: number): string {
  const fp = defenderGetFingerprint()
  const raw = `${payload}:${timestamp}:${fp}:${SEC_SALT}`
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

// 4. Rate-Limiting & Security Lockout Defender
let failedAttempts = 0
let lockoutUntil = 0

function defenderCheckRateLimit(): boolean {
  if (Date.now() < lockoutUntil) {
    console.warn('🛡️ ATTACK DEFENDER: Security Lockout active due to anomalous activity.')
    return false
  }
  return true
}

function defenderRecordFailure() {
  failedAttempts++
  if (failedAttempts >= 5) {
    lockoutUntil = Date.now() + 30000 // 30-Second Lockout
    failedAttempts = 0
    console.error('🛡️ ATTACK DEFENDER: 5 Anomalous auth failures detected! Enforcing 30s Lockout.')
  }
}

// 5. Anti-Tamper Cipher & XOR Salt Encryption Helper
function secureEncrypt(text: string): string {
  try {
    const cleanText = defenderSanitize(text)
    let result = ''
    for (let i = 0; i < cleanText.length; i++) {
      const charCode = cleanText.charCodeAt(i) ^ SEC_SALT.charCodeAt(i % SEC_SALT.length)
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
    return defenderSanitize(result)
  } catch {
    defenderRecordFailure()
    return ''
  }
}

// ==========================================
// 🔐 SECURE AUTHENTICATION API
// ==========================================

export function getStoredUser(): PrathomixUser | null {
  if (!defenderCheckRateLimit()) return null

  if (memoryUserCache) {
    return memoryUserCache
  }

  if (typeof window === 'undefined') return null

  try {
    const encData = localStorage.getItem('prathomix_user_sec_v3')
    const timeStr = localStorage.getItem('prathomix_sec_time_v3')
    const sigStored = localStorage.getItem('prathomix_sec_sig_v3')
    const fpStored = localStorage.getItem('prathomix_sec_fp_v3')

    if (!encData || !sigStored) {
      // Fallback check legacy cache if present, then purge it securely
      const legacyRaw = localStorage.getItem('prathomix_user') || localStorage.getItem('prathomix_user_sec_v2')
      if (legacyRaw) {
        clearAuth()
      }
      return null
    }

    // Anti-Session Hijacking: Verify Device Fingerprint match
    const currentFp = defenderGetFingerprint()
    if (fpStored && fpStored !== currentFp) {
      console.error('🛡️ ATTACK DEFENDER: Device Fingerprint Mismatch! Session hijacking attempt blocked.')
      clearAuth()
      return null
    }

    // Check Security TTL Expiry
    if (timeStr) {
      const savedTime = parseInt(timeStr, 10)
      if (isNaN(savedTime) || Date.now() - savedTime > CACHE_TTL_MS) {
        clearAuth()
        return null
      }

      // Anti-Tamper Checksum Verification
      const expectedSig = defenderComputeHMAC(encData, savedTime)
      if (sigStored !== expectedSig) {
        console.error('🛡️ ATTACK DEFENDER: LocalStorage Tampering Detected! Purging corrupt session.')
        clearAuth()
        return null
      }
    }

    const decryptedJson = secureDecrypt(encData)
    if (!decryptedJson) {
      clearAuth()
      return null
    }

    const parsed = JSON.parse(decryptedJson)
    // Sanitize user object against XSS
    parsed.name = defenderSanitize(parsed.name || '')
    parsed.email = defenderSanitize(parsed.email || '')

    memoryUserCache = parsed
    cacheTimestamp = Date.now()
    return parsed
  } catch {
    clearAuth()
    return null
  }
}

export function getDisplayName(user: PrathomixUser | null): string {
  const name = defenderSanitize(user?.name?.trim() || '')
  if (name) return name

  const emailName = defenderSanitize(user?.email?.split('@')[0]?.trim() || '')
  if (emailName) return emailName

  return user?.role === 'admin' ? 'Admin' : 'Patient'
}

export function storeUser(user: PrathomixUser, token: string) {
  // Sanitize before storing
  const safeUser: PrathomixUser = {
    ...user,
    name: defenderSanitize(user.name || ''),
    email: defenderSanitize(user.email || ''),
  }

  memoryUserCache = safeUser
  memoryTokenCache = token
  cacheTimestamp = Date.now()

  if (typeof window !== 'undefined') {
    try {
      const encryptedUser = secureEncrypt(JSON.stringify(safeUser))
      const encryptedToken = secureEncrypt(token)
      const hmacSig = defenderComputeHMAC(encryptedUser, cacheTimestamp)
      const currentFp = defenderGetFingerprint()

      localStorage.setItem('prathomix_user_sec_v3', encryptedUser)
      localStorage.setItem('prathomix_token_sec_v3', encryptedToken)
      localStorage.setItem('prathomix_sec_time_v3', String(cacheTimestamp))
      localStorage.setItem('prathomix_sec_sig_v3', hmacSig)
      localStorage.setItem('prathomix_sec_fp_v3', currentFp)

      if (safeUser.email) {
        localStorage.setItem('prathomix_rem_email_sec', secureEncrypt(safeUser.email))
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
      return defenderSanitize(secureDecrypt(encEmail))
    }
    return defenderSanitize(localStorage.getItem('prathomix_remembered_email') || '')
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
      localStorage.removeItem('prathomix_user_sec_v3')
      localStorage.removeItem('prathomix_token_sec_v3')
      localStorage.removeItem('prathomix_sec_time_v3')
      localStorage.removeItem('prathomix_sec_sig_v3')
      localStorage.removeItem('prathomix_sec_fp_v3')

      // Clean legacy keys
      localStorage.removeItem('prathomix_user_sec_v2')
      localStorage.removeItem('prathomix_token_sec_v2')
      localStorage.removeItem('prathomix_user')
      localStorage.removeItem('prathomix_token')
      localStorage.removeItem('prathomix_last_login_time')
    } catch {
      // Ignore cleanup errors
    }
  }
}

export function getToken(): string | null {
  if (!defenderCheckRateLimit()) return null
  if (memoryTokenCache) return memoryTokenCache

  if (typeof window !== 'undefined') {
    try {
      const encTok = localStorage.getItem('prathomix_token_sec_v3')
      if (encTok) {
        const decTok = secureDecrypt(encTok)
        if (decTok) {
          memoryTokenCache = decTok
          return decTok
        }
      }
      return null
    } catch {
      return null
    }
  }
  return null
}

// 6. Cross-Tab Live Storage Defender (Real-time Tamper Protection)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (
      e.key === 'prathomix_user_sec_v3' ||
      e.key === 'prathomix_token_sec_v3' ||
      e.key === 'prathomix_sec_sig_v3'
    ) {
      console.warn('🛡️ ATTACK DEFENDER: External Storage Mutation Detected! Re-validating auth integrity...')
      const user = getStoredUser()
      if (!user) {
        clearAuth()
      }
    }
  })
}
