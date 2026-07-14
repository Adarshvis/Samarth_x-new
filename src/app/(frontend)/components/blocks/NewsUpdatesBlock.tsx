'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import DynamicIcon from '../ui/DynamicIcon'
import SectionHeading from '../ui/SectionHeading'
import ScrollReveal from '../ui/ScrollReveal'
import { ArrowRight, Calendar } from 'lucide-react'

interface ArticleData {
  title: string
  excerpt?: string | null
  image?: any
  category?: string | null
  date?: string | null
  url?: string | null
  icon?: string | null
  categoryColor?: string | null
  id?: string | null
}

interface NewsUpdatesBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  layout?: 'cards' | 'spotlight' | null
  entryType?: 'manual' | 'collection' | null
  articles?: ArticleData[]
  collectionSource?: {
    limit?: number | null
    sortBy?: 'latest' | 'oldest' | null
    category?: string | null
    featuredOnly?: boolean | null
  } | null
  columns?: '2' | '3' | null
  bottomLink?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
  backgroundColor?: string | null
}

interface NewsCollectionDoc {
  id?: string | number
  title: string
  excerpt?: string | null
  featuredImage?: any
  category?: string | null
  publishedDate?: string | null
  slug?: string | null
}

const columnClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
}

function formatDate(dateStr: string): string {
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

function buildNewsApiUrl(collectionSource?: NewsUpdatesBlockProps['collectionSource']) {
  const params = new URLSearchParams()
  const limit =
    typeof collectionSource?.limit === 'number' && collectionSource.limit > 0
      ? collectionSource.limit
      : 6

  params.set('limit', String(limit))
  params.set('depth', '1')
  params.set('where[status][equals]', 'published')
  params.set('sort', collectionSource?.sortBy === 'oldest' ? 'publishedDate' : '-publishedDate')

  if (collectionSource?.featuredOnly) {
    params.set('where[isFeatured][equals]', 'true')
  }

  if (collectionSource?.category && collectionSource.category.trim()) {
    params.set('where[category][equals]', collectionSource.category.trim())
  }

  return `/api/news?${params.toString()}`
}

function mapNewsDocToArticle(doc: NewsCollectionDoc): ArticleData {
  return {
    id: typeof doc.id === 'string' || typeof doc.id === 'number' ? String(doc.id) : null,
    title: doc.title,
    excerpt: doc.excerpt || null,
    image: doc.featuredImage,
    category: doc.category || null,
    date: doc.publishedDate || null,
    url: doc.slug ? `/news/${doc.slug}` : null,
  }
}

// ── News Card ──
function NewsCard({ article }: { article: ArticleData }) {
  const imgUrl = typeof article.image === 'object' && article.image?.url ? article.image.url : null
  const catColor = article.categoryColor || '#3B82F6'

  const content = (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
      {imgUrl && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imgUrl}
            alt={typeof article.image === 'object' ? article.image.alt || article.title : article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {article.category && (
            <span
              className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: catColor }}
            >
              {article.icon && <DynamicIcon name={article.icon} size={12} className="inline mr-1" />}
              {article.category}
            </span>
          )}
        </div>
      )}
      <div className="p-5">
        {article.date && (
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <Calendar size={12} />
            {formatDate(article.date)}
          </div>
        )}
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
        )}
        {article.url && (
          <div className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-medium">
            Read More
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </div>
        )}
      </div>
    </div>
  )

  if (article.url) {
    return <a href={article.url} className="block">{content}</a>
  }
  return content
}

