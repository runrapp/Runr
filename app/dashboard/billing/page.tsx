'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

const PLANS = {
  starter: {
    name: 'Starter',
    price: '$25',
    features: ['500 tasks/mo', 'Email + Calendar', 'Web research', '2 integrations', '30-day history'],
    checkout: 'https://runr.lemonsqueezy.com/checkout/buy/ac2a9b22-66a4-4a89-9777-16299cbdb1c5',
  },
  pro: {
    name: 'Pro',
    price: '$75',
    features: ['Unlimited tasks', 'All integrations', 'Custom skills', 'Priority execution', 'API access', 'Unlimited history'],
    checkout: 'https://runr.lemonsqueezy.com/checkout/buy/f6aff73d-726c-4962-8410-3445ec3994f7',
  },
}

function BillingContent() {
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') as 'starter' | 'pro' | null
  const [currentSub, setCurrentSub] = useState<string | null>(null)

  useEffect(() => {
    setCurrentSub(localStorage.getItem('runr_subscription'))
  }, [])

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
  }

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p custom={0} variants={fadeUp} className="font-mono text-sm text-muted mb-8 max-w-lg">
        {currentSub
          ? `You're on the ${currentSub.charAt(0).toUpperCase() + currentSub.slice(1)} plan.`
          : 'Choose a plan to unlock integrations and start automating.'}
      </motion.p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border max-w-2xl">
        {(Object.entries(PLANS) as [string, typeof PLANS.starter][]).map(([key, plan], i) => {
          const isHighlighted = planParam === key
          const isActive = currentSub === key

          return (
            <motion.div key={key} custom={i + 1} variants={fadeUp}
              className={`bg-white p-6 sm:p-8 ${isHighlighted ? 'ring-2 ring-ink' : ''}`}>
              <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">{plan.name}</p>
              <div className="mb-6">
                <span className="font-display text-4xl sm:text-5xl tracking-display text-ink">{plan.price}</span>
                <span className="font-mono text-sm text-muted">/mo</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="font-mono text-sm text-muted">• {f}</li>
                ))}
              </ul>
              {isActive ? (
                <span className="font-mono text-xs uppercase tracking-[2px] text-ink inline-block px-6 py-3 border border-ink bg-surface">
                  ● Current plan
                </span>
              ) : (
                <a href={plan.checkout}
                  className="font-mono text-xs uppercase tracking-[2px] inline-block px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-150 hover:-translate-y-[2px]">
                  Subscribe — {plan.price}/mo
                </a>
              )}
            </motion.div>
          )
        })}
      </div>

      <motion.div custom={4} variants={fadeUp} className="mt-8 p-6 border border-border max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">Custom</p>
        <p className="font-mono text-sm text-muted mb-4">
          Need a dedicated instance, SSO, or custom integrations?
        </p>
        <a href="mailto:runrapp69@gmail.com?subject=Runr%20Custom%20Plan&body=Hi%2C%20I%27m%20interested%20in%20a%20custom%20Runr%20plan."
          className="font-mono text-xs uppercase tracking-[2px] inline-block px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-150 hover:-translate-y-[2px]">
          Contact us
        </a>
      </motion.div>
    </motion.div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<p className="font-mono text-sm text-muted">Loading...</p>}>
      <BillingContent />
    </Suspense>
  )
}
