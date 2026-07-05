import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith('/auth')
  const isDashboard = pathname.startsWith('/dashboard')
  const isCheckout = pathname.startsWith('/checkout')
  const isCreator = pathname.startsWith('/creator')

  if ((isDashboard || isCheckout || isCreator) && !token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && token) {
    const next = request.nextUrl.searchParams.get('next')
    const destination = next?.startsWith('/') ? next : '/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/checkout/:path*', '/creator/:path*'],
}
