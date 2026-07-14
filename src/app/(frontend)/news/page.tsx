import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import config from '@/payload.config'
import { getPayload } from '@/lib/payload'
import PageBanner from '../components/PageBanner'

async function getNewsList() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'news',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedDate',
    depth: 1,
    limit: 100,
  })

  return docs
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'News',
    description: 'Latest news and updates',
  }
}

export default async function NewsListingPage() {
  const newsList = await getNewsList()

  return (
    <div className="cms-page-shell">
      <PageBanner title="News" slug="news" />
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item: any) => {
            const imageUrl =
              typeof item.featuredImage === 'object' && item.featuredImage?.url
                ? item.featuredImage.url
                : null

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
              >
                {imageUrl ? (
                  <div className="relative h-48">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  {item.category ? (
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 mb-2">
                      {item.category}
                    </p>
                  ) : null}
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h2>
                  {item.excerpt ? (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{item.excerpt}</p>
                  ) : null}
                  {item.publishedDate ? (
                    <p className="text-xs text-gray-500">{formatDate(item.publishedDate)}</p>
                  ) : null}
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
