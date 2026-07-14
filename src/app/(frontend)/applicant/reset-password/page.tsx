'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/applicant/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password, confirmPassword: form.confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Reset failed.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2 className="auth-card__title">Invalid Link</h2>
          <p className="auth-card__subtitle">This reset link is invalid or has expired.</p>
          <div className="auth-card__links"><Link href="/applicant/forgot-password">Request a new link</Link></div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 className="auth-card__title">Password Reset Successful!</h2>
          <p className="auth-card__desc" style={{ marginTop: '0.5rem' }}>
            Your password has been updated successfully. You can now log in with your new password.
          </p>
          <Link href="/applicant/login" className="auth-form__btn" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center', marginTop: '1.25rem' }}>
            ← Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-card__title">Set New Password</h2>
        <p className="auth-card__subtitle">Enter your new password below.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__field">
            <span className="auth-form__label">New Password <span className="auth-form__hint">(Minimum 8 characters)</span></span>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" required className="auth-form__input" />
          </label>
          <label className="auth-form__field">
            <span className="auth-form__label">Confirm New Password</span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required className="auth-form__input" />
          </label>
          <button type="submit" disabled={loading} className="auth-form__btn">
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
