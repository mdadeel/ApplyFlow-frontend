import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MoreHorizontal,
  Trash2,
  FileText,
  FileSearch,
  BarChart3,
  Download,
  MessageSquare,
  Building,
  Briefcase,
  Calendar,
  Clock,
  Target,
  ChevronDown,
} from '../lib/icons'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Skeleton } from '../components/ui/Skeleton'
import { Dialog } from '../components/ui/Dialog'
import { Dropdown } from '../components/ui/Dropdown'
import { Timeline } from '../components/features/Timeline'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useToast } from '../components/layout/useToast'
import { getStatusDefinitions, type StatusDefinitionsResponse } from '../services/status'
import { applicationsService } from '../services/applications'
import type { Application, ApplicationStatus } from '../types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statusDefs, setStatusDefs] = useState<StatusDefinitionsResponse | null>(null)

  useEffect(() => {
    getStatusDefinitions().then(setStatusDefs).catch(() => {})
  }, [])

  const fetchApplication = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const app = await applicationsService.getApplication(id)
      setApplication(app)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application')
      showToast('Failed to load application', 'error')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!application || status === application.status) return
    try {
      const updated = await applicationsService.updateApplication(application._id, { status })
      setApplication(updated)
      showToast(`Status changed to ${status}`, 'success')
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async () => {
    if (!application) return
    try {
      await applicationsService.deleteApplication(application._id)
      showToast('Application deleted', 'success')
      navigate('/applications')
    } catch {
      showToast('Failed to delete application', 'error')
    }
    setDeleteDialogOpen(false)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-lg">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="25%" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton variant="rectangular" height={300} />
            </div>
            <div className="space-y-4">
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="rectangular" height={200} />
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !application) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-xl gap-4">
          <p className="text-body-md text-error">{error || 'Application not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/applications')}>
            Back to Applications
          </Button>
        </div>
      </AppLayout>
    )
  }

  const scores = application?.scores
  const validNextStatusValues = statusDefs?.transitions[application.status] ?? []
  const nextStatuses = validNextStatusValues.map((value) => {
    const def = statusDefs?.statuses.find((s) => s.value === value)
    return { value, label: def?.label ?? value }
  })

  return (
    <AppLayout>
      <div className="flex items-center gap-3 mb-lg">
        <Button
          variant="ghost"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate('/applications')}
        >
          Back
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-headline-lg text-on-surface truncate">
              {application.company}
            </h1>
            <span className="text-headline-md text-on-surface-variant hidden sm:inline">@</span>
            <span className="text-headline-md text-on-surface-variant truncate block sm:inline">
              {application.role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          <Dropdown
            align="right"
            trigger={
              <Button variant="ghost" icon={<MoreHorizontal className="h-4 w-4" />} aria-label="Actions" />
            }
            items={[
              ...nextStatuses.slice(0, 4).map((s) => ({
                label: `Move to ${s.label}`,
                onClick: () => handleStatusChange(s.value as ApplicationStatus),
                icon: <ChevronDown className="h-4 w-4" />,
              })),
              {
                label: 'Delete',
                onClick: () => setDeleteDialogOpen(true),
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <Card className="p-md">
            <h2 className="text-headline-md text-on-surface mb-md">Timeline</h2>
            <Timeline
              events={application.timeline.map((e) => ({ ...e, status: application.status }))}
            />
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to={`/jd-analysis?application=${application._id}`} className="block">
              <Card hover className="p-md space-y-2">
                <FileSearch className="h-6 w-6 text-primary" />
                <h3 className="text-headline-sm text-on-surface">JD Analysis</h3>
                <p className="text-body-sm text-on-surface-variant">Analyze job description</p>
              </Card>
            </Link>
            <Link to={`/resume-strategy?application=${application._id}`} className="block">
              <Card hover className="p-md space-y-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h3 className="text-headline-sm text-on-surface">Resume Strategy</h3>
                <p className="text-body-sm text-on-surface-variant">Plan your approach</p>
              </Card>
            </Link>
            <Link to={`/resume-editor?application=${application._id}`} className="block">
              <Card hover className="p-md space-y-2">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-headline-sm text-on-surface">Resume Editor</h3>
                <p className="text-body-sm text-on-surface-variant">Tailor your resume</p>
              </Card>
            </Link>
            <Link to={`/export?application=${application._id}`} className="block">
              <Card hover className="p-md space-y-2">
                <Download className="h-6 w-6 text-primary" />
                <h3 className="text-headline-sm text-on-surface">Export</h3>
                <p className="text-body-sm text-on-surface-variant">Download as PDF/DOCX</p>
              </Card>
            </Link>
            <Link to={`/interview?application=${application._id}`} className="block">
              <Card hover className="p-md space-y-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h3 className="text-headline-sm text-on-surface">Interview Prep</h3>
                <p className="text-body-sm text-on-surface-variant">Prepare for interviews</p>
              </Card>
            </Link>
          </div>
        </div>

        <div className="space-y-lg">
          <Card className="p-md">
            <h2 className="text-headline-md text-on-surface mb-md">Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Company</p>
                  <p className="text-body-md text-on-surface">{application.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Role</p>
                  <p className="text-body-md text-on-surface">{application.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Date Created</p>
                  <p className="text-body-md text-on-surface">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Last Updated</p>
                  <p className="text-body-md text-on-surface">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
              <hr className="border-outline-variant" />
              {scores ? (
                <>
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">ATS Score</p>
                    <ProgressBar
                      value={scores.ats ?? 0}
                      size="md"
                      color={(scores.ats ?? 0) >= 80 ? 'success' : (scores.ats ?? 0) >= 60 ? 'warning' : 'error'}
                      showLabel
                    />
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">Match Score</p>
                    <ProgressBar
                      value={scores.match ?? 0}
                      size="md"
                      color={(scores.match ?? 0) >= 80 ? 'success' : (scores.match ?? 0) >= 60 ? 'warning' : 'error'}
                      showLabel
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Target className="h-6 w-6 text-on-surface-variant" />
                  <p className="text-body-sm text-on-surface-variant">No scores yet</p>
                  <p className="text-body-sm text-on-surface-variant">Run a JD analysis to get started</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application for ${application.company} - ${application.role}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </AppLayout>
  )
}
