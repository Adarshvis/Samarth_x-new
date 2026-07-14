'use client'

import React, { useState, useCallback } from 'react'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#3b82f6', bg: '#eff6ff' },
  { value: 'reviewed', label: 'Reviewed', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'shortlisted', label: 'Shortlisted', color: '#10b981', bg: '#f0fdf4' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
  { value: 'deleted', label: 'Delete', color: '#7f1d1d', bg: '#fee2e2' },
]

function getStatusStyle(status: string | null | undefined) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status) || {
      color: '#6b7280',
      bg: '#f9fafb',
      label: status || 'Unknown',
    }
  )
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—'
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

interface Application {
  id: string
  applicantName?: string | null
  email?: string | null
  phone?: string | null
  jobTitle?: string | null
  highestQualification?: string | null
  status?: string | null
  createdAt?: string | null
  resume?: { id: string; filename?: string | null; url?: string | null } | null
  extraData?: Record<string, unknown> | null
}

function getHighestQualification(app: Application): string {
  const direct = app.highestQualification
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const extra = app.extraData
  if (!extra || typeof extra !== 'object') return '—'

  const candidates = [
    'highestQualification',
    'highest_qualification',
    'highest qualification',
    'highestEducation',
    'qualification',
  ]

  for (const key of candidates) {
    const value = (extra as Record<string, unknown>)[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return '—'
}

function flattenExportRecord(value: unknown, prefix = '', out: Record<string, string> = {}) {
  if (value === null || value === undefined) {
    if (prefix) out[prefix] = ''
    return out
  }

  if (Array.isArray(value)) {
    out[prefix] = value
      .map((item) => (typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)))
      .join(' | ')
    return out
  }

  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      flattenExportRecord(nested, nextPrefix, out)
    }
    return out
  }

  out[prefix] = String(value)
  return out
}

