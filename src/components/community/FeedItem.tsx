import { useNavigate } from 'react-router-dom'
import {
  AtSign,
  Bell,
  Briefcase,
  Clock,
  Handshake,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
} from '../../lib/icons'
import type { FeedItem as FeedItemModel, FeedItemType } from '../../services/community/feed'
import { Avatar } from '../ui/Avatar'
import {
  AcceptReferralAction,
  FeedItemAction,
  HelpReferralAction,
  JoinDiscussionAction,
  ReplyDiscussionAction,
  SaveOpportunityAction,
  ViewOpportunityAction,
} from './FeedItemAction'

interface FeedItemProps {
  item: FeedItemModel
  onSaveOpportunity?: (opportunityId: string) => void
  onDismiss?: (item: FeedItemModel) => void
}

interface IconSpec {
  Icon: typeof Briefcase
  tone: string
}

const ICONS: Record<FeedItemType, IconSpec> = {
  new_opportunity: { Icon: Briefcase, tone: 'text-primary' },
  saved_opportunity_update: { Icon: Bell, tone: 'text-primary' },
  new_contribution: { Icon: MessageSquare, tone: 'text-primary' },
  new_discussion: { Icon: Users, tone: 'text-primary' },
  referral_request: { Icon: Handshake, tone: 'text-primary' },
  referral_offer: { Icon: Handshake, tone: 'text-primary' },
  deadline_approaching: { Icon: Clock, tone: 'text-amber-600' },
  trending_skill: { Icon: TrendingUp, tone: 'text-emerald-600' },
  review_received: { Icon: Star, tone: 'text-amber-500' },
  mention: { Icon: AtSign, tone: 'text-primary' },
}

/**
 * Derives the navigation target for a feed item based on its entity type.
 * Falls back to `entityId` in the entity's detail route.
 */
export function getFeedItemHref(item: FeedItemModel): string {
  switch (item.entityType) {
    case 'opportunity':
      return `/community/opportunities/${item.entityId}`
    case 'discussion':
      return `/community/discussions/general/${item.entityId}`
    case 'referral':
      return `/community/referrals`
    case 'notification':
    default:
      return `/community/notifications`
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return 'just now'
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)}d ago`
  return date.toLocaleDateString()
}

/**
 * Single feed row — icon, title, summary, timestamp, actor, and contextual actions.
 * Acts as a focusable card; pressing Enter / clicking the body navigates to the
 * underlying entity.
 */
export function FeedItem({ item, onSaveOpportunity, onDismiss }: FeedItemProps) {
  const navigate = useNavigate()
  const spec = ICONS[item.type] ?? ICONS.new_opportunity
  const Icon = spec.Icon
  const href = getFeedItemHref(item)

  const handleOpen = () => {
    navigate(href)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleOpen()
    }
  }

  return (
    <article
      data-testid="feed-item"
      data-feed-item-type={item.type}
      className="bg-surface border border-outline-variant rounded-xl p-4 transition-colors hover:border-primary/40 focus-within:border-primary"
    >
      <div className="flex items-start gap-3">
        <div
          aria-hidden="true"
          className={`shrink-0 w-9 h-9 rounded-full bg-primary-container flex items-center justify-center ${spec.tone}`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            role="button"
            tabIndex={0}
            onClick={handleOpen}
            onKeyDown={handleKeyDown}
            aria-label={`${item.title} — open`}
            className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-headline-sm text-on-surface font-semibold leading-snug">
                {item.title}
              </h3>
              <span className="text-label-xs text-on-surface-variant shrink-0">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
            {item.actorName && (
              <p className="text-label-sm text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                <Avatar
                  src={item.avatarUrl}
                  name={item.actorName}
                  size="sm"
                  className="w-5 h-5 text-label-xs"
                />
                <span>{item.actorName}</span>
              </p>
            )}
            <p className="text-body-sm text-on-surface-variant mt-1 line-clamp-2">
              {item.summary}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {renderActions(item, onSaveOpportunity)}
            {onDismiss && (
              <button
                type="button"
                onClick={() => onDismiss(item)}
                className="text-label-xs text-on-surface-variant hover:text-on-surface ml-auto"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

function renderActions(
  item: FeedItemModel,
  onSaveOpportunity?: (id: string) => void,
) {
  switch (item.type) {
    case 'new_opportunity':
      return (
        <>
          {onSaveOpportunity && (
            <SaveOpportunityAction
              opportunityId={item.entityId}
              onClick={() => onSaveOpportunity(item.entityId)}
            />
          )}
          <ViewOpportunityAction opportunityId={item.entityId} />
        </>
      )

    case 'saved_opportunity_update':
    case 'deadline_approaching':
    case 'new_contribution':
      return <ViewOpportunityAction opportunityId={item.entityId} />

    case 'new_discussion':
      return (
        <JoinDiscussionAction
          href={`/community/discussions/general/${item.entityId}`}
        />
      )

    case 'referral_request':
      return <HelpReferralAction href={`/community/referrals`} />

    case 'referral_offer':
      return <AcceptReferralAction href={`/community/referrals`} />

    case 'review_received':
      return (
        <ReplyDiscussionAction
          href={`/community/discussions/general/${item.entityId}`}
        />
      )

    case 'mention':
      return (
        <ReplyDiscussionAction
          href={`/community/discussions/general/${item.entityId}`}
        />
      )

    case 'trending_skill':
      return (
        <FeedItemAction
          kind="link"
          variant="primary"
          label="Browse roles"
          href={`/community/opportunities?skills=${encodeURIComponent(item.entityId)}`}
        />
      )

    default:
      return null
  }
}
