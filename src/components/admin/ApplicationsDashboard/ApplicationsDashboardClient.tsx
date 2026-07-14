'use client'

import React, { useState, useTransition } from 'react'

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

interface Stats {
  total: number
  new: number
  reviewed: number
  shortlisted: number
  rejected: number
}

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


export default function ApplicationsDashboardClient({
  applications: initialApplications,
  stats,
}: {
  applications: Application[]
  stats: Stats
}) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      app.applicantName?.toLowerCase().includes(q) ||
      app.email?.toLowerCase().includes(q) ||
      app.jobTitle?.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      const endpoint = `/api/job-applications/${id}`
      const res =
        newStatus === 'deleted'
          ? await fetch(endpoint, {
              method: 'DELETE',
              credentials: 'include',
            })
          : await fetch(endpoint, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus }),
              credentials: 'include',
            })

      if (!res.ok) {
        throw new Error(`Status update failed: ${res.status}`)
      }

      setApplications((prev) => {
        if (newStatus === 'deleted') {
          return prev.filter((app) => app.id !== id)
        }
        return prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      })
    })
  }

  const statCards = [
    { label: 'Total Applications', value: stats.total, color: '#1e3a5f', icon: '📋' },
    { label: 'New', value: stats.new, color: '#3b82f6', icon: '🆕' },
    { label: 'Shortlisted', value: stats.shortlisted, color: '#10b981', icon: '✅' },
    { label: 'Reviewed', value: stats.reviewed, color: '#f59e0b', icon: '👀' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: '❌' },
  ]

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

    const allHeaders = Array.from(
      new Set(flattenedRows.flatMap((row) => Object.keys(row))),
    ).filter((h) => h !== 'resume' && !h.startsWith('resume.'))

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
    <div style={{ padding: '2rem', fontFamily: 'inherit' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#111827' }}>
            Applications Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Review and manage all job applications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport('csv')}
            style={{
              background: '#f8fafc',
              color: '#1e3a5f',
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #dce4ef',
              fontSize: '0.825rem',
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
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #dce4ef',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Export Excel
          </button>
          <button
            onClick={() => window.open('/admin/collections/job-applications/create', '_self')}
            style={{
              background: '#1e3a5f',
              color: '#fff',
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + New Application
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{card.icon}</div>
            <div
              style={{ fontSize: '2rem', fontWeight: 800, color: card.color, lineHeight: 1 }}
            >
              {card.value}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.3rem' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            padding: '0.55rem 0.875rem',
            fontSize: '0.875rem',
            outline: 'none',
            color: '#111827',
          }}
        />

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: filterStatus === s ? '#1e3a5f' : '#d1d5db',
                background: filterStatus === s ? '#1e3a5f' : '#f9fafb',
                color: filterStatus === s ? '#fff' : '#374151',
                fontWeight: filterStatus === s ? 600 : 400,
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '1rem',
            }}
          >
            No applications found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Applicant', 'Position', 'Contact', 'Highest Qualification', 'Status', 'Resume'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
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
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = '#f9fafb')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLTableRowElement).style.background = '#fff')
                    }
                  >
                    {/* Applicant */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: '#111827',
                          fontSize: '0.9rem',
                        }}
                      >
                        {app.applicantName || '—'}
                      </div>
                    </td>

                    {/* Position */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#374151',
                        }}
                      >
                        {app.jobTitle || '—'}
                      </span>
                    </td>

                    {/* Contact */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ fontSize: '0.8rem', color: '#374151' }}>{app.email}</div>
                      {app.phone && (
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{app.phone}</div>
                      )}
                    </td>

                    {/* Highest Qualification */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {getHighestQualification(app)}
                      </span>
                    </td>

                    {/* Status dropdown */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <select
                        value={app.status || 'new'}
                        disabled={isPending}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          border: `1px solid ${statusStyle.color}`,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          padding: '0.3rem 0.6rem',
                          borderRadius: '999px',
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'capitalize',
                        }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Resume */}
                    <td style={{ padding: '0.875rem 1rem' }}>
                      {app.resume?.url ? (
                        <a
                          href={app.resume.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: '#f0f4f8',
                            color: '#1e3a5f',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '0.375rem',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            border: '1px solid #dce4ef',
                          }}
                        >
                          ↓ Download
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>No file</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
