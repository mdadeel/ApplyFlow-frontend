import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, LayoutList, LayoutGrid, Sparkles } from '../lib/icons'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { Tabs } from '../components/ui'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Pagination } from '../components/ui/Pagination'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { ApplicationTable } from '../components/features/ApplicationTable'
import { ApplicationCard } from '../components/features/ApplicationCard'
import { useToast } from '../components/layout/useToast'
import { applicationsService } from '../services/applications'
import { getStatusDefinitions } from '../services/status'
import type { Application, ApplicationStatus } from '../types'

const ALL_STATUSES: { value: string; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'planning', label: 'Planning' },
  { value: 'generating', label: 'Generating' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'ready', label: 'Ready' },
  { value: 'exported', label: 'Exported' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ghosted', label: 'Ghosted' },
]

const fallbackStatusOptions = [
  { value: '', label: 'All Statuses' } as const,
  ...ALL_STATUSES,
]

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'review', label: 'Review' },
  { id: 'archived', label: 'Archived' },
]

const activeStatuses = ['analyzing', 'planning', 'generating', 'reviewing', 'ready']
const reviewStatuses = ['reviewing', 'ready', 'exported']
const archivedStatuses = ['applied', 'rejected', 'ghosted', 'offer', 'interview', 'assessment']

function getStatusFilter(tab: string, explicitStatus: string): string | undefined {
  if (explicitStatus) return explicitStatus
  switch (tab) {
    case 'active': return activeStatuses.join(',')
    case 'review': return reviewStatuses.join(',')
    case 'archived': return archivedStatuses.join(',')
    default: return undefined
  }
}

const LIMIT = 10

export function ApplicationsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const [modalOpen, setModalOpen] = useState(false)
  const [newCompany, setNewCompany] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newJdText, setNewJdText] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [autoFillLoading, setAutoFillLoading] = useState(false)
  const [apiStatusOptions, setApiStatusOptions] = useState(fallbackStatusOptions)

  useEffect(() => {
    getStatusDefinitions().then((defs) => {
      setApiStatusOptions([{ value: '', label: 'All Statuses' }, ...defs.statuses])
    }).catch(() => {
      // keep the fallback static list if API fails
    })
  }, [])

  const fetchApplications = useCallback(async () => {
    let cancelled = false
    setLoading(true)
    setError(null)
    try {
      const status = getStatusFilter(activeTab, statusFilter)
      const res = await applicationsService.getApplications({
        status,
        page,
        limit: LIMIT,
      })
      if (cancelled) return
      setApplications(res.applications ?? [])
      setTotal(res.total ?? 0)
      setPages(res.pages ?? 0)
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load applications')
        showToast('Failed to load applications', 'error')
      }
    } finally {
      if (!cancelled) setLoading(false)
    }
  }, [activeTab, statusFilter, page, showToast])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  useEffect(() => {
    setPage(1)
  }, [searchValue, statusFilter, activeTab])

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const handleAutoFill = async () => {
    const jd = newJdText.trim()
    if (!jd || autoFillLoading) return
    setAutoFillLoading(true)
    try {
      const result = await applicationsService.autoFillApplication(jd)
      if (result.company) setNewCompany(result.company)
      if (result.role) setNewRole(result.role)
      if (result.summary) setNewJdText(jd)
      showToast('Auto-filled from job description', 'success')
    } catch {
      showToast('Failed to auto-fill from job description', 'error')
    } finally {
      setAutoFillLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newCompany.trim() || !newRole.trim()) return
    setFormSubmitting(true)
    try {
      await applicationsService.createApplication({
        company: newCompany.trim(),
        role: newRole.trim(),
        jdText: newJdText.trim() || undefined,
        status: 'draft',
        timeline: [],
        notes: '',
        tags: [],
      })
      showToast('Application created', 'success')
      setModalOpen(false)
      setNewCompany('')
      setNewRole('')
      setNewJdText('')
      setPage(1)
      fetchApplications()
    } catch {
      showToast('Failed to create application', 'error')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await applicationsService.updateApplication(id, { status: newStatus })
      showToast('Status updated successfully', 'success')
      fetchApplications()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return
    try {
      await applicationsService.deleteApplication(id)
      showToast('Application deleted successfully', 'success')
      fetchApplications()
    } catch {
      showToast('Failed to delete application', 'error')
    }
  }

  const handleRowClick = (app: Application) => {
    navigate(`/applications/${app._id}`)
  }

  const filteredApplications = (() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return applications
    return applications.filter((app) => {
      const statusLabel = apiStatusOptions.find((s) => s.value === app.status)?.label ?? app.status
      return (
        app.company.toLowerCase().includes(query) ||
        app.role.toLowerCase().includes(query) ||
        statusLabel.toLowerCase().includes(query) ||
        app.status.toLowerCase().includes(query)
      )
    })
  })()

  return (
    <AppLayout onSearch={setSearchValue} searchValue={searchValue}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
        <h2 className="text-headline-md text-on-surface">All Applications</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={apiStatusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-full sm:w-44"
          />
          <div className="hidden sm:flex items-center border border-outline-variant rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-l-lg transition-colors ${viewMode === 'list' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              aria-label="List view"
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-r-lg transition-colors ${viewMode === 'grid' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
            New Application
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-lg" />

      {error && !loading && (
        <div className="rounded-xl border border-error/20 bg-red-50 p-4 text-body-md text-error mb-lg">
          {error}
        </div>
      )}

      {viewMode === 'list' ? (
        <ApplicationTable
          applications={filteredApplications}
          onRowClick={handleRowClick}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          loading={loading}
        />
      ) : (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface border border-outline-variant p-md rounded-xl space-y-3">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                </div>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState
              icon={<Plus className="h-8 w-8" />}
              title="No applications found"
              description={searchValue || statusFilter ? 'Try adjusting your filters.' : 'Create your first application to get started.'}
              action={searchValue || statusFilter ? undefined : { label: 'New Application', onClick: () => setModalOpen(true) }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((app) => (
                <ApplicationCard
                  key={app._id}
                  application={app}
                  onClick={() => handleRowClick(app)}
                  pendingTaskCount={app.trackerTasks?.filter((t) => t.status !== 'done').length ?? 0}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Pagination
        page={page}
        pages={pages}
        total={total}
        onChange={setPage}
        className="mt-lg"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Application" size="md">
        <div className="space-y-4">
          <Input
            label="Company"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            placeholder="e.g. Google"
          />
          <Input
            label="Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="e.g. Frontend Engineer"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="font-label-md text-on-surface" htmlFor="jd-text">
                Job Description
              </label>
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={handleAutoFill}
                loading={autoFillLoading}
                disabled={!newJdText.trim()}
              >
                Auto-fill with AI
              </Button>
            </div>
            <textarea
              id="jd-text"
              value={newJdText}
              onChange={(e) => setNewJdText(e.target.value)}
              placeholder="Paste the job description here..."
              rows={8}
              className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={formSubmitting}
              disabled={!newCompany.trim() || !newRole.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
