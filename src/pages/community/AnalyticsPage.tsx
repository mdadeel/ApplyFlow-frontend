import { useEffect, useState } from 'react'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import type { CommunityDashboard, SkillTrend } from '../../services/community/analytics'
import {
  getCommunityDashboard, getSkillTrends,
} from '../../services/community/analytics'
import {
  Briefcase, Globe, Users, BarChart3, Loader2
} from '../../lib/icons'

export function CommunityAnalyticsPage() {
  const [dashboard, setDashboard] = useState<CommunityDashboard | null>(null)
  const [trends, setTrends] = useState<SkillTrend | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getCommunityDashboard(),
      getSkillTrends(10),
    ])
      .then(([d, t]) => { setDashboard(d); setTrends(t) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const d = dashboard
  const maxCompanyCount = d ? Math.max(...d.topCompanies.map(c => c.count), 1) : 1
  const maxSkillCount = trends ? Math.max(...trends.topSkills.map(s => s.count), 1) : 1

  return (
    <AppLayout>
      <div className="mb-xl">
        <h1 className="text-headline-lg text-on-surface font-semibold">Community Analytics</h1>
        <p className="text-body-md text-on-surface-variant">Insights and metrics for the opportunity network</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Briefcase className="w-5 h-5" /></div>
            <div><p className="text-label-sm text-on-surface-variant">Opportunities</p><p className="text-headline-md font-semibold text-on-surface">{d?.totalOpportunities ?? 0}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600"><Globe className="w-5 h-5" /></div>
            <div><p className="text-label-sm text-on-surface-variant">Contributions</p><p className="text-headline-md font-semibold text-on-surface">{d?.totalContributions ?? 0}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600"><Users className="w-5 h-5" /></div>
            <div><p className="text-label-sm text-on-surface-variant">Active Users</p><p className="text-headline-md font-semibold text-on-surface">{d?.activeUsers ?? 0}</p></div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600"><BarChart3 className="w-5 h-5" /></div>
            <div><p className="text-label-sm text-on-surface-variant">Avg Match Score</p><p className="text-headline-md font-semibold text-on-surface">{d ? `${Math.round(d.averageMatchScore * 100)}%` : '-'}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
        <Card>
          <h3 className="text-headline-md text-on-surface font-semibold mb-4">Top Companies</h3>
          {d?.topCompanies.length ? (
            <div className="space-y-3">
              {d.topCompanies.map((c, i) => (
                <div key={c.company} className="flex items-center gap-3">
                  <span className="text-label-sm text-on-surface-variant w-6">{i + 1}.</span>
                  <span className="text-body-md text-on-surface flex-1">{c.company}</span>
                  <span className="text-label-sm text-on-surface-variant w-8 text-right">{c.count}</span>
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(c.count / maxCompanyCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-body-md text-on-surface-variant text-center py-md">No data yet</p>}
        </Card>
        <Card>
          <h3 className="text-headline-md text-on-surface font-semibold mb-4">Trending Skills</h3>
          {trends?.topSkills.length ? (
            <div className="space-y-3">
              {trends.topSkills.map(s => (
                <div key={s.skill} className="flex items-center gap-3">
                  <span className="text-body-md text-on-surface flex-1">{s.skill}</span>
                  <span className="text-label-sm text-on-surface-variant w-8 text-right">{s.count}</span>
                  <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden max-w-[200px]">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(s.count / maxSkillCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-body-md text-on-surface-variant text-center py-md">No skills data yet</p>}
        </Card>
      </div>
    </AppLayout>
  )
}
