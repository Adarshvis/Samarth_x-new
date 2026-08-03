import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

function getSecret(): Uint8Array {
  const value = process.env.JWT_SECRET
  if (!value) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(value)
}

const COOKIE_NAME = 'applicant_token'
const EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

export interface ApplicantPayload {
  id: number
  email: string
  name: string
}

export async function signToken(payload: ApplicantPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRY_SECONDS}s`)
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<ApplicantPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as ApplicantPayload
  } catch {
    return null
  }
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: EXPIRY_SECONDS,
    path: '/',
  })
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  })
}

/** Use inside server components / route handlers to get the current applicant */
export async function getApplicantFromCookies(): Promise<ApplicantPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

/** Use inside middleware / route handlers where you have the raw request */
export async function getApplicantFromRequest(req: NextRequest): Promise<ApplicantPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}
