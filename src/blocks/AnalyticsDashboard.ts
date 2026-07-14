import type { Block } from 'payload'
import { sectionHeadingFields, colorField } from './shared'

export const AnalyticsDashboard: Block = {
  slug: 'analyticsDashboard',
  labels: { singular: 'Analytics Dashboard', plural: 'Analytics Dashboards' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Enable this Dashboard',
      admin: {
        description: 'Toggle off to hide this analytics section without deleting it.',
      },
    },
    colorField('backgroundColor', 'Section Background Color', '#F8FAFC'),

    // ── Dashboard Tabs ──
    {
      name: 'dashboards',
      type: 'array',
      label: 'Dashboard Tabs',
      required: true,
      admin: {
        description: 'Add Superset dashboards as tabs. Get the Embed UUID from Superset → Dashboard → ⋮ → Embed Dashboard.',
        condition: (_, siblingData) => siblingData?.enabled,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              label: 'Tab Label',
              admin: {
                width: '50%',
                description: 'e.g. "Employees on SamarthX", "School Onboarding"',
              },
            },
            {
              name: 'embedUuid',
              type: 'text',
              required: true,
              label: 'Embed UUID',
              admin: {
                width: '50%',
                description: 'UUID from Superset embed dialog (e.g. 1f92fb02-ac82-4030-...)',
              },
            },
          ],
        },
        {
          name: 'height',
          type: 'number',
          defaultValue: 800,
          min: 400,
          label: 'Dashboard Height (px)',
        },
        {
          name: 'visible',
          type: 'checkbox',
          defaultValue: true,
          label: 'Visible',
          admin: {
            description: 'Toggle individual tab visibility without removing it.',
          },
        },
      ],
    },

    // ── Appearance ──
    colorField('activeTabColor', 'Active Tab Color', '#1E40AF'),
    {
      name: 'dashboardHeight',
      type: 'number',
      defaultValue: 800,
      min: 400,
      label: 'Default Dashboard Height (px)',
      admin: {
        description: 'Default height if not set per tab.',
        condition: (_, siblingData) => siblingData?.enabled,
      },
    },
  ],
}
