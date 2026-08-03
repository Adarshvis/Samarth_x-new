import type { Block } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

export const DocumentList: Block = {
  slug: 'documentList',
  labels: { singular: 'Document List', plural: 'Document Lists' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'documents',
      type: 'array',
      label: 'Documents',
      required: true,
      admin: {
        description: 'Each row shows a document with inline View and Download actions',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Ph.D Fee Bifurcation 2024-25"' },
        },
        {
          name: 'subtitle',
          type: 'text',
          admin: {
            description:
              'Optional short description. If left blank, the title is vertically centered with the icon.',
          },
        },
        {
          name: 'date',
          type: 'date',
          admin: {
            description: 'Optional date shown on the row',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
          },
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'documents',
          required: true,
          admin: { description: 'Upload or select a PDF / Word document' },
        },
        iconField('icon', 'Row Icon (optional)'),
      ],
    },

    // ── Display options ──
    {
      name: 'showIcon',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show file icon on each row',
    },
    {
      name: 'showViewButton',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "View" button (inline preview, PDF only)',
    },
    {
      name: 'showDownloadButton',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "Download" button',
    },
    {
      name: 'viewLabel',
      type: 'text',
      defaultValue: 'View',
      admin: { description: 'Label for the view/preview button' },
    },
    {
      name: 'downloadLabel',
      type: 'text',
      defaultValue: 'Download',
      admin: { description: 'Label for the download button' },
    },

    // ── Appearance ──
    colorField('accentColor', 'Action Accent Color', '#F97316'),
    colorField('cardBgColor', 'Row Background Color', '#FFFFFF'),
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
  ],
}
