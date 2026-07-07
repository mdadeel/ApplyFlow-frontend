import type { ReferralStatus } from '../../services/community/referrals'

const STATUS_STYLES: Record<ReferralStatus, string> = {
  open: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  matched: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  accepted: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-primary-container text-on-primary-container border-primary/30',
  withdrawn: 'bg-surface-container-low text-on-surface-variant border-outline-variant',
  expired: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
}

const STATUS_LABELS: Record<ReferralStatus, string> = {
  open: 'Open',
  matched: 'Matched',
  accepted: 'Accepted',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
  expired: 'Expired',
}

interface ReferralStatusBadgeProps {
  status: ReferralStatus
  className?: string
}

export function ReferralStatusBadge({ status, className }: ReferralStatusBadgeProps) {
  return (
    <span
      data-testid="referral-status-badge"
      data-status={status}
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-medium border',
        STATUS_STYLES[status],
        className ?? '',
      ]
        .join(' ')
        .trim()}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
