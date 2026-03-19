'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

function SubscribeContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'starter'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const plans: Record<string, { name: string; price: string; features: string[] }> = {
    starter: { name: 'Starter', price: '$25', features: ['500 tasks/mo', 'Email + Calendar', '2 integrations', '30-day history'] },
    pro: { name: 'Pro', price: '$75', features: ['Unlimited tasks', 'All integrations', 'Custom skills', 'API access', 'Unlimited history'] },
  }

  const selectedPlan = plans[plan] || plans.starter

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      if (data.url) window.location.href = data.url
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <Link href="/" className="font-logo text-4xl tracking-tight text-ink">RUNR</Link>
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mt-3">Subscribe to continue</p>
        </div>
        <div className="border border-border p-8 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">{selectedPlan.name} Plan</p>
          <div className="mb-6">
            <span className="font-display text-5xl tracking-display text-ink">{selectedPlan.price}</span>
            <span className="font-mono text-sm text-muted">/mo</span>
          </div>
          <ul className="space-y-2 mb-6">
            {selectedPlan.features.map((f) => (<li key={f} className="font-mono text-sm text-muted">• {f}</li>))}
          </ul>
          {error && (<div className="p-3 border border-red-300 bg-red-50 mb-4"><p className="font-mono text-xs text-red-700">{error}</p></div>)}
          <button onClick={handleCheckout} disabled={loading}
            className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40">
            {loading ? 'Redirecting to checkout...' : `Subscribe — ${selectedPlan.price}/mo`}
          </button>
        </div>
        <div className="flex justify-between">
          <Link href="/#pricing" className="font-mono text-xs text-muted underline hover:text-ink">Compare plans</Link>
          <Link href="/dashboard/integrations" className="font-mono text-xs text-muted underline hover:text-ink">Back to dashboard</Link>
        </div>
      </div>
    </div>
  )
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><p className="font-mono text-sm text-muted">Loading...</p></div>}>
      <SubscribeContent />
    </Suspense>
  )
}
