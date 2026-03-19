'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface ConnectModal {
  platform: 'telegram' | 'discord'
  code: string | null
  loading: boolean
  linked: boolean
  botUrl: string
  instructions: string
}

export default function IntegrationsPage() {
  const searchParams = useSearchParams()
  const [connected, setConnected] = useState({
    gmail: false,
    calendar: false,
    telegram: false,
    discord: false,
  })
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [modal, setModal] = useState<ConnectModal | null>(null)
  const [polling, setPolling] = useState(false)

  // Handle OAuth callback
  useEffect(() => {
    const connectedParam = searchParams.get('connected')
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (connectedParam && success === 'true') {
      setConnected((prev) => ({ ...prev, [connectedParam]: true }))
      localStorage.setItem(`runr_${connectedParam}`, 'true')
      setToast({ type: 'success', text: `${connectedParam === 'gmail' ? 'Gmail' : 'Google Calendar'} connected!` })
      window.history.replaceState({}, '', '/dashboard/integrations')
    }
    if (error) {
      setToast({ type: 'error', text: `Connection failed: ${decodeURIComponent(error)}` })
      window.history.replaceState({}, '', '/dashboard/integrations')
    }

    // Restore from localStorage
    setConnected({
      gmail: localStorage.getItem('runr_gmail') === 'true',
      calendar: localStorage.getItem('runr_calendar') === 'true',
      telegram: localStorage.getItem('runr_telegram') === 'true',
      discord: localStorage.getItem('runr_discord') === 'true',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-dismiss toasts
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(t)
    }
  }, [toast])

  // Poll for link status when modal is open
  const pollStatus = useCallback(async (platform: string, code: string) => {
    try {
      const res = await fetch(`/api/${platform}/status?code=${code}`)
      const data = await res.json()
      if (data.status === 'linked') {
        setConnected((prev) => ({ ...prev, [platform]: true }))
        localStorage.setItem(`runr_${platform}`, 'true')
        setModal((prev) => prev ? { ...prev, linked: true } : null)
        setPolling(false)
        setToast({ type: 'success', text: `${platform === 'telegram' ? 'Telegram' : 'Discord'} connected!` })
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!polling || !modal || !modal.code) return
    const interval = setInterval(() => pollStatus(modal.platform, modal.code!), 3000)
    return () => clearInterval(interval)
  }, [polling, modal, pollStatus])

  // Generate connect code
  const startConnect = async (platform: 'telegram' | 'discord') => {
    setModal({
      platform,
      code: null,
      loading: true,
      linked: false,
      botUrl: platform === 'telegram' ? 'https://t.me/Runr_ggbot' : '',
      instructions: '',
    })

    try {
      const res = await fetch(`/api/${platform}/link`, { method: 'POST' })
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setModal({
        platform,
        code: data.code,
        loading: false,
        linked: false,
        botUrl: data.botUrl || data.inviteUrl || '',
        instructions: data.instructions || '',
      })
      setPolling(true)
    } catch (err) {
      setToast({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate code' })
      setModal(null)
    }
  }

  const handleDisconnect = (id: string) => {
    setConnected((prev) => ({ ...prev, [id]: false }))
    localStorage.removeItem(`runr_${id}`)
    if (id === 'gmail' || id === 'calendar') {
      document.cookie = `${id}_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${id}_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    }
  }

  const integrations = [
    {
      id: 'gmail' as const,
      name: 'Gmail',
      description: 'Read, summarize, and send email on your behalf.',
      icon: integrationIcons.gmail,
      type: 'oauth' as const,
    },
    {
      id: 'calendar' as const,
      name: 'Google Calendar',
      description: 'Create, edit, and manage your calendar events.',
      icon: integrationIcons.calendar,
      type: 'oauth' as const,
    },
    {
      id: 'telegram' as const,
      name: 'Telegram',
      description: 'Send commands and get results via Telegram bot.',
      icon: integrationIcons.telegram,
      type: 'code' as const,
    },
    {
      id: 'discord' as const,
      name: 'Discord',
      description: 'Slash commands and task results in your Discord server.',
      icon: integrationIcons.discord,
      type: 'code' as const,
    },
  ]

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p custom={0} variants={fadeUp} className="font-mono text-sm text-muted mb-8 max-w-lg">
        Connect your services. The agent uses these to execute tasks on your behalf.
      </motion.p>

      {/* Toast */}
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

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
        {integrations.map((integration, i) => (
          <motion.div key={integration.id} custom={i + 1} variants={fadeUp} className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-ink opacity-60">{integration.icon}</div>
                <div>
                  <h3 className="font-display text-xl tracking-display text-ink">
                    {integration.name.toUpperCase()}
                  </h3>
                  <p className={`font-mono text-[11px] uppercase tracking-[2px] ${connected[integration.id] ? 'text-ink' : 'text-muted'}`}>
                    {connected[integration.id] ? '● Connected' : '○ Not connected'}
                  </p>
                </div>
              </div>
              <span className={`status-dot mt-1.5 ${connected[integration.id] ? 'active' : 'idle'}`} />
            </div>

            <p className="font-mono text-sm text-muted leading-relaxed mb-6">
              {integration.description}
            </p>

            <div className="flex items-center gap-3 justify-end">
              {connected[integration.id] ? (
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-red-400 hover:text-red-500 transition-all duration-150"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (integration.type === 'oauth') {
                      window.location.href = `/api/${integration.id === 'calendar' ? 'calendar' : 'gmail'}/connect`
                    } else {
                      startConnect(integration.id as 'telegram' | 'discord')
                    }
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

      {/* ─── Connect Code Modal ─── */}
      {modal && (
        <div className="fixed inset-0 bg-ink/20 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-border p-8 w-full max-w-md"
          >
            {modal.linked ? (
              /* ── Success State ── */
              <>
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="font-display text-2xl tracking-display text-ink mb-2">CONNECTED</h3>
                  <p className="font-mono text-sm text-muted">
                    {modal.platform === 'telegram' ? 'Telegram' : 'Discord'} is now linked to Runr.
                  </p>
                </div>
                <button
                  onClick={() => { setModal(null); setPolling(false) }}
                  className="w-full font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-3 hover:-translate-y-[2px] transition-transform duration-150"
                >
                  Done
                </button>
              </>
            ) : modal.loading ? (
              /* ── Loading State ── */
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full mx-auto mb-4" />
                <p className="font-mono text-sm text-muted">Generating connect code...</p>
              </div>
            ) : (
              /* ── Code Display State ── */
              <>
                <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">
                  Connect {modal.platform === 'telegram' ? 'Telegram' : 'Discord'}
                </p>
                <h3 className="font-display text-2xl tracking-display text-ink mb-4">
                  YOUR CONNECT CODE
                </h3>

                {/* Code Display */}
                <div className="bg-surface border border-border p-6 text-center mb-6">
                  <p className="font-mono text-4xl tracking-[8px] text-ink font-bold select-all">
                    {modal.code}
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4 mb-6">
                  <div className="flex gap-3">
                    <span className="font-mono text-sm text-ink font-bold shrink-0">1.</span>
                    <div>
                      <p className="font-mono text-sm text-ink">
                        Open {modal.platform === 'telegram' ? 'Telegram' : 'Discord'}
                      </p>
                      <a
                        href={modal.botUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-muted underline hover:text-ink transition-colors"
                      >
                        {modal.platform === 'telegram' ? '→ Open @Runr_ggbot' : '→ Add Runr to your server'}
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-mono text-sm text-ink font-bold shrink-0">2.</span>
                    <div>
                      <p className="font-mono text-sm text-ink">Send this command:</p>
                      <code className="font-mono text-xs bg-surface border border-border px-2 py-1 mt-1 inline-block select-all">
                        /connect {modal.code}
                      </code>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-mono text-sm text-ink font-bold shrink-0">3.</span>
                    <p className="font-mono text-sm text-muted">
                      This page will update automatically when connected.
                    </p>
                  </div>
                </div>

                {/* Waiting indicator */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="animate-spin w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full" />
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
                    Waiting for connection...
                  </p>
                </div>

                <button
                  onClick={() => { setModal(null); setPolling(false) }}
                  className="w-full font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-3 hover:border-ink hover:text-ink transition-all duration-150"
                >
                  Cancel
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
