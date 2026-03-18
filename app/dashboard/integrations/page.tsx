'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' },
  }),
}

interface Integration {
  id: string
  name: string
  description: string
  status: 'connected' | 'disconnected'
  lastUsed: string | null
  connectType: 'oauth' | 'token'
  icon: React.ReactNode
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

const defaultIntegrations: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read, summarize, and send email on your behalf.',
    status: 'disconnected',
    lastUsed: null,
    connectType: 'oauth',
    icon: integrationIcons.gmail,
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Create, edit, and manage your calendar events.',
    status: 'disconnected',
    lastUsed: null,
    connectType: 'oauth',
    icon: integrationIcons.calendar,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Receive commands and send results via Telegram bot.',
    status: 'disconnected',
    lastUsed: null,
    connectType: 'token',
    icon: integrationIcons.telegram,
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Slash commands and task results in your Discord server.',
    status: 'disconnected',
    lastUsed: null,
    connectType: 'token',
    icon: integrationIcons.discord,
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(defaultIntegrations)
  const [tokenModal, setTokenModal] = useState<{ id: string; name: string } | null>(null)
  const [tokenInput, setTokenInput] = useState('')

  const handleOAuthConnect = (id: string) => {
    if (id === 'gmail') {
      window.location.href = '/api/gmail/connect'
    } else if (id === 'calendar') {
      window.location.href = '/api/calendar/connect'
    }
  }

  const handleTokenConnect = (id: string) => {
    if (!tokenInput.trim()) return
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: 'connected' as const, lastUsed: 'Just now' } : i
      )
    )
    setTokenModal(null)
    setTokenInput('')
  }

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p
        custom={0}
        variants={fadeUp}
        className="font-mono text-sm text-muted mb-8 max-w-lg"
      >
        Connect your services. The agent uses these to execute tasks on your behalf.
      </motion.p>

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
                    {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>
              <span
                className={`status-dot mt-1.5 ${
                  integration.status === 'connected' ? 'active' : 'idle'
                }`}
              />
            </div>

            <p className="font-mono text-sm text-muted leading-relaxed mb-6">
              {integration.description}
            </p>

            <div className="flex items-center justify-between">
              {integration.status === 'connected' ? (
                <p className="font-mono text-[11px] text-muted">
                  Last used: {integration.lastUsed}
                </p>
              ) : (
                <div />
              )}
              {integration.status === 'disconnected' ? (
                <button
                  onClick={() => {
                    if (integration.connectType === 'oauth') {
                      handleOAuthConnect(integration.id)
                    } else {
                      setTokenModal({ id: integration.id, name: integration.name })
                    }
                  }}
                  className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150"
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={() =>
                    setIntegrations((prev) =>
                      prev.map((item) =>
                        item.id === integration.id
                          ? { ...item, status: 'disconnected' as const, lastUsed: null }
                          : item
                      )
                    )
                  }
                  className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-ink hover:text-ink transition-all duration-150"
                >
                  Disconnect
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Token Modal ─── */}
      {tokenModal && (
        <div className="fixed inset-0 bg-ink/20 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-border p-8 w-full max-w-md"
          >
            <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">
              Connect {tokenModal.name}
            </p>
            <h3 className="font-display text-2xl tracking-display text-ink mb-4">
              ENTER BOT TOKEN
            </h3>
            <p className="font-mono text-sm text-muted mb-6">
              Paste your {tokenModal.name} bot token below. This is stored securely and only used to run your agent.
            </p>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder={`${tokenModal.name} bot token...`}
              className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink transition-colors duration-150 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setTokenModal(null)
                  setTokenInput('')
                }}
                className="font-mono text-xs uppercase tracking-[2px] border border-border text-muted px-4 py-2 hover:border-ink hover:text-ink transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTokenConnect(tokenModal.id)}
                disabled={!tokenInput.trim()}
                className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40"
              >
                Connect
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
