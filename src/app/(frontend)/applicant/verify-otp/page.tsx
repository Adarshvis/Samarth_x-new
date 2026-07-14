'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyOtpPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/applicant/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Verification failed.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (!email) return
    setResending(true)
    setResent(false)
    try {
      await fetch('/api/applicant/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resend: true }),
      })
      setResent(true)
    } catch {
      // silent
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2 className="auth-card__title">Registration Successful!</h2>
          <p className="auth-card__desc" style={{ marginTop: '0.5rem' }}>
            Your account has been verified successfully. You can now log in to access your dashboard.
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
        <h2 className="auth-card__title">Verify Your Email</h2>
        <p className="auth-card__subtitle">
          A 6-digit OTP was sent to <strong>{email}</strong>. Please enter it below.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {resent && <div className="auth-success">OTP resent successfully!</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__field">
            <span className="auth-form__label">One-Time Password (OTP)</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit OTP"
              required
              className="auth-form__input auth-form__input--otp"
            />
          </label>

          <button type="submit" disabled={loading} className="auth-form__btn">
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-card__links">
          <button onClick={handleResend} disabled={resending} className="auth-link-btn">
            {resending ? 'Resending...' : "Didn't receive it? Resend OTP"}
          </button>
          <span><Link href="/applicant/signup">← Back to Signup</Link></span>
        </div>
      </div>
    </div>
  )
}
