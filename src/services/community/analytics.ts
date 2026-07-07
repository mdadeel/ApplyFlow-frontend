import { get } from '../api'
import type { Opportunity } from './opportunities'

export interface SuccessRateData {
  totalApplications: number
  byRoleLevel: Record<string, { count: number }>
  byCompany: Record<string, { count: number }>
}

export interface CommunityImpactData {
  totalContributions: number
  byType: Record<string, { count: number; total: number }>
  mostValuable: Array<{ type: string; count: number }>
}

export interface SkillTrend {
  topSkills: Array<{ skill: string; count: number; byLevel: Record<string, number>; byCompany: Record<string, number> }>
  totalOpportunities: number
}

export function getSuccessRate(filters?: { roleLevel?: string; company?: string; days?: number }): Promise<SuccessRateData> {
  return get<SuccessRateData>('/analytics/community/success-rate', filters as Record<string, string | number | undefined>)
}

export function getCommunityImpact(): Promise<CommunityImpactData> {
  return get<CommunityImpactData>('/analytics/community/community-impact')
}

export function getSkillTrends(limit?: number): Promise<SkillTrend> {
  return get<SkillTrend>('/analytics/community/skill-trends', { limit })
}

// ── Feed Analytics (Chunk 4 / Chunk 13) ──────────────────────────────────

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

export interface FeedAnalytics {
  recommendedOpportunities: Opportunity[]
  trendingCompanies: FeedTrendingCompany[]
  trendingSkills: FeedTrendingSkill[]
  salaryBands: FeedSalaryBand[]
  hiringVelocity: FeedHiringVelocityPoint[]
}

/**
 * Returns the analytics payload used by the Feed page's Trending tab.
 * The backend is expected to power this with `GET /analytics/community/feed`.
 */
export function getFeedAnalytics(): Promise<FeedAnalytics> {
  return get<FeedAnalytics>('/analytics/community/feed')
}
