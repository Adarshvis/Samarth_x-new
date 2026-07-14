'use client'

import React from 'react'
import Image from 'next/image'
import DynamicIcon from '../ui/DynamicIcon'
import { useInView } from '../ui/useInView'

// ── Types ──
interface ButtonItem {
  label: string
  url: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | null
  icon?: string | null
  id?: string | null
}

interface MediaLike {
  url?: string | null
  alt?: string | null
}

interface BuiltWithItem {
  text: string
  logo?: MediaLike | number | null
  id?: string | null
}

interface CloudCard {
  number?: string | null
  title: string
  subtitle?: string | null
  icon?: string | null
  id?: string | null
}

interface CloudChip {
  text: string
  icon?: string | null
  id?: string | null
}

interface AnimationSettings {
  enabled?: boolean | null
  heroText?: boolean | null
  cards?: boolean | null
  chips?: boolean | null
}

interface ConnectedHeroBlockProps {
  eyebrow?: string | null
  headline?: string | null
  headlineHighlight?: string | null
  description?: string | null
  buttons?: ButtonItem[] | null
  builtWithLabel?: string | null
  builtWithLogos?: BuiltWithItem[] | null
  showCloudPanel?: boolean | null
  cloudPanelTitle?: string | null
  centerLogo?: MediaLike | number | null
  cloudCards?: CloudCard[] | null
  cloudChips?: CloudChip[] | null
  backgroundColor?: string | null
  backgroundColorEnd?: string | null
  accentColor?: string | null
  textColor?: string | null
  cardBgColor?: string | null
  animations?: AnimationSettings | null
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = (hex || '').replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const num = parseInt(full, 16)
  if (Number.isNaN(num)) return hex
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function asMedia(val: MediaLike | number | null | undefined): MediaLike | null {
  return val && typeof val === 'object' && val.url ? val : null
}

// Corner positions for the orbital cards (first 4) — symmetric so the top pair
// and bottom pair align on the same horizontal line (parallel layout)
const cardPositions: React.CSSProperties[] = [
  { top: 'calc(4% + 5px)', left: '5px' },
  { top: 'calc(4% + 5px)', right: '5px' },
  { bottom: 'calc(4% + 5px)', left: '5px' },
  { bottom: 'calc(4% + 5px)', right: '5px' },
]

export default function ConnectedHeroBlock(props: ConnectedHeroBlockProps) {
  const {
    eyebrow,
    headline,
    headlineHighlight,
    description,
    buttons,
    builtWithLabel,
    builtWithLogos,
    showCloudPanel = true,
    cloudPanelTitle,
    centerLogo,
    cloudCards,
    cloudChips,
    backgroundColor = '#FFFFFF',
    backgroundColorEnd = '#EEF2FF',
    accentColor = '#2563EB',
    textColor = '#0F172A',
    cardBgColor = '#FFFFFF',
    animations,
  } = props

  // ── Animation gates ──
  const animOn = animations?.enabled !== false
  const heroAnim = animOn && animations?.heroText !== false
  const cardAnim = animOn && animations?.cards !== false
  const chipAnim = animOn && animations?.chips !== false

  const { ref: vizRef, inView: vizInView } = useInView(0.12)

  const bg = backgroundColor || '#FFFFFF'
  const bgEnd = backgroundColorEnd || '#EEF2FF'
  const accent = accentColor || '#2563EB'
  const text = textColor || '#0F172A'
  const cardBg = cardBgColor || '#FFFFFF'
  const mutedText = hexToRgba(text, 0.6)
  const centerMedia = asMedia(centerLogo)
  const hasCloud = showCloudPanel !== false && (cloudCards?.length || cloudChips?.length || cloudPanelTitle)
  const orbitCards = (cloudCards || []).slice(0, 4)

  const heroClass = (delay: string) => (heroAnim ? `animate-fade-in-up ${delay}` : '')

  const renderHeadline = () => {
    if (!headline) return null
    const hl = headlineHighlight?.trim()
    if (!hl) return headline
    const idx = headline.indexOf(hl)
    if (idx === -1) return headline
    return (
      <>
        {headline.slice(0, idx)}
        <span style={{ color: accent }}>{headline.slice(idx, idx + hl.length)}</span>
        {headline.slice(idx + hl.length)}
      </>
    )
  }

  const buttonStyle = (variant: ButtonItem['variant']): React.CSSProperties => {
    switch (variant) {
      case 'secondary':
      case 'outline':
        return {
          backgroundColor: '#FFFFFF',
          color: text,
          border: `1px solid ${hexToRgba(text, 0.15)}`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }
      case 'ghost':
        return { backgroundColor: 'transparent', color: accent }
      case 'primary':
      default:
        return {
          background: `linear-gradient(135deg, ${accent} 0%, #4F46E5 100%)`,
          color: '#FFFFFF',
          boxShadow: `0 10px 20px -6px ${hexToRgba(accent, 0.5)}`,
        }
    }
  }

  const CardInner = ({ card }: { card: CloudCard }) => (
    <div
      className="rounded-2xl p-4 sm:p-5 min-h-[150px] flex flex-col"
      style={{
        backgroundColor: cardBg,
        boxShadow: '0 18px 40px -18px rgba(15, 23, 42, 0.28)',
        border: `1px solid ${hexToRgba(text, 0.06)}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        {card.number && (
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: hexToRgba(accent, 0.1), color: accent }}
          >
            {card.number}
          </span>
        )}
        {card.icon && <DynamicIcon name={card.icon} size={18} color={accent} />}
      </div>
      <p className="text-base font-bold" style={{ color: text }}>
        {card.title}
      </p>
      {card.subtitle && (
        <p className="mt-0.5 text-xs sm:text-sm" style={{ color: mutedText }}>
          {card.subtitle}
        </p>
      )}
    </div>
  )

  const Pill = ({ chip }: { chip: CloudChip }) => (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap shadow-lg"
      style={{ backgroundColor: '#0F172A', color: '#FFFFFF' }}
    >
      {chip.icon ? (
        <DynamicIcon name={chip.icon} size={13} color="#34D399" />
      ) : (
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${chipAnim ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: '#34D399' }}
        />
      )}
      {chip.text}
    </span>
  )

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `radial-gradient(120% 120% at 80% 20%, ${bgEnd} 0%, ${bg} 55%)`, color: text }}
      role="region"
      aria-label="Hero"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* ── LEFT: text ── */}
          <div>
            {eyebrow && (
              <p
                className={`text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] mb-5 ${heroClass('')}`}
                style={{ color: accent }}
              >
                {eyebrow}
              </p>
            )}

            {headline && (
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight break-words [overflow-wrap:anywhere] ${heroClass('animation-delay-200')}`}
              >
                {renderHeadline()}
              </h1>
            )}

