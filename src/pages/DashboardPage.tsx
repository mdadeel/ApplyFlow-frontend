import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { applicationsService } from '../services/applications'
import type { Application } from '../types'
import {
  Briefcase,
  FileText,
  BarChart3,
  User,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Clock,
} from '../lib/icons'

function timeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

const AI_SUGGESTIONS = [
  { text: 'Analyze a new job description to see how your resume matches up', action: 'Analyze a JD', path: '/jd-analysis' },
  { text: 'Your interview prep materials are ready for the next round', action: 'Start preparing', path: '/interview' },
  { text: 'Update your career profile to improve match scores', action: 'Update profile', path: '/profile' },
]

export function DashboardPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [activityItems, setActivityItems] = useState<Array<{ id: string; action: string; target: string; date: string; type: string }>>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, interviews: 0, offers: 0 })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await applicationsService.getApplications({ limit: 50 })

        const apps = res.applications ?? []
        setApplications(apps.slice(0, 5))

        const total = apps.length
        const active = apps.filter(a => !['rejected', 'ghosted', 'offer', 'applied'].includes(a.status)).length
        const interviews = apps.filter(a => a.status === 'interview').length
        const offers = apps.filter(a => a.status === 'offer').length
        setStats({ total, active, interviews, offers })

        const activities = apps
          .filter(a => a.timeline?.length)
          .flatMap(a =>
            (a.timeline ?? []).slice(-1).map(t => ({
              id: `${a._id}-${t.date}`,
              action: t.event,
              target: `${a.role} @ ${a.company}`,
              date: t.date,
              type: a.status === 'interview' ? 'interview' : 'status',
            }))
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10)

        setActivityItems(activities.length > 0 ? activities : [
          { id: '1', action: 'Welcome to', target: 'ApplyFlow AI', date: new Date().toISOString(), type: 'note' },
        ])
      } catch {
        setActivityItems([
          { id: '1', action: 'Welcome to', target: 'ApplyFlow AI', date: new Date().toISOString(), type: 'note' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const resumePoints = [
    { label: 'Analyze a JD', desc: 'Paste a job description to get started', icon: FileText, path: '/jd-analysis' },
    { label: 'View Applications', desc: 'Track your progress', icon: BarChart3, path: '/applications' },
    { label: 'Update Profile', desc: 'Keep your career profile current', icon: User, path: '/profile' },
    { label: 'Prepare for Interview', desc: 'Generate talking points', icon: MessageSquare, path: '/interview' },
  ]

  return (
    <AppLayout>
      <div className="animate-fade-up">
        {/* Greeting + Today's Progress */}
        <div className="mb-10">
          <h1 className="text-display text-text-primary">
            {loading ? 'Welcome back' : `${timeBasedGreeting()}!`}
          </h1>
          <p className="text-body text-text-secondary mt-2">
            {loading
              ? 'Loading your progress...'
              : stats.total > 0
                ? `You've applied to ${stats.total} positions${stats.active > 0 ? `, ${stats.active} in progress` : ''}.`
                : 'Ready to start your job search journey?'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card variant="stat">
            <p className="text-meta text-text-tertiary uppercase tracking-wide mb-1">Total</p>
            <p className="text-heading-2 text-text-primary">{loading ? '—' : stats.total}</p>
          </Card>
          <Card variant="stat">
            <p className="text-meta text-text-tertiary uppercase tracking-wide mb-1">Active</p>
            <p className="text-heading-2 text-text-primary">{loading ? '—' : stats.active}</p>
          </Card>
          <Card variant="stat">
            <p className="text-meta text-text-tertiary uppercase tracking-wide mb-1">Interviews</p>
            <p className="text-heading-2 text-text-primary">{loading ? '—' : stats.interviews}</p>
          </Card>
          <Card variant="stat">
            <p className="text-meta text-text-tertiary uppercase tracking-wide mb-1">Offers</p>
            <p className="text-heading-2 text-text-primary">{loading ? '—' : stats.offers}</p>
          </Card>
        </div>

        {/* AI Suggestions */}
        <div className="mb-10">
          <Card variant="ai">
            <div className="flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <h2 className="text-heading-3 text-text-primary mb-1">Things you can do</h2>
                <div className="space-y-2">
                  {AI_SUGGESTIONS.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <p className="text-body-sm text-text-secondary">{suggestion.text}</p>
                      <button
                        onClick={() => navigate(suggestion.path)}
                        className="text-body-sm text-primary hover:text-primary-hover whitespace-nowrap shrink-0 transition-colors"
                      >
                        {suggestion.action} →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Continue Where You Left Off */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-heading-3 text-text-primary">Continue where you left off</h2>
            <p className="text-body-sm text-text-secondary mt-0.5">Jump back into your workflow</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {resumePoints.map((point) => {
              const Icon = point.icon
              return (
                <button
                  key={point.path}
                  onClick={() => navigate(point.path)}
                  className="flex items-center gap-3 w-full text-left bg-white border border-border rounded-lg p-4 hover:border-border-hover hover:shadow-card-hover transition-all duration-200 group"
                >
                  <Icon className="h-5 w-5 text-text-tertiary shrink-0 group-hover:text-primary transition-colors" />
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-text-primary">{point.label}</p>
                    <p className="text-meta text-text-tertiary mt-0.5">{point.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Recent Applications + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card variant="default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-heading-3 text-text-primary">Recent applications</h2>
                  <p className="text-body-sm text-text-secondary mt-0.5">Your latest submissions</p>
                </div>
                {!loading && applications.length > 0 && (
                  <button
                    onClick={() => navigate('/applications')}
                    className="flex items-center gap-1 text-body-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    View all <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="space-y-1.5">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" className="w-1/2" />
                      </div>
                      <Skeleton variant="text" />
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="h-8 w-8" />}
                  title="No applications yet"
                  description="Start by analyzing a job description — we'll help you tailor your resume and track every application."
                  action={{ label: 'Analyze a job', onClick: () => navigate('/jd-analysis') }}
                />
              ) : (
                <div className="divide-y divide-border">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between py-3 px-1 rounded-md hover:bg-surface-secondary transition-colors cursor-pointer -mx-1 first:-mt-1"
                      onClick={() => navigate(`/applications/${app._id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm font-medium text-text-primary truncate">{app.role}</p>
                        <p className="text-meta text-text-tertiary mt-0.5">{app.company}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <StatusBadge status={app.status} />
                        <span className="text-meta text-text-tertiary whitespace-nowrap">
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
            <Card variant="default">
              <div className="mb-4">
                <h2 className="text-heading-3 text-text-primary">Activity</h2>
                <p className="text-body-sm text-text-secondary mt-0.5">What's been happening</p>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton variant="text" className="!w-2 !h-2 rounded-full mt-1.5" />
                      <div className="flex-1 space-y-1">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" className="w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityItems.length === 0 || (activityItems.length === 1 && activityItems[0].action === 'Welcome to') && stats.total === 0 ? (
                <EmptyState
                  icon={<Clock className="h-8 w-8" />}
                  title="No activity yet"
                  description="Your recent actions will show up here as you start applying."
                  action={{ label: 'Analyze a job', onClick: () => navigate('/jd-analysis') }}
                />
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {activityItems.map((item) => {
                    const dotColor = item.type === 'interview' ? 'bg-primary' : item.type === 'note' ? 'bg-success' : 'bg-warning'
                    return (
                      <div key={item.id} className="flex items-start gap-3 py-2 rounded-md hover:bg-surface-secondary transition-colors -mx-1 px-1">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-text-primary">
                            {item.action} <span className="font-medium">{item.target}</span>
                          </p>
                          <p className="text-meta text-text-tertiary mt-0.5">{timeAgo(item.date)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
