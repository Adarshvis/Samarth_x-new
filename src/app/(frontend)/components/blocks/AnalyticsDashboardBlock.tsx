'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { embedDashboard } from '@superset-ui/embedded-sdk'
import SectionHeading from '../ui/SectionHeading'

interface DashboardTab {
  label: string
  embedUuid: string
  height?: number | null
  visible?: boolean | null
  id?: string | null
}

interface AnalyticsDashboardBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  backgroundColor?: string | null
  enabled?: boolean | null
  dashboards?: DashboardTab[]
  activeTabColor?: string | null
  dashboardHeight?: number | null
}

export default function AnalyticsDashboardBlock(props: AnalyticsDashboardBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    backgroundColor = '#F8FAFC',
    enabled = true,
    dashboards,
    activeTabColor = '#1E40AF',
    dashboardHeight = 800,
  } = props

  const visibleTabs = useMemo(
    () => (dashboards || []).filter((d) => d.visible !== false && d.embedUuid),
    [dashboards],
  )

  const [activeTab, setActiveTab] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [embedScale, setEmbedScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const embedViewportRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)

  const supersetDomain = process.env.NEXT_PUBLIC_SUPERSET_URL || ''

  const fetchGuestToken = useCallback(async (embedUuid: string): Promise<string> => {
    const res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embedUuid }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error)
    return json.token
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobile(mediaQuery.matches)

    onChange()
    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  useEffect(() => {
    const viewport = embedViewportRef.current
    if (!viewport) return

    const mobileBaseWidth = 900

    const updateScale = () => {
      if (!isMobile) {
        setEmbedScale(1)
        return
      }

      const width = viewport.clientWidth
      if (!width) return
      setEmbedScale(Math.min(1, width / mobileBaseWidth))
    }

    updateScale()

    let observer: ResizeObserver | null = null
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      observer = new ResizeObserver(updateScale)
      observer.observe(viewport)
    }

    window.addEventListener('resize', updateScale)

    return () => {
      if (observer) observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [isMobile])

  useEffect(() => {
    const currentTab = visibleTabs[activeTab]
    if (!currentTab || !containerRef.current || !supersetDomain) return

    if (mountedRef.current) return
    mountedRef.current = true

    setLoading(true)
    setError(null)
    containerRef.current.innerHTML = ''

    const embedUuid = currentTab.embedUuid

    embedDashboard({
      id: embedUuid,
      supersetDomain,
      mountPoint: containerRef.current,
      fetchGuestToken: () => fetchGuestToken(embedUuid),
      dashboardUiConfig: {
        hideTitle: true,
        hideChartControls: true,
        hideTab: true,
        filters: { visible: false, expanded: false },
        urlParams: { standalone: '3' },
      },
    })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Superset embed error:', err)
        setError('Failed to load dashboard.')
        setLoading(false)
      })

    return () => {
      mountedRef.current = false
    }
  }, [activeTab, visibleTabs, supersetDomain, fetchGuestToken])

  if (!enabled) return null
  if (visibleTabs.length === 0) return null

  const currentHeight = visibleTabs[activeTab]?.height || dashboardHeight || 800
  const tabColor = activeTabColor || '#1E40AF'
  const mobileBaseWidth = 900
  const viewportHeight = isMobile ? Math.max(400, Math.round(currentHeight * embedScale)) : currentHeight

  return (
    <section className="py-12 md:py-16 px-4 md:px-6" style={{ backgroundColor: backgroundColor || '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        {/* Tab Bar */}
        {visibleTabs.length > 1 && (
          <div className="mb-6 overflow-x-auto">
            <div className="inline-flex min-w-max bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 gap-1">
              {visibleTabs.map((tab, i) => {
                const isActive = activeTab === i
                return (
                  <button
                    key={tab.id || i}
                    onClick={() => {
                      if (i !== activeTab) {
                        mountedRef.current = false
                        setActiveTab(i)
                      }
                    }}
                    className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{
                      color: isActive ? '#fff' : '#4B5563',
                      backgroundColor: isActive ? tabColor : 'transparent',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Dashboard Container */}
        <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100" />
                  <div
                    className="absolute inset-0 w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
                    style={{ borderColor: `${tabColor} transparent transparent transparent` }}
                  />
                </div>
                <span className="text-sm text-gray-400 font-medium">Loading analytics...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center px-6">
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-3">{error}</p>
                <button
                  onClick={() => { setError(null); mountedRef.current = false; setActiveTab(activeTab) }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: tabColor, backgroundColor: `${tabColor}10` }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Superset Embed Mount Point */}
          <div
            ref={embedViewportRef}
            className="w-full overflow-hidden"
            style={{ height: `${viewportHeight}px`, minHeight: '400px' }}
          >
            <div
              ref={containerRef}
              style={{
                height: `${currentHeight}px`,
                width: isMobile ? `${mobileBaseWidth}px` : '100%',
                transform: isMobile ? `scale(${embedScale})` : undefined,
                transformOrigin: isMobile ? 'top left' : undefined,
              }}
              className="w-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0 [&>iframe]:rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
