import type { Referral, ReferralType } from '../../services/community/referrals'
import { Briefcase, MapPin, Handshake, MessageCircle } from '../../lib/icons'
import { ReferralStatusBadge } from './ReferralStatusBadge'

interface ReferralCardProps {
  referral: Referral
  onAccept?: (referral: Referral) => void
  onWithdraw?: (referral: Referral) => void
  onView?: (referral: Referral) => void
  busy?: boolean
  showActions?: boolean
}

const TYPE_BADGES: Record<ReferralType, string> = {
  request: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  offer: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
}

const TYPE_LABELS: Record<ReferralType, string> = {
  request: 'Request',
  offer: 'Offer',
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
  return `${Math.floor(months / 12)}y ago`
}

function truncateMessage(message: string, max = 220): string {
  if (message.length <= max) return message
  return `${message.slice(0, max).trimEnd()}…`
}

export function ReferralCard({
  referral,
  onAccept,
  onWithdraw,
  onView,
  busy = false,
  showActions = true,
}: ReferralCardProps) {
  const isOpen = referral.status === 'open'
  const canAccept = Boolean(onAccept) && isOpen && referral.type === 'offer'
  const canWithdraw = Boolean(onWithdraw) && isOpen

  return (
    <article
      data-testid="referral-card"
      data-referral-id={referral._id}
      data-referral-type={referral.type}
      data-referral-status={referral.status}
      className="p-4 rounded-xl border border-outline-variant bg-surface hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <header className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              data-testid="referral-card-type"
              className={[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-xs font-medium border',
                TYPE_BADGES[referral.type],
              ].join(' ')}
            >
              {referral.type === 'offer' ? (
                <Handshake className="w-3 h-3" aria-hidden="true" />
              ) : (
                <MessageCircle className="w-3 h-3" aria-hidden="true" />
              )}
              {TYPE_LABELS[referral.type]}
            </span>
            <ReferralStatusBadge status={referral.status} />
            <span className="text-label-xs text-on-surface-variant ml-auto">
              {relativeTime(referral.createdAt)}
            </span>
          </div>
          <h3 className="text-headline-sm text-on-surface font-semibold truncate">
            {referral.company}
          </h3>
          {referral.roleTitle && (
            <p className="text-body-sm text-on-surface-variant truncate">
              {referral.roleTitle}
            </p>
          )}
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant mb-2">
        {referral.location && (
          <span className="inline-flex items-center gap-1" data-testid="referral-card-location">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {referral.location}
          </span>
        )}
        {referral.roleLevel && (
          <span className="inline-flex items-center gap-1" data-testid="referral-card-role-level">
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            {referral.roleLevel}
          </span>
        )}
      </div>

      <p
        data-testid="referral-card-message"
        className="text-body-sm text-on-surface whitespace-pre-wrap"
      >
        {truncateMessage(referral.message)}
      </p>

      {showActions && (onAccept || onWithdraw || onView) && (
        <footer className="mt-3 pt-2 border-t border-outline-variant flex flex-wrap items-center gap-2">
          <span className="text-label-xs text-on-surface-variant">
            Posted {relativeTime(referral.createdAt)}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {onView && (
              <button
                type="button"
                onClick={() => onView(referral)}
                className="inline-flex items-center h-8 px-3 rounded-md text-label-sm border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all duration-150 active:scale-[0.97]"
                data-testid="referral-card-view"
              >
                View details
              </button>
            )}
            {canWithdraw && onWithdraw && (
              <button
                type="button"
                onClick={() => onWithdraw(referral)}
                disabled={busy}
                className="inline-flex items-center h-8 px-3 rounded-md text-label-sm border border-outline-variant text-on-surface hover:bg-surface-container-low transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="referral-card-withdraw"
              >
                {busy ? 'Working…' : 'Withdraw'}
              </button>
            )}
            {canAccept && onAccept && (
              <button
                type="button"
                onClick={() => onAccept(referral)}
                disabled={busy}
                className="inline-flex items-center h-8 px-3 rounded-md text-label-sm bg-primary text-on-primary hover:brightness-110 transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="referral-card-accept"
              >
                {busy ? 'Accepting…' : 'Accept'}
              </button>
            )}
          </div>
        </footer>
      )}
    </article>
  )
}
