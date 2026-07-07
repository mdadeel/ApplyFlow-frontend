import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  listSavedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
  updateSavedOpportunity,
  type SavedOpportunity,
} from '../services/community/savedOpportunities'
import { useToast } from '../components/layout/useToast'
import {
  SavedOpportunitiesContext,
  type UseSavedOpportunitiesValue,
} from './useSavedOpportunities'

export function SavedOpportunitiesProvider({ children }: { children: ReactNode }) {
  const { showToast } = useToast()
  const [saved, setSaved] = useState<SavedOpportunity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const items = await listSavedOpportunities()
      if (mountedRef.current) setSaved(items)
    } catch (err) {
      if (mountedRef.current) {
        setSaved([])
        showToast(
          err instanceof Error ? err.message : 'Failed to load saved opportunities',
          'error',
        )
      }
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    mountedRef.current = true
    void load()
    return () => {
      mountedRef.current = false
    }
  }, [load])

  const savedByOppId = useMemo(() => {
    const map = new Map<string, SavedOpportunity>()
    for (const s of saved) map.set(s.opportunityId, s)
    return map
  }, [saved])

  const savedIds = useMemo(() => new Set(savedByOppId.keys()), [savedByOppId])

  const isSaved = useCallback(
    (opportunityId: string) => savedByOppId.has(opportunityId),
    [savedByOppId],
  )

  const save = useCallback(
    async (opportunityId: string, alertEnabled = true) => {
      const previousEntry = savedByOppId.get(opportunityId)
      const optimistic: SavedOpportunity = previousEntry
        ? { ...previousEntry, alertEnabled }
        : {
            _id: `pending-${opportunityId}`,
            userId: '',
            opportunityId,
            savedAt: new Date().toISOString(),
            alertEnabled,
          }

      setSaved(prev => applyOptimisticSave(prev, opportunityId, optimistic))

      try {
        const result = await saveOpportunity(opportunityId, alertEnabled)
        setSaved(prev => replaceEntry(prev, opportunityId, result))
        showToast('Saved to your opportunities', 'success')
      } catch (err) {
        setSaved(prev => rollbackSave(prev, opportunityId, previousEntry))
        showToast(
          err instanceof Error ? err.message : 'Failed to save opportunity',
          'error',
        )
        throw err
      }
    },
    [savedByOppId, showToast],
  )

  const unsave = useCallback(
    async (opportunityId: string) => {
      const previousEntry = savedByOppId.get(opportunityId)
      setSaved(prev => prev.filter(s => s.opportunityId !== opportunityId))
      try {
        await unsaveOpportunity(opportunityId)
        showToast('Removed from saved', 'info')
      } catch (err) {
        if (previousEntry) {
          setSaved(prev => {
            // Avoid duplicating an entry that may have been re-added optimistically.
            if (prev.some(s => s.opportunityId === opportunityId)) return prev
            return [previousEntry, ...prev]
          })
        }
        showToast(
          err instanceof Error ? err.message : 'Failed to remove saved opportunity',
          'error',
        )
        throw err
      }
    },
    [savedByOppId, showToast],
  )

  const toggle = useCallback(
    async (opportunityId: string, alertEnabled = true) => {
      if (savedByOppId.has(opportunityId)) {
        await unsave(opportunityId)
      } else {
        await save(opportunityId, alertEnabled)
      }
    },
    [savedByOppId, save, unsave],
  )

  const setAlert = useCallback(
    async (opportunityId: string, alertEnabled: boolean) => {
      const previousEntry = savedByOppId.get(opportunityId)
      if (!previousEntry) return

      const optimistic = { ...previousEntry, alertEnabled }
      setSaved(prev => replaceEntry(prev, opportunityId, optimistic))

      try {
        const updated = await updateSavedOpportunity(previousEntry._id, {
          alertEnabled,
        })
        setSaved(prev => replaceEntry(prev, opportunityId, updated))
      } catch (err) {
        setSaved(prev => replaceEntry(prev, opportunityId, previousEntry))
        showToast(
          err instanceof Error ? err.message : 'Failed to update alert preference',
          'error',
        )
        throw err
      }
    },
    [savedByOppId, showToast],
  )

  const value = useMemo<UseSavedOpportunitiesValue>(
    () => ({
      savedIds,
      savedByOppId,
      isLoading,
      save,
      unsave,
      toggle,
      isSaved,
      setAlert,
      refresh: load,
    }),
    [savedIds, savedByOppId, isLoading, save, unsave, toggle, isSaved, setAlert, load],
  )

  return (
    <SavedOpportunitiesContext.Provider value={value}>
      {children}
    </SavedOpportunitiesContext.Provider>
  )
}

function applyOptimisticSave(
  current: SavedOpportunity[],
  opportunityId: string,
  optimistic: SavedOpportunity,
): SavedOpportunity[] {
  const idx = current.findIndex(s => s.opportunityId === opportunityId)
  if (idx === -1) return [optimistic, ...current]
  const next = current.slice()
  next[idx] = { ...next[idx], alertEnabled: optimistic.alertEnabled }
  return next
}

function replaceEntry(
  current: SavedOpportunity[],
  opportunityId: string,
  entry: SavedOpportunity,
): SavedOpportunity[] {
  const idx = current.findIndex(s => s.opportunityId === opportunityId)
  if (idx === -1) return [entry, ...current]
  const next = current.slice()
  next[idx] = entry
  return next
}

function rollbackSave(
  current: SavedOpportunity[],
  opportunityId: string,
  previous: SavedOpportunity | undefined,
): SavedOpportunity[] {
  if (!previous) {
    return current.filter(s => s.opportunityId !== opportunityId)
  }
  const idx = current.findIndex(s => s.opportunityId === opportunityId)
  if (idx === -1) return [previous, ...current]
  const next = current.slice()
  next[idx] = previous
  return next
}
