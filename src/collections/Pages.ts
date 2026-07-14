import type { CollectionConfig } from 'payload'
import { editorAccess, schoolAdminAccess, publishedOrEditor } from '../access/roles'
import { syncNavAfterChange, syncNavAfterDelete } from '../hooks/syncNavItems'
import { Hero } from '../blocks/Hero'
import { RichContent } from '../blocks/RichContent'
import { FeatureCards } from '../blocks/FeatureCards'
import { CallToAction } from '../blocks/CallToAction'
import { ImageGallery } from '../blocks/ImageGallery'
import { FAQ } from '../blocks/FAQ'
import { Statistics } from '../blocks/Statistics'
import { Testimonials } from '../blocks/Testimonials'
import { BannerAlert } from '../blocks/BannerAlert'
import { Embed } from '../blocks/Embed'
import { TeamGrid } from '../blocks/TeamGrid'
import { Tabs } from '../blocks/Tabs'
import { ContentWithMedia } from '../blocks/ContentWithMedia'
import { Marquee } from '../blocks/Marquee'
import { ShowcaseCards } from '../blocks/ShowcaseCards'
import { NewsUpdates } from '../blocks/NewsUpdates'
import { InteractiveMap } from '../blocks/InteractiveMap'
import { ScreenshotGallery } from '../blocks/ScreenshotGallery'
import { HelpSupport } from '../blocks/HelpSupport'
import { FlexibleRow } from '../blocks/FlexibleRow'
import { CareerPosting } from '../blocks/CareerPosting'
import { ConnectedHero } from '../blocks/ConnectedHero'
import { StatesOnboarded } from '../blocks/StatesOnboarded'
import { FormLayout } from '../blocks/FormLayout'
import { AnalyticsDashboard } from '../blocks/AnalyticsDashboard'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Content',
  },
  access: {
    read: publishedOrEditor,
    create: editorAccess,
    update: editorAccess,
    delete: schoolAdminAccess,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
    afterChange: [syncNavAfterChange],
    afterDelete: [syncNavAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier (auto-generated from title if left empty)',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Parent page for hierarchy',
      },
    },
    {
      type: 'group',
      name: 'meta',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Override page title for search engines',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          admin: {
            description: 'Meta description for search engines',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Open Graph image for social sharing',
          },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      required: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show in Navigation',
      admin: {
        position: 'sidebar',
        description: 'Automatically add this page to the header navigation',
      },
    },
    {
      name: 'navOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Order in navigation (lower numbers appear first)',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date this page was published',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      required: true,
      blocks: [
        Hero,
        ConnectedHero,
        Marquee,
        StatesOnboarded,        ShowcaseCards,
        Statistics,
        NewsUpdates,
        InteractiveMap,
        ScreenshotGallery,
        HelpSupport,
        FormLayout,
        RichContent,
        FeatureCards,
        CallToAction,
        ImageGallery,
        FAQ,
        Testimonials,
        BannerAlert,
        Embed,
        TeamGrid,
        Tabs,
        ContentWithMedia,
        FlexibleRow,
        CareerPosting,
        AnalyticsDashboard,
      ],
    },
  ],
}
