import type { Block } from 'payload'
import { iconField, colorField } from './shared'

export const ConnectedHero: Block = {
  slug: 'connectedHero',
  labels: { singular: 'Connected Hero + Cloud', plural: 'Connected Hero + Cloud' },
  fields: [
    // ── Hero content ──
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: "INDIA'S CONNECTED SCHOOL ECOSYSTEM",
      admin: {
        description: 'Small uppercase label above the headline',
      },
    },
    {
      name: 'headline',
      type: 'text',
      defaultValue: 'Education works better when everything connects.',
      admin: {
        description: 'Main hero headline',
      },
    },
    {
      name: 'headlineHighlight',
      type: 'text',
      defaultValue: 'everything connects.',
      admin: {
        description:
          'Portion of the headline to highlight in the accent color (must be an exact substring of the headline)',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      defaultValue:
        'SamarthX brings governance, administration, people and student journeys into one secure digital platform—helping education teams move faster and make better decisions.',
      admin: {
        description: 'Supporting paragraph below the headline',
      },
    },
    {
      name: 'buttons',
      type: 'array',
      label: 'Call-to-action Buttons',
      maxRows: 3,
      admin: {
        description: 'Hero buttons (e.g. "Explore the platform", "See SamarthX in action")',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
        {
          name: 'variant',
          type: 'select',
          defaultValue: 'primary',
          options: [
            { label: 'Primary (solid accent)', value: 'primary' },
            { label: 'Secondary (solid light)', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
            { label: 'Ghost (text + icon)', value: 'ghost' },
          ],
        },
        iconField('icon', 'Icon (optional)'),
      ],
    },

    // ── "Built with" partners ──
    {
      name: 'builtWithLabel',
      type: 'text',
      defaultValue: 'Built with',
      admin: {
        description: 'Label shown before the partner logos/names',
      },
    },
    {
      name: 'builtWithLogos',
      type: 'array',
      label: 'Built With (partners)',
      admin: {
        description: 'Partner names and optional logos (e.g. University of Delhi)',
      },
      fields: [
        { name: 'text', type: 'text', label: 'Name', required: true },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Optional logo image' },
        },
      ],
    },

    // ── Unified Education Cloud panel ──
    {
      name: 'showCloudPanel',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show "Unified Education Cloud" panel',
    },
    {
      name: 'cloudPanelTitle',
      type: 'text',
      defaultValue: 'Unified Education Cloud',
      admin: {
        description: 'Caption shown in the center of the orbital cloud',
        condition: (_, sibling) => sibling?.showCloudPanel !== false,
      },
    },
    {
      name: 'centerLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional logo shown in the center of the orbital cloud (e.g. SamarthX mark)',
        condition: (_, sibling) => sibling?.showCloudPanel !== false,
      },
    },
    {
      name: 'cloudCards',
      type: 'array',
      label: 'Cloud Cards',
      maxRows: 8,
      admin: {
        description: 'Numbered cards (State / School / People / Students)',
        condition: (_, sibling) => sibling?.showCloudPanel !== false,
      },
      fields: [
        { name: 'number', type: 'text', admin: { description: 'e.g. "01"' } },
        { name: 'title', type: 'text', required: true, admin: { description: 'e.g. "State"' } },
        {
          name: 'subtitle',
          type: 'text',
          admin: { description: 'e.g. "Governance & insights"' },
        },
        iconField('icon', 'Card Icon (optional)'),
      ],
    },
    {
      name: 'cloudChips',
      type: 'array',
      label: 'Status Chips',
      maxRows: 4,
      admin: {
        description: 'Small status chips (e.g. "Live data sync", "Secure by design")',
        condition: (_, sibling) => sibling?.showCloudPanel !== false,
      },
      fields: [
        { name: 'text', type: 'text', required: true },
        iconField('icon', 'Chip Icon (optional)'),
      ],
    },

    // ── Appearance ──
    colorField('backgroundColor', 'Background Color (top of gradient)', '#FFFFFF'),
    colorField('backgroundColorEnd', 'Background Color (bottom of gradient)', '#EEF2FF'),
    colorField('accentColor', 'Accent Color', '#2563EB'),
    colorField('textColor', 'Text Color', '#0F172A'),
    colorField('cardBgColor', 'Cloud Card Background', '#FFFFFF'),

    // ── Animation toggles ──
    {
      type: 'group',
      name: 'animations',
      label: 'Animations',
      admin: {
        description: 'Toggle individual animations on or off',
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Enable animations (master switch)',
        },
        {
          name: 'heroText',
          type: 'checkbox',
          defaultValue: true,
          label: 'Animate hero text (fade / slide in)',
        },
        {
          name: 'cards',
          type: 'checkbox',
          defaultValue: true,
          label: 'Animate cloud cards (staggered reveal)',
        },
        {
          name: 'chips',
          type: 'checkbox',
          defaultValue: true,
          label: 'Pulse status chip indicators',
        },
      ],
    },
  ],
}
