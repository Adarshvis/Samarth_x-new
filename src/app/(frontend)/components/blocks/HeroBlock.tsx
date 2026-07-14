'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Lottie from 'lottie-react'
import DynamicIcon from '../ui/DynamicIcon'

const mediaFillStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
}

const mediaCoverStyle: React.CSSProperties = {
  ...mediaFillStyle,
  objectFit: 'cover',
  objectPosition: 'center',
}

// ── Types ──
interface SlideData {
  mediaType?: string | null
  image?: any
  videoUrl?: string | null
  videoPoster?: any
  externalVideoUrl?: string | null
  animationUrl?: string | null
  dataVizEmbed?: string | null
  showText?: boolean | null
  heading?: string | null
  subtitle?: string | null
  buttons?: {
    label: string
    url: string
    variant?: 'primary' | 'secondary' | 'outline' | null
    icon?: string | null
    id?: string | null
  }[] | null
  id?: string | null
}

interface HeroBlockProps {
  mode?: 'single' | 'carousel' | null
  layout?: 'fullWidth' | 'split' | 'contained' | null
  splitDirection?: 'textLeft' | 'textRight' | null
  height?: number | null
  textAlignment?: 'left' | 'center' | 'right' | null
  overlay?: { enabled?: boolean | null; color?: string | null; opacity?: number | null } | null
  carouselSettings?: {
    autoPlay?: boolean | null
    autoPlayInterval?: number | null
    showArrows?: boolean | null
    showDots?: boolean | null
  } | null
  singleSlide?: SlideData | null
  slides?: SlideData[] | null
}

function LottieFromUrl({ url }: { url: string }) {
  const [animationData, setAnimationData] = useState<any | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setAnimationData(null)
    setHasError(false)

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to load Lottie JSON')
        return response.json()
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        if (!cancelled) setHasError(true)
      })

    return () => {
      cancelled = true
    }
  }, [url])

  if (hasError) {
    return <iframe src={url} className="border-0" style={mediaFillStyle} loading="lazy" />
  }

  if (!animationData) {
    return <div className="absolute inset-0 animate-pulse bg-slate-800/40" />
  }

  return (
    <div className="absolute inset-0 w-full h-full p-4 sm:p-6">
      <Lottie animationData={animationData} loop autoplay className="w-full h-full" />
    </div>
  )
}

const alignClasses = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
}

const btnVariants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl',
  secondary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl',
  outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
}

// ── Helper: parse YouTube/Vimeo URL to embed ──
function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&controls=0&playlist=${ytMatch[1]}`
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?autoplay=1&muted=1&loop=1&background=1`
  return null
}

function hasTextContent(slide: SlideData): boolean {
  if (slide.showText === false) return false
  const hasButtons = Array.isArray(slide.buttons) && slide.buttons.length > 0
  return Boolean(slide.heading || slide.subtitle || hasButtons)
}

function hasMediaContent(slide: SlideData): boolean {
  const type = slide.mediaType || 'textOnly'

  if (type === 'image') {
    return Boolean(typeof slide.image === 'object' && slide.image?.url)
  }

  if (type === 'video') {
    return Boolean(slide.videoUrl)
  }

  if (type === 'externalVideo') {
    return Boolean(slide.externalVideoUrl && getEmbedUrl(slide.externalVideoUrl))
  }

  if (type === 'animation') {
    return Boolean(slide.animationUrl)
  }

  if (type === 'dataViz') {
    return Boolean(slide.dataVizEmbed)
  }

  return false
}

