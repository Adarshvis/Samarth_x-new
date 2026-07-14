'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/applicant/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      await res.json()
      // Always show success (even if email not found — security)
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-card__title">Request password reset</h2>
        <p className="auth-card__subtitle auth-card__subtitle--red">We can help you reset your password.</p>

        {!success ? (
          <>
            <p className="auth-card__desc">
              Enter your registered email below, click on the &ldquo;Send&rdquo; button, and we&apos;ll send you a link to reset your password.
            </p>
            {error && <div className="auth-error">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
              <label className="auth-form__field">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="auth-form__input"
                />
              </label>
              <button type="submit" disabled={loading} className="auth-form__btn">
                {loading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success" style={{ marginTop: '1rem' }}>
            If this email is registered, you will receive a password reset link shortly. Please check your inbox.
          </div>
        )}

        <div className="auth-card__links" style={{ marginTop: '1.5rem' }}>
          <Link href="/applicant/login">← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
