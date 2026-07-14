import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const Testimonials: Block = {
  slug: 'testimonials',
  labels: { singular: 'Testimonials', plural: 'Testimonials' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'e.g. "Student, Class 10", "Parent", "Principal"',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
