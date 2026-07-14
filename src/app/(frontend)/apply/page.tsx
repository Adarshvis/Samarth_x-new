import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import BlockRenderer from '../components/BlockRenderer'
import PageBanner from '../components/PageBanner'

async function getApplyPage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'apply' },
      status: { equals: 'published' },
    },
    limit: 1,
  })

  return docs[0] || null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getApplyPage()
  if (!page) return {}

  return {
    title: page.meta?.title || page.title,
    description: page.meta?.description || undefined,
    openGraph:
      page.meta?.image && typeof page.meta.image === 'object' && page.meta.image.url
        ? { images: [{ url: page.meta.image.url }] }
        : undefined,
  }
}

export default async function ApplyPage() {
  const page = await getApplyPage()

  if (!page) notFound()

  return (
    <div className="cms-page-shell">
      <PageBanner title={page.title} slug="apply" />
      <BlockRenderer blocks={page.layout} />
    </div>
  )
}
