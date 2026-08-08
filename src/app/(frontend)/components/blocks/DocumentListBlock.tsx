'use client'

import React from 'react'
import { Eye, Download, X, FileText, FileType2 } from 'lucide-react'
import SectionHeading from '../ui/SectionHeading'
import DynamicIcon from '../ui/DynamicIcon'

interface DocFile {
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  filesize?: number | null
}

interface DocItem {
  title: string
  subtitle?: string | null
  date?: string | null
  file?: DocFile | number | null
  icon?: string | null
  id?: string | null
}

interface DocumentListBlockProps {
  sectionHeading?: string | null
  sectionDescription?: string | null
  headingAlignment?: 'left' | 'center' | 'right' | null
  documents?: DocItem[] | null
  showIcon?: boolean | null
  showViewButton?: boolean | null
  showDownloadButton?: boolean | null
  viewLabel?: string | null
  downloadLabel?: string | null
  accentColor?: string | null
  cardBgColor?: string | null
  backgroundColor?: string | null
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

function asFile(val: DocItem['file']): DocFile | null {
  return val && typeof val === 'object' && val.url ? val : null
}

function isPdf(file: DocFile | null): boolean {
  if (!file) return false
  if (file.mimeType === 'application/pdf') return true
  return Boolean(file.filename?.toLowerCase().endsWith('.pdf'))
}

function formatDate(value?: string | null): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function formatSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export default function DocumentListBlock(props: DocumentListBlockProps) {
  const {
    sectionHeading,
    sectionDescription,
    headingAlignment,
    documents,
    showIcon = true,
    showViewButton = true,
    showDownloadButton = true,
    viewLabel = 'View',
    downloadLabel = 'Download',
    accentColor = '#F97316',
    cardBgColor = '#FFFFFF',
    backgroundColor = '#FFFFFF',
  } = props

  const [preview, setPreview] = React.useState<{ url: string; title: string } | null>(null)

  // Close the preview on Escape and lock background scroll while open.
  React.useEffect(() => {
    if (!preview) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [preview])

  if (!documents || documents.length === 0) return null

  const accent = accentColor || '#F97316'
  const cardBg = cardBgColor || '#FFFFFF'

  return (
    <section className="py-14 md:py-16 px-6" style={{ backgroundColor: backgroundColor || '#FFFFFF' }}>
      <div className="max-w-5xl mx-auto">
        <SectionHeading
          heading={sectionHeading}
          description={sectionDescription}
          alignment={headingAlignment}
        />

        <div className="flex flex-col gap-4">
          {documents.map((doc, i) => {
            const file = asFile(doc.file)
            const pdf = isPdf(file)
            const dateLabel = formatDate(doc.date)
            const sizeLabel = formatSize(file?.filesize)
            const meta = [dateLabel, sizeLabel].filter(Boolean).join('  ·  ')
            // When there is no subtitle/meta, the single title line centers
            // against the icon thanks to `items-center` on the row.
            const hasSecondLine = Boolean(doc.subtitle || meta)

            return (
              <div
                key={doc.id || `${doc.title}-${i}`}
                className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ backgroundColor: cardBg }}
              >
                {/* ── Icon + text ── */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {showIcon !== false && (
                    <div
                      className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: hexToRgba(accent, 0.1), color: accent }}
                    >
                      {doc.icon ? (
                        <DynamicIcon name={doc.icon} size={20} color={accent} />
                      ) : pdf ? (
                        <FileText size={20} />
                      ) : (
                        <FileType2 size={20} />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug break-words">
                      {doc.title}
                    </p>
                    {hasSecondLine && (
                      <div className="mt-1 text-sm text-slate-500 break-words">
                        {doc.subtitle}
                        {doc.subtitle && meta ? <span className="mx-2">·</span> : null}
                        {meta && <span className="whitespace-nowrap">{meta}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-3 shrink-0 sm:ml-auto">
                  {showViewButton !== false && file?.url && pdf && (
                    <button
                      type="button"
                      onClick={() => setPreview({ url: file.url as string, title: doc.title })}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:brightness-95"
                      style={{ backgroundColor: hexToRgba(accent, 0.1), color: accent }}
                      aria-label={`${viewLabel || 'View'}: ${doc.title}`}
                    >
                      <Eye size={16} />
                      {viewLabel || 'View'}
                    </button>
                  )}

                  {showDownloadButton !== false && file?.url && (
                    <a 
                      href={file.url}
                      download={file.filename || undefined}
                      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline transition-colors hover:brightness-95"
                      style={{ backgroundColor: hexToRgba(accent, 0.14), color: accent }}
                      aria-label={`${downloadLabel || 'Download'}: ${doc.title}`}
          target="_blank"
          rel="noopener noreferrer"
        >
                      <Download size={16} />
                      {downloadLabel || 'Download'}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Inline PDF viewer ── */}
      {preview && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={preview.title}
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-gray-200">
              <p className="font-semibold text-slate-900 truncate">{preview.title}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={preview.url}
                  download
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium no-underline"
                  style={{ backgroundColor: hexToRgba(accent, 0.12), color: accent }}
          target="_blank"
          rel="noopener noreferrer"
        >
                  <Download size={15} />
                  {downloadLabel || 'Download'}
                </a>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-gray-100"
                  aria-label="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={preview.url}
              title={preview.title}
              className="flex-1 w-full border-0 bg-gray-50"
            />
          </div>
        </div>
      )}
    </section>
  )
}
