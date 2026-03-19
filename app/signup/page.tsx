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

  const handleGitHubSignup = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'github',
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

        {/* GitHub OAuth */}
        <button onClick={handleGitHubSignup}
          className="w-full flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[2px] border border-border text-ink px-4 py-3 hover:bg-surface transition-colors duration-150 mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
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
