import React from 'react'
import Image from 'next/image'
import { Quote } from 'lucide-react'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface TestimonialsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  items: {
    quote: string
    name: string
    role?: string | null
    avatar?: MediaType | string | null
    id?: string | null
  }[]
}

export default function TestimonialsBlock({ sectionHeading, sectionDescription, headingAlignment, items }: TestimonialsBlockProps) {
  return (
    <section className="py-16 px-6 bg-gray-800/50">
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items?.map((item) => {
            const avatarUrl = typeof item.avatar === 'object' && item.avatar?.url ? item.avatar.url : null
            return (
              <div key={item.id || item.name} className="bg-gray-800 rounded-xl p-6">
                <Quote className="text-blue-400 mb-4" size={24} />
                <p className="text-gray-300 mb-6 italic">&ldquo;{item.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  {avatarUrl && (
                    <Image src={avatarUrl} alt={item.name} width={40} height={40} className="rounded-full object-cover" />
                  )}
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    {item.role && <div className="text-gray-400 text-sm">{item.role}</div>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
