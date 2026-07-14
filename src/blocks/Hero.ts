import type { Block } from 'payload'

function slideFields() {
  return [
    {
      name: 'mediaType',
      type: 'select' as const,
      defaultValue: 'image',
      required: true,
      options: [
        { label: 'Text Content (No Media)', value: 'textOnly' },
        { label: 'Image Media', value: 'image' },
        { label: 'Video Media (Upload)', value: 'video' },
        { label: 'YouTube / Vimeo', value: 'externalVideo' },
        { label: 'Animation (Lottie / GIF)', value: 'animation' },
        { label: 'Data Visualization / Map', value: 'dataViz' },
      ],
    },
    {
      name: 'image',
      type: 'upload' as const,
      relationTo: 'media' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'image',
      },
    },
    {
      name: 'videoUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'video',
        description: 'URL to self-hosted video file (mp4, webm)',
      },
    },
    {
      name: 'videoPoster',
      type: 'upload' as const,
      relationTo: 'media' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'video',
        description: 'Poster/thumbnail image for the video',
      },
    },
    {
      name: 'externalVideoUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'externalVideo',
        description: 'YouTube or Vimeo URL (e.g. https://youtube.com/watch?v=...)',
      },
    },
    {
      name: 'animationUrl',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'animation',
        description: 'URL to Lottie JSON file or GIF image',
      },
    },
    {
      name: 'dataVizEmbed',
      type: 'code' as const,
      admin: {
        language: 'html',
        condition: (_: any, siblingData: any) => siblingData?.mediaType === 'dataViz',
        description: 'Embed code for map, chart, or data visualization',
      },
    },
    {
      name: 'showText',
      type: 'checkbox' as const,
      defaultValue: true,
      label: 'Show text overlay',
    },
    {
      name: 'heading',
      type: 'text' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
    },
    {
      name: 'subtitle',
      type: 'textarea' as const,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
    },
    {
      name: 'buttons',
      type: 'array' as const,
      maxRows: 3,
      admin: {
        condition: (_: any, siblingData: any) => siblingData?.showText !== false,
      },
      fields: [
        { name: 'label', type: 'text' as const, required: true },
        { name: 'url', type: 'text' as const, required: true },
        {
          name: 'variant',
          type: 'select' as const,
          defaultValue: 'primary',
          options: [
            { label: 'Primary (Filled)', value: 'primary' },
            { label: 'Secondary (Filled)', value: 'secondary' },
            { label: 'Outline', value: 'outline' },
          ],
        },
        {
          name: 'icon',
          type: 'text' as const,
          admin: {
            components: {
              Field: '@/components/admin/IconPickerField#IconPickerField',
            },
            description: 'Select button icon',
          },
        },
      ],
    },
  ]
}

export const Hero: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Heroes' },
  fields: [
    {
      name: 'mode',
      type: 'select',
      defaultValue: 'single',
      required: true,
      options: [
        { label: 'Single Slide', value: 'single' },
        { label: 'Carousel (Multiple Slides)', value: 'carousel' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'fullWidth',
      required: true,
      options: [
        { label: 'Full-Width Background', value: 'fullWidth' },
        { label: '50/50 Split (Text + Media)', value: 'split' },
        { label: 'Contained', value: 'contained' },
      ],
    },
    {
      name: 'splitDirection',
      type: 'select',
      defaultValue: 'textLeft',
      options: [
        { label: 'Text Left, Media Right', value: 'textLeft' },
        { label: 'Text Right, Media Left', value: 'textRight' },
      ],
      admin: {
        condition: (_, siblingData) => siblingData?.layout === 'split',
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 600,
      admin: { description: 'Hero height in pixels (e.g. 600)' },
    },
    {
      name: 'textAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      type: 'group',
      name: 'overlay',
      label: 'Overlay Settings',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'color',
          type: 'text',
          defaultValue: '#000000',
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick overlay color',
          },
        },
        {
          name: 'opacity',
          type: 'number',
          defaultValue: 50,
          min: 0,
          max: 100,
          admin: {
            condition: (_, siblingData) => siblingData?.enabled,
            components: {
              Field: '@/components/admin/OpacitySliderField#OpacitySliderField',
            },
            description: 'Overlay opacity (0-100)',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'carouselSettings',
      label: 'Carousel Settings',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'carousel' },
      fields: [
        { name: 'autoPlay', type: 'checkbox', defaultValue: true },
        {
          name: 'autoPlayInterval',
          type: 'number',
          defaultValue: 5000,
          admin: {
            description: 'Interval in milliseconds (e.g. 5000 = 5 seconds)',
            condition: (_, siblingData) => siblingData?.autoPlay,
          },
        },
        { name: 'showArrows', type: 'checkbox', defaultValue: true },
        { name: 'showDots', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      type: 'group',
      name: 'singleSlide',
      label: 'Slide Content',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'single' },
      fields: slideFields(),
    },
    {
      name: 'slides',
      type: 'array',
      label: 'Slides',
      admin: { condition: (_, siblingData) => siblingData?.mode === 'carousel' },
      fields: slideFields(),
    },
  ],
}