// ── Slide Media Renderer ──
function SlideMedia({ slide }: { slide: SlideData }) {
  const type = slide.mediaType || 'textOnly'

  if (type === 'image') {
    const url = typeof slide.image === 'object' && slide.image?.url ? slide.image.url : null
    if (!url) return null
    return (
      <img
        src={url}
        alt={typeof slide.image === 'object' ? slide.image.alt || '' : ''}
        style={mediaCoverStyle}
        loading="eager"
      />
    )
  }

  if (type === 'video') {
    const posterUrl = typeof slide.videoPoster === 'object' && slide.videoPoster?.url ? slide.videoPoster.url : undefined
    return (
      <video
        src={slide.videoUrl || undefined}
        poster={posterUrl}
        autoPlay
        muted
        loop
        playsInline
        style={mediaCoverStyle}
      />
    )
  }

  if (type === 'externalVideo' && slide.externalVideoUrl) {
    const embedUrl = getEmbedUrl(slide.externalVideoUrl)
    if (!embedUrl) return null
    return (
      <iframe
        src={embedUrl}
        className="border-0"
        style={mediaFillStyle}
        allow="autoplay; fullscreen"
        loading="lazy"
      />
    )
  }

  if (type === 'animation' && slide.animationUrl) {
    const isGif = slide.animationUrl.endsWith('.gif')
    const isLottieJson = slide.animationUrl.endsWith('.json')

    if (isLottieJson) {
      return <LottieFromUrl url={slide.animationUrl} />
    }

    if (isGif) {
      return <img src={slide.animationUrl} alt="" style={mediaCoverStyle} />
    }
    return (
      <iframe src={slide.animationUrl} className="border-0" style={mediaFillStyle} loading="lazy" />
    )
  }

  if (type === 'dataViz' && slide.dataVizEmbed) {
    return (
      <div style={mediaFillStyle} dangerouslySetInnerHTML={{ __html: slide.dataVizEmbed }} />
    )
  }

  return null
}

