'use client'

import { Suspense, useState, useEffect } from 'react'
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

const icons = {
  gmail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 6l10 7 10-7" />
    </svg>
  ),
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M8 2v4M16 2v4" />
    </svg>
  ),
  telegram: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 3L3 10l6 3" /><path d="M9 13l8-7" /><path d="M9 13v5l3-3" />
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

interface BotInfo {
  id: string
  username: string
  name: string
}

interface ConnectionState {
  gmail: boolean
  calendar: boolean
  telegram: BotInfo | null
  discord: BotInfo | null
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<div className="font-mono text-sm text-muted">Loading integrations...</div>}>
      <IntegrationsContent />
    </Suspense>
  )
}

function IntegrationsContent() {
  const searchParams = useSearchParams()
  const [conn, setConn] = useState<ConnectionState>({
    gmail: false,
    calendar: false,
    telegram: null,
    discord: null,
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [modal, setModal] = useState<'telegram' | 'discord' | null>(null)
  const [loading, setLoading] = useState(false)

  // Telegram form
  const [tgToken, setTgToken] = useState('')

  // Discord form
  const [dcToken, setDcToken] = useState('')
  const [dcClientId, setDcClientId] = useState('')

  // Handle OAuth callback + restore state
  useEffect(() => {
    const connected = searchParams.get('connected')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (connected && success === 'true') {
      localStorage.setItem(`runr_${connected}`, 'true')
      setToast({ type: 'success', text: `${connected === 'gmail' ? 'Gmail' : 'Google Calendar'} connected!` })
      window.history.replaceState({}, '', '/dashboard/integrations')
    }
    if (error) {
      setToast({ type: 'error', text: `Connection failed: ${decodeURIComponent(error)}` })
      window.history.replaceState({}, '', '/dashboard/integrations')
    }

    // Restore from localStorage
    const tgData = localStorage.getItem('runr_telegram_bot')
    const dcData = localStorage.getItem('runr_discord_bot')

    setConn({
      gmail: localStorage.getItem('runr_gmail') === 'true',
      calendar: localStorage.getItem('runr_calendar') === 'true',
      telegram: tgData ? JSON.parse(tgData) : null,
      discord: dcData ? JSON.parse(dcData) : null,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 6000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // ── Connect Telegram ──
  const connectTelegram = async () => {
    if (!tgToken.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tgToken.trim() }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setToast({ type: 'error', text: data.error || 'Failed to connect Telegram bot.' })
        setLoading(false)
        return
      }

      const botInfo: BotInfo = data.bot
      setConn((prev) => ({ ...prev, telegram: botInfo }))
      localStorage.setItem('runr_telegram_bot', JSON.stringify(botInfo))
      setToast({ type: 'success', text: `Telegram bot @${botInfo.username} connected!` })
      setModal(null)
      setTgToken('')
    } catch {
      setToast({ type: 'error', text: 'Network error. Try again.' })
    }

    setLoading(false)
  }

  // ── Connect Discord ──
  const connectDiscord = async () => {
    if (!dcToken.trim() || !dcClientId.trim()) return
    setLoading(true)

    try {
      const res = await fetch('/api/discord/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken: dcToken.trim(), clientId: dcClientId.trim() }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setToast({ type: 'error', text: data.error || 'Failed to connect Discord bot.' })
        setLoading(false)
        return
      }

      const botInfo: BotInfo = data.bot
      setConn((prev) => ({ ...prev, discord: { ...botInfo, id: dcClientId.trim() } }))
      localStorage.setItem('runr_discord_bot', JSON.stringify({ ...botInfo, id: dcClientId.trim() }))
      setToast({ type: 'success', text: `Discord bot ${botInfo.name} connected! ${data.commandsRegistered} commands registered.` })
      setModal(null)
      setDcToken('')
      setDcClientId('')
    } catch {
      setToast({ type: 'error', text: 'Network error. Try again.' })
    }

    setLoading(false)
  }

  // ── Disconnect ──
  const disconnect = async (platform: string) => {
    if (platform === 'gmail' || platform === 'calendar') {
      setConn((prev) => ({ ...prev, [platform]: false }))
      localStorage.removeItem(`runr_${platform}`)
      document.cookie = `${platform}_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${platform}_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      return
    }

    if (platform === 'telegram' && conn.telegram) {
      await fetch('/api/telegram/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botId: conn.telegram.id }),
      })
      setConn((prev) => ({ ...prev, telegram: null }))
      localStorage.removeItem('runr_telegram_bot')
    }

    if (platform === 'discord' && conn.discord) {
      await fetch('/api/discord/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: conn.discord.id }),
      })
      setConn((prev) => ({ ...prev, discord: null }))
      localStorage.removeItem('runr_discord_bot')
    }
  }

  const integrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Read, summarize, and send email on your behalf.',
      icon: icons.gmail,
      connected: conn.gmail,
      detail: null,
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      description: 'Create, edit, and manage your calendar events.',
      icon: icons.calendar,
      connected: conn.calendar,
      detail: null,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      description: 'Create a bot via @BotFather, paste the token here. Your bot becomes an AI agent.',
      icon: icons.telegram,
      connected: !!conn.telegram,
      detail: conn.telegram ? `@${conn.telegram.username}` : null,
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Create a bot in Discord Developer Portal, paste the credentials here.',
      icon: icons.discord,
      connected: !!conn.discord,
      detail: conn.discord ? conn.discord.name : null,
    },
  ]

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p custom={0} variants={fadeUp} className="font-mono text-sm text-muted mb-8 max-w-lg">
        Connect your services. The agent uses these to execute tasks on your behalf.
      </motion.p>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 border ${toast.type === 'success' ? 'border-ink/20 bg-surface' : 'border-red-300 bg-red-50'}`}
        >
          <p className={`font-mono text-sm ${toast.type === 'success' ? 'text-ink' : 'text-red-700'}`}>
            {toast.type === 'success' ? '✅' : '⚠️'} {toast.text}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {integrations.map((item, i) => (
          <motion.div key={item.id} custom={i + 1} variants={fadeUp} className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-ink opacity-60">{item.icon}</div>
                <div>
                  <h3 className="font-display text-xl tracking-display text-ink">
                    {item.name.toUpperCase()}
                  </h3>
                  <p className={`font-mono text-[11px] uppercase tracking-[2px] ${item.connected ? 'text-ink' : 'text-muted'}`}>
                    {item.connected ? `● Connected${item.detail ? ` · ${item.detail}` : ''}` : '○ Not connected'}
                  </p>
                </div>
              </div>
              <span className={`status-dot mt-1.5 ${item.connected ? 'active' : 'idle'}`} />
            </div>

            <p className="font-mono text-sm text-muted leading-relaxed mb-6">
              {item.description}
            </p>

            <div className="flex items-center gap-3 justify-end">
              {item.connected ? (
                <button
                  onClick={() => disconnect(item.id)}
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-red-400 hover:text-red-500 transition-all duration-150"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (item.id === 'gmail') window.location.href = '/api/gmail/connect'
                    else if (item.id === 'calendar') window.location.href = '/api/calendar/connect'
                    else if (item.id === 'telegram') setModal('telegram')
                    else if (item.id === 'discord') setModal('discord')
                  }}
                  className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150"
                >
                  Connect
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Telegram Modal ─── */}
      {modal === 'telegram' && (
        <div className="fixed inset-0 bg-ink/20 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border p-8 w-full max-w-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">
              Connect Telegram
            </p>
            <h3 className="font-display text-2xl tracking-display text-ink mb-4">
              BOT TOKEN
            </h3>

            <div className="space-y-4 mb-6 p-4 bg-surface border border-border">
              <p className="font-mono text-xs text-muted leading-relaxed">
                <span className="text-ink font-bold">1.</span> Open Telegram → search <span className="text-ink">@BotFather</span><br />
                <span className="text-ink font-bold">2.</span> Send <code className="bg-white px-1 border border-border">/newbot</code> → follow instructions<br />
                <span className="text-ink font-bold">3.</span> Copy the API token and paste below
              </p>
            </div>

            <input
              type="text"
              value={tgToken}
              onChange={(e) => setTgToken(e.target.value)}
              placeholder="123456789:ABCdefGhIjKlmNoPqRsTuVwXyZ"
              className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors duration-150 mb-4"
              autoFocus
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setModal(null); setTgToken('') }}
                className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-ink hover:text-ink transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={connectTelegram}
                disabled={!tgToken.trim() || loading}
                className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Discord Modal ─── */}
      {modal === 'discord' && (
        <div className="fixed inset-0 bg-ink/20 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border p-8 w-full max-w-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">
              Connect Discord
            </p>
            <h3 className="font-display text-2xl tracking-display text-ink mb-4">
              BOT CREDENTIALS
            </h3>

            <div className="space-y-4 mb-6 p-4 bg-surface border border-border">
              <p className="font-mono text-xs text-muted leading-relaxed">
                <span className="text-ink font-bold">1.</span> Go to <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-ink underline">Discord Developer Portal</a><br />
                <span className="text-ink font-bold">2.</span> Create an application → go to <span className="text-ink">Bot</span> tab<br />
                <span className="text-ink font-bold">3.</span> Copy the <span className="text-ink">Bot Token</span> and <span className="text-ink">Application ID</span>
              </p>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">
                  Application ID
                </label>
                <input
                  type="text"
                  value={dcClientId}
                  onChange={(e) => setDcClientId(e.target.value)}
                  placeholder="1234567890123456789"
                  className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors duration-150"
                  autoFocus
                />
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">
                  Bot Token
                </label>
                <input
                  type="password"
                  value={dcToken}
                  onChange={(e) => setDcToken(e.target.value)}
                  placeholder="MTIzNDU2Nzg5MDEyMzQ1Njc4OQ..."
                  className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors duration-150"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setModal(null); setDcToken(''); setDcClientId('') }}
                className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-ink hover:text-ink transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={connectDiscord}
                disabled={!dcToken.trim() || !dcClientId.trim() || loading}
                className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40"
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
