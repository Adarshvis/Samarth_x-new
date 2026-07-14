import type { CollectionAfterChangeHook, CollectionConfig } from 'payload'
import { adminAccess } from '../access/roles'

const autoDeleteWhenMarkedDeleted: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (operation !== 'update') return
  if (doc?.status !== 'deleted') return
  if (previousDoc?.status === 'deleted') return

  try {
    const resumeValue = doc?.resume as unknown
    let resumeId: number | string | null = null

    if (typeof resumeValue === 'number' || typeof resumeValue === 'string') {
      resumeId = resumeValue
    } else if (
      resumeValue &&
      typeof resumeValue === 'object' &&
      'id' in (resumeValue as Record<string, unknown>)
    ) {
      const maybeId = (resumeValue as { id?: number | string }).id
      if (typeof maybeId === 'number' || typeof maybeId === 'string') {
        resumeId = maybeId
      }
    }

    // Delete linked resume first so there is no orphan file on disk.
    if (resumeId !== null) {
      await req.payload.delete({
        collection: 'resumes',
        id: resumeId,
        overrideAccess: true,
      })
    }

    await req.payload.delete({
      collection: 'job-applications',
      id: doc.id,
      overrideAccess: true,
    })
  } catch (err) {
    req.payload.logger.error(`Failed auto-delete for job application ${String(doc?.id)}: ${String(err)}`)
  }
}

export const JobApplications: CollectionConfig = {
  slug: 'job-applications',
  labels: {
    singular: 'Job Application',
    plural: 'Job Applications',
  },
  admin: {
    useAsTitle: 'applicantName',
    group: 'Job Applications',
    defaultColumns: ['applicantName', 'email', 'jobTitle', 'status', 'createdAt'],
    description: 'Resume submissions from job applicants',
    hidden: true,
  },
  access: {
    // Anyone can submit an application
    create: () => true,
    // Only admins can view, update, delete
    read: adminAccess,
    update: adminAccess,
    delete: adminAccess,
  },
  hooks: {
    afterChange: [autoDeleteWhenMarkedDeleted],
  },
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      label: 'Applicant Name',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Position Applied For',
      required: true,
      admin: {
        description: 'The position the candidate indicated they are applying for',
      },
    },
    {
      name: 'currentAddress',
      type: 'text',
      label: 'Current Address',
    },
    {
      name: 'permanentAddress',
      type: 'text',
      label: 'Permanent Address',
    },
    {
      name: 'highestQualification',
      type: 'text',
      label: 'Highest Qualification',
    },
    {
      name: 'workStatus',
      type: 'select',
      label: 'Work Status',
      options: [
        { label: 'Fresher', value: 'fresher' },
        { label: 'Experienced', value: 'experienced' },
      ],
    },
    {
      name: 'yearOfExperience',
      type: 'text',
      label: 'Year of Experience',
    },
    {
      name: 'resume',
      type: 'relationship',
      label: 'Resume / CV',
      relationTo: 'resumes',
      required: true,
    },
    {
      name: 'resumeURL',
      type: 'text',
      label: 'Resume URL',
      virtual: true, // This field is computed, not stored in DB
      admin: {
        hidden: true, // Hidden from admin UI, only used for exports
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ data, req }) => {
            if (!data?.resume) return null
            
            try {
              const resumeId = typeof data.resume === 'object' ? data.resume.id : data.resume
              const resume = await req.payload.findByID({
                collection: 'resumes',
                id: resumeId,
              })
              
              if (!resume?.url) return null
              
              // Prepend the base URL to make it an absolute URL
              const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || ''
              return `${baseUrl}${resume.url}`
            } catch (err) {
              req.payload.logger.error(`Failed to fetch resume URL for application ${data?.id}: ${String(err)}`)
              return null
            }
          },
        ],
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Application Status',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Reviewed', value: 'reviewed' },
        { label: 'Shortlisted', value: 'shortlisted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Delete', value: 'deleted' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      label: 'Submitted At',
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
