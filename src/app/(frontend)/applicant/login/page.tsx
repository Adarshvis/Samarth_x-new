'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { question: `${a} + ${b} = ?`, answer: a + b }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/applicant/dashboard'

  const [captcha, setCaptcha] = useState<{ question: string; answer: number } | null>(null)
  const [form, setForm] = useState({ email: '', password: '', captcha: '', remember: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCaptcha(generateCaptcha())
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!captcha || String(form.captcha) !== String(captcha.answer)) {
      setError('Incorrect verification answer.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/applicant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }
      router.push(redirect)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-card__title">Login</h2>
        <p className="auth-card__subtitle">Please fill out the following fields to login.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-form__field">
            <span className="auth-form__label">Registered Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your registered email"
              required
              className="auth-form__input"
            />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
              className="auth-form__input"
            />
          </label>

          <label className="auth-form__field">
            <span className="auth-form__label">Verify Code {captcha ? <span className="auth-captcha-question">{captcha.question}</span> : <span className="auth-captcha-question">Loading...</span>}</span>
            <input
              type="text"
              inputMode="numeric"
              name="captcha"
              value={form.captcha}
              onChange={handleChange}
              placeholder="Enter answer"
              required
              className="auth-form__input"
            />
          </label>

          <label className="auth-form__checkbox">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            <span>Remember Me</span>
          </label>

          <button type="submit" disabled={loading} className="auth-form__btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-card__links">
          <span>New User? <Link href="/applicant/signup">Signup</Link></span>
          <span>In case you don&apos;t remember your password, <Link href="/applicant/forgot-password">Click here to Reset Password</Link></span>
        </div>
      </div>
    </div>
  )
}
