import { get, getArray, post, put, del } from '../api'

export interface Opportunity {
  _id: string
  title: string
  company: string
  location?: string
  locationType: 'remote' | 'hybrid' | 'onsite' | 'unspecified'
  description: string
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryInterval: string
  roleLevel?: string
  employmentType?: string
  requiredSkills: string[]
  preferredSkills: string[]
  minExperience?: number
  source: string
  sourceUrl?: string
  matchCount: number
  averageMatchScore: number
  totalContributions: number
  totalWorkspaces: number
  referralAvailable?: boolean
  referralCount?: number
  deadline?: string
  isExpired: boolean
  pipelineStatus: string
  aiConfidence: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type OpportunitySort = 'relevance' | 'newest' | 'deadline' | 'salary' | 'match'

export interface OpportunitySearchParams {
  q?: string
  locationType?: string
  roleLevel?: string
  employmentType?: string
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  sort?: OpportunitySort
  page?: number
  limit?: number
  saved?: boolean
  deadlineSoon?: boolean
  recency?: '24h' | 'week' | 'month'
}

export interface OpportunityInput {
  title: string
  company: string
  source: string
  sourceUrl?: string
  description?: string
  location?: string
  locationType?: string
  salaryMin?: number
  salaryMax?: number
  roleLevel?: string
  employmentType?: string
  requiredSkills?: string[]
  preferredSkills?: string[]
  deadline?: string
}

export function getOpportunities(params?: OpportunitySearchParams): Promise<Opportunity[]> {
  return getArray<Opportunity>('/opportunities', params as Record<string, string | number | undefined>)
}

export function getOpportunity(id: string): Promise<Opportunity> {
  return get<Opportunity>(`/opportunities/${id}`)
}

export async function searchOpportunities(params: OpportunitySearchParams): Promise<{ items: Opportunity[]; total: number; suggestions: string[] }> {
  const flat: Record<string, string | number | undefined> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v)) {
      if (v.length > 0) flat[k] = v.join(',')
    } else {
      flat[k] = v as string | number
    }
  }
  const res = await get<{ results: Opportunity[]; total: number; suggestions?: string[] }>('/opportunities/search', flat)
  return {
    items: res.results || [],
    total: res.total || 0,
    suggestions: res.suggestions || [],
  }
}

export function createOpportunity(data: OpportunityInput): Promise<Opportunity> {
  return post<Opportunity>('/opportunities', data)
}

export function updateOpportunity(id: string, data: Partial<OpportunityInput>): Promise<Opportunity> {
  return put<Opportunity>(`/opportunities/${id}`, data)
}

export function deleteOpportunity(id: string): Promise<void> {
  return del<void>(`/opportunities/${id}`)
}
