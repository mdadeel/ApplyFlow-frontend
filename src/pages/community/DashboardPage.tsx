import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import type { CommunityDashboard as DashboardData } from '../../services/community/analytics'
import { getCommunityDashboard } from '../../services/community/analytics'
import {
  Globe,
  Briefcase,
  Users,
  BarChart3,
  ArrowRight,
  Sparkles,
} from '../../lib/icons'

export function CommunityDashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCommunityDashboard()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface font-semibold">Community</h1>
          <p className="text-body-md text-on-surface-variant">Discover and collaborate on opportunities</p>
        </div>
        <button
          onClick={() => navigate('/community/opportunities/new')}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Add Opportunity
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Opportunities</p>
              <p className="text-headline-md font-semibold text-on-surface">
                {loading ? '-' : data?.totalOpportunities ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Contributions</p>
              <p className="text-headline-md font-semibold text-on-surface">
                {loading ? '-' : data?.totalContributions ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Active Users</p>
              <p className="text-headline-md font-semibold text-on-surface">
                {loading ? '-' : data?.activeUsers ?? 0}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">Avg Match</p>
              <p className="text-headline-md font-semibold text-on-surface">
                {loading ? '-' : data ? `${Math.round(data.averageMatchScore * 100)}%` : '-'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        <Card>
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-headline-md text-on-surface font-semibold">Top Companies</h3>
            <button onClick={() => navigate('/community/opportunities')} className="text-label-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse" />
              ))}
            </div>
          ) : data?.topCompanies.length ? (
            <div className="space-y-3">
              {data.topCompanies.map((c, i) => (
                <div key={c.company} className="flex items-center gap-3">
                  <span className="text-label-sm text-on-surface-variant w-5">{i + 1}.</span>
                  <span className="text-body-md text-on-surface flex-1">{c.company}</span>
                  <span className="text-label-sm text-on-surface-variant">{c.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant text-center py-md">No opportunities yet</p>
          )}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-md">
            <h3 className="text-headline-md text-on-surface font-semibold">Trending Skills</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-container-high rounded animate-pulse" />
              ))}
            </div>
          ) : data?.trendingSkills.length ? (
            <div className="flex flex-wrap gap-2">
              {data.trendingSkills.map(s => (
                <span key={s.skill} className="px-3 py-1.5 bg-surface-container-low rounded-full text-label-sm text-on-surface-variant border border-outline-variant">
                  {s.skill} <span className="text-primary">×{s.count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant text-center py-md">No skills data yet</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <button onClick={() => navigate('/community/opportunities')} className="text-left">
          <Card className="hover:border-primary/50 transition-all duration-200 h-full">
            <Briefcase className="w-8 h-8 text-primary mb-3" />
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Browse Opportunities</h3>
            <p className="text-body-md text-on-surface-variant">Search and filter open positions</p>
          </Card>
        </button>
        <button onClick={() => navigate('/community/hub')} className="text-left">
          <Card className="hover:border-primary/50 transition-all duration-200 h-full">
            <Users className="w-8 h-8 text-amber-600 mb-3" />
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Community Hub</h3>
            <p className="text-body-md text-on-surface-variant">Templates, posts, and referrals</p>
          </Card>
        </button>
        <button onClick={() => navigate('/community/notifications')} className="text-left">
          <Card className="hover:border-primary/50 transition-all duration-200 h-full">
            <Sparkles className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-headline-sm text-on-surface font-semibold mb-1">Notifications</h3>
            <p className="text-body-md text-on-surface-variant">Updates and alerts</p>
          </Card>
        </button>
      </div>
    </AppLayout>
  )
}
