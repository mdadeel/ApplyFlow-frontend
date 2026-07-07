import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { OpportunityCard } from '../../components/community/OpportunityCard'
import { OpportunityFilterBar } from '../../components/community/OpportunityFilterBar'
import { SavedSearchChip } from '../../components/community/SavedSearchChip'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import {
  type Opportunity,
  type OpportunitySearchParams,
  type OpportunitySort,
  searchOpportunities,
} from '../../services/community/opportunities'
import {
  type SavedSearch,
  createSavedSearch,
  listSavedSearches,
  deleteSavedSearch,
} from '../../services/community/savedSearches'
import {
  Loader2,
  Save,
} from '../../lib/icons'

const DEFAULT_LIMIT = 20

const SORT_OPTIONS: Array<{ value: OpportunitySort | ''; label: string }> = [
  { value: '', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'salary', label: 'Salary' },
  { value: 'match', label: 'Match score' },
]

function readSearchFromUrl(sp: URLSearchParams): OpportunitySearchParams {
  const skillsRaw = sp.get('skills')
  const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined

  const salaryMinRaw = sp.get('salaryMin')
  const salaryMaxRaw = sp.get('salaryMax')

  return {
    q: sp.get('q') ?? undefined,
    locationType: sp.get('locationType') ?? undefined,
    roleLevel: sp.get('roleLevel') ?? undefined,
    employmentType: sp.get('employmentType') ?? undefined,
    salaryMin: salaryMinRaw ? Number(salaryMinRaw) : undefined,
    salaryMax: salaryMaxRaw ? Number(salaryMaxRaw) : undefined,
    skills: skills && skills.length > 0 ? skills : undefined,
    sort: (sp.get('sort') as OpportunitySort | null) ?? undefined,
    saved: sp.get('saved') === 'true' || undefined,
    deadlineSoon: sp.get('deadlineSoon') === 'true' || undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    limit: sp.get('limit') ? Number(sp.get('limit')) : DEFAULT_LIMIT,
  }
}

function writeSearchToUrl(params: OpportunitySearchParams): Record<string, string> {
  const out: Record<string, string> = {}
  if (params.q) out.q = params.q
  if (params.locationType) out.locationType = params.locationType
  if (params.roleLevel) out.roleLevel = params.roleLevel
  if (params.employmentType) out.employmentType = params.employmentType
  if (typeof params.salaryMin === 'number') out.salaryMin = String(params.salaryMin)
  if (typeof params.salaryMax === 'number') out.salaryMax = String(params.salaryMax)
  if (params.skills && params.skills.length > 0) out.skills = params.skills.join(',')
  if (params.sort) out.sort = params.sort
  if (params.saved) out.saved = 'true'
  if (params.deadlineSoon) out.deadlineSoon = 'true'
  if (params.page && params.page > 1) out.page = String(params.page)
  return out
}

