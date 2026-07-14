'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import RichText from '../ui/RichText'
import SectionHeading from '../ui/SectionHeading'

interface FAQBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  items: {
    question: string
    answer: any
    id?: string | null
  }[]
}

function FAQItem({ question, answer }: { question: string; answer: any }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left text-white hover:text-blue-400 transition-colors"
      >
        <span className="text-lg font-medium pr-4">{question}</span>
        <ChevronDown className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} size={20} />
      </button>
      {open && (
        <div className="pb-5 prose prose-invert prose-sm max-w-none">
          <RichText data={answer} />
        </div>
      )}
    </div>
  )
}

export default function FAQBlock({ sectionHeading, sectionDescription, headingAlignment, items }: FAQBlockProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div>
          {items?.map((item) => (
            <FAQItem key={item.id || item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
