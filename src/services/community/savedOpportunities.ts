import { del, getArray, post, put } from '../api'

export interface SavedOpportunity {
  _id: string
  userId: string
  opportunityId: string
  savedAt: string
  alertEnabled: boolean
  notes?: string
}

export interface SaveOpportunityInput {
  alertEnabled?: boolean
  notes?: string
}

export function saveOpportunity(
  opportunityId: string,
  alertEnabled = true,
): Promise<SavedOpportunity> {
  return post<SavedOpportunity>(`/opportunities/${opportunityId}/save`, { alertEnabled })
}

export function unsaveOpportunity(opportunityId: string): Promise<void> {
  return del<void>(`/opportunities/${opportunityId}/save`)
}

export function listSavedOpportunities(): Promise<SavedOpportunity[]> {
  return getArray<SavedOpportunity>('/opportunities/saved')
}

export function updateSavedOpportunity(
  id: string,
  data: { alertEnabled?: boolean; notes?: string },
): Promise<SavedOpportunity> {
  return put<SavedOpportunity>(`/saved-opportunities/${id}`, data)
}
