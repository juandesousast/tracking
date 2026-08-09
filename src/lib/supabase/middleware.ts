import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const reqUrl = request.nextUrl.clone()

  const isPublicRoute = reqUrl.pathname === '/login'

  // Protect private routes: redirect to '/login' if not logged in
  if (!user && !isPublicRoute) {
    reqUrl.pathname = '/login'
    return NextResponse.redirect(reqUrl)
  }

  // Redirect to '/' if logged in and navigating to '/login'
  if (user && reqUrl.pathname === '/login') {
    reqUrl.pathname = '/'
    return NextResponse.redirect(reqUrl)
  }

  return supabaseResponse
}
