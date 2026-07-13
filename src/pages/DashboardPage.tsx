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
  Zap,
  FileSearch,
  FileCheck,
  MessageCircle,
  Target,
  BrainCircuit,
  Settings,
  Users,
  BookOpen,
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

const QUICK_ACTIONS = [
  { group: 'AI Co-pilot', items: [
    { label: 'Smart Application', desc: 'AI-driven end-to-end application', icon: Zap, path: '/smart-application' },
    { label: 'JD Analysis', desc: 'Match your resume to a job description', icon: FileSearch, path: '/jd-analysis' },
    { label: 'Resume Editor', desc: 'Build and refine your resume', icon: FileText, path: '/resume-editor' },
    { label: 'Interview Prep', desc: 'Generate Q&A and talking points', icon: MessageCircle, path: '/interview' },
  ]},
  { group: 'Tracker', items: [
    { label: 'Applications', desc: 'Kanban board & status tracking', icon: Briefcase, path: '/applications' },
    { label: 'Analytics', desc: 'Conversion rates & insights', icon: BarChart3, path: '/analytics' },
  ]},
  { group: 'Network', items: [
    { label: 'Job Board', desc: 'Discover opportunities', icon: Target, path: '/community/opportunities' },
    { label: 'Feed', desc: 'Community posts & updates', icon: Sparkles, path: '/community/feed' },
  ]},
  { group: 'Management', items: [
    { label: 'Career Profile', desc: 'Skills, experience, credentials', icon: User, path: '/profile' },
    { label: 'Resume Library', desc: 'Stored resume versions', icon: FileCheck, path: '/resume-library' },
  ]},
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

  return (
    <AppLayout>
      <div className="animate-fade-up space-y-12">
        {/* Greeting + Today's Progress */}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="stat" className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-caption text-text-tertiary uppercase tracking-wider font-semibold">Total</p>
              <p className="text-headline-lg font-bold text-text-primary">{loading ? '—' : stats.total}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50/60 text-blue-600 flex items-center justify-center shrink-0">
              <Briefcase className="h-5 w-5" />
            </div>
          </Card>
          <Card variant="stat" className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-caption text-text-tertiary uppercase tracking-wider font-semibold">Active</p>
              <p className="text-headline-lg font-bold text-text-primary">{loading ? '—' : stats.active}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50/60 text-indigo-600 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </Card>
          <Card variant="stat" className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-caption text-text-tertiary uppercase tracking-wider font-semibold">Interviews</p>
              <p className="text-headline-lg font-bold text-text-primary">{loading ? '—' : stats.interviews}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50/60 text-amber-600 flex items-center justify-center shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
          </Card>
          <Card variant="stat" className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-caption text-text-tertiary uppercase tracking-wider font-semibold">Offers</p>
              <p className="text-headline-lg font-bold text-text-primary">{loading ? '—' : stats.offers}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50/60 text-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
          </Card>
        </div>

        {/* AI Suggestions */}
        <div>
          <Card variant="ai" className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-heading-3 text-text-primary font-bold mb-3">AI Suggestions</h2>
                <div className="space-y-3">
                  {AI_SUGGESTIONS.map((suggestion, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-1.5 border-b border-border last:border-0">
                      <p className="text-body-sm text-text-secondary leading-relaxed">{suggestion.text}</p>
                      <button
                        onClick={() => navigate(suggestion.path)}
                        className="text-body-sm font-semibold text-primary hover:text-primary-hover whitespace-nowrap shrink-0 transition-colors"
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

        {/* Quick Actions by Workspace Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-heading-2 text-text-primary font-semibold">Quick Actions</h2>
            <p className="text-body-sm text-text-secondary mt-1">Jump directly into any workspace</p>
          </div>
          <div className="space-y-6">
            {QUICK_ACTIONS.map((group) => (
              <div key={group.group}>
                <h3 className="text-caption text-text-tertiary font-semibold uppercase tracking-wider mb-3">{group.group}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="flex items-center gap-4 w-full text-left bg-white border border-border rounded-xl p-5 hover:border-border-hover hover:shadow-card-hover transition-all duration-300 group shadow-card"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-50 text-text-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                          <Icon className="h-5 w-5" />
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
            ))}
          </div>
        </div>

        {/* Recent Applications + Activity */}
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
                    onClick={() => navigate('/applications')}
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
                    action={{ label: 'Analyze a job', onClick: () => navigate('/jd-analysis') }}
                    noCard
                  />
                </div>
              ) : (
                <div className="divide-y divide-border -mx-2">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="flex items-center justify-between py-4 px-3 rounded-xl hover:bg-surface-secondary/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-border"
                      onClick={() => navigate(`/applications/${app._id}`)}
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

              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton variant="text" className="!w-2 !h-2 rounded-full mt-2" />
                      <div className="flex-1 space-y-1">
                        <Skeleton variant="text" />
                        <Skeleton variant="text" className="w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activityItems.length === 0 || (activityItems.length === 1 && activityItems[0].action === 'Welcome to') && stats.total === 0 ? (
                <div className="flex-1 flex items-center justify-center py-6">
                  <EmptyState
                    icon={<Clock className="h-8 w-8" />}
                    title="No activity yet"
                    description="Your recent actions will show up here as you start applying."
                    action={{ label: 'Analyze a job', onClick: () => navigate('/jd-analysis') }}
                    noCard
                  />
                </div>
              ) : (
                <div className="space-y-1 overflow-y-auto max-h-[360px] pr-1 -mx-2">
                  {activityItems.map((item) => {
                    const dotColor = item.type === 'interview' ? 'bg-primary' : item.type === 'note' ? 'bg-success' : 'bg-warning'
                    return (
                      <div key={item.id} className="flex items-start gap-4 py-3.5 px-3 rounded-xl hover:bg-surface-secondary/70 transition-all duration-200 border border-transparent hover:border-border">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dotColor}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-text-primary leading-relaxed">
                            {item.action} <span className="font-semibold text-text-primary">{item.target}</span>
                          </p>
                          <p className="text-caption text-text-tertiary mt-1 font-medium">{timeAgo(item.date)}</p>
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
