import type { CommunityNotification, CommunityNotificationType } from '../../services/community/notifications'
import { BookmarkSimple, Handshake, MessageCircle, Eye } from '../../lib/icons'

export interface NotificationActionsProps {
  notification: CommunityNotification
  onAcceptReferral?: (id: string) => void
  onDismissJob?: (id: string) => void
  onReply?: (id: string) => void
  onSaveOpportunity?: (id: string) => void
  onView: (link: string) => void
}

interface InlineAction {
  label: string
  onClick: () => void
  ariaLabel: string
  variant: 'primary' | 'secondary'
  icon: typeof Eye
  testId: string
}

/**
 * Map of notification type -> inline action(s) to render.
 *
 * Spec (Chunk 10):
 *   - referral_accepted -> "View referral"
 *   - new_comment / mention -> "Reply"
 *   - resume_feedback -> "View feedback"
 *   - company_hiring / match_found / deadline_approaching -> "Save opportunity"
 *   - everything else -> "View" (navigates to notification.link)
 *
 * Multiple actions can be returned per notification by separating them in the
 * returned array.
 */
function resolveActions(
  notification: CommunityNotification,
  props: Omit<NotificationActionsProps, 'notification'>,
): InlineAction[] {
  const { onDismissJob, onReply, onSaveOpportunity, onView } = props
  const id = notification._id
  const link = notification.link ?? '/community/notifications'

  switch (notification.type as CommunityNotificationType) {
    case 'referral_accepted':
      return [
        {
          label: 'View referral',
          onClick: () => onView(link),
          ariaLabel: 'View referral',
          variant: 'primary',
          icon: Handshake,
          testId: 'notification-action-view-referral',
        },
      ]

    case 'new_comment':
    case 'mention':
      return [
        {
          label: 'Reply',
          onClick: () => (onReply ? onReply(id) : onView(link)),
          ariaLabel: 'Reply',
          variant: 'primary',
          icon: MessageCircle,
          testId: 'notification-action-reply',
        },
        {
          label: 'View',
          onClick: () => onView(link),
          ariaLabel: 'View',
          variant: 'secondary',
          icon: Eye,
          testId: 'notification-action-view',
        },
      ]

    case 'resume_feedback':
      return [
        {
          label: 'View feedback',
          onClick: () => onView(link),
          ariaLabel: 'View feedback',
          variant: 'primary',
          icon: Eye,
          testId: 'notification-action-view-feedback',
        },
      ]

    case 'company_hiring':
    case 'match_found':
    case 'deadline_approaching':
      return [
        ...(onSaveOpportunity
          ? [
              {
                label: 'Save opportunity',
                onClick: () => onSaveOpportunity(id),
                ariaLabel: 'Save opportunity',
                variant: 'primary' as const,
                icon: BookmarkSimple,
                testId: 'notification-action-save',
              },
            ]
          : []),
        ...(onDismissJob
          ? [
              {
                label: 'Dismiss',
                onClick: () => onDismissJob(id),
                ariaLabel: 'Dismiss job notification',
                variant: 'secondary' as const,
                icon: Eye,
                testId: 'notification-action-dismiss',
              },
            ]
          : []),
        {
          label: 'View',
          onClick: () => onView(link),
          ariaLabel: 'View',
          variant: 'secondary',
          icon: Eye,
          testId: 'notification-action-view',
        },
      ]

    default:
      return [
        {
          label: 'View',
          onClick: () => onView(link),
          ariaLabel: 'View',
          variant: 'primary',
          icon: Eye,
          testId: 'notification-action-view',
        },
      ]
  }
}

/**
 * Renders the contextual inline action(s) for a notification row.
 *
 * The component is intentionally presentational — it never calls services
 * directly. Each action simply invokes the matching prop callback so the
 * page (or test harness) decides what to do.
 */
export function NotificationActions({
  notification,
  onAcceptReferral,
  onDismissJob,
  onReply,
  onSaveOpportunity,
  onView,
}: NotificationActionsProps) {
  const actions = resolveActions(notification, {
    onAcceptReferral,
    onDismissJob,
    onReply,
    onSaveOpportunity,
    onView,
  })

  if (actions.length === 0) return null

  return (
    <div
      data-testid="notification-actions"
      data-notification-type={notification.type}
      className="mt-2 flex flex-wrap items-center gap-2"
    >
      {actions.map(action => {
        const Icon = action.icon
        const baseClass =
          'inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full font-label-sm transition-colors duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed'
        const variantClass =
          action.variant === 'primary'
            ? 'bg-primary-container text-on-primary hover:bg-primary'
            : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-container-low'
        return (
          <button
            key={action.testId}
            type="button"
            onClick={action.onClick}
            aria-label={action.ariaLabel}
            data-testid={action.testId}
            className={`${baseClass} ${variantClass}`}
          >
            <Icon size={14} aria-hidden="true" />
            <span>{action.label}</span>
          </button>
        )
      })}
    </div>
  )
}
