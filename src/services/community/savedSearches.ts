import { get, post, del } from '../api'
import type { OpportunitySearchParams } from './opportunities'

export interface SavedSearch {
  _id: string
  userId: string
  name: string
  params: OpportunitySearchParams
  alertEnabled: boolean
  createdAt: string
}

export type SavedSearchInput = Omit<SavedSearch, '_id' | 'userId' | 'createdAt'>

export function createSavedSearch(data: SavedSearchInput): Promise<SavedSearch> {
  return post<SavedSearch>('/opportunities/saved-searches', data)
}

export function listSavedSearches(): Promise<SavedSearch[]> {
  return get<SavedSearch[]>('/opportunities/saved-searches')
}

export function deleteSavedSearch(id: string): Promise<void> {
  return del<void>(`/opportunities/saved-searches/${id}`)
}
