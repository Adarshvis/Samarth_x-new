import type { Block } from 'payload'
import { sectionHeadingFields } from './shared'

export const Embed: Block = {
  slug: 'embed',
  labels: { singular: 'Embed', plural: 'Embeds' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'embedType',
      type: 'select',
      defaultValue: 'iframe',
      required: true,
      options: [
        { label: 'HTML Code', value: 'html' },
        { label: 'iFrame URL', value: 'iframe' },
      ],
    },
    {
      name: 'html',
      type: 'code',
      admin: {
        language: 'html',
        condition: (_, siblingData) => siblingData?.embedType === 'html',
        description: 'Paste custom HTML/embed code',
      },
    },
    {
      name: 'iframeUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.embedType === 'iframe',
        description: 'URL to embed (YouTube, Google Maps, etc.)',
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 400,
      admin: {
        description: 'Height in pixels',
      },
    },
  ],
}
