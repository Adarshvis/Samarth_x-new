'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

interface ApplicantUserSlotProps {
  name: string
}

export default function ApplicantUserSlot({ name }: ApplicantUserSlotProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function handleLogout() {
    await fetch('/api/applicant/logout', { method: 'POST' })
    router.push('/applicant/login')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}
      >
        {name}
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgb(0 0 0 / 15%)',
            minWidth: '130px',
            zIndex: 200,
          }}
        >
          <button
            onClick={handleLogout}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
              display: 'block',
              width: '100%',
              padding: '0.6rem 1rem',
              background: hovered ? '#fff1f1' : 'transparent',
              border: 'none',
              textAlign: 'left',
              fontSize: '0.875rem',
              color: hovered ? '#c0392b' : '#e53e3e',
              cursor: 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
