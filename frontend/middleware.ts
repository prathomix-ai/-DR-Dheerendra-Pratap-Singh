import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const ADMIN_EMAIL = 'prathamsinghujjain@gmail.com'
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || ADMIN_EMAIL)
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean)

function isAdminUser(user: any): boolean {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  const email = String(user?.email || '').toLowerCase()

  return role === 'admin' || email === ADMIN_EMAIL || ADMIN_EMAILS.includes(email)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminLogin = pathname === '/admin/login'

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const response = NextResponse.next({ request: { headers: request.headers } })

  // Global Security Firewall Headers Injection
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (isAdminLogin) {
      return response
    }

    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isAdminLogin) {
    if (user && isAdminUser(user)) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return response
  }

  if (!user || !isAdminUser(user)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}