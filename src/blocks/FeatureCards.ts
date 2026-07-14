import type { Block } from 'payload'
import { sectionHeadingFields, iconField } from './shared'

export const FeatureCards: Block = {
  slug: 'featureCards',
  labels: { singular: 'Feature Cards', plural: 'Feature Cards' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'cardLayout',
      type: 'select',
      defaultValue: 'classic',
      options: [
        { label: 'Classic', value: 'classic' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Split', value: 'split' },
        { label: 'Accent Top', value: 'accentTop' },
        { label: 'Role Cards (icon badge + link)', value: 'roleCards' },
      ],
      admin: {
        description: 'Choose how cards should be displayed.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Small uppercase label above the heading (Role Cards layout)',
        condition: (_, sibling) => sibling?.cardLayout === 'roleCards',
      },
    },
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
      name: 'cards',
      type: 'array',
      fields: [
        iconField('icon', 'Card Icon'),
        {
          name: 'title',
          type: 'richText',
          admin: {
            description: 'Optional card title (rich text supported).',
          },
        },
        {
          name: 'description',
          type: 'richText',
          admin: {
            description: 'Optional card description/details (rich text supported).',
          },
        },
        {
          name: 'link',
          type: 'text',
          admin: {
            description: 'Optional URL this card links to',
          },
        },
        {
          name: 'linkLabel',
          type: 'text',
          defaultValue: 'Discover more',
          admin: {
            description: 'Link text shown on the card (Role Cards layout, e.g. "Discover more")',
          },
        },
      ],
    },
  ],
}
