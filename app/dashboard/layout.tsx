'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard/integrations', label: 'Integrations' },
  { href: '/dashboard/skills', label: 'Skills' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [agentStatus] = useState<'active' | 'idle'>('active')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-ink/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        w-56 border-r border-border flex flex-col fixed h-screen bg-white z-50
        transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="h-14 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" className="font-logo text-3xl tracking-tight text-ink">RUNR</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-muted hover:text-ink">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-6 py-2.5 font-mono text-xs uppercase tracking-[2px] transition-colors duration-150 ${
                  isActive ? 'text-ink bg-surface' : 'text-muted hover:text-ink hover:bg-surface/50'
                }`}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border">
          <div className="px-6 py-3">
            <div className="flex items-center gap-2">
              <span className={`status-dot ${agentStatus}`} />
              <span className="font-mono text-[11px] uppercase tracking-[2px] text-muted">Agent {agentStatus}</span>
            </div>
          </div>
          <div className="px-6 py-3 border-t border-border">
            <button onClick={handleLogout} className="font-mono text-[11px] uppercase tracking-[2px] text-muted hover:text-ink transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 lg:ml-56 min-w-0">
        <div className="h-14 border-b border-border flex items-center px-4 sm:px-8 sticky top-0 bg-white/90 backdrop-blur-sm z-30 gap-3">
          {/* Mobile menu button */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-muted hover:text-ink flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted">
            {navItems.find((n) => n.href === pathname)?.label ?? 'Dashboard'}
          </p>
        </div>
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  )
}
