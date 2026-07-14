import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const result = await query<{
      id: number
      full_name: string
      email: string
      password_hash: string
      is_verified: boolean
    }>('SELECT id, full_name, email, password_hash, is_verified FROM applicants WHERE email = $1', [
      email.toLowerCase(),
    ])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const applicant = result.rows[0]

    if (!applicant.is_verified) {
      return NextResponse.json(
        { error: 'Please verify your email first.' },
        { status: 403 },
      )
    }

    const passwordMatch = await bcrypt.compare(password, applicant.password_hash)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    const token = await signToken({
      id: applicant.id,
      email: applicant.email,
      name: applicant.full_name,
    })

    const res = NextResponse.json({ success: true, name: applicant.full_name })
    setAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
