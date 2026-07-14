import React from 'react'
import * as LucideIcons from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import RichText from '../ui/RichText'

interface FeatureCardsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  cardLayout?: 'classic' | 'minimal' | 'split' | 'accentTop' | null
  columns?: '2' | '3' | '4' | null
  cards: {
    icon?: string | null
    title?: any
    description?: any
    link?: string | null
    id?: string | null
  }[]
}

const gridClasses = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

function getIcon(name: string) {
  const Icon = (LucideIcons as any)[name]
  return Icon ? <Icon size={32} /> : null
}

function renderCardBody(card: FeatureCardsBlockProps['cards'][number]) {
  return (
    <>
      {card.title ? (
        <div className="mb-2 text-inherit [&_h1]:text-2xl [&_h2]:text-xl [&_h3]:text-lg [&_p]:my-0 [&_p]:leading-snug">
          <RichText data={card.title} />
        </div>
      ) : null}
      {card.description ? (
        <div className="text-inherit/80 [&_p]:my-0 [&_p]:leading-relaxed">
          <RichText data={card.description} />
        </div>
      ) : null}
    </>
  )
}

export default function FeatureCardsBlock({
  sectionHeading,
  sectionDescription,
  headingAlignment,
  cardLayout = 'classic',
  columns = '3',
  cards,
}: FeatureCardsBlockProps) {
  const cols = columns || '3'
  const layout = cardLayout || 'classic'

  if (!cards || cards.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-8 ${gridClasses[cols]}`}>
          {cards.map((card, index) => {
            const key = card.id || `feature-card-${index}`
            const iconNode = card.icon ? getIcon(card.icon) : null

            const content = (
              <div
                key={key}
                className={
                  layout === 'minimal'
                    ? 'bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all'
                    : layout === 'split'
                      ? 'bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all'
                      : layout === 'accentTop'
                        ? 'bg-white rounded-xl p-6 border border-gray-200 relative hover:shadow-md transition-all'
                        : 'bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors'
                }
              >
                {layout === 'accentTop' ? (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500 rounded-t-xl" />
                ) : null}

                {layout === 'split' ? (
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start p-6">
                    {iconNode ? <div className="text-blue-500">{iconNode}</div> : null}
                    <div className="text-gray-900">{renderCardBody(card)}</div>
                  </div>
                ) : (
                  <>
                    {iconNode ? (
                      <div className={layout === 'classic' ? 'text-blue-400 mb-4' : 'text-blue-500 mb-4'}>
                        {iconNode}
                      </div>
                    ) : null}
                    <div className={layout === 'classic' ? 'text-white' : 'text-gray-900'}>
                      {renderCardBody(card)}
                    </div>
                  </>
                )}
              </div>
            )

            if (card.link) {
              return <a key={key} href={card.link} className="no-underline">{content}</a>
            }
            return content
          })}
        </div>
      </div>
    </section>
  )
}
