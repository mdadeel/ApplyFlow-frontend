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
  deadline?: string
  isExpired: boolean
  pipelineStatus: string
  aiConfidence: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OpportunitySearchParams {
  q?: string
  locationType?: string
  roleLevel?: string
  employmentType?: string
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  sort?: string
  page?: number
  limit?: number
  deadlineSoon?: boolean
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

export function searchOpportunities(params: OpportunitySearchParams): Promise<{ items: Opportunity[]; total: number; suggestions: string[] }> {
  return get<{ items: Opportunity[]; total: number; suggestions: string[] }>('/opportunities/search', params as Record<string, string | number | undefined>)
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
