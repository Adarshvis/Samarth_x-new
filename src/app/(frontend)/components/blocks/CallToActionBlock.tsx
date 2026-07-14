import React from 'react'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface CallToActionBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  heading: string
  description?: string | null
  buttons?: { label: string; url: string; variant?: 'primary' | 'secondary' | 'outline' | null; id?: string | null }[] | null
  backgroundType?: 'color' | 'image' | null
  backgroundColor?: string | null
  backgroundImage?: MediaType | string | null
}

const buttonVariants = {
  primary: 'bg-white text-gray-900 hover:bg-gray-100',
  secondary: 'bg-purple-600 text-white hover:bg-purple-700',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
}

export default function CallToActionBlock({ sectionHeading, sectionDescription, headingAlignment, heading, description, buttons, backgroundType = 'color', backgroundColor, backgroundImage }: CallToActionBlockProps) {
  const bg = typeof backgroundImage === 'object' && backgroundImage?.url ? backgroundImage.url : null

  return (
    <section
      className="relative py-20 px-6"
      style={backgroundType === 'color' ? { backgroundColor: backgroundColor || '#1E40AF' } : undefined}
    >
      {backgroundType === 'image' && bg && (
        <>
          <Image src={bg} alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </>
      )}
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{heading}</h2>
        {description && <p className="text-gray-200 text-lg mb-8">{description}</p>}
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {buttons.map((btn) => (
              <a
                key={btn.id || btn.url}
                href={btn.url}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${buttonVariants[btn.variant || 'primary']}`}
              >
                {btn.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