export function OpportunityBrowserPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filters = useMemo(() => readSearchFromUrl(searchParams), [searchParams])
  const [showSavePrompt, setShowSavePrompt] = useState(false)
  const [savedSearchName, setSavedSearchName] = useState('')
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const saveInputRef = useRef<HTMLInputElement | null>(null)

  const hasActiveFilters =
    !!filters.q ||
    !!filters.locationType ||
    !!filters.roleLevel ||
    !!filters.employmentType ||
    !!filters.salaryMin ||
    !!filters.salaryMax ||
    !!filters.recency ||
    !!(filters.skills && filters.skills.length > 0)

  const updateFilters = useCallback(
    (next: OpportunitySearchParams) => {
      setSearchParams(writeSearchToUrl(next), { replace: true })
    },
    [setSearchParams],
  )

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const handleSortChange = (value: string) => {
    updateFilters({ ...filters, sort: (value || undefined) as OpportunitySort | undefined, page: 1 })
  }

  const fetchOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchOpportunities({
        ...filters,
        page: filters.page ?? 1,
        limit: filters.limit ?? DEFAULT_LIMIT,
      })
      if ((filters.page ?? 1) === 1) {
        setOpportunities(result.items)
      } else {
        setOpportunities(prev => [...prev, ...result.items])
      }
      setTotal(result.total)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load opportunities')
      setOpportunities([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  useEffect(() => {
    let cancelled = false
    listSavedSearches()
      .then(items => {
        if (!cancelled) setSavedSearches(items)
      })
      .catch(() => {
        if (!cancelled) setSavedSearches([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveSearch = async () => {
    if (!savedSearchName.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const created = await createSavedSearch({
        name: savedSearchName.trim(),
        params: filters,
        alertEnabled: false,
      })
      setSavedSearches(prev => [created, ...prev])
      setSavedSearchName('')
      setShowSavePrompt(false)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save search')
    } finally {
      setSaving(false)
    }
  }

  const handleApplySavedSearch = (search: SavedSearch) => {
    updateFilters({ ...search.params, page: 1 })
  }

  const handleDeleteSavedSearch = async (search: SavedSearch) => {
    try {
      await deleteSavedSearch(search._id)
      setSavedSearches(prev => prev.filter(s => s._id !== search._id))
    } catch {
      // best-effort — keep the chip visible on failure
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-xl gap-3 flex-wrap">
        <div>
          <h1 className="text-headline-lg text-on-surface font-semibold">Opportunities</h1>
          <p className="text-body-md text-on-surface-variant">{total} opportunities found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="open-save-search"
            onClick={() => {
              setShowSavePrompt(prev => !prev)
              setSaveError(null)
              setTimeout(() => saveInputRef.current?.focus(), 0)
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save search
          </button>
          <div>
            <label htmlFor="opp-sort" className="sr-only">Sort</label>
            <select
              id="opp-sort"
              data-testid="opp-sort"
              value={filters.sort ?? ''}
              onChange={e => handleSortChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {savedSearches.length > 0 && (
        <div
          data-testid="saved-searches-list"
          className="flex flex-wrap gap-2 mb-md"
        >
          {savedSearches.map(s => (
            <SavedSearchChip
              key={s._id}
              search={s}
              onClick={() => handleApplySavedSearch(s)}
              onDelete={() => handleDeleteSavedSearch(s)}
            />
          ))}
        </div>
      )}

      {showSavePrompt && (
        <div
          data-testid="save-search-prompt"
          className="mb-md p-3 rounded-xl border border-outline-variant bg-surface-container-low flex flex-wrap items-center gap-2"
        >
          <input
            ref={saveInputRef}
            type="text"
            data-testid="save-search-input"
            value={savedSearchName}
            onChange={e => setSavedSearchName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSaveSearch()
              } else if (e.key === 'Escape') {
                setShowSavePrompt(false)
                setSavedSearchName('')
              }
            }}
            placeholder="Name this search"
            className="flex-1 min-w-[12rem] px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
          />
          <button
            type="button"
            data-testid="save-search-confirm"
            onClick={handleSaveSearch}
            disabled={saving || !savedSearchName.trim()}
            className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowSavePrompt(false)
              setSavedSearchName('')
              setSaveError(null)
            }}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container"
          >
            Cancel
          </button>
          {saveError && (
            <span className="text-label-sm text-red-500" role="alert">{saveError}</span>
          )}
        </div>
      )}

      <OpportunityFilterBar
        filters={filters}
        onChange={updateFilters}
        onClearAll={clearFilters}
      />

      {loading && (filters.page ?? 1) === 1 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      ) : error ? (
        <CommunityEmptyState
          icon={communityEmptyStates.opportunitiesNoResults.icon}
          title="Couldn't load opportunities"
          description={error}
          primaryAction={{ label: 'Try again', onClick: () => fetchOpportunities() }}
        />
      ) : opportunities.length === 0 ? (
        hasActiveFilters ? (
          <CommunityEmptyState
            {...communityEmptyStates.opportunitiesNoResults}
            primaryAction={{ label: 'Clear filters', onClick: clearFilters }}
            secondaryAction={{ label: 'Add an opportunity', href: '/community/opportunities/new' }}
          />
        ) : (
          <CommunityEmptyState
            {...communityEmptyStates.opportunitiesGlobalEmpty}
          />
        )
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
            {opportunities.map(opp => (
              <OpportunityCard
                key={opp._id}
                opportunity={opp}
                onClick={() => navigate(`/community/opportunities/${opp._id}`)}
              />
            ))}
          </div>
          {opportunities.length < total && (
            <div className="text-center mt-xl">
              <button
                onClick={() => updateFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
                disabled={loading}
                className="px-6 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
