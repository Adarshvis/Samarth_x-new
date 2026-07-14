import { postgresAdapter } from '@payloadcms/db-postgres'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import {
  AlignFeature,
  lexicalEditor,
  EXPERIMENTAL_TableFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { HighlightColorFeature, TextColorFeature } from 'payloadcms-lexical-ext'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { News } from './collections/News'
import { Resumes } from './collections/Resumes'
import { JobApplications } from './collections/JobApplications'
import { SiteSettings } from './globals/SiteSettings'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const databaseUrl = process.env.CMS_DATABASE_URL || ''

function maskDatabaseUrl(value: string): string {
  if (!value) return '<empty>'

  try {
    const parsed = new URL(value)
    const user = parsed.username || '<user>'
    const host = parsed.hostname || '<host>'
    const port = parsed.port || '<port>'
    const dbName = parsed.pathname?.replace(/^\//, '') || '<db>'
    return `${parsed.protocol}//${user}:***@${host}:${port}/${dbName}`
  } catch {
    return '<invalid-url>'
  }
}

export default buildConfig({
  onInit: async (payload) => {
    payload.logger.info('[DB] Payload initialized')
    payload.logger.info(`[DB] CMS_DATABASE_URL=${maskDatabaseUrl(databaseUrl)}`)
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterDashboard: ['@/components/admin/ApplicationsDashboardCard#default'],
    },
  },
  collections: [Users, Media, Pages, News, Resumes, JobApplications],
  globals: [SiteSettings, Header, Footer],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      AlignFeature(),
      TextStateFeature({
        state: {
          fontSize: {
            sm: { label: 'Small', css: { 'font-size': '0.875rem' } },
            base: { label: 'Normal', css: { 'font-size': '1rem' } },
            lg: { label: 'Large', css: { 'font-size': '1.125rem' } },
            xl: { label: 'XL', css: { 'font-size': '1.25rem' } },
            '2xl': { label: '2XL', css: { 'font-size': '1.5rem' } },
          },
        },
      }),
      TextColorFeature(),
      HighlightColorFeature(),
      EXPERIMENTAL_TableFeature(),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    push: false,
  }),
  sharp,
  plugins: [
    formBuilderPlugin({
      redirectRelationships: ['pages'],
      fields: {
        resumeUpload: {
          slug: 'resumeUpload',
          labels: {
            singular: 'Resume Upload',
            plural: 'Resume Upload Fields',
          },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  label: 'Name (lowercase, no special characters)',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Label',
                  localized: true,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'accept',
                  type: 'text',
                  label: 'Accepted MIME Types',
                  defaultValue: 'application/pdf',
                  admin: {
                    width: '50%',
                    description: 'Comma-separated list, e.g. application/pdf,image/*',
                  },
                },
                {
                  name: 'maxSizeMB',
                  type: 'number',
                  label: 'Max File Size (MB)',
                  defaultValue: 5,
                  min: 1,
                  max: 20,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'helperText',
              type: 'text',
              label: 'Helper Text',
              defaultValue: 'Only PDF files accepted. Maximum size: 5 MB.',
            },
            {
              name: 'required',
              type: 'checkbox',
              label: 'Required',
              defaultValue: true,
            },
          ],
        } as any,
        payment: false,
      },
      formOverrides: {
        fields: ({ defaultFields }) => {
          return defaultFields.map((field) => {
            if ('name' in field && field.name === 'title') {
              return {
                ...field,
                required: false,
              }
            }

            return field
          })
        },
        admin: {
          hidden: true,
        },
      },
      formSubmissionOverrides: {
        admin: {
          hidden: true,
        },
      },
    }),
  ],
})
