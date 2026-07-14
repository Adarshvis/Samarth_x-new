'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { question: `${a} + ${b} = ?`, answer: a + b }
}

export default function SignupPage() {
  const router = useRouter()
  const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    // mobile: '',
    captcha: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCaptcha(generateCaptcha())
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.email !== form.confirmEmail) {
      setError('Emails do not match.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!captcha || String(form.captcha) !== String(captcha.answer)) {
      setError('Incorrect verification answer.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/applicant/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          // mobile: form.mobile,
          captchaAnswer: Number(form.captcha),
          captchaExpected: captcha.answer,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed.')
        return
      }
      router.push(`/applicant/verify-otp?email=${encodeURIComponent(form.email)}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-card__title">Signup</h2>
        <p className="auth-card__subtitle">Please fill out the following fields to signup.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__field">
            <span className="auth-form__label">Full Name</span>
            <input name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Applicant's Full Name" required className="auth-form__input" />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Applicant's Email Address" required className="auth-form__input" />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Confirm Email</span>
            <input name="confirmEmail" type="email" value={form.confirmEmail} onChange={handleChange} placeholder="Confirm Email Address" required className="auth-form__input" />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Password <span className="auth-form__hint">(Minimum 8 characters)</span></span>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password (Minimum 8 characters)" required className="auth-form__input" />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Confirm Password</span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required className="auth-form__input" />
          </label>

          {/* Mobile field hidden for now */}
          {/* <label className="auth-form__field">
            <span className="auth-form__label">Mobile</span>
            <input name="mobile" type="tel" value={form.mobile} onChange={handleChange} placeholder="Applicant's Mobile No." required className="auth-form__input" />
          </label> */}

          <label className="auth-form__field">
            <span className="auth-form__label">Verification Code {captcha ? <span className="auth-captcha-question">{captcha.question}</span> : <span className="auth-captcha-question">Loading...</span>}</span>
            <input name="captcha" type="text" inputMode="numeric" value={form.captcha} onChange={handleChange} placeholder="Enter answer" required className="auth-form__input" />
          </label>

          <button type="submit" disabled={loading} className="auth-form__btn">
            {loading ? 'Creating account...' : 'Signup'}
          </button>
        </form>

        <div className="auth-card__links">
          <span>Returning User? <Link href="/applicant/login">Login</Link></span>
        </div>
      </div>
    </div>
  )
}