// ── Spotlight Layout ──
function SpotlightLayout({ articles }: { articles: ArticleData[] }) {
  if (articles.length === 0) return null

  const featured = articles[0]
  const sideArticles = articles.slice(1, 5)
  const featuredImg =
    typeof featured.image === 'object' && featured.image?.url ? featured.image.url : null
  const catColor = featured.categoryColor || '#3B82F6'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Featured article */}
      <div className="lg:col-span-3">
        <ScrollReveal>
          <div className="group relative rounded-xl overflow-hidden h-full min-h-[400px]">
            {featuredImg && (
              <Image
                src={featuredImg}
                alt={typeof featured.image === 'object' ? featured.image.alt || featured.title : featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              {featured.category && (
                <span
                  className="text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block"
                  style={{ backgroundColor: catColor }}
                >
                  {featured.category}
                </span>
              )}
              <h3 className="text-white text-xl md:text-2xl font-bold leading-tight mb-2">
                {featured.url ? (
                  <a href={featured.url} className="hover:underline">{featured.title}</a>
                ) : (
                  featured.title
                )}
              </h3>
              {featured.excerpt && (
                <p className="text-white/80 text-sm line-clamp-2">{featured.excerpt}</p>
              )}
              {featured.date && (
                <div className="flex items-center gap-1.5 text-white/60 text-xs mt-3">
                  <Calendar size={12} />
                  {formatDate(featured.date)}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Side list */}
      <div className="lg:col-span-2 flex flex-col gap-4 lg:h-full">
        {sideArticles.map((article, i) => {
          const imgUrl =
            typeof article.image === 'object' && article.image?.url ? article.image.url : null

          return (
            <ScrollReveal key={article.id || i} delay={i * 100}>
              <div className="h-full">
                <div className="group flex h-full min-h-[116px] gap-4 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                  {imgUrl && (
                    <div className="relative w-24 h-20 shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={imgUrl}
                        alt={typeof article.image === 'object' ? article.image.alt || article.title : article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {article.date && (
                      <div className="text-gray-400 text-xs mb-1">{formatDate(article.date)}</div>
                    )}
                    <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.url ? (
                        <a href={article.url}>{article.title}</a>
                      ) : (
                        article.title
                      )}
                    </h4>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Block ──
export default function NewsUpdatesBlock(props: NewsUpdatesBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    layout = 'cards',
    entryType = 'manual',
    articles,
    collectionSource,
    columns = '3',
    bottomLink,
    backgroundColor = 'var(--bg-muted)',
  } = props

  const [fetchedArticles, setFetchedArticles] = useState<ArticleData[]>([])
  const [loadingFetchedArticles, setLoadingFetchedArticles] = useState(false)

  useEffect(() => {
    if (entryType !== 'collection') {
      setFetchedArticles([])
      return
    }

    let active = true

    async function fetchCollectionNews() {
      try {
        setLoadingFetchedArticles(true)
        const res = await fetch(buildNewsApiUrl(collectionSource), {
          credentials: 'same-origin',
        })

        if (!res.ok) {
          throw new Error('Failed to fetch news collection')
        }

        const data = await res.json()
        const docs = Array.isArray(data?.docs) ? (data.docs as NewsCollectionDoc[]) : []

        if (active) {
          setFetchedArticles(docs.map(mapNewsDocToArticle))
        }
      } catch {
        if (active) {
          setFetchedArticles([])
        }
      } finally {
        if (active) {
          setLoadingFetchedArticles(false)
        }
      }
    }

    void fetchCollectionNews()

    return () => {
      active = false
    }
  }, [entryType, collectionSource?.category, collectionSource?.featuredOnly, collectionSource?.limit, collectionSource?.sortBy])

  const displayArticles = useMemo(() => {
    if (entryType === 'collection') return fetchedArticles
    return articles || []
  }, [articles, entryType, fetchedArticles])

  if (loadingFetchedArticles && entryType === 'collection' && displayArticles.length === 0) {
    return (
      <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || 'var(--bg-muted)' }}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            heading={sectionHeading}
            description={sectionDescription}
            alignment={headingAlignment}
          />
          <p>Loading news...</p>
        </div>
      </section>
    )
  }

  if (!displayArticles || displayArticles.length === 0) return null

  const style = layout || 'cards'
  const cols = columns || '3'

  return (
    <section className="py-16 px-6" style={{ backgroundColor: backgroundColor || 'var(--bg-muted)' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        {style === 'spotlight' ? (
          <SpotlightLayout articles={displayArticles} />
        ) : (
          <div className={`grid ${columnClasses[cols]} gap-6`}>
            {displayArticles.map((article, i) => (
              <ScrollReveal key={article.id || i} delay={i * 100}>
                <NewsCard article={article} />
              </ScrollReveal>
            ))}
          </div>
        )}

        {bottomLink?.enabled && bottomLink.label && bottomLink.url && (
          <div className="mt-10 text-center">
            <a
              href={bottomLink.url}
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
            >
              {bottomLink.label}
              <ArrowRight size={18} />
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
