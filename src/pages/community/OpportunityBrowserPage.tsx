import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { OpportunityCard } from '../../components/community/OpportunityCard'
import type { Opportunity } from '../../services/community/opportunities'
import { searchOpportunities } from '../../services/community/opportunities'
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Loader2,
} from '../../lib/icons'

export function OpportunityBrowserPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [locationType, setLocationType] = useState(searchParams.get('locationType') || '')
  const [roleLevel, setRoleLevel] = useState(searchParams.get('roleLevel') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 20

  const fetchOpportunities = useCallback(async () => {
    setLoading(true)
    try {
      const result = await searchOpportunities({
        q: query || undefined,
        locationType: locationType || undefined,
        roleLevel: roleLevel || undefined,
        page,
        limit,
      })
      if (page === 1) {
        setOpportunities(result.items)
      } else {
        setOpportunities(prev => [...prev, ...result.items])
      }
      setTotal(result.total)
    } catch {
      setOpportunities([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [query, locationType, roleLevel, page])

  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  useEffect(() => {
    setPage(1)
  }, [query, locationType, roleLevel])

  const clearFilters = () => {
    setQuery('')
    setLocationType('')
    setRoleLevel('')
    setPage(1)
  }

  const hasFilters = query || locationType || roleLevel

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface font-semibold">Opportunities</h1>
          <p className="text-body-md text-on-surface-variant">{total} opportunities found</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex items-center gap-3 mb-lg">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            type="search"
            placeholder="Search opportunities..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-on-surface-variant"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-on-surface-variant hover:text-on-surface">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <Card className="mb-lg">
          <div className="flex flex-wrap gap-lg">
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Location Type</label>
              <select
                value={locationType}
                onChange={e => setLocationType(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
              >
                <option value="">All</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant block mb-1">Role Level</label>
              <select
                value={roleLevel}
                onChange={e => setRoleLevel(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
              >
                <option value="">All</option>
                <option value="intern">Intern</option>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-label-sm text-primary hover:underline self-end">
                Clear filters
              </button>
            )}
          </div>
        </Card>
      )}

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      ) : opportunities.length === 0 ? (
        <Card>
          <div className="py-20 text-center">
            <MapPin className="w-12 h-12 text-on-surface-variant mx-auto mb-3 opacity-50" />
            <h3 className="text-headline-md text-on-surface mb-1">No opportunities found</h3>
            <p className="text-body-md text-on-surface-variant mb-4">Try broadening your filters</p>
            <button onClick={() => navigate('/community/opportunities/new')} className="text-primary text-label-md hover:underline">
              Add an opportunity
            </button>
          </div>
        </Card>
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
                onClick={() => setPage(p => p + 1)}
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
