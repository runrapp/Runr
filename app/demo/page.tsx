'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const DEMO_DURATION = 5 * 60 * 1000 // 5 minutes

export default function DemoPage() {
  const [step, setStep] = useState<'loading' | 'already_used' | 'intro' | 'connect' | 'active' | 'expired'>('loading')
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [botInfo, setBotInfo] = useState<{ id: string; username: string; name: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(DEMO_DURATION)
  const [endTime, setEndTime] = useState<number | null>(null)

  // Disconnect the bot
  const disconnectBot = useCallback(async (botId: string, botToken: string) => {
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`)
      await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId }),
      })
    } catch {
      // Silent fail — demo cleanup
    }
  }, [])

  // Check demo eligibility on mount
  useEffect(() => {
    // First check if there's an active session
    const savedEnd = sessionStorage.getItem('demo_end')
    const savedBotId = sessionStorage.getItem('demo_bot_id')
    const savedBotUsername = sessionStorage.getItem('demo_bot_username')
    const savedBotName = sessionStorage.getItem('demo_bot_name')

    if (savedEnd && savedBotId) {
      const end = parseInt(savedEnd)
      if (Date.now() < end) {
        setEndTime(end)
        setTimeLeft(end - Date.now())
        setBotInfo({ id: savedBotId, username: savedBotUsername || '', name: savedBotName || '' })
        setStep('active')
        return
      } else {
        // Expired — clean up
        const savedToken = sessionStorage.getItem('demo_token')
        if (savedToken) disconnectBot(savedBotId, savedToken)
        sessionStorage.clear()
      }
    }

    // Check if user already used demo
    fetch('/api/demo')
      .then(r => r.json())
      .then(data => {
        setStep(data.used ? 'already_used' : 'intro')
      })
      .catch(() => setStep('intro'))
  }, [disconnectBot])

  // Timer countdown
  useEffect(() => {
    if (step !== 'active' || !endTime) return

    const interval = setInterval(() => {
      const remaining = endTime - Date.now()
      if (remaining <= 0) {
        setTimeLeft(0)
        setStep('expired')
        const savedToken = sessionStorage.getItem('demo_token')
        const savedBotId = sessionStorage.getItem('demo_bot_id')
        if (savedBotId && savedToken) {
          disconnectBot(savedBotId, savedToken)
          sessionStorage.clear()
        }
        clearInterval(interval)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [step, endTime, disconnectBot])

  const handleConnect = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError(null)

    try {
      // Mark demo as used FIRST (prevents refresh exploit)
      const markRes = await fetch('/api/demo', { method: 'POST' })
      const markData = await markRes.json()

      if (!markRes.ok || markData.error) {
        if (markData.used) {
          setStep('already_used')
          return
        }
        setError(markData.error || 'Failed to start demo.')
        setLoading(false)
        return
      }

      // Connect bot
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to connect.')
        setLoading(false)
        return
      }

      const bot = data.bot
      setBotInfo(bot)

      const end = Date.now() + DEMO_DURATION
      setEndTime(end)
      setTimeLeft(DEMO_DURATION)
      sessionStorage.setItem('demo_token', token.trim())
      sessionStorage.setItem('demo_bot_id', bot.id)
      sessionStorage.setItem('demo_bot_username', bot.username)
      sessionStorage.setItem('demo_bot_name', bot.name)
      sessionStorage.setItem('demo_end', String(end))

      setStep('active')
    } catch {
      setError('Network error. Try again.')
    }
    setLoading(false)
  }

  const handleEndDemo = async () => {
    const savedToken = sessionStorage.getItem('demo_token')
    const savedBotId = sessionStorage.getItem('demo_bot_id')
    if (savedBotId && savedToken) {
      await disconnectBot(savedBotId, savedToken)
    }
    sessionStorage.clear()
    setStep('expired')
  }

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="font-logo text-4xl tracking-tight text-ink">RUNR</Link>
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mt-3">5-Minute Demo</p>
        </div>

        {/* ─── LOADING ─── */}
        {step === 'loading' && (
          <div className="text-center py-12">
            <p className="font-mono text-sm text-muted">Checking demo eligibility...</p>
          </div>
        )}

        {/* ─── ALREADY USED ─── */}
        {step === 'already_used' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-border p-6 sm:p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-surface">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l2.5 2.5L16 9" />
                </svg>
              </div>
              <h2 className="font-display text-2xl tracking-display text-ink mb-3">DEMO ALREADY USED</h2>
              <p className="font-mono text-sm text-muted leading-relaxed mb-6">
                You&apos;ve already used your free demo. Subscribe to get unlimited access with all integrations.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/billing"
                  className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 text-center">
                  View plans
                </Link>
                <Link href="/dashboard/integrations"
                  className="w-full font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-3 hover:border-ink hover:text-ink transition-all duration-150 text-center">
                  Go to dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── INTRO ─── */}
        {step === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-border p-6 sm:p-8 mb-6">
              <h2 className="font-display text-2xl tracking-display text-ink mb-4">TRY RUNR FREE</h2>
              <p className="font-mono text-sm text-muted leading-relaxed mb-4">
                Connect your Telegram bot and test Runr for 5 minutes. After 5 minutes, your bot is automatically disconnected.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="font-mono text-sm text-muted">✓ Telegram integration only</li>
                <li className="font-mono text-sm text-muted">✓ Full agent capabilities</li>
                <li className="font-mono text-sm text-muted">✓ Auto-disconnects after 5 min</li>
                <li className="font-mono text-sm text-muted/50">✗ Gmail, Calendar, Discord</li>
                <li className="font-mono text-sm text-muted/50">✗ One-time only per account</li>
              </ul>
              <button
                onClick={() => setStep('connect')}
                className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150"
              >
                Start demo
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── CONNECT ─── */}
        {step === 'connect' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-border p-6 sm:p-8">
              <h2 className="font-display text-xl tracking-display text-ink mb-4">CONNECT TELEGRAM BOT</h2>
              <div className="bg-surface p-4 mb-6">
                <p className="font-mono text-xs text-muted leading-relaxed">
                  <span className="text-ink font-medium">How to get a bot token:</span><br />
                  1. Open Telegram, search for @BotFather<br />
                  2. Send /newbot and follow the prompts<br />
                  3. Copy the API token and paste below
                </p>
              </div>

              {error && (
                <div className="p-3 border border-red-300 bg-red-50 mb-4">
                  <p className="font-mono text-xs text-red-700">{error}</p>
                </div>
              )}

              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="123456:ABC-DEF1234..."
                className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('intro')}
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-3 hover:border-ink hover:text-ink transition-all duration-150"
                >
                  Back
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!token.trim() || loading}
                  className="flex-1 font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40"
                >
                  {loading ? 'Connecting...' : 'Connect & start timer'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── ACTIVE DEMO ─── */}
        {step === 'active' && botInfo && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-border p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted">Time remaining</p>
                  <p className={`font-display text-4xl tracking-display ${timeLeft < 60000 ? 'text-red-500' : 'text-ink'}`}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
                <div className="w-12 h-12 relative">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#E0DDD6" strokeWidth="3" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke={timeLeft < 60000 ? '#EF4444' : '#0F0F0F'} strokeWidth="3"
                      strokeDasharray={`${(timeLeft / DEMO_DURATION) * 125.66} 125.66`}
                      strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="bg-surface p-4 mb-6">
                <p className="font-mono text-xs text-muted mb-1">Connected bot</p>
                <p className="font-mono text-sm text-ink font-medium">@{botInfo.username}</p>
                <p className="font-mono text-xs text-muted mt-2">
                  Open Telegram and send a message to your bot. Try: &quot;/task what can you do?&quot;
                </p>
              </div>

              <div className="w-full h-1 bg-border mb-6 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${timeLeft < 60000 ? 'bg-red-500' : 'bg-ink'}`}
                  style={{ width: `${(timeLeft / DEMO_DURATION) * 100}%` }}
                />
              </div>

              <button
                onClick={handleEndDemo}
                className="w-full font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2.5 hover:border-red-400 hover:text-red-500 transition-all duration-150"
              >
                End demo early
              </button>
            </div>

            <p className="font-mono text-xs text-muted text-center mt-6">
              Like it?{' '}
              <Link href="/dashboard/billing" className="text-ink underline hover:no-underline">Subscribe for full access</Link>
            </p>
          </motion.div>
        )}

        {/* ─── EXPIRED ─── */}
        {step === 'expired' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="border border-border p-6 sm:p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-surface">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="16" cy="16" r="12" />
                  <path d="M16 10v6l4 2" />
                </svg>
              </div>
              <h2 className="font-display text-2xl tracking-display text-ink mb-3">DEMO ENDED</h2>
              <p className="font-mono text-sm text-muted leading-relaxed mb-6">
                Your Telegram bot has been disconnected. Subscribe to get unlimited access with all integrations.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard/billing"
                  className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150 text-center">
                  View plans
                </Link>
                <Link href="/dashboard/integrations"
                  className="w-full font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-3 hover:border-ink hover:text-ink transition-all duration-150 text-center">
                  Go to dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
