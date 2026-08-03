import type { CollectionConfig } from 'payload'
import { editorAccess, schoolAdminAccess, publicAccess } from '../access/roles'

const documentsUploadDir = process.env.SAMARTHX_MAIN_CMS_DOCUMENTS_UPLOAD_DIR || 'documents'

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'mimeType', 'filesize', 'updatedAt'],
    description: 'PDF / Word documents (notices, circulars, forms) uploaded by admins',
  },
  access: {
    // Public can read/download published documents from the site
    read: publicAccess,
    // Only admin-panel users can manage them
    create: editorAccess,
    update: editorAccess,
    delete: schoolAdminAccess,
  },
  upload: {
    staticDir: documentsUploadDir,
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional label for this file in the admin list (defaults to the filename)',
      },
    },
  ],
}
