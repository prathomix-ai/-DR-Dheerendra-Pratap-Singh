export { supabase, isSupabaseConfigured } from './supabase'
export interface PrathomixUser { id:string; email:string; name:string; role:'patient'|'caregiver'|'admin'; language:string }
export function getStoredUser(): PrathomixUser|null {
  if (typeof window === 'undefined') return null
  try { const u = localStorage.getItem('prathomix_user'); return u ? JSON.parse(u) : null } catch { return null }
}

export function getDisplayName(user: PrathomixUser|null): string {
  const name = user?.name?.trim()
  if (name) return name

  const emailName = user?.email?.split('@')[0]?.trim()
  if (emailName) return emailName

  return user?.role === 'admin' ? 'Admin' : 'Patient'
}

export function storeUser(user: PrathomixUser, token: string) {
  localStorage.setItem('prathomix_user', JSON.stringify(user))
  localStorage.setItem('prathomix_token', token)
}
export function clearAuth() {
  localStorage.removeItem('prathomix_user'); localStorage.removeItem('prathomix_token')
}
export function getToken() { return typeof window!=='undefined' ? localStorage.getItem('prathomix_token') : null }
