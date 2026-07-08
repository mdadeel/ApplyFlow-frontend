import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { CommunityEmptyState } from '../../components/community/CommunityEmptyState'
import { communityEmptyStates } from '../../components/community/communityEmptyStates'
import { useToast } from '../../components/layout/useToast'
import {
  FileText,
  Star,
  Download,
  Loader2,
  Filter,
  ListFilter,
} from '../../lib/icons'
import {
  listTemplates,
  likeTemplate,
  downloadTemplate,
  type CommunityTemplate,
  type ListTemplatesParams,
} from '../../services/community/templates'

export function TemplatesPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [templates, setTemplates] = useState<CommunityTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'resume' | 'cover_letter' | 'email' | null>(null)
  const [showOnlyPublished, setShowOnlyPublished] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params: ListTemplatesParams = {
      limit: 100,
    }
    if (selectedType) params.type = selectedType

    listTemplates(params)
      .then((response) => {
        if (cancelled) return
        const items = response.templates.filter(
          (t) => !showOnlyPublished || t.isPublished
        )
        setTemplates(items)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          err instanceof Error ? err.message : 'Failed to load templates.'
        setError(message)
        setTemplates([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedType, showOnlyPublished])

  const handleCreateTemplate = () => {
    navigate('/community/templates/create')
  }

  const handleTemplateClick = (id: string) => {
    navigate(`/community/templates/${id}`)
  }

  const onLikeTemplate = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setDownloadingId(id)
    try {
      const updated = await likeTemplate(id)
      setTemplates((prev) => prev.map((t) => (t._id === updated.template._id ? updated.template : t)))
      showToast(updated.liked ? 'Template liked' : 'Template unliked', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Action failed.'
      showToast(message, 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const onDownloadTemplate = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setDownloadingId(id)
    try {
      const blob = await downloadTemplate(id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const filename = `template-${id}.md`
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Template downloaded', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Download failed.'
      showToast(message, 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredTemplates = templates.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const renderEmptyState = () => {
    if (searchTerm) {
      const state = communityEmptyStates.profilesNoResults as any
      return (
        <CommunityEmptyState
          icon={state.icon}
          title={state.title}
          description={state.description}
          primaryAction={state.primaryAction}
          secondaryAction={state.secondaryAction}
          example={state.example}
        />
      )
    }
    const state = communityEmptyStates.templates as any
    return (
      <CommunityEmptyState
        icon={state.icon}
        title={state.title}
        description={state.description}
        primaryAction={state.primaryAction}
        secondaryAction={state.secondaryAction}
        example={state.example}
      />
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'resume':
        return 'Resume'
      case 'cover_letter':
        return 'Cover Letter'
      case 'email':
        return 'Email'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'resume':
        return 'bg-surface-secondary text-text-primary'
      case 'cover_letter':
        return 'bg-success/20 text-success'
      case 'email':
        return 'bg-primary/20 text-primary'
      default:
        return 'bg-surface-secondary text-text-primary'
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-xl gap-3 flex-wrap">
          <div>
            <h1 className="text-headline-lg text-on-surface font-semibold">
              Templates
            </h1>
            <p className="text-body-md text-on-surface-variant">
              Browse community templates for resumes, cover letters, and emails.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleCreateTemplate}
            >
              <FileText size={16} aria-hidden="true" className="mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-md">
          <div className="relative flex-1 min-w-[200px]">
            <FileText
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Search templates"
            />
          </div>

          <div className="relative min-w-[140px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant"
              aria-hidden="true"
            />
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value as any || null)}
              className="w-full pl-10 pr-3 py-2 border border-outline rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              aria-label="Filter by type"
            >
              <option value="">All Types</option>
              <option value="resume">Resume</option>
              <option value="cover_letter">Cover Letter</option>
              <option value="email">Email</option>
            </select>
          </div>

          <Button
            variant={showOnlyPublished ? 'primary' : 'secondary'}
            onClick={() => setShowOnlyPublished(!showOnlyPublished)}
            className="flex items-center gap-2"
          >
            <ListFilter size={16} aria-hidden="true" />
            {showOnlyPublished ? 'Published Only' : 'All Templates'}
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center text-center py-xl px-md">
            <svg
              className="w-12 h-12 text-error mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m-9.75 9.05A4.5 4.5 0 0 0 19.5 7.05L12 14.25m0 8.5a4.5 4.5 0 0 1-9 0 M12 5.25a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5m3-3.5a4.5 4.5 0 0 1 4.5-4.5m0 0a4.5 4.5 0 0 1 9 0m-9 8.5v-2.5"
              />
            </svg>
            <h3 className="text-headline-md text-on-surface mb-1">Couldn't load templates</h3>
            <p className="text-body-md text-on-surface-variant mb-4">{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-xl px-md">
            {renderEmptyState()}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {filteredTemplates.map((template) => (
              <Card
                key={template._id}
                className="p-md hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleTemplateClick(template._id)}
              >
                <div className="flex justify-between items-start mb-sm">
                  <div className="flex-1">
                    <h3 className="text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors mb-1">
                      {template.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={getTypeColor(template.type)}
                    >
                      {getTypeLabel(template.type)}
                    </Badge>
                    {template.isPublished && (
                      <span className="text-caption-sm text-success">Published</span>
                    )}
                  </div>
                </div>
                <Star
                  className={`w-4 h-4 ${template.likes > 0 ? 'text-warning fill-warning' : 'text-on-surface-variant'}`}
                  aria-hidden="true"
                />
              </div>
              <p className="text-body-sm text-on-surface-variant line-clamp-2 mb-3">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                  >
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="default">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
                <div className="flex items-center justify-between pt-sm border-t border-outline-light">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => onLikeTemplate(template._id, e)}
                      disabled={downloadingId === template._id}
                      className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Like template"
                    >
                      <Star
                        className="w-4 h-4"
                        fill={template.likes > 0 ? 'currentColor' : 'none'}
                      />
                      <span>{template.likes}</span>
                    </button>
                    <button
                      onClick={(e) => onDownloadTemplate(template._id, e)}
                      disabled={downloadingId === template._id}
                      className="flex items-center gap-1 text-body-sm text-on-surface-variant hover:text-primary transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="Download template"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-caption-sm text-on-surface-variant">
                    by {template.userId}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}