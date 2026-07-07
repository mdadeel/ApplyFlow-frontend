import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Plus } from '../../lib/icons'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import { FeedItem } from '../../components/community/FeedItem'
import { FeedSkeleton } from '../../components/community/FeedSkeleton'
import { MyActivitySummary } from '../../components/community/MyActivitySummary'
import { TrendingWidget } from '../../components/community/TrendingWidget'
import {
  emptyForYouPage,
  emptyTrending,
  emptyMyActivity,
  getCommunityFeed,
  type FeedForYouPage,
  type FeedItem as FeedItemModel,
  type FeedMyActivity,
  type FeedTab,
  type FeedTrending,
} from '../../services/community/feed'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/layout/useToast'

const TABS: { id: FeedTab; label: string }[] = [
  { id: 'for-you', label: 'For You' },
  { id: 'trending', label: 'Trending' },
  { id: 'my-activity', label: 'My Activity' },
]

const FEED_PAGE_LIMIT = 20

function isFeedTab(value: string | null): value is FeedTab {
  return value === 'for-you' || value === 'trending' || value === 'my-activity'
}

interface LoadState<T> {
  data: T
  loading: boolean
  loadingMore: boolean
  error: string | null
}

function makeInitialState<T>(initial: T): LoadState<T> {
  return { data: initial, loading: true, loadingMore: false, error: null }
}

