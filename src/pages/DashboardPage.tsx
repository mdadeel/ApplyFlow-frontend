import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { StatCard } from '../components/features/StatCard'
import { ActivityFeed } from '../components/features/ActivityFeed'
import { BentoGrid } from '../components/layout/BentoGrid'
import { Card } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { applicationsService } from '../services/applications'
import type { Application } from '../types'
import {
  Briefcase,
  Activity,
  Calendar,
  Award,
  FileText,
  BarChart3,
  User,
  MessageSquare,
  ChevronRight,
} from '../lib/icons'

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

  const quickActions = [
    { label: 'Analyze New Job', desc: 'Paste a job description and get AI-powered insights', icon: FileText, path: '/jd-analysis', color: 'bg-blue-500' },
    { label: 'View Applications', desc: 'Track and manage all your job applications', icon: BarChart3, path: '/applications', color: 'bg-emerald-500' },
    { label: 'Update Profile', desc: 'Keep your career profile up to date', icon: User, path: '/profile', color: 'bg-amber-500' },
    { label: 'Prepare for Interview', desc: 'Generate interview questions and talking points', icon: MessageSquare, path: '/interview', color: 'bg-purple-500' },
  ]

  return (
    <AppLayout>
      <div className="mb-xl">
        <Section title="Quick Actions" description="Jump to any part of the workflow" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full text-left bg-surface border border-outline-variant p-md rounded-xl hover:bg-surface-container hover:border-primary/40 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${action.color} text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-body-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {action.label}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">{action.desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <hr className="border-t border-outline-variant my-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
        <StatCard title="Total Applications" value={loading ? '-' : stats.total} icon={Briefcase} accentColor="info" />
        <StatCard title="Active Applications" value={loading ? '-' : stats.active} icon={Activity} accentColor="success" />
        <StatCard title="Interviews Scheduled" value={loading ? '-' : stats.interviews} icon={Calendar} accentColor="warning" />
        <StatCard title="Offers Received" value={loading ? '-' : stats.offers} icon={Award} accentColor="success" />
      </div>

      <BentoGrid cols={12} className="mb-xl">
        <div className="md:col-span-8">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-md">
              <h3 className="text-headline-md text-on-surface">Recent Applications</h3>
              <button
                onClick={() => navigate('/applications')}
                className="text-label-md text-primary hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton variant="text" width="200px" />
                      <Skeleton variant="text" width="140px" height={12} />
                    </div>
                    <Skeleton variant="text" width={80} height={24} />
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-xl text-center">
                <Briefcase className="h-10 w-10 text-on-surface-variant mb-3" />
                <p className="text-body-md text-on-surface-variant">No applications yet</p>
                <button
                  onClick={() => navigate('/jd-analysis')}
                  className="text-label-md text-primary hover:underline mt-2"
                >
                  Analyze your first job description
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
                    onClick={() => navigate(`/applications/${app._id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-body-md font-medium text-on-surface truncate">
                        {app.role}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      <StatusBadge status={app.status} />
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <h3 className="text-headline-md text-on-surface mb-md">Activity Feed</h3>
            <ActivityFeed items={activityItems} loading={loading} />
          </Card>
        </div>
      </BentoGrid>
    </AppLayout>
  )
}

function Section({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-md">
      <h2 className="text-headline-md text-on-surface">{title}</h2>
      {description && <p className="text-body-md text-on-surface-variant mt-0.5">{description}</p>}
    </div>
  )
}
