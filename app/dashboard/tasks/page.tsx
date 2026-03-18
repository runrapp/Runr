'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
  id: string
  name: string
  command: string
  status: 'completed' | 'running' | 'pending' | 'failed'
  created_at: string
  duration: string
  result?: string
}

type Filter = 'all' | 'pending' | 'running' | 'completed' | 'failed'

const filters: Filter[] = ['all', 'pending', 'running', 'completed', 'failed']

const statusStyle: Record<string, string> = {
  completed: 'bg-ink text-white',
  running: 'bg-surface text-ink border border-ink',
  pending: 'bg-surface text-muted',
  failed: 'bg-white text-ink border border-ink',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load tasks from API
    async function loadTasks() {
      try {
        const res = await fetch('/api/agent?action=list')
        if (res.ok) {
          const data = await res.json()
          setTasks(data.tasks || [])
        }
      } catch {
        // No tasks yet — expected on fresh install
      } finally {
        setLoading(false)
      }
    }
    loadTasks()
  }, [])

  const filtered = activeFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeFilter)

  return (
    <div className="flex gap-0 relative">
      {/* ─── Main List ─── */}
      <div className={`flex-1 transition-all duration-300 ${selectedTask ? 'pr-[400px]' : ''}`}>
        {/* Filter Tabs */}
        <div className="flex gap-0 mb-6 border border-border inline-flex">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`font-mono text-[11px] uppercase tracking-[2px] px-4 py-2 transition-colors duration-150 ${
                activeFilter === f
                  ? 'bg-ink text-white'
                  : 'bg-white text-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className="border border-border p-12 text-center">
            <p className="font-mono text-sm text-muted">Loading tasks...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-border p-12 text-center">
            <p className="font-mono text-sm text-muted">
              {activeFilter === 'all'
                ? 'No tasks yet. Run your first command from the Overview page.'
                : `No ${activeFilter} tasks.`}
            </p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">
            {filtered.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors duration-150 ${
                  selectedTask?.id === task.id ? 'bg-surface' : 'hover:bg-surface/50'
                }`}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[2px] px-2 py-0.5 inline-block flex-shrink-0 ${
                      statusStyle[task.status]
                    }`}
                  >
                    {task.status}
                  </span>
                  <span className="font-mono text-sm text-ink truncate">
                    {task.name || task.command}
                  </span>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <span className="font-mono text-[11px] text-muted">
                    {task.duration}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {new Date(task.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─── Detail Side Panel ─── */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-14 bottom-0 w-[400px] border-l border-border bg-white z-20 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted">
                  Task Detail
                </p>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="font-mono text-xs text-muted hover:text-ink transition-colors duration-150"
                >
                  &times; Close
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-1">
                    Command
                  </p>
                  <p className="font-mono text-sm text-ink">
                    {selectedTask.command || selectedTask.name}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-1">
                    Status
                  </p>
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[2px] px-2 py-0.5 inline-block ${
                      statusStyle[selectedTask.status]
                    }`}
                  >
                    {selectedTask.status}
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-1">
                    Duration
                  </p>
                  <p className="font-mono text-sm text-ink">
                    {selectedTask.duration || '—'}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-1">
                    Created
                  </p>
                  <p className="font-mono text-sm text-ink">
                    {new Date(selectedTask.created_at).toLocaleString()}
                  </p>
                </div>

                {selectedTask.result && (
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[2px] text-muted mb-1">
                      Result
                    </p>
                    <div className="bg-surface p-4 font-mono text-sm text-ink whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                      {selectedTask.result}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