            {description && (
              <p
                className={`mt-6 text-base sm:text-lg leading-relaxed max-w-xl ${heroClass('animation-delay-400')}`}
                style={{ color: mutedText }}
              >
                {description}
              </p>
            )}

            {buttons && buttons.length > 0 && (
              <div className={`mt-8 flex flex-wrap gap-4 ${heroClass('animation-delay-600')}`}>
                {buttons.map((btn) => {
                  const isPrimary = !btn.variant || btn.variant === 'primary'
                  return (
                    <a
                      key={btn.id || btn.url}
                      href={btn.url}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5"
                      style={buttonStyle(btn.variant)}
                    >
                      {!isPrimary && btn.icon && <DynamicIcon name={btn.icon} size={16} />}
                      {!isPrimary && !btn.icon && btn.variant !== 'ghost' && (
                        <DynamicIcon name="Play" size={16} color={accent} />
                      )}
                      {btn.label}
                      {isPrimary && <DynamicIcon name={btn.icon || 'ArrowRight'} size={16} />}
                    </a>
                  )
                })}
              </div>
            )}

            {/* ── Built with ── */}
            {builtWithLogos && builtWithLogos.length > 0 && (
              <div className={`mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 ${heroClass('animation-delay-600')}`}>
                {builtWithLabel && (
                  <span className="text-[11px] uppercase tracking-wider" style={{ color: hexToRgba(text, 0.4) }}>
                    {builtWithLabel}
                  </span>
                )}
                {builtWithLogos.map((item, i) => {
                  const logo = asMedia(item.logo)
                  return (
                    <React.Fragment key={item.id || item.text}>
                      {i > 0 && <span style={{ color: hexToRgba(text, 0.25) }}>|</span>}
                      <span className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: hexToRgba(text, 0.7) }}>
                        {logo?.url && (
                          <Image
                            src={logo.url}
                            alt={logo.alt || item.text}
                            width={24}
                            height={24}
                            style={{ height: '20px', width: 'auto', objectFit: 'contain' }}
                          />
                        )}
                        {item.text}
                      </span>
                    </React.Fragment>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT: Unified Education Cloud ── */}
          {hasCloud && (
            <div ref={vizRef} className="w-full">
              {/* Orbital visualization (all breakpoints) */}
              <div className="relative w-full max-w-[540px] mx-auto aspect-[3/4] sm:aspect-square">
                {/* Static guide rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[86%] aspect-square rounded-full" style={{ border: `1px solid ${hexToRgba(text, 0.07)}` }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] aspect-square rounded-full" style={{ border: `1px solid ${hexToRgba(text, 0.06)}` }} />

                {/* Wave ripple rings */}
                {animOn &&
                  [0, 1, 2].map((k) => (
                    <div
                      key={k}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46%] aspect-square"
                    >
                      <span
                        className="ch-ring-wave block w-full h-full rounded-full"
                        style={{
                          border: `1.5px solid ${hexToRgba(accent, 0.3)}`,
                          animationDelay: `${k * 1.6}s`,
                        }}
                      />
                    </div>
                  ))}

                {/* Center circle */}
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42%] sm:w-[38%] aspect-square rounded-full flex flex-col items-center justify-center text-center p-6 z-[5]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 24px 50px -18px rgba(37, 99, 235, 0.4)',
                    border: `1px solid ${hexToRgba(accent, 0.1)}`,
                  }}
                >
                  {centerMedia?.url ? (
                    <Image
                      src={centerMedia.url}
                      alt={centerMedia.alt || 'Logo'}
                      width={120}
                      height={40}
                      style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
                    />
                  ) : (
                    <span className="text-xl font-extrabold" style={{ color: text }}>
                      Samarth<span style={{ color: accent }}>X</span>
                    </span>
                  )}
                  {cloudPanelTitle && (
                    <span className="mt-1 text-[11px] leading-tight" style={{ color: mutedText }}>
                      {cloudPanelTitle}
                    </span>
                  )}
                </div>

                {/* Corner cards */}
                {orbitCards.map((card, i) => (
                  <div
                    key={card.id || `${card.title}-${i}`}
                    className="absolute z-[6] w-[46%] lg:w-[33%]"
                    style={{
                      ...(cardPositions[i] || {}),
                      opacity: cardAnim ? (vizInView ? 1 : 0) : 1,
                      transform: cardAnim && !vizInView ? 'translateY(20px)' : undefined,
                      transition: 'opacity 0.6s ease, transform 0.6s ease',
                      transitionDelay: cardAnim ? `${i * 120}ms` : undefined,
                    }}
                  >
                    <div
                      className={cardAnim && vizInView ? 'ch-card-float' : ''}
                      style={{ animationDelay: `${i * 0.9}s` }}
                    >
                      <CardInner card={card} />
                    </div>
                  </div>
                ))}

                {/* Floating pills */}
                {cloudChips?.[0] && (
                  <div className="absolute top-[3%] left-1/2 -translate-x-1/2 z-10">
                    <Pill chip={cloudChips[0]} />
                  </div>
                )}
                {cloudChips?.[1] && (
                  <div className="absolute bottom-[1%] left-1/2 -translate-x-1/2 z-10">
                    <Pill chip={cloudChips[1]} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
