import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'
import { ResumePreview } from '../components/features/ResumePreview'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { resumeService } from '../services/resume'
import { contentService } from '../services/content'
import { useToast } from '../components/layout/useToast'
import type { ResumeVersion, ResumeContent } from '../types'
import {
  Sparkles,
  FileCheck,
  Download,
  RefreshCw,
  Eye,
} from '../lib/icons'

const TEMPLATES = [
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
]

const SECTION_LIST = [
  { id: 'summary', label: 'Professional Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
]

const emptyContent: ResumeContent = {
  summary: '',
  experiences: [],
  projects: [],
  skills: [],
  education: [],
  certificates: [],
}

export function ResumeEditorPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const strategy = (location.state as { strategy?: unknown })?.strategy

  const [template, setTemplate] = useState('modern')
  const [version, setVersion] = useState<ResumeVersion | null>(null)
  const [content, setContent] = useState<ResumeContent>(emptyContent)
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [visibleSections, setVisibleSections] = useState<string[]>(
    SECTION_LIST.map((s) => s.id),
  )

  function toggleSection(id: string) {
    setVisibleSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const result = await resumeService.generateResume({
        applicationId: 'new',
        strategy: strategy as any,
      })
      setVersion(result)
      setContent(result.content)
      setGenerated(true)
      toast.showToast('Resume generated successfully', 'success')
    } catch {
      toast.showToast('Failed to generate resume', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerateSection(section: string) {
    toast.showToast(`Regenerating ${section}...`, 'info')
    try {
      const result = await resumeService.generateResume({
        applicationId: version?._id ?? 'new',
        strategy: strategy as any,
      })
      setVersion(result)
      setContent(result.content)
      toast.showToast(`${section} regenerated`, 'success')
    } catch {
      toast.showToast('Failed to regenerate section', 'error')
    }
  }

  function handleValidate() {
    if (version?._id) {
      navigate(`/validation/${version._id}`)
    } else {
      toast.showToast('Generate a resume first', 'warning')
    }
  }

  function handleExport() {
    if (version?._id) {
      navigate(`/export?resumeId=${version._id}`)
    } else {
      toast.showToast('Generate a resume first', 'warning')
    }
  }

  async function handleHumanize() {
    try {
      const result = await contentService.humanize(content.summary)
      setContent((prev) => ({ ...prev, summary: result.text }))
      toast.showToast('Resume humanized', 'success')
    } catch {
      toast.showToast('Failed to humanize resume', 'error')
    }
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-heading-1 text-text-primary">Resume Editor</h1>
        <p className="text-body text-text-secondary mt-1">
          Review, customize, and refine your tailored resume.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Document Preview (Left) */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <Card className="p-8 flex items-center justify-center min-h-[500px]">
              <Skeleton variant="rectangular" width="100%" height={500} />
            </Card>
          ) : generated ? (
            <ResumePreview content={content} />
          ) : (
            <Card className="p-8 flex items-center justify-center min-h-[400px]">
              <EmptyState
                icon={<Eye className="h-12 w-12 text-text-tertiary" />}
                title="No Resume Yet"
                description="Select a template, choose your sections, and click 'Generate Resume' to see a preview."
              />
            </Card>
          )}
        </div>

        {/* Sidebar Controls (Right) */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          {/* Card 1: Configuration */}
          <Card className="p-4 space-y-4">
            <div>
              <h3 className="text-body-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Resume Template</h3>
              <Select
                options={TEMPLATES}
                value={template}
                onChange={setTemplate}
              />
            </div>

            <div className="border-t border-border pt-3">
              <h3 className="text-body-sm font-semibold text-text-primary uppercase tracking-wider mb-2">Visible Sections</h3>
              <div className="space-y-1">
                {SECTION_LIST.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-neutral-50 cursor-pointer transition-colors text-body-sm text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={visibleSections.includes(section.id)}
                      onChange={() => toggleSection(section.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary"
                    />
                    <span>{section.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              loading={loading}
              className="w-full gap-2"
              icon={<Sparkles className="h-4 w-4" />}
            >
              {generated ? 'Regenerate Resume' : 'Generate Resume'}
            </Button>
          </Card>

          {/* Card 2: AI Tools */}
          <Card className="p-4 space-y-3">
            <h3 className="text-body-sm font-semibold text-text-primary uppercase tracking-wider">AI Copilot Tools</h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={() => handleRegenerateSection('summary')}
                disabled={!generated}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Regenerate Summary
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleValidate}
                disabled={!generated}
                icon={<FileCheck className="h-4 w-4" />}
              >
                Check ATS Score
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleHumanize}
                disabled={!generated}
                icon={<Sparkles className="h-4 w-4" />}
              >
                Humanize Summary
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={handleExport}
                disabled={!generated}
                icon={<Download className="h-4 w-4" />}
              >
                Export / Download
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
