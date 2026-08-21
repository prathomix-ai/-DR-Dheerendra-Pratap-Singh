import { createClient } from '@supabase/supabase-js'
import AdminCommandCentre from '@/components/AdminCommandCentre'

export const dynamic = 'force-dynamic'

async function getPatients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ionpkajucnujjxouxoit.supabase.co'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.warn("WARNING: Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Unable to fetch patients securely on server-side.")
    return []
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })

  // Fetch patients directly from the new public.patients table
  try {
    const { data: patients, error } = await supabaseAdmin
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (patients || []).map((row: any, index: number) => ({
      id: String(row.id || ''),
      email: String(row.email || ''),
      name: String(row.full_name || row.name || row.email?.split('@')?.[0] || 'Patient').trim(),
      phone: String(row.phone || ''),
      condition: String(row.condition || 'General rehab follow-up'),
      status: String(row.status || 'active').toLowerCase(),
      completion: Number(row.completion || 0),
      accuracy: Number(row.accuracy || 0),
      lastSession: String(row.created_at || ''),
    }))
  } catch (err) {
    console.error('Failed to retrieve patients from the patients table:', err)
    return []
  }
}

export default async function AdminPatientsPage() {
  const initialPatients = await getPatients()
  return <AdminCommandCentre isSubpage={true} initialPatients={initialPatients} />
}



