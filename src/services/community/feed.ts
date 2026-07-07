import { get } from '../api'

/**
 * Backend feed item types — see `.kimchi/docs/community-feed-page-spec.md`.
 *
 * The spec also lists `mention` and `trending_skill`; both are kept in the union
 * even though FeedItemAction does not surface primary CTAs for them.
 */
export type FeedItemType =
  | 'new_opportunity'
  | 'saved_opportunity_update'
  | 'new_contribution'
  | 'new_discussion'
  | 'referral_request'
  | 'referral_offer'
  | 'deadline_approaching'
  | 'trending_skill'
  | 'review_received'
  | 'mention'

export type FeedEntityType =
  | 'opportunity'
  | 'discussion'
  | 'referral'
  | 'notification'

export interface FeedItem {
  id: string
  type: FeedItemType
  title: string
  summary: string
  timestamp: string
  entityId: string
  entityType: FeedEntityType
  actorName?: string
  actorId?: string
  avatarUrl?: string
  meta?: Record<string, string | number>
}

export interface FeedForYouPage {
  items: FeedItem[]
  nextCursor?: string
  hasMore: boolean
}

export interface FeedTrendingCompany {
  company: string
  count: number
}

export interface FeedTrendingSkill {
  skill: string
  count: number
  byLevel: Record<string, number>
}

export interface FeedSalaryBand {
  roleLevel: string
  min: number
  max: number
  count: number
}

export interface FeedHiringVelocityPoint {
  week: string
  count: number
}

export interface FeedTrending {
  topCompanies: FeedTrendingCompany[]
  topSkills: FeedTrendingSkill[]
  salaryBands: FeedSalaryBand[]
  hiringVelocity: FeedHiringVelocityPoint[]
}

export interface FeedMyActivity {
  savedCount: number
  appliedCount: number
  contributionsCount: number
  referralsCount: number
  recentActions: FeedItem[]
}

export interface FeedResponse {
  forYou: FeedForYouPage
  trending: FeedTrending
  myActivity: FeedMyActivity
}

export type FeedTab = 'for-you' | 'trending' | 'my-activity'

export interface GetCommunityFeedParams {
  tab: FeedTab
  cursor?: string
  limit?: number
}

/**
 * Calls `GET /community/feed?tab=...&cursor=...&limit=...` and returns the
 * slice of the envelope that corresponds to the requested tab.
 *
 * The backend may also return a tab-specific payload (e.g. `{ items, nextCursor,
 * hasMore }` for `for-you`). Both shapes are normalized into the matching
 * `FeedResponse` sub-object so callers can render uniformly.
 */
export async function getCommunityFeed(
  params: GetCommunityFeedParams,
  signal?: AbortSignal,
): Promise<
  | FeedForYouPage
  | FeedTrending
  | FeedMyActivity
> {
  const query: Record<string, string | number | undefined> = {
    tab: params.tab,
    cursor: params.cursor,
    limit: params.limit,
  }

  // Fetch envelope (the API helper does not currently accept a signal, so we
  // race it against an abort-aware manual fetch below for caller convenience).
  const response = await get<FeedResponse | unknown>(
    '/v1/community/feed',
    query,
    signal,
  )

  return normalizeFeedResponse(response, params.tab)
}

/**
 * Normalizes the backend response into the tab-specific slice.
 *
 * The backend may either return the full `FeedResponse` envelope or a single
 * tab payload (e.g. `{ items, nextCursor, hasMore }`). Both are handled. If
 * the response shape doesn't match the requested tab, fall back to the empty
 * shape for that tab so downstream consumers never see `undefined` fields.
 */
export function normalizeFeedResponse(
  response: unknown,
  tab: FeedTab,
): FeedForYouPage | FeedTrending | FeedMyActivity {
  if (!response || typeof response !== 'object') {
    return emptyForTab(tab)
  }

  const record = response as Record<string, unknown>

  // Envelope response: pick the tab-specific slice.
  if ('forYou' in record || 'trending' in record || 'myActivity' in record) {
    switch (tab) {
      case 'for-you':
        return (record.forYou as FeedForYouPage) ?? emptyForYouPage()
      case 'trending':
        return (record.trending as FeedTrending) ?? emptyTrending()
      case 'my-activity':
        return (record.myActivity as FeedMyActivity) ?? emptyMyActivity()
    }
  }

  // Single-tab payload — validate the shape matches the requested tab before
  // casting. Wrong-tab payloads fall through to the empty shape.
  switch (tab) {
    case 'for-you':
      if (Array.isArray(record.items) && typeof record.hasMore === 'boolean') {
        return response as FeedForYouPage
      }
      return emptyForYouPage()
    case 'trending':
      if (
        Array.isArray(record.topCompanies) &&
        Array.isArray(record.topSkills) &&
        Array.isArray(record.salaryBands) &&
        Array.isArray(record.hiringVelocity)
      ) {
        return response as FeedTrending
      }
      return emptyTrending()
    case 'my-activity':
      if (
        typeof record.savedCount === 'number' &&
        Array.isArray(record.recentActions)
      ) {
        return response as FeedMyActivity
      }
      return emptyMyActivity()
  }
}

export function emptyForYouPage(): FeedForYouPage {
  return { items: [], hasMore: false }
}

export function emptyTrending(): FeedTrending {
  return {
    topCompanies: [],
    topSkills: [],
    salaryBands: [],
    hiringVelocity: [],
  }
}

export function emptyMyActivity(): FeedMyActivity {
  return {
    savedCount: 0,
    appliedCount: 0,
    contributionsCount: 0,
    referralsCount: 0,
    recentActions: [],
  }
}

function emptyForTab(
  tab: FeedTab,
): FeedForYouPage | FeedTrending | FeedMyActivity {
  switch (tab) {
    case 'for-you':
      return emptyForYouPage()
    case 'trending':
      return emptyTrending()
    case 'my-activity':
      return emptyMyActivity()
  }
}
