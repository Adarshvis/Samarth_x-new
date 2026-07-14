import type { GlobalConfig } from 'payload'
import { publicAccess, adminAccess } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: publicAccess,
    update: adminAccess,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media',
    },
    {
      type: 'group',
      name: 'themeColors',
      label: 'Theme Colors',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          defaultValue: '#1E40AF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick primary brand color',
          },
        },
        {
          name: 'secondaryColor',
          type: 'text',
          defaultValue: '#9333EA',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick secondary brand color',
          },
        },
        {
          name: 'accentColor',
          type: 'text',
          defaultValue: '#F59E0B',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Pick accent/highlight color',
          },
        },
        {
          name: 'backgroundColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Main page background color',
          },
        },
        {
          name: 'surfaceColor',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Card/surface background color',
          },
        },
        {
          name: 'mutedBackgroundColor',
          type: 'text',
          defaultValue: '#F1F5F9',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Section muted background color',
          },
        },
        {
          name: 'textColor',
          type: 'text',
          defaultValue: '#111827',
          admin: {
            components: {
              Field: '@/components/admin/ColorPickerField#ColorPickerField',
            },
            description: 'Default body text color',
          },
        },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter / X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
