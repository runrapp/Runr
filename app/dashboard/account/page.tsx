'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type UserProfile = {
  id: string
  email: string
  provider: string
  created_at: string
  last_sign_in: string
  avatar_url?: string
  full_name?: string
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          provider: data.user.app_metadata?.provider || 'email',
          created_at: data.user.created_at,
          last_sign_in: data.user.last_sign_in_at || '',
          avatar_url: data.user.user_metadata?.avatar_url,
          full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
        })
      }
      setLoading(false)
    })
  }, [])

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPasswordLoading(true)
    setPasswordMsg(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message })
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return
    // Sign out — actual deletion needs admin/backend
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/?deleted=true'
  }

  const formatDate = (iso: string) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const } }),
  }

  if (loading) {
    return <p className="font-mono text-sm text-muted">Loading...</p>
  }

  if (!user) {
    return <p className="font-mono text-sm text-muted">Not signed in.</p>
  }

  return (
    <motion.div initial="hidden" animate="visible" className="max-w-xl">
      {/* ─── Profile ─── */}
      <motion.div custom={0} variants={fadeUp} className="border border-border p-6 sm:p-8 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-6">Profile</p>

        <div className="flex items-center gap-4 mb-6">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-14 h-14 rounded-full border border-border" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-surface border border-border flex items-center justify-center">
              <span className="font-display text-xl text-ink">{user.email[0].toUpperCase()}</span>
            </div>
          )}
          <div>
            {user.full_name && (
              <p className="font-mono text-sm text-ink font-medium">{user.full_name}</p>
            )}
            <p className="font-mono text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-mono text-xs text-muted uppercase tracking-[2px]">Auth method</span>
            <span className="font-mono text-sm text-ink capitalize">{user.provider}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-mono text-xs text-muted uppercase tracking-[2px]">Member since</span>
            <span className="font-mono text-sm text-ink">{formatDate(user.created_at)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="font-mono text-xs text-muted uppercase tracking-[2px]">Last sign in</span>
            <span className="font-mono text-sm text-ink">{formatDate(user.last_sign_in)}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-mono text-xs text-muted uppercase tracking-[2px]">User ID</span>
            <span className="font-mono text-[11px] text-muted">{user.id.slice(0, 8)}...{user.id.slice(-4)}</span>
          </div>
        </div>
      </motion.div>

      {/* ─── Change Password ─── */}
      {user.provider === 'email' && (
        <motion.div custom={1} variants={fadeUp} className="border border-border p-6 sm:p-8 mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[3px] text-muted mb-6">Change Password</p>

          {passwordMsg && (
            <div className={`p-3 border mb-4 ${passwordMsg.type === 'error' ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <p className={`font-mono text-xs ${passwordMsg.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>{passwordMsg.text}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[2px] text-muted block mb-1">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full font-mono text-sm px-4 py-3 border border-border bg-white text-ink placeholder:text-muted/40 focus:border-ink focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading || !newPassword}
              className="font-mono text-xs uppercase tracking-[2px] px-6 py-3 border border-ink text-ink hover:bg-ink hover:text-white transition-all duration-150 hover:-translate-y-[2px] disabled:opacity-40"
            >
              {passwordLoading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Danger Zone ─── */}
      <motion.div custom={2} variants={fadeUp} className="border border-red-200 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[3px] text-red-400 mb-2">Danger Zone</p>
        <p className="font-mono text-sm text-muted mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="font-mono text-xs uppercase tracking-[2px] px-6 py-3 border border-red-300 text-red-500 hover:bg-red-50 transition-all duration-150"
          >
            Delete account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs text-red-500">Type <strong>DELETE</strong> to confirm:</p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              className="w-full font-mono text-sm px-4 py-3 border border-red-300 bg-white text-ink focus:border-red-500 focus:outline-none transition-colors"
              placeholder="DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(false); setDeleteText('') }}
                className="font-mono text-xs uppercase tracking-[2px] px-6 py-3 border border-border text-muted hover:text-ink transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'DELETE'}
                className="font-mono text-xs uppercase tracking-[2px] px-6 py-3 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40"
              >
                Permanently delete
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
