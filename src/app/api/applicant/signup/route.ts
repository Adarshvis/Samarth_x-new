import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { sendOtpEmail } from '@/lib/mailer'

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, password, confirmPassword, mobile, captchaAnswer, captchaExpected } =
      body

    // Basic validation
    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }
    if (String(captchaAnswer) !== String(captchaExpected)) {
      return NextResponse.json({ error: 'Incorrect CAPTCHA answer.' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await query<{ id: number; is_verified: boolean }>(
      'SELECT id, is_verified FROM applicants WHERE email = $1',
      [email.toLowerCase()],
    )

    if (existing.rows.length > 0) {
      if (existing.rows[0].is_verified) {
        return NextResponse.json(
          { error: 'This email is already registered. Please login.' },
          { status: 409 },
        )
      }
      // Unverified: resend OTP
      const otp = generateOtp()
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
      await query('UPDATE applicants SET otp = $1, otp_expires_at = $2 WHERE email = $3', [
        otp,
        otpExpiry.toISOString(),
        email.toLowerCase(),
      ])
      await sendOtpEmail(email, otp)
      return NextResponse.json({ success: true, message: 'OTP resent.' })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Generate OTP
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Insert applicant
    await query(
      `INSERT INTO applicants (full_name, email, password_hash, mobile, is_verified, otp, otp_expires_at)
       VALUES ($1, $2, $3, $4, false, $5, $6)`,
      [fullName.trim(), email.toLowerCase(), passwordHash, mobile?.trim() || null, otp, otpExpiry.toISOString()],
    )

    // Send OTP
    await sendOtpEmail(email, otp)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
