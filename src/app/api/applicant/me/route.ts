import { NextRequest, NextResponse } from 'next/server'
import { getApplicantFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const applicant = await getApplicantFromRequest(req)
  if (!applicant) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ id: applicant.id, name: applicant.name, email: applicant.email })
}
