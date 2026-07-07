import { useMemo, useState } from 'react'
import { Handshake, Plus } from '../../lib/icons'
import { Button } from '../ui/Button'
import { CommunityEmptyState } from './CommunityEmptyState'

export type ReferralType = 'request' | 'offer'
export type ReferralStatus = 'open' | 'accepted' | 'completed' | 'withdrawn' | 'expired'

export interface Referral {
  _id: string
  type: ReferralType
  userId: string
  company: string
  roleTitle?: string
  opportunityId?: string
  message: string
  status: ReferralStatus
  matchedUserId?: string
  createdAt: string
  updatedAt: string
}

const STATUS_BADGES: Record<ReferralStatus, string> = {
  open: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  accepted: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  completed: 'bg-primary/10 text-primary border-primary/30',
  withdrawn: 'bg-surface-container-low text-on-surface-variant border-outline-variant',
  expired: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
}

const STATUS_LABELS: Record<ReferralStatus, string> = {
  open: 'Open',
  accepted: 'Accepted',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
}

export interface ReferralListProps {
  referrals: Referral[]
  companyName: string
  onRequest?: () => void
  onOffer?: () => void
  onAccept?: (referralId: string) => void
  emptyStatePrimary?: { label: string; onClick?: () => void; href?: string }
  emptyStateSecondary?: { label: string; onClick?: () => void; href?: string }
}

export function ReferralList({
  referrals,
  companyName,
  onRequest,
  onOffer,
  onAccept,
  emptyStatePrimary,
  emptyStateSecondary,
}: ReferralListProps) {
  const [busyId, setBusyId] = useState<string | null>(null)

  const offers = useMemo(() => referrals.filter(r => r.type === 'offer'), [referrals])
  const requests = useMemo(() => referrals.filter(r => r.type === 'request'), [referrals])

  if (referrals.length === 0) {
    return (
      <div data-testid="referral-empty">
        <CommunityEmptyState
          icon={Handshake}
          title="No open referrals"
          description={`Be the first to request or offer a referral for ${companyName}.`}
          primaryAction={
            emptyStatePrimary ?? {
              label: 'Request referral',
              ...(onRequest ? { onClick: onRequest } : { href: '/community/referrals/request' }),
            }
          }
          secondaryAction={
            emptyStateSecondary ?? (onOffer
              ? { label: 'Offer referral', onClick: onOffer }
              : undefined)
          }
        />
      </div>
    )
  }

  const handleAccept = async (referralId: string) => {
    if (!onAccept || busyId) return
    setBusyId(referralId)
    try {
      await onAccept(referralId)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div data-testid="referral-list" className="space-y-6">
      {offers.length > 0 && (
        <section aria-labelledby="referral-offers-heading">
          <h3
            id="referral-offers-heading"
            className="text-headline-sm text-on-surface font-semibold mb-2"
          >
            Open offers ({offers.length})
          </h3>
          <ul className="space-y-3">
            {offers.map(r => (
              <ReferralItem
                key={r._id}
                referral={r}
                onAccept={onAccept ? () => handleAccept(r._id) : undefined}
                busy={busyId === r._id}
              />
            ))}
          </ul>
        </section>
      )}

      {requests.length > 0 && (
        <section aria-labelledby="referral-requests-heading">
          <h3
            id="referral-requests-heading"
            className="text-headline-sm text-on-surface font-semibold mb-2"
          >
            Open requests ({requests.length})
          </h3>
          <ul className="space-y-3">
            {requests.map(r => (
              <ReferralItem
                key={r._id}
                referral={r}
                onAccept={onAccept ? () => handleAccept(r._id) : undefined}
                busy={busyId === r._id}
              />
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t border-outline-variant">
        {onRequest && (
          <Button variant="primary" onClick={onRequest}>
            <Plus size={14} aria-hidden="true" />
            Request referral
          </Button>
        )}
        {onOffer && (
          <Button variant="secondary" onClick={onOffer}>
            <Handshake size={14} aria-hidden="true" />
            Offer referral
          </Button>
        )}
      </div>
    </div>
  )
}

function ReferralItem({
  referral,
  onAccept,
  busy,
}: {
  referral: Referral
  onAccept?: () => void
  busy: boolean
}) {
  return (
    <li
      data-testid="referral-item"
      className="p-3 rounded-lg bg-surface-container-low border border-outline-variant"
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-label-sm text-on-surface font-medium">
          {referral.company}
        </span>
        {referral.roleTitle && (
          <span className="text-label-sm text-on-surface-variant">
            — {referral.roleTitle}
          </span>
        )}
        <span
          data-testid="referral-status"
          className={[
            'ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-medium border',
            STATUS_BADGES[referral.status],
          ].join(' ')}
        >
          {STATUS_LABELS[referral.status]}
        </span>
      </div>
      <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">
        {referral.message}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-label-xs text-on-surface-variant">
          Posted {new Date(referral.createdAt).toLocaleDateString()}
        </span>
        {onAccept && referral.status === 'open' && referral.type === 'offer' && (
          <Button
            variant="primary"
            onClick={onAccept}
            disabled={busy}
            className="ml-auto"
          >
            {busy ? 'Accepting…' : 'Accept'}
          </Button>
        )}
      </div>
    </li>
  )
}
