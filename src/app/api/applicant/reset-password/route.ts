import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, password, confirmPassword } = body

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 },
      )
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 })
    }

    const result = await query<{ id: number; reset_token_expires_at: string }>(
      'SELECT id, reset_token_expires_at FROM applicants WHERE reset_token = $1',
      [token],
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 })
    }

    const applicant = result.rows[0]
    if (new Date(applicant.reset_token_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Reset link has expired. Please request a new one.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await query(
      'UPDATE applicants SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
      [passwordHash, applicant.id],
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
