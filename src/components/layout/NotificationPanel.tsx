import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, X, Loader2, ArrowRight } from '../../lib/icons'
import {
  getNotifications,
  markAsRead,
  markAllAsRead as markAllReadApi,
  dismiss,
  type NotificationItem,
} from '../../services/notifications'

interface NotificationPanelProps {
  onClose: () => void
  onUnreadCountChange?: (count: number) => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function NotificationPanel({ onClose, onUnreadCountChange }: NotificationPanelProps) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    getNotifications()
      .then((response) => {
        if (cancelled) return
        setNotifications(response.items)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load notifications')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    onUnreadCountChange?.(notifications.filter((n) => !n.read).length)
  }, [notifications, onUnreadCountChange])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
    try { await markAsRead(id) } catch { /* ignore */ }
  }

  const handleDismiss = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n._id !== id))
    try { await dismiss(id) } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    try { await markAllReadApi() } catch { /* ignore */ }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-on-surface-variant" aria-hidden="true" />
          <h3 className="text-title-md text-on-surface">Notifications</h3>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-label-sm font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-label-sm text-primary hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Bell className="w-8 h-8 text-on-surface-variant mb-2 opacity-50" aria-hidden="true" />
            <p className="text-body-md text-on-surface-variant">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <Bell className="w-8 h-8 text-on-surface-variant mb-2" aria-hidden="true" />
            <p className="text-body-md text-on-surface-variant">You're all caught up</p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {notifications.map((n) => (
              <li
                key={n._id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  n.read ? 'bg-surface' : 'bg-primary-container/5'
                }`}
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-body-md text-on-surface ${n.read ? '' : 'font-semibold'}`}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {!n.read && (
                        <button
                          onClick={() => handleMarkAsRead(n._id)}
                          className="p-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant"
                          aria-label="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(n._id)}
                        className="p-1 rounded hover:bg-surface-container transition-colors text-on-surface-variant"
                        aria-label="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-label-sm text-on-surface-variant mt-1">{formatTime(n.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer with link to full notifications page */}
      <div className="border-t border-outline-variant">
        <button
          onClick={() => {
            onClose()
            navigate('/community/notifications')
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-label-sm text-primary hover:bg-primary-container/10 transition-colors font-medium"
        >
          <ArrowRight className="w-4 h-4" />
          All Notifications
        </button>
      </div>
    </div>
  )
}
