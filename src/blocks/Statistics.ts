import type { Block, Field } from 'payload'
import { sectionHeadingFields, iconField, colorField } from './shared'

const impactOnly = (_: unknown, siblingData: Record<string, unknown>) =>
  siblingData?.layout === 'impactSpotlight'

export const Statistics: Block = {
  slug: 'statistics',
  labels: { singular: 'Statistics / Impact', plural: 'Statistics / Impact' },
  fields: [
    ...sectionHeadingFields,
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'cardGrid',
      required: true,
      options: [
        { label: 'Card Grid (colored icon cards)', value: 'cardGrid' },
        { label: 'Circular Rings (donut progress)', value: 'circularRings' },
        { label: 'Interlocking Rings (ribbon weave)', value: 'interlockingRings' },
        { label: 'Impact + Spotlight (dark band + map)', value: 'impactSpotlight' },
      ],
      admin: {
        description: 'Choose between card grid layout or circular ring/donut layout',
      },
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      label: 'Statistics',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "Students Enrolled", "Schools", "Pass Rate"' },
        },
        {
          name: 'numericValue',
          type: 'number',
          required: true,
          admin: {
            description: 'Numeric value for count-up animation (e.g. 10000, 500, 98)',
          },
        },
        {
          name: 'suffix',
          type: 'text',
          admin: { description: 'Suffix after the number (e.g. "+", "%", "K", "M")' },
        },
        {
          name: 'prefix',
          type: 'text',
          admin: { description: 'Prefix before the number (e.g. "$", "₹")' },
        },
        iconField('icon', 'Stat Icon'),
        colorField('iconColor', 'Icon / Ring Color', '#3B82F6'),
        colorField('ringGradientEnd', 'Ring Gradient End Color (Interlocking)', '#FF4500'),
        colorField('iconBgColor', 'Icon Background Color (Card Grid)', '#EFF6FF'),
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Short description shown below the stat (optional)',
          },
        },
        {
          name: 'ringPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Ring fill percentage (0-100). Used in Circular Rings layout.',
          },
        },
      ],
    },
    {
      ...colorField('ribbonBaseColor', 'Base Ribbon Color', '#e3e4e4'),
      admin: {
        ...colorField('ribbonBaseColor', 'Base Ribbon Color', '#e3e4e4').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Color of the back ribbon (default gray)',
      },
    } as Field,
    {
      ...colorField('ribbonWaveStartColor', 'Wave Ribbon Start Color', '#3B82F6'),
      admin: {
        ...colorField('ribbonWaveStartColor', 'Wave Ribbon Start Color', '#3B82F6').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Gradient start color of the front weave ribbon',
      },
    } as Field,
    {
      ...colorField('ribbonWaveEndColor', 'Wave Ribbon End Color', '#FF4500'),
      admin: {
        ...colorField('ribbonWaveEndColor', 'Wave Ribbon End Color', '#FF4500').admin,
        condition: (_: unknown, siblingData: Record<string, unknown>) =>
          siblingData?.layout === 'interlockingRings',
        description: 'Gradient end color of the front weave ribbon',
      },
    } as Field,
    colorField('backgroundColor', 'Section Background Color', '#FFFFFF'),
    colorField('cardBgColor', 'Card Background Color', '#FFFFFF'),
    {
      name: 'enableCountUp',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Animate numbers counting up when scrolled into view' },
    },
    {
      name: 'enableHoverZoom',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Zoom effect on card hover' },
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '4',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },

    // ── Impact + Spotlight layout fields ──
    {
      name: 'eyebrow',
      type: 'text',
      defaultValue: 'IMPACT AT SCALE',
      admin: {
        description: 'Small uppercase label above the heading (Impact + Spotlight layout)',
        condition: impactOnly,
      },
    },
    {
      ...colorField('accentColor', 'Accent Color', '#7AA5FF'),
      admin: {
        ...colorField('accentColor', 'Accent Color', '#7AA5FF').admin,
        condition: impactOnly,
        description: 'Accent color for labels, numbers and the map marker',
      },
    } as Field,
    {
      ...colorField('textColor', 'Text Color', '#FFFFFF'),
      admin: {
        ...colorField('textColor', 'Text Color', '#FFFFFF').admin,
        condition: impactOnly,
        description: 'Main text color on the dark band',
      },
    } as Field,
    {
      type: 'group',
      name: 'spotlight',
      label: 'Spotlight (Impact layout)',
      admin: {
        description: 'Optional highlighted state/story card shown below the stats',
        condition: impactOnly,
      },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          label: 'Show spotlight card',
        },
        { name: 'eyebrow', type: 'text', defaultValue: 'SPOTLIGHT' },
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Goa moves school governance forward with SamarthX.',
        },
        {
          name: 'description',
          type: 'textarea',
          defaultValue:
            'A unified digital ecosystem now supports 1,450+ schools and 16,500+ employees across the state.',
        },
        { name: 'buttonLabel', type: 'text', defaultValue: 'Read the story' },
        { name: 'buttonUrl', type: 'text' },
        {
          name: 'mapSource',
          type: 'select',
          defaultValue: 'image',
          options: [
            { label: 'Uploaded image (SVG / PNG)', value: 'image' },
            { label: 'Interactive map (Leaflet)', value: 'leaflet' },
          ],
          admin: { description: 'Choose a static uploaded map or an interactive Leaflet map' },
        },
        {
          name: 'map',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Upload the state map (SVG or PNG) shown faintly on the right',
            condition: (_, sibling) => sibling?.mapSource !== 'leaflet',
          },
        },
        {
          name: 'mapLat',
          type: 'number',
          defaultValue: 15.2993,
          admin: {
            description: 'Latitude for the Leaflet map center / marker (e.g. Goa = 15.2993)',
            condition: (_, sibling) => sibling?.mapSource === 'leaflet',
          },
        },
        {
          name: 'mapLng',
          type: 'number',
          defaultValue: 74.124,
          admin: {
            description: 'Longitude for the Leaflet map center / marker (e.g. Goa = 74.1240)',
            condition: (_, sibling) => sibling?.mapSource === 'leaflet',
          },
        },
        {
          name: 'mapZoom',
          type: 'number',
          defaultValue: 8,
          min: 1,
          max: 18,
          admin: {
            description: 'Leaflet zoom level (1–18)',
            condition: (_, sibling) => sibling?.mapSource === 'leaflet',
          },
        },
        { name: 'markerLabel', type: 'text', defaultValue: 'Goa' },
        { name: 'markerSublabel', type: 'text', defaultValue: 'Live on SamarthX' },
      ],
    },
  ],
}
