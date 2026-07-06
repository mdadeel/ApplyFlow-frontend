import { get } from '../api'

export interface CommunityDashboard {
  totalOpportunities: number
  totalContributions: number
  activeUsers: number
  averageMatchScore: number
  topCompanies: Array<{ company: string; count: number }>
  trendingSkills: Array<{ skill: string; count: number }>
  lastUpdated: string
}

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

export function getCommunityDashboard(): Promise<CommunityDashboard> {
  return get<CommunityDashboard>('/analytics/community/dashboard')
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
