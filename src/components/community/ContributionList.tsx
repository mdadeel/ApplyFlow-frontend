import { useMemo, useState } from 'react'
import type { Contribution } from '../../services/community/contributions'
import { markHelpful } from '../../services/community/contributions'
import { ArrowUp as ThumbsUp, Users } from '../../lib/icons'
import { TrustBadge, type TrustBadgeTone } from './TrustBadge'

const CONTRIBUTION_TYPE_ICONS = new Map<string, string>([
  ['interview_insight', '🎙️'],
  ['salary_update', '💰'],
  ['culture_review', '🏢'],
  ['referral_available', '🤝'],
  ['application_tip', '💡'],
  ['skill_suggestion', '🔧'],
  ['jd_verification', '✅'],
  ['deadline_update', '📅'],
  ['general', '📝'],
])

const CONTRIBUTION_TYPE_LABELS = new Map<string, string>([
  ['interview_insight', 'Interview Insight'],
  ['salary_update', 'Salary Update'],
  ['culture_review', 'Culture Review'],
  ['referral_available', 'Referral Available'],
  ['application_tip', 'Application Tip'],
  ['skill_suggestion', 'Skill Suggestion'],
  ['jd_verification', 'JD Verification'],
  ['deadline_update', 'Deadline Update'],
  ['general', 'General'],
])

const LABEL_NEWEST = 'Newest'
const LABEL_MOST_HELPFUL = 'Most helpful'
const LABEL_ANONYMOUS = 'Anonymous'
const LABEL_HELPFUL = 'Helpful'

export type ContributionSort = 'newest' | 'helpful'

export interface ContributionAuthor {
  id: string
  name: string
  reputation?: number
  isVerified?: boolean
  contributionsCount?: number
}

export interface ContributionListProps {
  opportunityId: string
  contributions: Contribution[]
  /** Optional map of userId → author info. Missing entries show a placeholder. */
  authors?: Record<string, ContributionAuthor>
  /** Called when the helpful toggle changes. If omitted, an optimistic local toggle is applied. */
  onToggleHelpful?: (
    opportunityId: string,
    contributionId: string,
    next: boolean,
  ) => Promise<void> | void
}

function resolveAuthorBadge(reputation: number | undefined): {
  tone: TrustBadgeTone
  label: string
} {
  if (reputation === undefined) return { tone: 'new', label: 'New' }
  if (reputation >= 500) return { tone: 'top-contributor', label: 'Top Contributor' }
  if (reputation >= 100) return { tone: 'trusted', label: 'Trusted' }
  return { tone: 'verified', label: 'Member' }
}

function sortContributions(
  list: Contribution[],
  sort: ContributionSort,
): Contribution[] {
  const copy = [...list]
  if (sort === 'helpful') {
    copy.sort((a, b) => b.helpfulCount - a.helpfulCount)
  } else {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  }
  return copy
}

