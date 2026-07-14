import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const getValue = (keys: string[]): string => {
      for (const key of keys) {
        const value = formData.get(key)
        if (typeof value === 'string' && value.trim()) return value.trim()
      }
      return ''
    }

    const applicantName = getValue(['applicantName', 'fullName', 'name'])
    const email = getValue(['email'])
    const phone = getValue(['phone', 'phoneNumber', 'mobile', 'mobileNumber'])
    const jobTitle = getValue(['jobTitle', 'applyingFor', 'positionApplyingFor', 'position', 'role'])
    const currentAddress = getValue(['currentAddress', 'current_address', 'current-address'])
    const permanentAddress = getValue(['permanentAddress', 'permanent_address', 'permanent-address'])
    const highestQualification = getValue(['highestQualification', 'highest_qualification', 'qualification'])
    const workStatus = getValue(['workStatus', 'work_status', 'work-status'])
    const yearOfExperience = getValue(['yearOfExperience', 'year_of_experience', 'yearsOfExperience'])
    const file = formData.get('resume') as File | null

    // Basic validation
    if (!applicantName || !email || !jobTitle || !file) {
      return NextResponse.json(
        { error: 'Name, email, position, and resume are required.' },
        { status: 400 },
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5 MB.' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Convert File to Buffer for Payload upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload the resume file to the Resumes collection
    const resumeDoc = await payload.create({
      collection: 'resumes' as any,
      data: {
        applicantName,
        alt: `Resume - ${applicantName}`,
      },
      file: {
        data: buffer,
        mimetype: 'application/pdf',
        name: `${applicantName.replace(/\s+/g, '_')}_resume.pdf`,
        size: file.size,
      },
      overrideAccess: true,
    })

    // Create the job application record with all fields
    await payload.create({
      collection: 'job-applications' as any,
      data: {
        applicantName,
        email,
        phone: phone || undefined,
        jobTitle,
        currentAddress: currentAddress || undefined,
        permanentAddress: permanentAddress || undefined,
        highestQualification: highestQualification || undefined,
        workStatus: workStatus ? workStatus.toLowerCase() : undefined,
        yearOfExperience: yearOfExperience || undefined,
        resume: resumeDoc.id,
        status: 'new',
        submittedAt: new Date().toISOString(),
      },
      overrideAccess: true,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Apply API error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
