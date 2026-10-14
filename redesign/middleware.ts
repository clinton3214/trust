import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authRole = request.cookies.get('tb_auth_role')?.value

  // Allow static files, Next.js internal files, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Handle /login route
  if (pathname === '/login') {
    if (authRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (authRole === 'user') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // All other routes require authentication
  if (!authRole) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin') && authRole !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