// ── Slide Text Content ──
function SlideContent({
  slide,
  align,
}: {
  slide: SlideData
  align: 'left' | 'center' | 'right'
}) {
  if (slide.showText === false) return null

  return (
    <div className={`relative z-10 flex flex-col gap-5 ${alignClasses[align]}`}>
      {slide.heading && (
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight break-words [overflow-wrap:anywhere] max-w-[22ch] animate-fade-in-up">
          {slide.heading}
        </h1>
      )}
      {slide.subtitle && (
        <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl animate-fade-in-up animation-delay-200">
          {slide.subtitle}
        </p>
      )}
      {slide.buttons && slide.buttons.length > 0 && (
        <div className="flex flex-wrap gap-4 mt-2 animate-fade-in-up animation-delay-400">
          {slide.buttons.map((btn) => (
            <a
              key={btn.id || btn.url}
              href={btn.url}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${btnVariants[btn.variant || 'primary']}`}
            >
              {btn.label}
              {btn.icon && <DynamicIcon name={btn.icon} size={18} />}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Hero Block ──
export default function HeroBlock(props: HeroBlockProps) {
  const {
    mode = 'single',
    layout = 'fullWidth',
    splitDirection = 'textLeft',
    height = 600,
    textAlignment = 'center',
    overlay,
    carouselSettings,
    singleSlide,
    slides,
  } = props

  const allSlides: SlideData[] =
    mode === 'carousel' && slides && slides.length > 0 ? slides : singleSlide ? [singleSlide] : []

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (allSlides.length === 0) {
      setCurrent(0)
      return
    }

    setCurrent((prev) => (prev >= allSlides.length ? 0 : prev))
  }, [allSlides.length])

  const next = useCallback(() => {
    setCurrent((prev) => {
      if (allSlides.length === 0) return 0
      return (prev + 1) % allSlides.length
    })
  }, [allSlides.length])

  const prev = useCallback(() => {
    setCurrent((prev) => {
      if (allSlides.length === 0) return 0
      return (prev - 1 + allSlides.length) % allSlides.length
    })
  }, [allSlides.length])

  // Auto-play
  useEffect(() => {
    if (mode !== 'carousel' || !carouselSettings?.autoPlay || allSlides.length <= 1) return
    const interval = setInterval(next, carouselSettings.autoPlayInterval || 5000)
    return () => clearInterval(interval)
  }, [mode, carouselSettings, allSlides.length, next])

  if (allSlides.length === 0) return null

  const currentSlide = allSlides[current]
  const fallbackTextSlide = allSlides.find(hasTextContent) || allSlides[0]
  const fallbackMediaSlide = allSlides.find(hasMediaContent) || allSlides[0]
  const align = textAlignment || 'center'
  const heroHeight = height || 600
  const showArrows = mode === 'carousel' && carouselSettings?.showArrows !== false && allSlides.length > 1
  const showDots = mode === 'carousel' && carouselSettings?.showDots !== false && allSlides.length > 1

  // Overlay
  const overlayEnabled = overlay?.enabled !== false
  const overlayColor = overlay?.color || '#000000'
  const overlayOpacity = (overlay?.opacity ?? 50) / 100

  // ── Split layout ──
  if (layout === 'split') {
    const isTextLeft = splitDirection !== 'textRight'
    return (
      <section className="bg-gray-900" style={{ minHeight: `${heroHeight}px` }}>
        <div
          className={`max-w-7xl mx-auto flex flex-col ${isTextLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} min-h-[inherit]`}
          style={{ minHeight: `${heroHeight}px` }}
        >
          <div className="flex-1 relative px-6 sm:px-10 lg:px-16 py-10 sm:py-12 lg:py-16 min-h-[320px] lg:min-h-0">
            {allSlides.map((slide, i) => {
              const textSlide = hasTextContent(slide) ? slide : fallbackTextSlide
              return (
                <div
                  key={slide.id || `split-text-${i}`}
                  className={`absolute inset-0 flex items-start px-6 sm:px-10 lg:px-16 py-10 sm:py-12 lg:py-16 transition-opacity duration-700 ease-in-out ${
                    i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="w-full">
                    <SlideContent slide={textSlide} align="left" />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex-1 relative overflow-hidden min-h-[320px] lg:min-h-0">
            {allSlides.map((slide, i) => {
              const mediaSlide = hasMediaContent(slide) ? slide : fallbackMediaSlide
              return (
                <div
                  key={slide.id || `split-media-${i}`}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <SlideMedia slide={mediaSlide} />
                </div>
              )
            })}
            {overlayEnabled && (
              <div className="absolute inset-0 z-[1]" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
            )}

            {showArrows && <CarouselArrows prev={prev} next={next} />}
            {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
          </div>
        </div>
      </section>
    )
  }

  // ── Contained layout ──
  if (layout === 'contained') {
    return (
      <section className="py-12 px-6">
        <div
          className="relative max-w-6xl mx-auto rounded-2xl overflow-hidden flex items-center justify-center"
          style={{ minHeight: `${heroHeight}px` }}
        >
          <SlideMedia slide={currentSlide} />
          {overlayEnabled && (
            <div className="absolute inset-0" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
          )}
          <div className="relative z-10 px-8 py-16 w-full max-w-4xl mx-auto">
            <SlideContent slide={currentSlide} align={align} />
          </div>
          {showArrows && <CarouselArrows prev={prev} next={next} />}
          {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
        </div>
      </section>
    )
  }

  // ── Full-width layout (default) ──
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center bg-gray-900"
      style={{ minHeight: `${heroHeight}px` }}
      role="region"
      aria-label="Hero"
    >
      {/* Slides */}
      {allSlides.map((slide, i) => (
        <div
          key={slide.id || i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <SlideMedia slide={slide} />
        </div>
      ))}

      {/* Overlay */}
      {overlayEnabled && (
        <div className="absolute inset-0 z-[1]" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
      )}

      {/* Text */}
      <div className="relative z-10 px-6 py-16 w-full max-w-4xl mx-auto">
        <SlideContent slide={currentSlide} align={align} />
      </div>

      {showArrows && <CarouselArrows prev={prev} next={next} />}
      {showDots && <CarouselDots total={allSlides.length} current={current} setCurrent={setCurrent} />}
    </section>
  )
}

// ── Carousel navigation ──
function CarouselArrows({ prev, next }: { prev: () => void; next: () => void }) {
  return (
    <>
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 transition-all duration-200 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </>
  )
}

function CarouselDots({
  total,
  current,
  setCurrent,
}: {
  total: number
  current: number
  setCurrent: (i: number) => void
}) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrent(i)}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i === current ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/70'
          }`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}