export function FeedPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: FeedTab = isFeedTab(tabParam) ? tabParam : 'for-you'
  const { showToast } = useToast()

  const setTab = useCallback(
    (tab: FeedTab) => {
      const next = new URLSearchParams(searchParams)
      if (tab === 'for-you') {
        next.delete('tab')
      } else {
        next.set('tab', tab)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const [forYou, setForYou] = useState<LoadState<FeedForYouPage>>(() =>
    makeInitialState<FeedForYouPage>(emptyForYouPage()),
  )
  const [trending, setTrending] = useState<LoadState<FeedTrending>>(() =>
    makeInitialState<FeedTrending>(emptyTrending()),
  )
  const [myActivity, setMyActivity] = useState<LoadState<FeedMyActivity>>(() =>
    makeInitialState<FeedMyActivity>(emptyMyActivity()),
  )
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const run = async () => {
      const beginLoading = <T,>(setter: React.Dispatch<React.SetStateAction<LoadState<T>>>) =>
        setter((prev) => ({ ...prev, loading: true, error: null }))
      const finishWithError = <T,>(
        setter: React.Dispatch<React.SetStateAction<LoadState<T>>>,
        message: string,
      ) =>
        setter((prev) => ({ ...prev, loading: false, error: message }))

      try {
        // getCommunityFeed already returns a normalized, tab-specific shape.
        const response = await getCommunityFeed(
          { tab: activeTab, limit: FEED_PAGE_LIMIT },
          signal,
        )

        if (signal.aborted) return

        switch (activeTab) {
          case 'for-you':
            beginLoading(setForYou)
            setForYou({
              data: response as FeedForYouPage,
              loading: false,
              loadingMore: false,
              error: null,
            })
            return
          case 'trending':
            beginLoading(setTrending)
            setTrending({
              data: response as FeedTrending,
              loading: false,
              loadingMore: false,
              error: null,
            })
            return
          case 'my-activity':
            beginLoading(setMyActivity)
            setMyActivity({
              data: response as FeedMyActivity,
              loading: false,
              loadingMore: false,
              error: null,
            })
            return
        }
      } catch (err) {
        if (signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        const message = err instanceof Error ? err.message : 'Couldn’t load your feed'
        switch (activeTab) {
          case 'for-you':
            finishWithError(setForYou, message)
            return
          case 'trending':
            finishWithError(setTrending, message)
            return
          case 'my-activity':
            finishWithError(setMyActivity, message)
            return
        }
      }
    }

    run()

    return () => controller.abort()
  }, [activeTab])

  // ── Infinite scroll for For You ───────────────────────────────────────
  const loadMoreRef = useRef<HTMLDivElement | null>(null)
  const handleLoadMore = useCallback(async () => {
    if (activeTab !== 'for-you') return
    const state = forYou
    if (state.loading || state.loadingMore || !state.data.hasMore) return

    setForYou((prev) => ({ ...prev, loadingMore: true, error: null }))
    try {
      const payload = (await getCommunityFeed({
        tab: 'for-you',
        cursor: state.data.nextCursor,
        limit: FEED_PAGE_LIMIT,
      })) as FeedForYouPage

      setForYou((prev) => {
        const seen = new Set(prev.data.items.map((it) => it.id))
        const merged = [
          ...prev.data.items,
          ...payload.items.filter((it) => !seen.has(it.id)),
        ]
        return {
          data: {
            items: merged,
            nextCursor: payload.nextCursor ?? prev.data.nextCursor,
            hasMore: payload.hasMore,
          },
          loading: false,
          loadingMore: false,
          error: null,
        }
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Couldn’t load more'
      setForYou((prev) => ({ ...prev, loadingMore: false, error: message }))
    }
  }, [activeTab, forYou])

  useEffect(() => {
    if (activeTab !== 'for-you') return
    const target = loadMoreRef.current
    if (!target) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void handleLoadMore()
          }
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [activeTab, handleLoadMore])

  const visibleForYou = useMemo(
    () => forYou.data.items.filter((item) => !dismissed.has(item.id)),
    [forYou.data.items, dismissed],
  )

  const handleSaveOpportunity = useCallback(
    (opportunityId: string) => {
      showToast('Saved — we’ll alert you to updates', 'success')
      // Best-effort local hint to My Activity counts.
      setMyActivity((prev) => ({
        ...prev,
        data: { ...prev.data, savedCount: prev.data.savedCount + 1 },
      }))
      // Optimistically mark as dismissed so the user sees the action take effect.
      void opportunityId
    },
    [showToast],
  )

  const handleDismiss = useCallback((item: FeedItemModel) => {
    setDismissed((prev) => {
      const next = new Set(prev)
      next.add(item.id)
      return next
    })
    showToast('Dismissed', 'info')
  }, [showToast])

  const handleRetry = useCallback(() => {
    // Toggle to force the effect to re-run.
    setTab(activeTab)
  }, [activeTab, setTab])

  return (
    <AppLayout>
    <div className="max-w-5xl mx-auto">
      <header className="mb-xl flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-headline-lg text-on-surface font-semibold">
            Community
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Personalized updates and trends for your job search
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => navigate('/community/opportunities/new')}
          >
            <Plus size={16} aria-hidden="true" />
            Add Opportunity
          </Button>

        </div>
      </header>

      <div
        role="tablist"
        aria-label="Community feed tabs"
        className="flex border-b border-outline-variant mb-lg overflow-x-auto"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              id={`feed-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`feed-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setTab(tab.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                  event.preventDefault()
                  const direction = event.key === 'ArrowRight' ? 1 : -1
                  const currentIndex = TABS.findIndex((t) => t.id === activeTab)
                  const nextIndex = (currentIndex + direction + TABS.length) % TABS.length
                  setTab(TABS[nextIndex].id)
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-3 text-label-md font-medium transition-colors duration-150 border-b-2 -mb-px whitespace-nowrap
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`feed-panel-${activeTab}`}
        aria-labelledby={`feed-tab-${activeTab}`}
      >
        {activeTab === 'for-you' && (
          <ForYouTab
            state={forYou}
            items={visibleForYou}
            loadMoreRef={loadMoreRef}
            onLoadMore={handleLoadMore}
            onSaveOpportunity={handleSaveOpportunity}
            onDismiss={handleDismiss}
            onRetry={handleRetry}
          />
        )}

        {activeTab === 'trending' && (
          <TrendingTab
            state={trending}
            onRetry={handleRetry}
          />
        )}

        {activeTab === 'my-activity' && (
          <MyActivityTab
            state={myActivity}
            onDismiss={handleDismiss}
            onSaveOpportunity={handleSaveOpportunity}
            onRetry={handleRetry}
          />
        )}
      </div>
    </div>
    </AppLayout>
  )
}

// ── Tab bodies ───────────────────────────────────────────────────────────────

interface ForYouTabProps {
  state: LoadState<FeedForYouPage>
  items: FeedItemModel[]
  loadMoreRef: React.RefObject<HTMLDivElement | null>
  onLoadMore: () => void
  onSaveOpportunity: (id: string) => void
  onDismiss: (item: FeedItemModel) => void
  onRetry: () => void
}

function ForYouTab({
  state,
  items,
  loadMoreRef,
  onLoadMore,
  onSaveOpportunity,
  onDismiss,
  onRetry,
}: ForYouTabProps) {
  if (state.loading) {
    return <FeedSkeleton count={5} />
  }

  if (state.error) {
    return <FeedErrorState message={state.error} onRetry={onRetry} />
  }

  if (items.length === 0) {
    const empty = communityEmptyStates.feedNoActivity
    return (
      <CommunityEmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        primaryAction={empty.primaryAction}
        secondaryAction={empty.secondaryAction}
        example={empty.example}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3" data-testid="for-you-list">
      {items.map((item) => (
        <FeedItem
          key={item.id}
          item={item}
          onSaveOpportunity={onSaveOpportunity}
          onDismiss={onDismiss}
        />
      ))}
      <div ref={loadMoreRef} aria-live="polite" className="py-4 text-center">
        {state.loadingMore && (
          <p className="text-label-sm text-on-surface-variant">Loading more…</p>
        )}
        {!state.loadingMore && state.data.hasMore && (
          <Button variant="secondary" onClick={onLoadMore}>
            Load more
          </Button>
        )}
        {!state.loadingMore && !state.data.hasMore && (
          <p className="text-label-sm text-on-surface-variant">
            You’re all caught up.
          </p>
        )}
      </div>
    </div>
  )
}

interface TrendingTabProps {
  state: LoadState<FeedTrending>
  onRetry: () => void
}

function TrendingTab({ state, onRetry }: TrendingTabProps) {
  if (state.loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FeedSkeleton count={4} />
      </div>
    )
  }

  if (state.error) {
    return <FeedErrorState message={state.error} onRetry={onRetry} />
  }

  const isEmpty =
    state.data.topCompanies.length === 0 &&
    state.data.topSkills.length === 0 &&
    state.data.salaryBands.length === 0 &&
    state.data.hiringVelocity.length === 0

  if (isEmpty) {
    const empty = communityEmptyStates.trendingEmpty
    return (
      <CommunityEmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        primaryAction={empty.primaryAction}
        secondaryAction={empty.secondaryAction}
        example={empty.example}
      />
    )
  }

  const maxCompany = Math.max(1, ...state.data.topCompanies.map((c) => c.count))
  const maxSkill = Math.max(1, ...state.data.topSkills.map((s) => s.count))
  const maxVelocity = Math.max(1, ...state.data.hiringVelocity.map((v) => v.count))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" data-testid="trending-grid">
      <TrendingWidget
        title="Top companies hiring"
        description="Most active companies in the last 30 days"
        action={{ label: 'Browse opportunities', href: '/community/opportunities' }}
      >
        <ul className="flex flex-col gap-2" data-testid="trending-companies">
          {state.data.topCompanies.map((company) => (
            <li key={company.company} className="flex items-center gap-3">
              <span className="text-body-sm text-on-surface w-32 truncate">
                {company.company}
              </span>
              <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${Math.round((company.count / maxCompany) * 100)}%` }}
                />
              </div>
              <span className="text-label-sm text-on-surface-variant w-8 text-right">
                {company.count}
              </span>
            </li>
          ))}
        </ul>
      </TrendingWidget>

      <TrendingWidget
        title="Trending skills"
        description="Skills showing up most in new postings"
        action={{ label: 'Filter by skill', href: '/community/opportunities' }}
      >
        <ul className="flex flex-col gap-2" data-testid="trending-skills">
          {state.data.topSkills.map((skill) => (
            <li key={skill.skill} className="flex items-center gap-3">
              <span className="text-body-sm text-on-surface w-32 truncate">
                {skill.skill}
              </span>
              <div className="flex-1 h-2 rounded-full bg-surface-container-low overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: `${Math.round((skill.count / maxSkill) * 100)}%` }}
                />
              </div>
              <span className="text-label-sm text-on-surface-variant w-8 text-right">
                {skill.count}
              </span>
            </li>
          ))}
        </ul>
      </TrendingWidget>

      <TrendingWidget
        title="Salary bands"
        description="Min / max by role level (n = postings)"
      >
        <ul className="flex flex-col gap-3" data-testid="trending-salary">
          {state.data.salaryBands.map((band) => {
            const span = Math.max(1, band.max - band.min)
            const minPct = Math.min(100, Math.max(0, (band.min / (band.max || 1)) * 100))
            return (
              <li key={band.roleLevel} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-label-sm">
                  <span className="text-on-surface font-medium capitalize">
                    {band.roleLevel}
                  </span>
                  <span className="text-on-surface-variant">
                    ${band.min.toLocaleString()} – ${band.max.toLocaleString()} · n={band.count}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                  <div
                    className="h-full bg-primary/70"
                    style={{ width: `${minPct}%` }}
                    title={`Range $${(band.max - band.min).toLocaleString()} (span ${span})`}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </TrendingWidget>

      <TrendingWidget
        title="Hiring velocity"
        description="New postings per week"
      >
        <div className="flex items-end gap-1 h-24" data-testid="trending-velocity">
          {state.data.hiringVelocity.map((point) => (
            <div
              key={point.week}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full bg-primary rounded-t"
                style={{
                  height: `${Math.round((point.count / maxVelocity) * 100)}%`,
                  minHeight: 4,
                }}
                title={`${point.week}: ${point.count}`}
              />
              <span className="text-[10px] text-on-surface-variant truncate w-full text-center">
                {point.week.slice(5)}
              </span>
            </div>
          ))}
        </div>
      </TrendingWidget>
    </div>
  )
}

interface MyActivityTabProps {
  state: LoadState<FeedMyActivity>
  onDismiss: (item: FeedItemModel) => void
  onSaveOpportunity: (id: string) => void
  onRetry: () => void
}

function MyActivityTab({
  state,
  onDismiss,
  onSaveOpportunity,
  onRetry,
}: MyActivityTabProps) {
  if (state.loading) {
    return (
      <div className="flex flex-col gap-3">
        <FeedSkeleton count={1} className="!gap-0" />
        <FeedSkeleton count={3} />
      </div>
    )
  }

  if (state.error) {
    return <FeedErrorState message={state.error} onRetry={onRetry} />
  }

  const counts = state.data
  const isEmpty =
    counts.savedCount === 0 &&
    counts.appliedCount === 0 &&
    counts.contributionsCount === 0 &&
    counts.referralsCount === 0 &&
    counts.recentActions.length === 0

  if (isEmpty) {
    const empty = communityEmptyStates.myActivityEmpty
    return (
      <CommunityEmptyState
        icon={empty.icon}
        title={empty.title}
        description={empty.description}
        primaryAction={empty.primaryAction}
        secondaryAction={empty.secondaryAction}
      />
    )
  }

  return (
    <div className="flex flex-col gap-lg" data-testid="my-activity-tab">
      <MyActivitySummary counts={counts} />

      {counts.savedCount + counts.appliedCount + counts.contributionsCount + counts.referralsCount < 4 && (
        <p className="text-label-sm text-on-surface-variant" data-testid="activity-progress-hint">
          Next: save your first opportunity.
        </p>
      )}

      <section>
        <h2 className="text-headline-sm text-on-surface font-semibold mb-3">
          Recent actions
        </h2>
        {counts.recentActions.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant italic">
            No recent actions yet — your activity will appear here as you use the community.
          </p>
        ) : (
          <div className="flex flex-col gap-3" data-testid="my-activity-recent">
            {counts.recentActions.map((item) => (
              <FeedItem
                key={item.id}
                item={item}
                onSaveOpportunity={onSaveOpportunity}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface FeedErrorStateProps {
  message: string
  onRetry: () => void
}

function FeedErrorState({ message, onRetry }: FeedErrorStateProps) {
  return (
    <div
      role="alert"
      data-testid="feed-error"
      className="bg-surface border border-outline-variant rounded-xl p-6 text-center flex flex-col items-center gap-3"
    >
      <h3 className="text-headline-md text-on-surface font-semibold">
        Couldn’t load your feed
      </h3>
      <p className="text-body-md text-on-surface-variant">
        Check your connection and try again.
      </p>
      <p className="text-label-sm text-on-surface-variant italic">{message}</p>
      <Button variant="primary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
