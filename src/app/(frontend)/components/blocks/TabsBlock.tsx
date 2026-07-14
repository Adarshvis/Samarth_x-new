'use client'

import React, { useState } from 'react'
import RichText from '../ui/RichText'
import SectionHeading from '../ui/SectionHeading'

interface TabsBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  tabs: {
    label: string
    content: any
    id?: string | null
  }[]
}

export default function TabsBlock({ sectionHeading, sectionDescription, headingAlignment, tabs }: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(0)

  if (!tabs || tabs.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <SectionHeading heading={sectionHeading} description={sectionDescription} alignment={headingAlignment} />
        <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={tab.id || tab.label}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                i === activeTab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="prose prose-invert prose-lg max-w-none">
          <RichText data={tabs[activeTab].content} />
        </div>
      </div>
    </section>
  )
}
