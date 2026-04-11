import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users from dashboard
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Practice setup redirect: if on a dashboard page (not /dashboard/setup),
  // and practice_setup_completed is false, redirect to setup
  const isSetupExempt =
    pathname.startsWith('/dashboard/setup') ||
    pathname.startsWith('/auth/') ||
    pathname === '/signout'

  if (user && pathname.startsWith('/dashboard') && !isSetupExempt) {
    const { data: userData } = await supabase
      .from('users')
      .select('practice_setup_completed')
      .eq('id', user.id)
      .single()

    if (userData && userData.practice_setup_completed === false) {
      return NextResponse.redirect(new URL('/dashboard/setup', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}
