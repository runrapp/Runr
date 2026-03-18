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

/* ─── Mock data for initial state ─── */
const stats = [
  { label: 'Total tasks run', value: '—' },
  { label: 'Tasks today', value: '—' },
  { label: 'Success rate', value: '—' },
  { label: 'Time saved', value: '—' },
]

interface Task {
  id: string
  name: string
  status: 'completed' | 'running' | 'pending' | 'failed'
  timestamp: string
  duration: string
}

const recentTasks: Task[] = []

const statusStyle: Record<string, string> = {
  completed: 'bg-ink text-white',
  running: 'bg-surface text-ink border border-ink',
  pending: 'bg-surface text-muted',
  failed: 'bg-white text-ink border border-ink',
}

export default function DashboardOverview() {
  const [command, setCommand] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(recentTasks)
  const [liveStats, setLiveStats] = useState(stats)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return
    setSubmitting(true)

    const newTask: Task = {
      id: Date.now().toString(),
      name: command,
      status: 'running',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: '...',
    }

    setTasks((prev) => [newTask, ...prev])

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command.trim() }),
      })

      const data = await res.json()

      setTasks((prev) =>
        prev.map((t) =>
          t.id === newTask.id
            ? {
                ...t,
                status: data.status === 'COMPLETED' ? 'completed' : 'failed',
                duration: data.duration || '—',
              }
            : t
        )
      )

      // Update stats
      setLiveStats((prev) => {
        const completed = tasks.filter((t) => t.status === 'completed').length + 1
        const total = tasks.length + 1
        return [
          { label: 'Total tasks run', value: String(total) },
          { label: 'Tasks today', value: String(total) },
          { label: 'Success rate', value: total > 0 ? `${Math.round((completed / total) * 100)}%` : '—' },
          { label: 'Time saved', value: `${total * 3}m` },
        ]
      })
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === newTask.id ? { ...t, status: 'failed', duration: '—' } : t
        )
      )
    }

    setCommand('')
    setSubmitting(false)
  }

  return (
    <motion.div initial="hidden" animate="visible">
      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-8">
        {liveStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            className="bg-white p-6"
          >
            <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-2">
              {stat.label}
            </p>
            <p className="font-display text-4xl tracking-display text-ink">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ─── Quick Command ─── */}
      <motion.div custom={4} variants={fadeUp} className="mb-8">
        <form onSubmit={handleSubmit} className="flex gap-0">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Tell your agent what to do..."
            className="flex-1 font-mono text-sm px-4 py-3 border border-border border-r-0 bg-white text-ink placeholder:text-muted/40 focus:border-ink transition-colors duration-150"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !command.trim()}
            className="font-mono text-xs uppercase tracking-[2px] bg-ink text-white px-6 py-3 hover:-translate-y-[2px] transition-transform duration-150 disabled:opacity-40 disabled:hover:translate-y-0 whitespace-nowrap"
          >
            {submitting ? 'Running...' : 'Run'}
          </button>
        </form>
      </motion.div>

      {/* ─── Recent Tasks ─── */}
      <motion.div custom={5} variants={fadeUp}>
        <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-4">
          Recent tasks
        </p>
        {tasks.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <p className="font-mono text-sm text-muted">
              No tasks yet. Type a command above to get started.
            </p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-surface/50 transition-colors duration-150"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[2px] px-2 py-0.5 inline-block ${
                      statusStyle[task.status]
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="font-mono text-sm text-ink truncate">
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="font-mono text-[11px] text-muted">
                    {task.duration}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {task.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
