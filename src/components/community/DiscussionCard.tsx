import { Link } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Pin } from '../../lib/icons'
import {
  DISCUSSION_CHANNEL_LABELS,
  type Discussion,
} from '../../services/community/discussions'
import type { ReputationLevel } from '../../services/community/reputation'
import { ReputationBadge } from './ReputationBadge'

interface DiscussionCardProps {
  discussion: Discussion
  /**
   * When provided, the card links to `/community/discussions/:channel/:id`.
   * When omitted, the card links to `/community/discussions/:id` for legacy routes.
   */
  includeChannelInHref?: boolean
  /** Reputation level for the discussion author (shown next to author name). */
  reputationLevel?: ReputationLevel
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

/**
 * Compact card that represents a discussion in a channel listing.
 *
 * Links into the discussion thread page. Shows channel badge, title, body
 * preview, reply count, helpful count, and a pinned indicator.
 */
export function DiscussionCard({
  discussion,
  includeChannelInHref = false,
  reputationLevel,
}: DiscussionCardProps) {
  const href = includeChannelInHref
    ? `/community/discussions/${discussion.channel}/${discussion._id}`
    : `/community/discussions/${discussion._id}`

  const channelLabel = DISCUSSION_CHANNEL_LABELS[discussion.channel] ?? 'General'

  return (
    <article
      data-testid="discussion-card"
      data-discussion-id={discussion._id}
      className="p-4 rounded-xl border border-outline-variant bg-surface hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
          <MessageSquare className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-label-xs text-on-surface-variant">
              {channelLabel}
            </span>
            {discussion.isPinned && (
              <span
                data-testid="discussion-card-pinned"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-label-xs"
              >
                <Pin className="w-3 h-3" aria-hidden="true" />
                Pinned
              </span>
            )}
            <span className="text-label-xs text-on-surface-variant ml-auto">
              {relativeTime(discussion.createdAt)}
            </span>
          </div>

          <h3 className="text-headline-sm text-on-surface font-semibold mb-1">
            <Link
              to={href}
              data-testid="discussion-card-title"
              className="hover:text-primary transition-colors line-clamp-2"
            >
              {discussion.title}
            </Link>
          </h3>

          {discussion.body && (
            <p
              data-testid="discussion-card-preview"
              className="text-body-sm text-on-surface-variant line-clamp-2 mb-2"
            >
              {discussion.body}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
            {discussion.authorName && (
              <span data-testid="discussion-card-author" className="inline-flex items-center gap-1">
                by {discussion.authorName}
                {reputationLevel && <ReputationBadge level={reputationLevel} />}
              </span>
            )}
            <span data-testid="discussion-card-replies" className="inline-flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              {discussion.replyCount} {discussion.replyCount === 1 ? 'reply' : 'replies'}
            </span>
            <span className="inline-flex items-center gap-1">
              <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
              {discussion.helpfulCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
