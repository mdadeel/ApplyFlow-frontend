import { createContext, useContext } from 'react'
import type { SavedOpportunity } from '../services/community/savedOpportunities'

export interface UseSavedOpportunitiesValue {
  savedIds: Set<string>
  savedByOppId: Map<string, SavedOpportunity>
  isLoading: boolean
  save: (opportunityId: string, alertEnabled?: boolean) => Promise<void>
  unsave: (opportunityId: string) => Promise<void>
  toggle: (opportunityId: string, alertEnabled?: boolean) => Promise<void>
  isSaved: (opportunityId: string) => boolean
  setAlert: (opportunityId: string, alertEnabled: boolean) => Promise<void>
  refresh: () => Promise<void>
}

export const SavedOpportunitiesContext = createContext<UseSavedOpportunitiesValue | null>(null)

export { SavedOpportunitiesProvider } from './SavedOpportunitiesProvider'

/**
 * Primary hook. Throws if used outside {@link SavedOpportunitiesProvider} so
 * production misuse is caught early. For tests/isolated renders that want a
 * null-safe fallback, use {@link useOptionalSavedOpportunities}.
 */
export function useSavedOpportunities(): UseSavedOpportunitiesValue {
  const ctx = useContext(SavedOpportunitiesContext)
  if (!ctx) {
    throw new Error('useSavedOpportunities must be used within SavedOpportunitiesProvider')
  }
  return ctx
}

/** Null-safe variant — returns `null` when no provider is in the tree. */
export function useOptionalSavedOpportunities(): UseSavedOpportunitiesValue | null {
  return useContext(SavedOpportunitiesContext)
}
