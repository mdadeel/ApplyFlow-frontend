import { useEffect, useMemo, useState } from 'react'
import { getReputation, getReputations, type ReputationSummary } from '../services/community/reputation'

interface UseReputationResult {
  reputation: ReputationSummary | null
  loading: boolean
  error: string | null
}

interface UseReputationsResult {
  reputations: Record<string, ReputationSummary>
  loading: boolean
  error: string | null
}

/**
 * Fetch reputation for a single user.
 */
export function useReputation(userId: string | undefined): UseReputationResult {
  const [reputation, setReputation] = useState<ReputationSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setReputation(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getReputation(userId)
      .then((data) => {
        if (!cancelled) {
          setReputation(data)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load reputation'
          setError(message)
          setReputation(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [userId])

  return useMemo(() => ({ reputation, loading, error }), [reputation, loading, error])
}

/**
 * Fetch reputations for multiple users in batch.
 * Re-fetches when the userIds array changes (by reference).
 */
export function useReputations(userIds: string[]): UseReputationsResult {
  const [reputations, setReputations] = useState<Record<string, ReputationSummary>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dedupedIds = useMemo(() => [...new Set(userIds.filter(Boolean))], [userIds])

  useEffect(() => {
    if (dedupedIds.length === 0) {
      setReputations({})
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    getReputations(dedupedIds)
      .then((data) => {
        if (!cancelled) setReputations(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load reputations'
          setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [dedupedIds])

  return useMemo(() => ({ reputations, loading, error }), [reputations, loading, error])
}
