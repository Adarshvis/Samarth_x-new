import React from 'react'
import SectionHeading from '../ui/SectionHeading'

interface EmbedBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  embedType: 'html' | 'iframe'
  html?: string | null
  iframeUrl?: string | null
  height?: number | null
}

export default function EmbedBlock({ sectionHeading, sectionDescription, headingAlignment, embedType, html, iframeUrl, height = 400 }: EmbedBlockProps) {
  const h = height || 400

  if (embedType === 'html' && html) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </section>
    )
  }

  if (embedType === 'iframe' && iframeUrl) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
          <iframe
            src={iframeUrl}
            width="100%"
            height={h}
            className="rounded-lg border-0"
            allowFullScreen
          />
        </div>
      </section>
    )
  }

  return null
}
