'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function EmailConfirmedPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm text-center"
      >
        <Link href="/" className="font-logo text-4xl tracking-tight text-ink">RUNR</Link>

        <div className="mt-12 border border-border p-8">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-surface">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0F0F0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <h1 className="font-display text-2xl tracking-display text-ink mb-3">EMAIL CONFIRMED</h1>
          <p className="font-mono text-sm text-muted leading-relaxed">
            Your email has been verified successfully. You&apos;re all set — sign in to start using Runr.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-8 w-full inline-block font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 text-center"
        >
          Go to sign in
        </Link>

        <p className="font-mono text-xs text-muted mt-6">
          Need help?{' '}
          <a href="mailto:hello@runr.site" className="text-ink underline hover:no-underline">Contact us</a>
        </p>
      </motion.div>
    </div>
  )
}
