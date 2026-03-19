'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  )
}

/* ─── Icons (hand-crafted inline SVGs) ─── */
const icons = {
  email: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="26" height="20" rx="2" />
      <path d="M3 8l13 9 13-9" />
    </svg>
  ),
  calendar: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="24" height="22" rx="2" />
      <path d="M4 12h24" />
      <path d="M10 4v4M22 4v4" />
      <circle cx="11" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="21" cy="19" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  web: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="16" r="12" />
      <path d="M4 16h24" />
      <path d="M16 4c-4 4-4 12 0 24M16 4c4 4 4 12 0 24" />
    </svg>
  ),
  telegram: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M28 4L4 14l8 3" />
      <path d="M12 17l10-9" />
      <path d="M12 17v7l4-4" />
      <path d="M12 17l16-13" />
    </svg>
  ),
  discord: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6C9 6 6 8 5 10c-2 5-1 10 1 14 2 2 5 3 7 3l1-2c-1 0-3-1-4-2l1-1c3 1 6 2 9 0 3 2 6 1 9 0l1 1c-1 1-3 2-4 2l1 2c2 0 5-1 7-3 2-4 3-9 1-14-1-2-4-4-7-4" />
      <circle cx="12.5" cy="17" r="2" fill="currentColor" stroke="none" />
      <circle cx="19.5" cy="17" r="2" fill="currentColor" stroke="none" />
    </svg>
  ),
  task: (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6h14a3 3 0 013 3v14a3 3 0 01-3 3H9a3 3 0 01-3-3V9a3 3 0 013-3z" />
      <path d="M11 16l3 3 7-7" />
    </svg>
  ),
}

/* ─── Capability Cards Data ─── */
const capabilities = [
  {
    icon: icons.email,
    title: 'Email Management',
    desc: 'Reads, summarizes, and replies to your Gmail. Handles the inbox so you don\'t have to.',
  },
  {
    icon: icons.calendar,
    title: 'Calendar & Scheduling',
    desc: 'Creates events, detects conflicts, sends invites. Your schedule, managed automatically.',
  },
  {
    icon: icons.web,
    title: 'Web Research',
    desc: 'Browses any public page, extracts what matters, and gives you a clean summary.',
  },
  {
    icon: icons.telegram,
    title: 'Telegram Integration',
    desc: 'Send commands via Telegram. Get results back instantly. Your agent lives in your chat.',
  },
  {
    icon: icons.discord,
    title: 'Discord Integration',
    desc: 'Slash commands in your server. Task results posted to your channel. Built for teams.',
  },
  {
    icon: icons.task,
    title: 'Task Automation',
    desc: 'Chain tasks together. Set recurring jobs. Your agent works while you sleep.',
  },
]

/* ─── Chat Messages for How It Works ─── */
const chatMessages = [
  { role: 'user' as const, text: '/task summarize my emails today' },
  { role: 'agent' as const, text: 'Parsing intent... Connecting to Gmail.' },
  { role: 'agent' as const, text: 'Found 14 emails. 3 require action.' },
  {
    role: 'agent' as const,
    text: '1. Invoice from AWS — $127.40, due Mar 22\n2. Meeting request from Sarah — Thu 2pm\n3. Support ticket #4021 — customer waiting',
  },
  { role: 'user' as const, text: '/task accept Sarah\'s meeting' },
  { role: 'agent' as const, text: 'Event created: Thu 2pm — Meeting with Sarah Chen. Calendar invite sent.' },
]

/* ─── Pricing Data ─── */
const pricing = [
  {
    name: 'Starter',
    price: '$25',
    period: '/mo',
    features: [
      '500 tasks per month',
      'Email + Calendar',
      'Web research',
      '2 messaging integrations',
      'Task history — 30 days',
    ],
    inverted: false,
    cta: 'Get started',
    href: 'https://runr.lemonsqueezy.com/checkout/buy/ac2a9b22-66a4-4a89-9777-16299cbdb1c5',
  },
  {
    name: 'Pro',
    price: '$75',
    period: '/mo',
    features: [
      'Unlimited tasks',
      'All integrations',
      'Custom skills',
      'Priority execution',
      'Task history — unlimited',
      'API access',
    ],
    inverted: true,
    cta: 'Get started',
    href: 'https://runr.lemonsqueezy.com/checkout/buy/ac2a9b22-66a4-4a89-9777-16299cbdb1c5',
  },
  {
    name: 'Custom',
    price: "Let's talk",
    period: '',
    features: [
      'Everything in Pro',
      'Dedicated agent instance',
      'SSO + team management',
      'Custom integrations',
      'SLA guarantee',
      'On-call support',
    ],
    inverted: false,
    cta: 'Contact us',
    href: 'mailto:runrapp69@gmail.com?subject=Runr%20Custom%20Plan&body=Hi%2C%20I%27m%20interested%20in%20a%20custom%20Runr%20plan.',
  },
]

