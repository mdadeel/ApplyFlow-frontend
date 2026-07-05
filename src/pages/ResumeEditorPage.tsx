import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Section } from '../components/layout/Section'
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
      <div className="flex flex-col lg:flex-row gap-lg">
        <div className="w-full lg:w-72 shrink-0 space-y-md">
          <Section title="Template">
            <Select
              options={TEMPLATES}
              value={template}
              onChange={setTemplate}
            />
          </Section>

          <Section title="Sections">
            <div className="space-y-1.5">
              {SECTION_LIST.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors duration-150"
                >
                  <input
                    type="checkbox"
                    checked={visibleSections.includes(section.id)}
                    onChange={() => toggleSection(section.id)}
                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                  <span className="text-body-md text-on-surface">{section.label}</span>
                </label>
              ))}
            </div>
          </Section>

          <Button
            onClick={handleGenerate}
            loading={loading}
            className="w-full"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Generate Resume
          </Button>
        </div>

        <div className="flex-1 min-w-0">
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={600} />
          ) : generated ? (
            <ResumePreview content={content} />
          ) : (
            <EmptyState
              icon={<Eye className="h-12 w-12" />}
              title="No Resume Yet"
              description="Select a template, choose sections, and click 'Generate Resume' to see a preview."
            />
          )}
        </div>

        <div className="w-full lg:w-64 shrink-0 space-y-md">
          <Section title="Tools">
            <div className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => handleRegenerateSection('summary')}
                disabled={!generated}
                icon={<RefreshCw className="h-4 w-4" />}
              >
                Regenerate Section
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleValidate}
                disabled={!generated}
                icon={<FileCheck className="h-4 w-4" />}
              >
                Check ATS
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleHumanize}
                disabled={!generated}
                icon={<Sparkles className="h-4 w-4" />}
              >
                Humanize
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleExport}
                disabled={!generated}
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          </Section>

          {generated && (
            <div className="flex flex-col gap-2">
              <Button onClick={handleValidate} className="w-full" icon={<FileCheck className="h-4 w-4" />}>
                Validate
              </Button>
              <Button
                variant="secondary"
                onClick={handleExport}
                className="w-full"
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
