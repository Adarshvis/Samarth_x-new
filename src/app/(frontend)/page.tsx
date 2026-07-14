import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import type { Metadata } from 'next'
import config from '@/payload.config'
import BlockRenderer from './components/BlockRenderer'

async function getHomePage() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: 'home' },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return docs[0] || null
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getHomePage()
  if (!page) return { title: 'SamarthX' }

  return {
    title: page.meta?.title || page.title || 'SamarthX',
    description: page.meta?.description || undefined,
    openGraph:
      page.meta?.image && typeof page.meta.image === 'object' && page.meta.image.url
        ? { images: [{ url: page.meta.image.url }] }
        : undefined,
  }
}

export default async function HomePage() {
  const page = await getHomePage()

  if (!page) notFound()

  return (
    <div className="cms-page-shell">
      <BlockRenderer blocks={page.layout} />
    </div>
  )
}
