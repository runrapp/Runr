'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/tasks', label: 'Tasks' },
  { href: '/dashboard/integrations', label: 'Integrations' },
  { href: '/dashboard/skills', label: 'Skills' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [agentStatus] = useState<'active' | 'idle'>('active')

  return (
    <div className="min-h-screen bg-white flex">
      {/* ─── Sidebar ─── */}
      <aside className="w-56 border-r border-border flex flex-col fixed h-screen bg-white z-40">
        {/* Logo */}
        <div className="h-14 flex items-center px-6 border-b border-border">
          <Link href="/" className="font-display text-2xl tracking-display text-ink">
            RUNR
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-2.5 font-mono text-xs uppercase tracking-[2px] transition-colors duration-150 ${
                  isActive
                    ? 'text-ink bg-surface'
                    : 'text-muted hover:text-ink hover:bg-surface/50'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Agent Status */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center gap-2">
            <span className={`status-dot ${agentStatus}`} />
            <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">
              Agent {agentStatus}
            </span>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 ml-56">
        <div className="h-14 border-b border-border flex items-center px-8 sticky top-0 bg-white/90 backdrop-blur-sm z-30">
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted">
            {navItems.find((n) => n.href === pathname)?.label ?? 'Dashboard'}
          </p>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
