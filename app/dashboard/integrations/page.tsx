'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

interface IntegrationStatus {
  gmail: boolean
  calendar: boolean
  telegram: boolean
  discord: boolean
}

const integrationIcons = {
  gmail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 6l10 7 10-7" />
    </svg>
  ),
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 2v4M16 2v4" />
    </svg>
  ),
  telegram: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3L3 10l6 3" />
      <path d="M9 13l8-7" />
      <path d="M9 13v5l3-3" />
    </svg>
  ),
  discord: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4C7 4 5 5.5 4 7c-1.5 4-1 8 1 11 1.5 1.5 3.5 2 5 2l1-1.5" />
      <path d="M15 4c2 0 4 1.5 5 3 1.5 4 1 8-1 11-1.5 1.5-3.5 2-5 2l-1-1.5" />
      <circle cx="9.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<IntegrationStatus>({
    gmail: false,
    calendar: false,
    telegram: false,
    discord: false,
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)

  // Check connection status on mount
  useEffect(() => {
    // Check URL params from OAuth callback
    const connected = searchParams.get('connected')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (connected && success === 'true') {
      setStatus((prev) => ({ ...prev, [connected]: true }))
      setSuccessMessage(`${connected === 'gmail' ? 'Gmail' : 'Google Calendar'} connected successfully!`)
      // Save to localStorage
      localStorage.setItem(`runr_${connected}_connected`, 'true')
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/integrations')
    }

    if (error) {
      setErrorMessage(`Connection failed: ${error}`)
      window.history.replaceState({}, '', '/dashboard/integrations')
    }

    // Restore from localStorage
    setStatus({
      gmail: localStorage.getItem('runr_gmail_connected') === 'true',
      calendar: localStorage.getItem('runr_calendar_connected') === 'true',
      telegram: localStorage.getItem('runr_telegram_connected') === 'true',
      discord: localStorage.getItem('runr_discord_connected') === 'true',
    })

    // Auto-check Telegram & Discord status
    checkTelegramStatus()
    checkDiscordStatus()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkTelegramStatus = async () => {
    try {
      const res = await fetch('/api/telegram/webhook')
      const data = await res.json()
      if (data.status) {
        setStatus((prev) => ({ ...prev, telegram: true }))
        localStorage.setItem('runr_telegram_connected', 'true')
      }
    } catch {
      // Telegram not set up
    }
  }

  const checkDiscordStatus = async () => {
    try {
      const res = await fetch('/api/discord/interactions')
      const data = await res.json()
      if (data.status) {
        setStatus((prev) => ({ ...prev, discord: true }))
        localStorage.setItem('runr_discord_connected', 'true')
      }
    } catch {
      // Discord not set up
    }
  }

  const testIntegration = async (id: string) => {
    setTesting(id)
    try {
      if (id === 'gmail') {
        const res = await fetch('/api/gmail/read')
        const data = await res.json()
        if (data.error) {
          setErrorMessage(`Gmail: ${data.error}`)
        } else {
          setSuccessMessage(`Gmail working! Found ${data.count || 0} emails.`)
        }
      } else if (id === 'calendar') {
        const res = await fetch('/api/calendar/events')
        const data = await res.json()
        if (data.error) {
          setErrorMessage(`Calendar: ${data.error}`)
        } else {
          setSuccessMessage(`Calendar working! Found ${data.count || 0} upcoming events.`)
        }
      } else if (id === 'telegram') {
        const res = await fetch('/api/telegram/webhook')
        const data = await res.json()
        setSuccessMessage(data.status ? 'Telegram webhook is active!' : 'Telegram webhook not responding.')
      } else if (id === 'discord') {
        const res = await fetch('/api/discord/interactions')
        const data = await res.json()
        setSuccessMessage(data.status ? 'Discord interactions endpoint is active!' : 'Discord endpoint not responding.')
      }
    } catch {
      setErrorMessage(`Failed to test ${id}.`)
    }
    setTesting(null)
  }

  const handleDisconnect = (id: string) => {
    setStatus((prev) => ({ ...prev, [id]: false }))
    localStorage.removeItem(`runr_${id}_connected`)
    // Clear cookies for OAuth integrations
    if (id === 'gmail' || id === 'calendar') {
      document.cookie = `${id}_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${id}_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  }

  // Dismiss messages after 5s
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const t = setTimeout(() => setErrorMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [errorMessage])

  const integrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Read, summarize, and send email on your behalf.',
      icon: integrationIcons.gmail,
      connected: status.gmail,
      onConnect: () => { window.location.href = '/api/gmail/connect' },
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Create, edit, and manage your calendar events.',
      icon: integrationIcons.calendar,
      connected: status.calendar,
      onConnect: () => { window.location.href = '/api/calendar/connect' },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Send commands and get results via Telegram. Bot is pre-configured — just open it and send /start.',
      icon: integrationIcons.telegram,
      connected: status.telegram,
      onConnect: () => { window.open('https://t.me/Runr_ggbot', '_blank') },
      connectLabel: 'OPEN BOT',
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Slash commands in your server. Use /task, /status, /emails, /events.',
      icon: integrationIcons.discord,
      connected: status.discord,
      onConnect: () => { window.open('https://discord.com/oauth2/authorize?client_id=1483966577442291984&permissions=2147483648&scope=bot%20applications.commands', '_blank') },
      connectLabel: 'ADD TO SERVER',
    },
  ]

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p
        custom={0}
        variants={fadeUp}
        className="font-mono text-sm text-muted mb-8 max-w-lg"
      >
        Connect your services. The agent uses these to execute tasks on your behalf.
      </motion.p>

      {/* ─── Status Messages ─── */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 border border-ink/20 bg-surface"
        >
          <p className="font-mono text-sm text-ink">✅ {successMessage}</p>
        </motion.div>
      )}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 border border-red-300 bg-red-50"
        >
          <p className="font-mono text-sm text-red-700">⚠️ {errorMessage}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {integrations.map((integration, i) => (
          <motion.div
            key={integration.id}
            custom={i + 1}
            variants={fadeUp}
            className="bg-white p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-ink opacity-60">{integration.icon}</div>
                <div>
                  <h3 className="font-display text-xl tracking-display text-ink">
                    {integration.name.toUpperCase()}
                  </h3>
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
                    {integration.connected ? '● Connected' : '○ Not connected'}
                  </p>
                </div>
              </div>
              <span
                className={`status-dot mt-1.5 ${integration.connected ? 'active' : 'idle'}`}
              />
            </div>

            <p className="font-mono text-sm text-muted leading-relaxed mb-6">
              {integration.description}
            </p>

            <div className="flex items-center gap-3 justify-end">
              {integration.connected && (
                <button
                  onClick={() => testIntegration(integration.id)}
                  disabled={testing === integration.id}
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-ink hover:text-ink transition-all duration-150 disabled:opacity-40"
                >
                  {testing === integration.id ? 'Testing...' : 'Test'}
                </button>
              )}

              {integration.connected ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-red-400 hover:text-red-500 transition-all duration-150"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={integration.onConnect}
                  className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150"
                >
                  {integration.connectLabel || 'Connect'}
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
