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
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (<div className="p-3 border border-red-300 bg-red-50"><p className="font-mono text-xs text-red-700">{error}</p></div>)}
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
        <p className="font-mono text-xs text-muted text-center mt-8">
          Already have an account?{' '}
          <Link href="/login" className="text-ink underline hover:no-underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
