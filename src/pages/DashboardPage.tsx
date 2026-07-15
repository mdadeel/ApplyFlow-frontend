import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { ActivityFeed } from '../components/features/ActivityFeed'
import { applicationsService } from '../services/applications'
import { analyticsService } from '../services/analytics'
import { trackAction } from '../lib/analytics'
import type { Application, AnalyticsSummary } from '../types'
import {
  Briefcase,
  BarChart3,
  ChevronRight,
  Sparkles,
  Clock,
  Zap,
  FileSearch,
  TrendingUp,
} from '../lib/icons'

function timeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const ONBOARDING_SUGGESTIONS = [
  { text: 'Analyze a job description to see how your resume matches up', action: 'Analyze a JD', path: '/applications' },
  { text: 'Build your career profile to improve match scores', action: 'Update profile', path: '/identity' },
]

const QUICK_ACTIONS = [
  { label: 'Smart Application', desc: 'AI-driven end-to-end application', icon: Zap, path: '/smart-application' },
  { label: 'JD Analysis', desc: 'Match your resume to a job description', icon: FileSearch, path: '/applications' },
  { label: 'Applications', desc: 'Kanban board & status tracking', icon: Briefcase, path: '/applications' },
  { label: 'Analytics', desc: 'Conversion rates & insights', icon: BarChart3, path: '/analytics' },
]

