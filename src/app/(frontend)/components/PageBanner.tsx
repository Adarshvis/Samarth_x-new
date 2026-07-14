import React from 'react'
import Link from 'next/link'

interface PageBannerProps {
  title: string
  slug?: string
  userSlot?: React.ReactNode
}

export default function PageBanner({ title, slug, userSlot }: PageBannerProps) {
  return (
    <div className="page-banner">
      <div className="page-banner__inner">
        <h1 className="page-banner__title">{title}</h1>
        {userSlot ? (
          <div className="page-banner__user-slot">{userSlot}</div>
        ) : (
          <nav className="page-banner__breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="page-banner__breadcrumb-link">
              Home
            </Link>
            <span className="page-banner__breadcrumb-sep">/</span>
            <span className="page-banner__breadcrumb-current">{title}</span>
          </nav>
        )}
      </div>
    </div>
  )
}
