import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { sendResetEmail } from '@/lib/mailer'
import { randomBytes } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const result = await query<{ id: number; is_verified: boolean }>(
      'SELECT id, is_verified FROM applicants WHERE email = $1',
      [email.toLowerCase()],
    )

    // Always return success to prevent email enumeration
    if (result.rows.length === 0 || !result.rows[0].is_verified) {
      return NextResponse.json({ success: true })
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await query(
      'UPDATE applicants SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
      [token, expiry.toISOString(), result.rows[0].id],
    )

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3999'
    const resetUrl = `${appUrl}/applicant/reset-password?token=${token}`

    await sendResetEmail(email, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
