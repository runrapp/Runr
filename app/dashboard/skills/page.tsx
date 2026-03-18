'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
}

interface Skill {
  id: string
  name: string
  description: string
  enabled: boolean
  lastUsed: string | null
}

const defaultSkills: Skill[] = [
  {
    id: 'email',
    name: 'Email Management',
    description: 'Read, summarize, compose, and send email via Gmail.',
    enabled: true,
    lastUsed: null,
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Create, update, delete events. Detect scheduling conflicts.',
    enabled: true,
    lastUsed: null,
  },
  {
    id: 'web',
    name: 'Web Research',
    description: 'Browse public URLs, search the web, summarize content.',
    enabled: true,
    lastUsed: null,
  },
  {
    id: 'telegram',
    name: 'Telegram Messaging',
    description: 'Receive commands and send task results via Telegram.',
    enabled: true,
    lastUsed: null,
  },
  {
    id: 'discord',
    name: 'Discord Messaging',
    description: 'Handle slash commands and post results in Discord.',
    enabled: false,
    lastUsed: null,
  },
]

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>(defaultSkills)

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }

  return (
    <motion.div initial="hidden" animate="visible">
      <motion.p
        custom={0}
        variants={fadeUp}
        className="font-mono text-sm text-muted mb-2 max-w-lg"
      >
        Skills define what your agent can do. Enable or disable individual capabilities.
      </motion.p>
      <motion.p custom={1} variants={fadeUp} className="mb-8">
        <a
          href="/skill.md"
          target="_blank"
          className="font-mono text-[11px] uppercase tracking-[2px] text-muted hover:text-ink underline underline-offset-4 transition-colors duration-150"
        >
          View full skill definition →
        </a>
      </motion.p>

      <div className="border border-border divide-y divide-border">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.id}
            custom={i + 2}
            variants={fadeUp}
            className={`flex items-center justify-between px-6 py-5 transition-colors duration-150 ${
              skill.enabled ? 'bg-white' : 'bg-surface/30'
            }`}
          >
            <div className="flex-1 min-w-0 mr-6">
              <div className="flex items-center gap-3 mb-1">
                <h3
                  className={`font-display text-lg tracking-display transition-opacity duration-150 ${
                    skill.enabled ? 'text-ink' : 'text-muted'
                  }`}
                >
                  {skill.name.toUpperCase()}
                </h3>
              </div>
              <p
                className={`font-mono text-sm leading-relaxed transition-opacity duration-150 ${
                  skill.enabled ? 'text-muted' : 'text-muted/50'
                }`}
              >
                {skill.description}
              </p>
              {skill.lastUsed && (
                <p className="font-mono text-[11px] text-muted/60 mt-1">
                  Last used: {skill.lastUsed}
                </p>
              )}
            </div>

            {/* Toggle */}
            <button
              onClick={() => toggleSkill(skill.id)}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                skill.enabled ? 'bg-ink' : 'bg-border'
              }`}
              aria-label={`Toggle ${skill.name}`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                  skill.enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'
                }`}
              />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
