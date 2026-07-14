import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, otp } = body

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required.' }, { status: 400 })
    }

    const result = await query<{
      id: number
      full_name: string
      email: string
      otp: string
      otp_expires_at: string
      is_verified: boolean
    }>('SELECT id, full_name, email, otp, otp_expires_at, is_verified FROM applicants WHERE email = $1', [
      email.toLowerCase(),
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 })
    }

    const applicant = result.rows[0]

    if (applicant.is_verified) {
      return NextResponse.json({ error: 'Account already verified. Please login.' }, { status: 400 })
    }

    if (!applicant.otp || applicant.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP.' }, { status: 400 })
    }

    if (!applicant.otp_expires_at || new Date(applicant.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please sign up again.' }, { status: 400 })
    }

    // Mark verified, clear OTP
    await query(
      'UPDATE applicants SET is_verified = true, otp = NULL, otp_expires_at = NULL WHERE id = $1',
      [applicant.id],
    )

    // Issue JWT
    const token = await signToken({
      id: applicant.id,
      email: applicant.email,
      name: applicant.full_name,
    })

    const res = NextResponse.json({ success: true })
    setAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
