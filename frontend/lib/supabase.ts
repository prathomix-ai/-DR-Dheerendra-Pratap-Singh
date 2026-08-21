import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'


// Forcefully grab the exact URL, ignoring any old placeholders
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ionpkajucnujjxouxoit.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseAnonKey) {
  console.error("CRITICAL: Anon key is missing!")
}

declare global {
  // eslint-disable-next-line no-var
  var __prathomixSupabaseClient: ReturnType<typeof createClient> | undefined
}


export const supabase =
  globalThis.__prathomixSupabaseClient ??
  (globalThis.__prathomixSupabaseClient = createClient(supabaseUrl, supabaseAnonKey || ''))


export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey
)

export function getSupabaseDisplayName(user: User | null): string {
  const metadata = user?.user_metadata || {}
  const fullName = String(metadata.full_name || metadata.name || metadata.display_name || '').trim()

  if (fullName) {
    return fullName
  }

  const email = user?.email?.trim()
  if (email) {
    return email.split('@')[0]
  }

  return 'User'
}
