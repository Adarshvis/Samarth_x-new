import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  labels: { singular: 'Team / Faculty Grid', plural: 'Team / Faculty Grids' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'e.g. "Principal", "Math Teacher", "HOD Science"',
          },
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'bio',
          type: 'textarea',
        },
      ],
    },
  ],
}