export function ContributionList({
  opportunityId,
  contributions,
  authors = {},
  onToggleHelpful,
}: ContributionListProps) {
  const [sort, setSort] = useState<ContributionSort>('newest')
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(() => {
    return new Set(
      contributions.filter(c => c.isHelpful).map(c => c._id),
    )
  })
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())

  const sorted = useMemo(
    () => sortContributions(contributions, sort),
    [contributions, sort],
  )

  const authorMap = useMemo(() => new Map(Object.entries(authors)), [authors])

  const handleToggleHelpful = async (contributionId: string) => {
    if (pendingIds.has(contributionId)) return
    const wasHelpful = helpfulIds.has(contributionId)
    const next = !wasHelpful

    // Optimistic update
    setHelpfulIds(prev => {
      const updated = new Set(prev)
      if (next) updated.add(contributionId)
      else updated.delete(contributionId)
      return updated
    })
    setPendingIds(prev => new Set(prev).add(contributionId))

    try {
      if (onToggleHelpful) {
        await onToggleHelpful(opportunityId, contributionId, next)
      } else {
        await markHelpful(opportunityId, contributionId)
      }
    } catch {
      // Roll back optimistic update on error
      setHelpfulIds(prev => {
        const updated = new Set(prev)
        if (wasHelpful) updated.add(contributionId)
        else updated.delete(contributionId)
        return updated
      })
    } finally {
      setPendingIds(prev => {
        const updated = new Set(prev)
        updated.delete(contributionId)
        return updated
      })
    }
  }

  if (contributions.length === 0) {
    // Render nothing here — the parent is expected to render CommunityEmptyState.
    return null
  }

  return (
    <div data-testid="contribution-list" className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">
          {contributions.length} contribution{contributions.length === 1 ? '' : 's'}
        </p>
        <div
          role="group"
          aria-label="Sort contributions"
          className="inline-flex items-center gap-1 p-0.5 rounded-full border border-outline-variant bg-surface"
        >
          <button
            type="button"
            onClick={() => setSort('newest')}
            aria-pressed={sort === 'newest'}
            data-testid="contribution-sort-newest"
            className={[
              'px-2.5 py-1 rounded-full text-label-xs font-medium transition-colors',
              sort === 'newest'
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {LABEL_NEWEST}
          </button>
          <button
            type="button"
            onClick={() => setSort('helpful')}
            aria-pressed={sort === 'helpful'}
            data-testid="contribution-sort-helpful"
            className={[
              'px-2.5 py-1 rounded-full text-label-xs font-medium transition-colors',
              sort === 'helpful'
                ? 'bg-primary text-white'
                : 'text-on-surface-variant hover:text-on-surface',
            ].join(' ')}
          >
            {LABEL_MOST_HELPFUL}
          </button>
        </div>
      </div>

      <ul className="space-y-3" aria-label="Contributions">
        {sorted.map(c => {
          const isHelpful = helpfulIds.has(c._id)
          const isPending = pendingIds.has(c._id)
          const author = authorMap.get(c.userId)
          const showAuthor = !c.isAnonymous && author
          const authorBadge = resolveAuthorBadge(author?.reputation)
          const baseCount = c.helpfulCount ?? 0
          const helpfulCount = baseCount + (isHelpful ? 1 : 0) - (helpfulIds.has(c._id) && !isHelpful ? 1 : 0)

          return (
            <li
              key={c._id}
              data-testid="contribution-item"
              className="p-3 rounded-lg bg-surface-container-low border border-outline-variant"
            >
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm" aria-hidden="true">
                  {CONTRIBUTION_TYPE_ICONS.get(c.type) || '📝'}
                </span>
                <span className="text-label-xs text-on-surface-variant px-1.5 py-0.5 bg-surface-container-high rounded">
                  {CONTRIBUTION_TYPE_LABELS.get(c.type) || c.type}
                </span>
                {showAuthor ? (
                  <span className="inline-flex items-center gap-1 text-label-xs text-on-surface-variant">
                    <Users size={12} aria-hidden="true" />
                    <span>{author.name}</span>
                    <TrustBadge tone={authorBadge.tone} label={authorBadge.label} />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-label-xs text-on-surface-variant">
                    <Users size={12} aria-hidden="true" />
                    <span className="italic">{LABEL_ANONYMOUS}</span>
                  </span>
                )}
                <span className="text-label-xs text-on-surface-variant ml-auto">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-body-md text-on-surface font-medium">{c.title}</h4>
              <p className="text-body-sm text-on-surface-variant mt-1 whitespace-pre-wrap">
                {c.body}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleHelpful(c._id)}
                  disabled={isPending}
                  aria-pressed={isHelpful}
                  data-testid="contribution-helpful-toggle"
                  className={[
                    'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-label-xs font-medium border transition-colors disabled:opacity-50',
                    isHelpful
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-primary/40',
                  ].join(' ')}
                >
                  <ThumbsUp
                    size={12}
                    weight={isHelpful ? 'fill' : 'regular'}
                    aria-hidden="true"
                  />
                  <span data-testid="contribution-helpful-count">{helpfulCount}</span>
                  <span>{LABEL_HELPFUL}</span>
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

