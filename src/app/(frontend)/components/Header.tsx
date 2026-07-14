'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ChevronDown } from 'lucide-react'

interface HeaderData {
  topBar?: {
    enabled?: boolean | null
    text?: string | null
    backgroundColor?: string | null
  } | null
  leftLogo?: {
    image?: any
    url?: string | null
    height?: number | null
    maxWidth?: number | null
  } | null
  centerLogo?: {
    image?: any
    title?: string | null
    subtitle?: string | null
    url?: string | null
    height?: number | null
    maxWidth?: number | null
  } | null
  searchBar?: {
    enabled?: boolean | null
    placeholder?: string | null
  } | null
  navAlignment?: 'left' | 'center' | 'right' | null
  navItems?: {
    label: string
    url?: string | null
    children?: {
      page?: { title?: string | null; slug?: string | null } | null
      label?: string | null
      id?: string | null
    }[] | null
    id?: string | null
  }[] | null
  ctaButton?: {
    enabled?: boolean | null
    label?: string | null
    url?: string | null
  } | null
}

interface HeaderProps {
  data: HeaderData
}

export default function Header({ data }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredNav, setHoveredNav] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const updateHeight = () => {
      document.documentElement.style.setProperty('--site-header-height', `${el.offsetHeight}px`)
    }

    updateHeight()

    let observer: ResizeObserver | null = null
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new ResizeObserver(updateHeight)
      observer.observe(el)
    }

    window.addEventListener('resize', updateHeight)

    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', updateHeight)
      document.documentElement.style.removeProperty('--site-header-height')
    }
  }, [mobileOpen, searchOpen, data.topBar?.enabled, data.navItems?.length])

  // Check if a nav item is active based on current path
  const isActive = (url?: string | null) => {
    if (!url) return false
    if (url === '/') return pathname === '/'
    return pathname === url || pathname.startsWith(url + '/')
  }

  const leftImg = typeof data.leftLogo?.image === 'object' && data.leftLogo.image?.url ? data.leftLogo.image : null
  const leftHeight = data.leftLogo?.height || 50
  const leftMaxWidth = data.leftLogo?.maxWidth || 200
  const navAlignment = data.navAlignment || 'center'
  const navAlignWrapperClass =
    navAlignment === 'left'
      ? 'justify-start'
      : navAlignment === 'right'
        ? 'justify-end'
        : 'justify-center'

  return (
    <>
    <header ref={headerRef} className="site-header fixed top-0 left-0 right-0 z-[100] w-full">
      {/* ── Top Bar ── */}
      {data.topBar?.enabled && data.topBar.text && (
        <div
          className="text-white text-xs text-center py-1.5 px-4"
          style={{ backgroundColor: data.topBar.backgroundColor || '#1E3A5F' }}
        >
          {data.topBar.text}
        </div>
      )}

      {/* ── Main Header: Left Logo | Center Menu | Search ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left Logo */}
          <div className="shrink-0">
            {leftImg?.url ? (
              <a href={data.leftLogo?.url || '/'} className="block">
                <Image
                  src={leftImg.url}
                  alt={leftImg.alt || 'Organization Logo'}
                  width={leftMaxWidth}
                  height={leftHeight}
                  style={{ height: `${leftHeight}px`, width: 'auto', maxWidth: `${leftMaxWidth}px` }}
                  className="object-contain"
                />
              </a>
            ) : (
              <Link href="/" className="text-lg font-bold text-gray-900">SamarthX</Link>
            )}
          </div>

          {/* Center Desktop Navigation */}
          <div className={`hidden md:flex flex-1 items-center ${navAlignWrapperClass}`}>
            <div className="flex items-center gap-8">
              {(data.navItems || []).map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const active = hasChildren
                  ? item.children?.some((child) => {
                      const slug = child.page?.slug
                      return isActive(slug === 'home' ? '/' : `/${slug}`)
                    }) || false
                  : isActive(item.url)

                return (
                  <div key={item.id || item.label} className="relative group">
                    {!hasChildren ? (
                      <a
                        href={item.url || '#'}
                        onMouseEnter={() => setHoveredNav(item.id || item.label)}
                        onMouseLeave={() => setHoveredNav(null)}
                        className="inline-flex items-center text-base font-medium pb-1 border-b-[3px]"
                        style={{
                          color: hoveredNav === (item.id || item.label)
                            ? '#FFAA01'
                            : active
                              ? '#1A73E9'
                              : '#000000',
                          borderColor: hoveredNav === (item.id || item.label)
                            ? '#FFAA01'
                            : active
                              ? '#1A73E9'
                              : 'transparent',
                          transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, transform 0.2s ease',
                          transform: hoveredNav === (item.id || item.label) ? 'translateY(-1px)' : 'translateY(0)',
                        }}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <>
                        <button
                          onMouseEnter={() => setHoveredNav(item.id || item.label)}
                          onMouseLeave={() => setHoveredNav(null)}
                          className="inline-flex items-center gap-1 text-base font-medium pb-1 border-b-[3px]"
                          style={{
                            color: hoveredNav === (item.id || item.label)
                              ? '#FFAA01'
                              : active
                                ? '#1A73E9'
                                : '#000000',
                            borderColor: hoveredNav === (item.id || item.label)
                              ? '#FFAA01'
                              : active
                                ? '#1A73E9'
                                : 'transparent',
                            transition: 'color 0.3s ease-in-out, border-color 0.3s ease-in-out, transform 0.2s ease',
                            transform: hoveredNav === (item.id || item.label) ? 'translateY(-1px)' : 'translateY(0)',
                          }}
                        >
                          {item.label}
                          <ChevronDown size={14} />
                        </button>
                        {item.children && item.children.length > 0 && (
                          <div className="absolute top-full left-0 mt-0 bg-white rounded-b-lg shadow-lg border border-gray-200 py-1 min-w-[200px] hidden group-hover:block z-50">
                            {item.children.map((child) => {
                              const childSlug = child.page?.slug
                              const childUrl = childSlug === 'home' ? '/' : `/${childSlug}`
                              const childLabel = child.label || child.page?.title || ''
                              const childActive = isActive(childUrl)
                              return (
                                <a
                                  key={child.id || childLabel}
                                  href={childUrl}
                                  className={`block px-4 py-2 text-base transition-colors ${
                                    childActive
                                      ? 'text-[#1A73E9] font-semibold'
                                      : 'text-gray-900 hover:text-[#1A73E9] hover:bg-gray-50'
                                  }`}
                                >
                                  {childLabel}
                                </a>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}

              {data.ctaButton?.enabled && data.ctaButton.label && (
                <a
                  href={data.ctaButton.url || '#'}
                  className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-blue-700 transition-colors"
                >
                  {data.ctaButton.label}
                </a>
              )}
            </div>
          </div>

          {/* Right: Search Bar + Mobile Toggle */}
          <div className="shrink-0 flex items-center gap-3">
            {data.searchBar?.enabled && (
              <>
                {/* Desktop search */}
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2 w-56">
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={data.searchBar.placeholder || 'Search...'}
                    className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
                  />
                </div>
                {/* Mobile search toggle */}
                <button
                  className="md:hidden text-gray-600 hover:text-gray-900"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <Search size={20} />
                </button>
              </>
            )}
            <button
              className="md:hidden text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar (expanded) */}
        {searchOpen && data.searchBar?.enabled && (
          <div className="md:hidden border-t border-gray-200 px-4 py-3">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
              <Search size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={data.searchBar.placeholder || 'Search...'}
                className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile Navigation Bar ── */}
      {data.navItems && data.navItems.length > 0 && (
        <nav className="md:hidden bg-white border-b border-gray-200 pb-[5px]">

          {/* Mobile Nav */}
          {mobileOpen && (
            <div className="md:hidden border-t border-gray-200 px-4 py-3 bg-white">
              {data.navItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const active = hasChildren
                  ? item.children?.some((child) => {
                      const slug = child.page?.slug
                      return isActive(slug === 'home' ? '/' : `/${slug}`)
                    }) || false
                  : isActive(item.url)

                return (
                <div key={item.id || item.label}>
                  {!hasChildren ? (
                    <a
                      href={item.url || '#'}
                      className={`block py-2.5 text-base transition-colors ${
                        active
                          ? 'text-[#1A73E9] font-semibold'
                          : 'text-gray-900 hover:text-[#1A73E9]'
                      }`}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <>
                      <div className={`py-2.5 text-base font-medium ${
                        active ? 'text-[#1A73E9]' : 'text-gray-900'
                      }`}>{item.label}</div>
                      {item.children?.map((child) => {
                        const childSlug = child.page?.slug
                        const childUrl = childSlug === 'home' ? '/' : `/${childSlug}`
                        const childLabel = child.label || child.page?.title || ''
                        return (
                          <a
                            key={child.id || childLabel}
                            href={childUrl}
                            className={`block py-2 pl-4 text-base transition-colors ${
                              isActive(childUrl)
                                ? 'text-[#1A73E9] font-semibold'
                                : 'text-gray-500 hover:text-[#1A73E9]'
                            }`}
                          >
                            {childLabel}
                          </a>
                        )
                      })}
                    </>
                  )}
                </div>
                )
              })}
              {data.ctaButton?.enabled && data.ctaButton.label && (
                <a
                  href={data.ctaButton.url || '#'}
                  className="block mt-3 text-center bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
                >
                  {data.ctaButton.label}
                </a>
              )}
            </div>
          )}
        </nav>
      )}
    </header>
    </>
  )
}
