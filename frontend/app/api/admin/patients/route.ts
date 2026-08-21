import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

type AdminPatient = {
  id: string
  name: string
  email: string
  role: 'patient' | 'admin' | 'caregiver'
  phone: string | null
  created_at: string | null
  last_sign_in_at: string | null
}

function isAdminUser(user: any): boolean {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  if (role === 'admin') {
    return true
  }

  const allowed = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  const email = String(user?.email || '').toLowerCase()
  return allowed.includes(email)
}

function mapUserToPatient(user: any): AdminPatient {
  const metadata = user?.user_metadata || {}
  const name = String(metadata.full_name || metadata.name || user?.email?.split('@')?.[0] || 'Patient').trim()
  const role = String(metadata.role || user?.app_metadata?.role || 'patient').toLowerCase()

  return {
    id: String(user?.id || ''),
    name,
    email: String(user?.email || ''),
    role: role === 'admin' || role === 'caregiver' ? role : 'patient',
    phone: metadata.phone ? String(metadata.phone) : null,
    created_at: user?.created_at || null,
    last_sign_in_at: user?.last_sign_in_at || null,
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for admin patients route.' },
        { status: 500 },
      )
    }

    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (anonKey) {
      const cookieStore = cookies()
      const sessionClient = createServerClient(supabaseUrl, anonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No-op for route handlers.
          },
        },
      })

      const {
        data: { user },
        error: userError,
      } = await sessionClient.auth.getUser()

      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (!isAdminUser(user)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const allUsers: any[] = []
    const perPage = 200
    let page = 1

    while (true) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const users = data?.users || []
      allUsers.push(...users)

      if (users.length < perPage) {
        break
      }

      page += 1
    }

    const patients = allUsers
      .map(mapUserToPatient)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

    return NextResponse.json({
      patients,
      total: patients.length,
      source: 'supabase.auth.users',
      defaultRole: 'patient',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch admin patients' },
      { status: 500 },
    )
  }
}
