import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { NotificationActions } from '../../components/community/NotificationActions'
import { useToast } from '../../components/layout/useToast'
import type { CommunityNotification } from '../../services/community/notifications'
import {
  getNotifications, markAsRead, markAllAsRead,
} from '../../services/community/notifications'
import { Bell, Check, Loader2 } from '../../lib/icons'

const TYPE_ICONS: Record<string, string> = {
  deadline_approaching: '⏰',
  match_found: '🎯',
  workspace_generated: '✨',
  contribution_added: '📝',
  referral_claimed: '🤝',
  referral_accepted: '🤝',
  new_comment: '💬',
  resume_feedback: '📄',
  company_hiring: '🏢',
  mention: '💬',
  application_collaboration: '👥',
  status_change: '🔄',
  interview_reminder: '📅',
  feature: '🚀',
  system: 'ℹ️',
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState<CommunityNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    getNotifications()
      .then(r => setNotifications(r.items))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const handleMarkRead = async (n: CommunityNotification) => {
    setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, read: true } : x))
    try { await markAsRead(n._id) } catch { /* ignore */ }
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(x => ({ ...x, read: true })))
    try { await markAllAsRead() } catch { /* ignore */ }
  }

  // Navigation handler used by NotificationActions "View" buttons.
  const handleView = (link: string) => {
    navigate(link)
  }

  // Placeholder referral acceptance — logs for now until the backend
  // endpoint lands (per Chunk 10 spec, no backend implementation here).
  const handleAcceptReferral = (id: string) => {
    // eslint-disable-next-line no-console
    console.info('[notifications] accept referral', id)
    showToast('Referral accepted', 'success')
  }

  const handleDismissJob = (id: string) => {
    // eslint-disable-next-line no-console
    console.info('[notifications] dismiss job', id)
    showToast('Dismissed', 'info')
  }

  const handleReply = (id: string) => {
    const target = notifications.find(n => n._id === id)
    if (target?.link) {
      navigate(`${target.link}${target.link.includes('?') ? '&' : '?'}reply=1`)
    } else {
      navigate(`/community/notifications?reply=${id}`)
    }
  }

  const handleSaveOpportunity = (id: string) => {
    // eslint-disable-next-line no-console
    console.info('[notifications] save opportunity', id)
    showToast('Opportunity saved', 'success')
  }

  const unread = notifications.filter(n => !n.read).length

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-xl">
        <div className="flex items-center gap-3">
          <h1 className="text-headline-lg text-on-surface font-semibold">Notifications</h1>
          {unread > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-primary text-white text-label-xs font-medium">{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={handleMarkAllRead} className="text-label-sm text-primary hover:underline">
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CommunityEmptyState
            icon={Bell}
            title="All caught up"
            description="No new notifications"
            primaryAction={{
              label: 'Browse opportunities',
              href: '/community/opportunities',
            }}
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <Card
              key={n._id}
              data-testid="notification-row"
              data-notification-type={n.type}
              className={`transition-colors ${!n.read ? 'border-primary/30 bg-primary/[0.02]' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className={`text-body-md text-on-surface ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                      <p className="text-body-sm text-on-surface-variant mt-0.5">{n.message}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && (
                        <button onClick={() => handleMarkRead(n)} className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" aria-label="Mark as read">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-label-xs text-on-surface-variant mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  <NotificationActions
                    notification={n}
                    onAcceptReferral={handleAcceptReferral}
                    onDismissJob={handleDismissJob}
                    onReply={handleReply}
                    onSaveOpportunity={handleSaveOpportunity}
                    onView={handleView}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
