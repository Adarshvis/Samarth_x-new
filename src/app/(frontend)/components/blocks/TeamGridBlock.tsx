import React from 'react'
import Image from 'next/image'
import type { Media as MediaType } from '@/payload-types'
import SectionHeading from '../ui/SectionHeading'

interface TeamGridBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  columns?: '2' | '3' | '4' | null
  members: {
    name: string
    role?: string | null
    photo?: MediaType | string | null
    bio?: string | null
    id?: string | null
  }[]
}

const gridClasses = {
  '2': 'grid-cols-1 md:grid-cols-2',
  '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
}

export default function TeamGridBlock({ sectionHeading, sectionDescription, headingAlignment, columns = '3', members }: TeamGridBlockProps) {
  const cols = columns || '3'

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className={`grid gap-8 ${gridClasses[cols]}`}>
          {members?.map((member) => {
            const photoUrl = typeof member.photo === 'object' && member.photo?.url ? member.photo.url : null
            return (
              <div key={member.id || member.name} className="bg-gray-800 rounded-xl overflow-hidden text-center">
                {photoUrl && (
                  <div className="relative aspect-square">
                    <Image src={photoUrl} alt={member.name} fill className="object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                  {member.role && <p className="text-blue-400 text-sm mb-2">{member.role}</p>}
                  {member.bio && <p className="text-gray-400 text-sm">{member.bio}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
