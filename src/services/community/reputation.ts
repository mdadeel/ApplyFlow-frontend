import { get } from '../api'

export type ReputationLevel = 'new' | 'active' | 'trusted' | 'expert'

export interface ReputationSummary {
  userId: string
  helpfulVotesReceived: number
  contributionsCount: number
  reviewsGiven: number
  referralsGiven: number
  referralsSuccessful: number
  level: ReputationLevel
}

const REPUTATION_LEVELS: ReputationLevel[] = ['new', 'active', 'trusted', 'expert']

function isReputationLevel(value: string): value is ReputationLevel {
  return (REPUTATION_LEVELS as string[]).includes(value)
}

function normalizeReputation(raw: Partial<ReputationSummary> & { userId: string }): ReputationSummary {
  return {
    userId: raw.userId,
    helpfulVotesReceived: raw.helpfulVotesReceived ?? 0,
    contributionsCount: raw.contributionsCount ?? 0,
    reviewsGiven: raw.reviewsGiven ?? 0,
    referralsGiven: raw.referralsGiven ?? 0,
    referralsSuccessful: raw.referralsSuccessful ?? 0,
    level: isReputationLevel(String(raw.level)) ? (raw.level as ReputationLevel) : 'new',
  }
}

/**
 * Fetch a single user's reputation summary.
 */
export async function getReputation(userId: string): Promise<ReputationSummary> {
  const raw = await get<Partial<ReputationSummary>>(`/reputation/${userId}`)
  return normalizeReputation({ ...raw, userId })
}

/**
 * Fetch reputation summaries for multiple users in one call.
 */
export async function getReputations(userIds: string[]): Promise<Record<string, ReputationSummary>> {
  if (userIds.length === 0) return {}
  const raw = await get<Record<string, Partial<ReputationSummary>>>('/reputation', {
    userIds: userIds.join(','),
  })
  const result: Record<string, ReputationSummary> = {}
  for (const userId of userIds) {
    const entry = raw[userId]
    result[userId] = entry
      ? normalizeReputation({ ...entry, userId })
      : normalizeReputation({ userId })
  }
  return result
}
