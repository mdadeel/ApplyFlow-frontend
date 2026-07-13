import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ArrowLeft, FileText } from '../../lib/icons'
import { useToast } from '../../components/layout/useToast'
import {
  createTemplate,
  type TemplateType,
} from '../../services/community/templates'

const TEMPLATE_TYPES: TemplateType[] = ['resume', 'cover_letter', 'email']

const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  resume: 'Resume',
  cover_letter: 'Cover Letter',
  email: 'Email',
}

function isTemplateType(value: string): value is TemplateType {
  return (TEMPLATE_TYPES as string[]).includes(value)
}

export function CreateTemplatePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<TemplateType>('resume')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const trimmedTitle = title.trim()
  const trimmedContent = content.trim()
  const formInvalid = trimmedTitle.length === 0 || trimmedContent.length === 0

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (formInvalid) {
      setError('Title and content are required.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      await createTemplate({
        title: trimmedTitle,
        description: description.trim(),
        type,
        content: trimmedContent,
        tags: parsedTags,
        isPublished: true,
      })
      showToast('Template published', 'success')
      navigate('/community/templates', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to publish template.'
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/community/templates')}
          className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to templates
        </button>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            <div>
              <h1 className="text-headline-lg text-on-surface font-semibold">
                Create Community Template
              </h1>
              <p className="text-body-md text-on-surface-variant">
                Share a template with the community to help others
              </p>
            </div>

            <div>
              <label
                htmlFor="template-title"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Title <span className="text-error">*</span>
              </label>
              <input
                id="template-title"
                data-testid="template-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="e.g. Senior Software Engineer Resume"
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="template-description"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Description
              </label>
              <textarea
                id="template-description"
                data-testid="template-description"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Briefly describe what this template is for..."
                rows={3}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors resize-y"
              />
            </div>

            <div>
              <label
                htmlFor="template-type"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Category
              </label>
              <select
                id="template-type"
                data-testid="template-type"
                value={type}
                onChange={(event) => {
                  if (isTemplateType(event.target.value)) {
                    setType(event.target.value)
                  }
                }}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary transition-colors"
              >
                {TEMPLATE_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {TEMPLATE_TYPE_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="template-content"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Content <span className="text-error">*</span>
              </label>
              <textarea
                id="template-content"
                data-testid="template-content"
                value={content}
                onChange={(event) => {
                  setContent(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Paste or write your template content here..."
                rows={12}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors resize-y font-mono"
              />
            </div>

            <div>
              <label
                htmlFor="template-tags"
                className="block text-label-md text-on-surface font-medium mb-1"
              >
                Tags
              </label>
              <input
                id="template-tags"
                data-testid="template-tags"
                type="text"
                value={tags}
                onChange={(event) => {
                  setTags(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="comma-separated, e.g. react, senior, backend"
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-colors"
              />
            </div>

            {error && (
              <p
                role="alert"
                data-testid="template-create-error"
                className="text-label-sm text-error"
              >
                {error}
              </p>
            )}

            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate('/community/templates')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={formInvalid || submitting}
                loading={submitting}
              >
                <FileText size={16} />
                Publish Template
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