function csvEscape(value: string) {
  const needsQuotes = /[",\n]/.test(value)
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
}

export default function ApplicationsWidget() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-applications?limit=200&sort=-createdAt&depth=1', {
        credentials: 'include',
      })
      const data = await res.json()
      setApplications(data.docs || [])
    } catch {
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleToggle() {
    if (!open) fetchApplications()
    setOpen((v) => !v)
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdating(id)
    try {
      const endpoint = `/api/job-applications/${id}`
      const res =
        status === 'deleted'
          ? await fetch(endpoint, {
              method: 'DELETE',
              credentials: 'include',
            })
          : await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ status }),
            })

      if (!res.ok) {
        throw new Error(`Status update failed: ${res.status}`)
      }

      setApplications((prev) => {
        if (status === 'deleted') {
          return prev.filter((app) => app.id !== id)
        }
        return prev.map((app) => (app.id === id ? { ...app, status } : app))
      })
    } finally {
      setUpdating(null)
    }
  }

  const filtered = applications.filter((app) => {
    const matchStatus = filterStatus === 'all' || app.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      app.applicantName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === 'new').length,
    reviewed: applications.filter((a) => a.status === 'reviewed').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  function downloadFile(content: string, fileName: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  function handleExport(format: 'csv' | 'excel') {
    if (!applications.length) return

    const flattenedRows = applications.map((app) => {
      const record = flattenExportRecord(app)
      record.highestQualification = getHighestQualification(app)
      if (app.createdAt) record.submittedDate = formatDate(app.createdAt)
      delete record.createdAt
      for (const key of Object.keys(record)) {
        if (key === 'resume' || key.startsWith('resume.')) {
          delete record[key]
        }
      }
      return record
    })

    const preferredHeaders = [
      'id',
      'applicantName',
      'jobTitle',
      'highestQualification',
      'email',
      'phone',
      'status',
      'submittedDate',
    ]

    const allHeaders = Array.from(new Set(flattenedRows.flatMap((row) => Object.keys(row))))
      .filter((h) => h !== 'resume' && !h.startsWith('resume.'))
    const orderedHeaders = [
      ...preferredHeaders.filter((h) => allHeaders.includes(h)),
      ...allHeaders.filter((h) => !preferredHeaders.includes(h)).sort(),
    ]

    if (format === 'csv') {
      const lines = [orderedHeaders.join(',')]
      for (const row of flattenedRows) {
        const values = orderedHeaders.map((header) => csvEscape(row[header] || ''))
        lines.push(values.join(','))
      }
      downloadFile(lines.join('\n'), `applications-${Date.now()}.csv`, 'text/csv;charset=utf-8')
      return
    }

    const tsvLines = [orderedHeaders.join('\t')]
    for (const row of flattenedRows) {
      const values = orderedHeaders.map((header) => (row[header] || '').replace(/\t/g, ' '))
      tsvLines.push(values.join('\t'))
    }

    downloadFile(
      tsvLines.join('\n'),
      `applications-${Date.now()}.xls`,
      'application/vnd.ms-excel;charset=utf-8',
    )
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Section header */}
      <h2
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: 'var(--theme-text, #1f2937)',
        }}
      >
        Job Applications
      </h2>

      {/* Native-style card button */}
      <button
        onClick={handleToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          width: '220px',
          background: open
            ? 'var(--theme-elevation-100, #f3f4f6)'
            : 'var(--theme-elevation-50, #f9fafb)',
          border: `1px solid ${open ? 'var(--theme-elevation-300, #d1d5db)' : 'var(--theme-elevation-150, #e5e7eb)'}`,
          borderRadius: '0.5rem',
          textDecoration: 'none',
          color: 'var(--theme-text, #111827)',
          fontWeight: 500,
          fontSize: '0.95rem',
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.15s, border-color 0.15s',
          textAlign: 'left',
        }}
      >
        <span>Applications Dashboard</span>
        <span
          style={{
            fontSize: '1.1rem',
            color: 'var(--theme-elevation-400, #9ca3af)',
            transform: open ? 'rotate(45deg)' : 'none',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}
        >
          +
        </span>
      </button>

      {/* Inline Dashboard */}
      {open && (
        <div
          style={{
            marginTop: '1.5rem',
            border: '1px solid var(--theme-elevation-150, #e5e7eb)',
            borderRadius: '0.75rem',
            background: 'var(--theme-bg, #fff)',
            overflow: 'hidden',
          }}
        >
          {/* Dashboard header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Applications Dashboard
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#6b7280' }}>
                Review and manage all job applications
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleExport('csv')}
                style={{
                  background: '#f8fafc',
                  color: '#1e3a5f',
                  border: '1px solid #dce4ef',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Export CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                style={{
                  background: '#f8fafc',
                  color: '#1e3a5f',
                  border: '1px solid #dce4ef',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Export Excel
              </button>
              <button
                onClick={() => fetchApplications()}
                style={{
                  background: '#1e3a5f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
              Loading applications...
            </div>
          ) : (
            <>
              {/* Stat cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '0',
                  borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
                }}
              >
                {[
                  { label: 'Total', value: stats.total, color: '#1e3a5f' },
                  { label: 'New', value: stats.new, color: '#3b82f6' },
                  { label: 'Shortlisted', value: stats.shortlisted, color: '#10b981' },
                  { label: 'Reviewed', value: stats.reviewed, color: '#f59e0b' },
                  { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
                ].map((s, i, arr) => (
                  <div
                    key={s.label}
                    style={{
                      padding: '1rem',
                      textAlign: 'center',
                      borderRight: i < arr.length - 1 ? '1px solid var(--theme-elevation-100, #f3f4f6)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: '0.73rem', color: '#6b7280', marginTop: '0.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div
                style={{
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid var(--theme-elevation-100, #f3f4f6)',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  placeholder="Search by name, email or position..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '180px',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    padding: '0.45rem 0.75rem',
                    fontSize: '0.82rem',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      border: '1px solid',
                      borderColor: filterStatus === s ? '#1e3a5f' : '#d1d5db',
                      background: filterStatus === s ? '#1e3a5f' : 'transparent',
                      color: filterStatus === s ? '#fff' : '#374151',
                      fontWeight: filterStatus === s ? 600 : 400,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      fontFamily: 'inherit',
                    }}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Table */}
              {filtered.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                  No applications found.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Applicant', 'Position', 'Contact', 'Highest Qualification', 'Status', 'Resume'].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: '0.65rem 1rem',
                              textAlign: 'left',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#6b7280',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #f3f4f6',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((app, idx) => {
                        const statusStyle = getStatusStyle(app.status)
                        return (
                          <tr
                            key={app.id}
                            style={{
                              borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
                            }}
                          >
                            <td style={{ padding: '0.75rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>
                              {app.applicantName || '—'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#374151' }}>
                              {app.jobTitle || '—'}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontSize: '0.78rem', color: '#374151' }}>{app.email}</div>
                              {app.phone && <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{app.phone}</div>}
                            </td>
                            <td style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#6b7280' }}>
                              {getHighestQualification(app)}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <select
                                value={app.status || 'new'}
                                disabled={updating === app.id}
                                onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                style={{
                                  border: `1px solid ${statusStyle.color}`,
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 600,
                                  fontSize: '0.72rem',
                                  padding: '0.28rem 0.55rem',
                                  borderRadius: '999px',
                                  cursor: 'pointer',
                                  outline: 'none',
                                  textTransform: 'capitalize',
                                  fontFamily: 'inherit',
                                }}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              {app.resume?.url ? (
                                <a
                                  href={app.resume.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-block',
                                    background: '#f0f4f8',
                                    color: '#1e3a5f',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    textDecoration: 'none',
                                    border: '1px solid #dce4ef',
                                  }}
                                >
                                  ↓ Download
                                </a>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>No file</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
