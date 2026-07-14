import type { CollectionConfig } from 'payload'
import { adminAccess } from '../access/roles'

const resumesUploadDir = process.env.CMS_RESUMES_UPLOAD_DIR || 'resumes'

export const Resumes: CollectionConfig = {
  slug: 'resumes',
  labels: {
    singular: 'Resume',
    plural: 'Resumes',
  },
  admin: {
    group: 'Job Applications',
    description: 'Uploaded resume/CV files from job applicants',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
    hidden: true,
  },
  access: {
    // Anyone can upload (needed for public form submission)
    create: () => true,
    // Only admins can view, update, delete
    read: adminAccess,
    update: adminAccess,
    delete: adminAccess,
  },
  upload: {
    staticDir: resumesUploadDir,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'applicantName',
      type: 'text',
      admin: {
        description: 'Name of the applicant who uploaded this resume',
      },
    },
  ],
}