function SectionError({ title }: { title: string }) {
  return (
    <Card variant="default" className="p-6">
      <p className="text-body-sm text-text-tertiary text-center">Failed to load {title.toLowerCase()}</p>
    </Card>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [activityItems, setActivityItems] = useState<Array<{ id: string; action: string; target: string; date: string; type: string }>>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, interviews: 0, offers: 0 })
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [appsRes, summary] = await Promise.all([
          applicationsService.getApplications({ limit: 5 }),
          analyticsService.getAnalyticsSummary(),
        ])

        const apps = appsRes.applications ?? []
        setApplications(apps)

        const byStatus = summary.byStatus || {}
        const applied = byStatus.applied || 0
        const interviews = byStatus.interview || 0
        const offers = byStatus.offer || 0
        const rejected = byStatus.rejected || 0
        const ghosted = byStatus.ghosted || 0
        const active = summary.totalApps - applied - interviews - offers - rejected - ghosted
        setStats({ total: summary.totalApps, active, interviews, offers })

        const activities = apps
          .filter(a => a.timeline?.length)
          .flatMap(a =>
            (a.timeline ?? []).slice(-3).map(t => ({
              id: `${a._id}-${t.date}-${t.event}`,
              action: t.event,
              target: `${a.role} @ ${a.company}`,
              date: t.date,
              type: a.status === 'interview' ? 'interview' : 'status',
            }))
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)

        setActivityItems(activities)
      } catch {
        setActivityItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    async function fetchInsights() {
      try {
        const data = await analyticsService.getInsights()
        if (Array.isArray(data) && data.length > 0) {
          setInsights(data)
        }
      } catch {
        // Insights are best-effort; fallback to onboarding prompts
      }
    }
    fetchInsights()
  }, [])

  const insightSuggestions = insights.length > 0
    ? insights.map(text => ({ text, action: 'View', path: '/insights' }))
    : ONBOARDING_SUGGESTIONS

  const pipelineStages = [
    { label: 'Applied', count: stats.total, icon: Briefcase, color: 'bg-blue-500' },
    { label: 'In Progress', count: stats.active, icon: Clock, color: 'bg-indigo-500' },
    { label: 'Interview', count: stats.interviews, icon: TrendingUp, color: 'bg-amber-500' },
    { label: 'Offer', count: stats.offers, icon: Sparkles, color: 'bg-emerald-500' },
  ]

  const showActivityEmpty = stats.total === 0

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-display text-text-primary tracking-tight">
            {loading ? 'Welcome back' : `${timeBasedGreeting()}!`}
          </h1>
          <p className="text-body-md text-text-secondary mt-3">
            {loading
              ? 'Loading your progress...'
              : stats.total > 0
                ? `You've applied to ${stats.total} positions${stats.active > 0 ? `, ${stats.active} in progress` : ''}.`
                : 'Ready to start your job search journey?'}
          </p>
        </div>

        {/* Pipeline Visualization */}
        <ErrorBoundary fallback={<SectionError title="Pipeline" />}>
          <Card variant="default" className="p-6">
          <h2 className="text-heading-2 text-text-primary font-semibold mb-6">Your Pipeline</h2>
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" height={32} />
                </div>
              ))}
            </div>
          ) : stats.total === 0 ? (
            <div className="flex items-center justify-center py-6">
              <EmptyState
                icon={<Briefcase className="h-8 w-8" />}
                title="No applications yet"
                description="Start tracking your job applications to see your pipeline."
                action={{ label: 'Analyze a job', onClick: () => { trackAction('pipeline_cta', '/dashboard'); navigate('/smart-application') } }}
                noCard
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {pipelineStages.map((stage, i) => (
                <div key={stage.label} className="flex-1 flex items-center gap-3">
                  <div className="flex-1 bg-surface border border-border rounded-lg p-4 hover:shadow-card-hover transition-shadow relative">
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-md ${stage.color} flex items-center justify-center`}>
                      <stage.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="text-headline-lg font-bold text-text-primary">{stage.count}</p>
                    <p className="text-caption text-text-tertiary uppercase tracking-wider font-semibold mt-0.5">{stage.label}</p>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-text-tertiary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>        </ErrorBoundary>

        {/* AI Insights / Onboarding */}
        <ErrorBoundary fallback={<SectionError title="Insights" />}>
          <Card variant="ai" className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-heading-3 text-text-primary font-semibold mb-2">
                {insights.length > 0 ? 'AI Insights' : 'Getting Started'}
              </h2>
              <div className="space-y-1">
                {insightSuggestions.map((suggestion, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1.5">
                    <p className="text-body-sm text-text-secondary leading-snug">{suggestion.text}</p>
                    <button
                      onClick={() => { trackAction('insight_click', '/dashboard'); navigate(suggestion.path) }}
                      className="text-caption font-semibold text-primary hover:text-primary-hover whitespace-nowrap shrink-0 transition-colors"
                    >
                      {suggestion.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
        </ErrorBoundary>

        {/* Quick Actions — 4 core actions */}
        <ErrorBoundary fallback={<SectionError title="Quick Actions" />}>
        <div>
          <div className="mb-4">
            <h2 className="text-heading-2 text-text-primary font-semibold">Quick Actions</h2>
            <p className="text-body-sm text-text-secondary mt-1">Jump directly into any workspace</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  onClick={() => { trackAction(`quick_action_${item.label}`, '/dashboard'); navigate(item.path) }}
                  className="flex items-center gap-3 w-full text-left bg-surface border border-border rounded-lg p-3 hover:border-border-hover hover:shadow-card-hover transition-all duration-300 group shadow-card"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-secondary text-text-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm font-semibold text-text-primary group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-caption text-text-tertiary mt-1 leading-normal">{item.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        </ErrorBoundary>

        {/* Recent Applications + Activity */}
        <ErrorBoundary fallback={<SectionError title="Applications" />}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="default" className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-heading-2 text-text-primary font-semibold">Recent applications</h2>
                  <p className="text-body-sm text-text-secondary mt-1">Status of your latest submissions</p>
                </div>
                {!loading && applications.length > 0 && (
                  <button
                    onClick={() => { trackAction('view_all_apps', '/dashboard'); navigate('/applications') }}
                    className="flex items-center gap-1 text-body-sm font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div className="space-y-1.5 flex-1 mr-4">
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                      <Skeleton variant="text" width="60px" />
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-6">
                  <EmptyState
                    icon={<Briefcase className="h-8 w-8" />}
                    title="No applications yet"
                    description="Start by analyzing a job description — we'll help you tailor your resume and track every application."
                    action={{ label: 'Analyze a job', onClick: () => navigate('/smart-application') }}
                    noCard
                  />
                </div>
              ) : (
                <div className="divide-y divide-border -mx-2">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between py-4 px-3 rounded-xl hover:bg-surface-secondary/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border"
                      onClick={() => { trackAction('app_row_click', '/dashboard'); navigate(`/applications/${app._id}`) }}
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="text-body-sm font-semibold text-text-primary truncate">{app.role}</p>
                        <p className="text-caption text-text-tertiary mt-1 font-medium">{app.company}</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <StatusBadge status={app.status} />
                        <span className="text-caption text-text-tertiary whitespace-nowrap font-medium">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card variant="default" className="h-full flex flex-col">
              <div className="mb-6">
                <h2 className="text-heading-2 text-text-primary font-semibold">Activity</h2>
                <p className="text-body-sm text-text-secondary mt-1">Timeline of recent events</p>
              </div>

              {loading || showActivityEmpty ? (
                <div className="flex-1 flex items-center justify-center py-6">
                  <EmptyState
                    icon={<Clock className="h-8 w-8" />}
                    title="No activity yet"
                    description="Your recent actions will show up here as you start applying."
                    action={{ label: 'Analyze a job', onClick: () => navigate('/smart-application') }}
                    noCard
                  />
                </div>
              ) : (
                <ActivityFeed items={activityItems} loading={false} />
              )}
            </Card>
          </div>
        </div>
        </ErrorBoundary>
      </div>
    </AppLayout>
  )
}