/* ─── Integration logos row ─── */
const integrations = ['Telegram', 'Discord', 'Gmail', 'Google Calendar', 'More soon']

/* ═══════════════════════════════════════════ */
/*  LANDING PAGE                               */
/* ═══════════════════════════════════════════ */

export default function LandingPage() {
  const [email, setEmail] = useState('')

  return (
    <main className="min-h-screen bg-white overflow-x-hidden">
      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Runr" className="h-7 w-7" />
            <span className="font-logo text-3xl tracking-tight text-ink">RUNR</span>
          </a>
          <div className="flex items-center gap-8">
            <a href="#features" className="font-mono text-xs uppercase tracking-[2px] text-muted hover:text-ink transition-colors duration-150">
              Features
            </a>
            <a href="#pricing" className="font-mono text-xs uppercase tracking-[2px] text-muted hover:text-ink transition-colors duration-150">
              Pricing
            </a>
            <a
              href="/dashboard"
              className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-4 py-2 hover:-translate-y-[2px] transition-transform duration-150"
            >
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ SECTION 1: Hero ═══ */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 pt-14">
        <div className="max-w-[1200px] w-full">
          <motion.h1
            className="font-brand font-bold italic text-[clamp(64px,12vw,140px)] leading-[0.9] tracking-tight text-ink"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
          >
            DO LESS.
          </motion.h1>
          <motion.h1
            className="font-brand font-bold text-[clamp(64px,12vw,140px)] leading-[0.9] tracking-tight text-ink"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' as const }}
          >
            RUN MORE.
          </motion.h1>
          <motion.p
            className="mt-8 font-mono text-sm text-muted max-w-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: 'easeOut' as const }}
          >
            Your AI agent. Always on.
          </motion.p>
          <motion.div
            className="mt-10 flex gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26, ease: 'easeOut' as const }}
          >
            <a
              href="/dashboard"
              className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-6 py-3 hover:-translate-y-[2px] transition-transform duration-150 inline-block"
            >
              Start for free
            </a>
            <a
              href="#how-it-works"
              className="font-mono text-xs uppercase tracking-[2px] border border-ink text-ink px-6 py-3 hover:-translate-y-[2px] hover:bg-ink hover:text-white transition-all duration-150 inline-block"
            >
              See how it works
            </a>
          </motion.div>
        </div>
      </section>

      {/* ─── Marquee Divider ─── */}
      <div className="border-t border-b border-border py-3 overflow-hidden">
        <div className="marquee-track">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="font-mono text-[11px] uppercase tracking-[3px] text-muted whitespace-nowrap px-4"
            >
              DO LESS. RUN MORE. &middot; TELEGRAM &middot; DISCORD &middot; EMAIL &middot; CALENDAR &middot; WEB &middot;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 2: What Runr Does ═══ */}
      <Section className="py-24 px-6" >
        <div className="max-w-[1200px] mx-auto" id="features">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4"
          >
            Capabilities
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-display text-ink mb-16"
          >
            ONE AGENT.<br />EVERYTHING RUNS.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                variants={fadeUp}
                custom={i + 2}
                className="bg-white p-8 group hover:bg-surface transition-colors duration-150"
              >
                <div className="text-ink mb-6 opacity-60 group-hover:opacity-100 transition-opacity duration-150">
                  {cap.icon}
                </div>
                <h3 className="font-display text-2xl tracking-display text-ink mb-3">
                  {cap.title.toUpperCase()}
                </h3>
                <p className="font-mono text-sm text-muted leading-relaxed">
                  {cap.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 3: How It Works ═══ */}
      <Section className="py-24 px-6 bg-surface" >
        <div className="max-w-[1200px] mx-auto" id="how-it-works">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4"
          >
            How it works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-display text-ink mb-16"
          >
            COMMAND. EXECUTE. DONE.
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Chat Interface */}
            <motion.div
              variants={fadeUp}
              custom={2}
              className="bg-white border border-border p-6 max-h-[520px] overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-8 h-8 bg-ink flex items-center justify-center">
                  <span className="font-display text-white text-sm">R</span>
                </div>
                <div>
                  <p className="font-mono text-xs font-medium text-ink">Runr Agent</p>
                  <p className="font-mono text-[10px] text-muted">online</p>
                </div>
              </div>
              <ChatDemo />
            </motion.div>

            {/* Execution Flow */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col justify-center"
            >
              {[
                { step: '01', title: 'Receive command', desc: 'Agent picks up your message via Telegram, Discord, or the dashboard.' },
                { step: '02', title: 'Parse intent', desc: 'Claude analyzes the request, identifies the right skill and parameters.' },
                { step: '03', title: 'Execute task', desc: 'Connects to Gmail, Calendar, web, or any active integration and runs.' },
                { step: '04', title: 'Return result', desc: 'Clean output delivered back to you. Task logged. Done.' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  custom={i + 4}
                  className="flex gap-6 mb-8 last:mb-0"
                >
                  <span className="font-display text-4xl text-border leading-none pt-1">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="font-display text-xl tracking-display text-ink mb-1">
                      {item.title.toUpperCase()}
                    </h4>
                    <p className="font-mono text-sm text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 4: Integrations ═══ */}
      <Section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4"
          >
            Integrations
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={1}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {integrations.map((name, i) => (
              <motion.span
                key={name}
                variants={fadeUp}
                custom={i + 2}
                className={`font-mono text-sm px-6 py-3 border border-border ${
                  name === 'More soon'
                    ? 'text-muted border-dashed'
                    : 'text-ink hover:bg-surface transition-colors duration-150'
                }`}
              >
                {name}
              </motion.span>
            ))}
          </motion.div>
          <motion.p
            variants={fadeUp}
            custom={7}
            className="font-mono text-sm text-muted"
          >
            Connect once. Run forever.
          </motion.p>
        </div>
      </Section>

      {/* ═══ SECTION 5: Pricing ═══ */}
      <Section className="py-24 px-6 bg-surface" >
        <div className="max-w-[1200px] mx-auto" id="pricing">
          <motion.p
            variants={fadeUp}
            custom={0}
            className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4"
          >
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display text-[clamp(40px,6vw,72px)] leading-[0.95] tracking-display text-ink mb-16"
          >
            PICK YOUR LANE.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {pricing.map((tier, i) => (
              <motion.div
                key={tier.name}
                variants={fadeUp}
                custom={i + 2}
                className={`p-8 ${
                  tier.inverted
                    ? 'bg-ink text-white'
                    : 'bg-white text-ink'
                }`}
              >
                <p className={`font-mono text-[11px] uppercase tracking-[3px] mb-2 ${
                  tier.inverted ? 'text-white/50' : 'text-muted'
                }`}>
                  {tier.name}
                </p>
                <div className="mb-8">
                  <span className="font-display text-5xl tracking-display">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`font-mono text-sm ${
                      tier.inverted ? 'text-white/50' : 'text-muted'
                    }`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={`font-mono text-sm ${
                        tier.inverted ? 'text-white/70' : 'text-muted'
                      }`}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.href}
                  className={`font-mono text-xs uppercase tracking-[2px] inline-block px-6 py-3 border transition-all duration-150 hover:-translate-y-[2px] ${
                    tier.inverted
                      ? 'border-white text-white hover:bg-white hover:text-ink'
                      : 'border-ink text-ink hover:bg-ink hover:text-white'
                  }`}
                >
                  {tier.cta}
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══ SECTION 6: Footer CTA ═══ */}
      <section className="py-32 px-6">
        <div className="max-w-[1200px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
            className="font-display text-[clamp(48px,8vw,100px)] leading-[0.9] tracking-display text-ink mb-12"
          >
            READY TO RUN?
          </motion.h2>
          <motion.form
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' as const }}
            className="flex gap-0 max-w-lg"
            onSubmit={(e) => {
              e.preventDefault()
              if (email) window.location.href = '/signup'
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="flex-1 font-mono text-sm px-4 py-3 border border-border border-r-0 bg-white text-ink placeholder:text-muted/50 focus:border-ink transition-colors duration-150"
              required
            />
            <button
              type="submit"
              className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-6 py-3 hover:-translate-y-[2px] transition-transform duration-150 whitespace-nowrap"
            >
              Get started
            </button>
          </motion.form>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <span className="font-display text-lg tracking-display text-ink">RUNR</span>
          <div className="flex gap-6">
            <a href="/skill.md" className="font-mono text-[11px] uppercase tracking-[2px] text-muted hover:text-ink transition-colors duration-150">
              skill.md
            </a>
            <a href="/dashboard" className="font-mono text-[11px] uppercase tracking-[2px] text-muted hover:text-ink transition-colors duration-150">
              Dashboard
            </a>
          </div>
          <span className="font-mono text-[11px] text-muted">
            &copy; {new Date().getFullYear()} Runr
          </span>
        </div>
      </footer>
    </main>
  )
}

/* ─── Chat Demo Component ─── */
function ChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  useEffect(() => {
    if (!inView) return
    const timers: NodeJS.Timeout[] = []
    chatMessages.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleMessages(i + 1), (i + 1) * 700)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <div ref={ref} className="space-y-4">
      {chatMessages.slice(0, visibleMessages).map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-line ${
              msg.role === 'user'
                ? 'bg-ink text-white'
                : 'bg-surface text-ink'
            }`}
          >
            {msg.text}
          </div>
        </motion.div>
      ))}
      {visibleMessages > 0 && visibleMessages < chatMessages.length && (
        <div className="flex justify-start">
          <div className="px-4 py-3 bg-surface">
            <span className="typing-cursor font-mono text-sm text-muted" />
          </div>
        </div>
      )}
    </div>
  )
}
