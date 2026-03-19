'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })

      if (error) { setError(error.message); setLoading(false); return }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="font-logo text-4xl tracking-tight text-ink">RUNR</Link>
          <div className="mt-12 p-6 border border-border">
            <p className="font-mono text-sm text-ink mb-2">Check your email</p>
            <p className="font-mono text-xs text-muted leading-relaxed">
              We sent a confirmation link to <span className="text-ink">{email}</span>. Click the link to activate your account.
            </p>
          </div>
          <p className="font-mono text-xs text-muted mt-6">
            <Link href="/login" className="text-ink underline hover:no-underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <Link href="/" className="font-logo text-4xl tracking-tight text-ink">RUNR</Link>
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mt-3">Create your account</p>
        </div>

        {error && (<div className="p-3 border border-red-300 bg-red-50 mb-4"><p className="font-mono text-xs text-red-700">{error}</p></div>)}

        {/* Google OAuth */}
        <button onClick={handleGoogleSignup}
          className="w-full flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[2px] border border-border text-ink px-4 py-3 hover:bg-surface transition-colors duration-150 mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors"
              placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40 mt-2">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="flex flex-col items-center gap-2 mt-8">
          <p className="font-mono text-xs text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-ink underline hover:no-underline">Sign in</Link>
          </p>
          <Link href="/demo" className="font-mono text-xs text-muted hover:text-ink underline transition-colors">
            Try the demo →
          </Link>
        </div>
      </div>
    </div>
  )
}
