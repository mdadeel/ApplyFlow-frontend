import { Briefcase, BookmarkSimple, Handshake, MessageSquare } from '../../lib/icons'

export interface MyActivityCounts {
  savedCount: number
  appliedCount: number
  contributionsCount: number
  referralsCount: number
}

interface MyActivitySummaryProps {
  counts: MyActivityCounts
  className?: string
}

interface StatCard {
  label: string
  value: number
  Icon: typeof Briefcase
  href: string
  testId: string
  accent: string
}

const CARDS: (keyof MyActivityCounts)[] = [
  'savedCount',
  'appliedCount',
  'contributionsCount',
  'referralsCount',
]

/**
 * Four summary cards for the My Activity tab — Saved, Applied, Contributions, Referrals.
 * Each card is a link to the relevant surface.
 */
export function MyActivitySummary({ counts, className = '' }: MyActivitySummaryProps) {
  const cardDefs: Record<keyof MyActivityCounts, StatCard> = {
    savedCount: {
      label: 'Saved',
      value: counts.savedCount,
      Icon: BookmarkSimple,
      href: '/community/opportunities?saved=true',
      testId: 'activity-saved',
      accent: 'text-primary',
    },
    appliedCount: {
      label: 'Applied',
      value: counts.appliedCount,
      Icon: Briefcase,
      href: '/applications',
      testId: 'activity-applied',
      accent: 'text-emerald-600',
    },
    contributionsCount: {
      label: 'Contributions',
      value: counts.contributionsCount,
      Icon: MessageSquare,
      href: '/community/discussions',
      testId: 'activity-contributions',
      accent: 'text-blue-600',
    },
    referralsCount: {
      label: 'Referrals',
      value: counts.referralsCount,
      Icon: Handshake,
      href: '/community/referrals',
      testId: 'activity-referrals',
      accent: 'text-amber-600',
    },
  }

  return (
    <div
      data-testid="my-activity-summary"
      className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${className}`}
    >
      {CARDS.map(key => {
        const card = cardDefs[key]
        return (
          <a
            key={key}
            href={card.href}
            data-testid={card.testId}
            className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors"
          >
            <span className={`inline-flex w-8 h-8 rounded-full bg-primary-container items-center justify-center ${card.accent}`}>
              <card.Icon size={16} aria-hidden="true" />
            </span>
            <span className="text-headline-lg text-on-surface font-semibold">
              {card.value}
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {card.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
