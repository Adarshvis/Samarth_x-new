import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('applicant_token')?.value

  if (!token) {
    const loginUrl = new URL('/applicant/login', req.url)
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const applicant = await verifyToken(token)
  if (!applicant) {
    const loginUrl = new URL('/applicant/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/applicant/dashboard/:path*'],
}
