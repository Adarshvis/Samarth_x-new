import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query<{
      id: number
      email: string
      full_name: string
      is_verified: boolean
      created_at: string
    }>('SELECT id, email, full_name, is_verified, created_at FROM applicants ORDER BY created_at DESC LIMIT 10')

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      applicants: result.rows.map(r => ({
        id: r.id,
        email: r.email,
        name: r.full_name,
        verified: r.is_verified,
        created: r.created_at,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
