import { NextRequest, NextResponse } from 'next/server'

const SUPERSET_BASE_URL = (process.env.SUPERSET_BASE_URL || '').replace(/\/+$/, '')
const SUPERSET_USERNAME = process.env.SUPERSET_USERNAME || ''
const SUPERSET_PASSWORD = process.env.SUPERSET_PASSWORD || ''
const SUPERSET_PROVIDER = process.env.SUPERSET_PROVIDER || 'db'

interface TokenCache {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken
  }

  const res = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: SUPERSET_USERNAME,
      password: SUPERSET_PASSWORD,
      provider: SUPERSET_PROVIDER,
      refresh: true,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Superset login failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const accessToken = data.access_token as string

  tokenCache = { accessToken, expiresAt: Date.now() + 55 * 60 * 1000 }
  return accessToken
}

/**
 * POST /api/analytics
 *
 * Generates a Superset guest token for embedded dashboard rendering.
 * Superset credentials come from .env — the frontend only sends the embed UUID.
 *
 * Body: { embedUuid: string }
 */
export async function POST(req: NextRequest) {
  try {
    if (!SUPERSET_BASE_URL || !SUPERSET_USERNAME || !SUPERSET_PASSWORD) {
      return NextResponse.json(
        { error: 'Superset is not configured. Set SUPERSET_* env vars.' },
        { status: 500 },
      )
    }

    const body = await req.json()
    const { embedUuid } = body

    if (!embedUuid) {
      return NextResponse.json({ error: 'Embed UUID is required.' }, { status: 400 })
    }

    const accessToken = await getAccessToken()

    const guestTokenRes = await fetch(`${SUPERSET_BASE_URL}/api/v1/security/guest_token/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: { username: 'guest', first_name: 'Guest', last_name: 'User' },
        resources: [{ type: 'dashboard', id: embedUuid }],
        rls: [],
      }),
    })

    if (!guestTokenRes.ok) {
      const text = await guestTokenRes.text()
      throw new Error(`Guest token failed (${guestTokenRes.status}): ${text}`)
    }

    const guestData = await guestTokenRes.json()
    return NextResponse.json({ token: guestData.token })
  } catch (err: any) {
    console.error('Analytics API error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate guest token.' },
      { status: 500 },
    )
  }
}
