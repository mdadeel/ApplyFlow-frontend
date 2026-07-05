import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Section } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui'
import { Select } from '../components/ui/Select'
import { SearchInput } from '../components/ui/SearchInput'
import { ExportOptions } from '../components/features/ExportOptions'
import { exportService } from '../services/export'
import { contentService } from '../services/content'
import { applicationsService } from '../services/applications'
import { useToast } from '../components/layout/useToast'
import type { Application, JDAnalysis } from '../types'
import { type JSX } from 'react'
import { Download, Mail, FileSignature, AlertTriangle, X, FileText, FileSpreadsheet, FileCode, FileType } from '../lib/icons'
import type { ExportFormat } from '../components/features/ExportOptions'

const EXPORT_TABS = [
  { id: 'resume', label: 'Resume Export' },
  { id: 'cover-letter', label: 'Cover Letter' },
  { id: 'email', label: 'Email' },
]

const RESUME_FORMATS: ExportFormat[] = [
  { format: 'docx', label: 'DOCX', description: 'Editable Word document', icon: FileSpreadsheet },
  { format: 'md', label: 'Markdown', description: 'Plain text with formatting', icon: FileCode },
  { format: 'pdf', label: 'PDF', description: 'Printable document, best for submissions', icon: FileText },
]

const DOC_FORMATS: ExportFormat[] = [
  { format: 'txt', label: 'TXT', description: 'Plain text file', icon: FileType },
  { format: 'md', label: 'Markdown', description: 'Plain text with formatting', icon: FileCode },
  { format: 'pdf', label: 'PDF', description: 'Printable document', icon: FileText },
]

const DEFAULT_FORMAT_BY_TAB: Record<string, string> = {
  resume: 'pdf',
  'cover-letter': 'txt',
  email: 'txt',
}

export function ExportCenterPage() {
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()
  const resumeId = searchParams.get('resumeId')

  const [activeTab, setActiveTab] = useState('resume')
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedAppId, setSelectedAppId] = useState(resumeId ?? '')
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [contentError, setContentError] = useState<string | null>(null)
  const [applicationsError, setApplicationsError] = useState<string | null>(null)
  const [exportedFileName, setExportedFileName] = useState<string | null>(null)

  const [coverLetter, setCoverLetter] = useState<string | null>(null)
  const [emailSubject, setEmailSubject] = useState<string | null>(null)
  const [emailBody, setEmailBody] = useState<string | null>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    applicationsService.getApplications().then((res) => {
      setApplications(res.applications ?? [])
      setApplicationsError(null)
    }).catch(() => {
      setApplicationsError('Failed to load applications.')
      showToast('Failed to load applications', 'error')
    })
  }, [showToast])

  const appOptions = applications.map((app) => ({
    value: app._id,
    label: `${app.role} @ ${app.company}`,
  }))

  const selectedApp = applications.find((a) => a._id === selectedAppId)

  async function handleExport(format: string) {
    if (!selectedAppId) {
      showToast('Select an application first', 'warning')
      return
    }

    setExporting(true)
    setExportError(null)
    setExportedFileName(null)
    try {
      let blob: Blob
      let extension = format

      if (activeTab === 'resume') {
        blob = await exportService.exportResume({
          applicationId: selectedAppId,
          format,
        })
      } else if (activeTab === 'cover-letter') {
        blob = await exportService.exportCoverLetter({
          applicationId: selectedAppId,
          format,
        })
      } else {
        blob = await exportService.exportEmail({
          applicationId: selectedAppId,
          format,
        })
      }

      const fileName = `${selectedApp?.role ?? 'resume'}-${selectedApp?.company ?? 'export'}.${extension}`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)

      setExportedFileName(fileName)
      showToast(`Exported as ${fileName}`, 'success')
    } catch {
      setExportError('Export failed. The server may be unavailable. Please try again.')
      showToast('Export failed', 'error')
    } finally {
      setExporting(false)
    }
  }

  async function handleGenerateContent(contentType: 'cover-letter' | 'email') {
    if (!selectedAppId) {
      showToast('Select an application first', 'warning')
      return
    }

    setLoadingContent(true)
    setContentError(null)
    try {
      const app = selectedApp
      const mockAnalysis: JDAnalysis = {
        _id: app?.jdAnalysisId ?? '',
        company: app?.company ?? '',
        role: app?.role ?? '',
        requiredSkills: [],
        niceToHaveSkills: [],
        keywords: [],
        atsTerms: [],
        redFlags: [],
      }

      if (contentType === 'cover-letter') {
        const result = await contentService.generateCoverLetter(mockAnalysis, {})
        setCoverLetter(result.content)
      } else {
        const result = await contentService.generateEmail(mockAnalysis, {}, 'professional')
        setEmailSubject(result.subject ?? '')
        setEmailBody(result.content)
      }
      showToast(`${contentType === 'cover-letter' ? 'Cover letter' : 'Email'} generated`, 'success')
    } catch {
      setContentError(`Failed to generate ${contentType === 'cover-letter' ? 'cover letter' : 'email'}. Please try again.`)
      showToast(`Failed to generate ${contentType}`, 'error')
    } finally {
      setLoadingContent(false)
    }
  }

  const filteredApps = appOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  function renderResumeTab() {
    return (
      <div className="space-y-md">
        <Section title="Export Resume" description="Choose format and export your tailored resume">
          <ExportOptions
            onExport={handleExport}
            loading={exporting}
            formats={RESUME_FORMATS}
            defaultFormat={DEFAULT_FORMAT_BY_TAB.resume}
          />
        </Section>
      </div>
    )
  }

  function renderCoverLetterTab() {
    return (
      <div className="space-y-md">
        <Section
          title="Cover Letter"
          description="Generate and export a tailored cover letter"
          action={
            coverLetter
              ? { label: 'Clear', onClick: () => setCoverLetter(null) }
              : undefined
          }
        >
          {coverLetter ? (
            <div className="space-y-4">
              <Card className="p-4">
                <p className="text-body-md text-on-surface whitespace-pre-line">
                  {coverLetter}
                </p>
              </Card>
              <ExportOptions
                onExport={handleExport}
                loading={exporting}
                formats={DOC_FORMATS}
                defaultFormat={DEFAULT_FORMAT_BY_TAB['cover-letter']}
              />
            </div>
          ) : (
            <div className="flex justify-center py-lg">
              <Button
                onClick={() => handleGenerateContent('cover-letter')}
                loading={loadingContent}
                icon={<FileSignature className="h-4 w-4" />}
              >
                Generate Cover Letter
              </Button>
            </div>
          )}
        </Section>
      </div>
    )
  }

  function renderEmailTab() {
    return (
      <div className="space-y-md">
        <Section
          title="Application Email"
          description="Generate a professional application email"
          action={
            emailBody
              ? { label: 'Clear', onClick: () => { setEmailBody(null); setEmailSubject(null) } }
              : undefined
          }
        >
          {emailBody ? (
            <div className="space-y-4">
              <Card className="p-4 space-y-3">
                {emailSubject && (
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">Subject</p>
                    <p className="text-body-md font-medium text-on-surface">{emailSubject}</p>
                  </div>
                )}
                <div>
                  <p className="text-label-sm text-on-surface-variant mb-1">Body</p>
                  <p className="text-body-md text-on-surface whitespace-pre-line">{emailBody}</p>
                </div>
              </Card>
              <ExportOptions
                onExport={handleExport}
                loading={exporting}
                formats={DOC_FORMATS}
                defaultFormat={DEFAULT_FORMAT_BY_TAB.email}
              />
            </div>
          ) : (
            <div className="flex justify-center py-lg">
              <Button
                onClick={() => handleGenerateContent('email')}
                loading={loadingContent}
                icon={<Mail className="h-4 w-4" />}
              >
                Generate Email
              </Button>
            </div>
          )}
        </Section>
      </div>
    )
  }

  const tabContent: Record<string, () => JSX.Element> = {
    resume: renderResumeTab,
    'cover-letter': renderCoverLetterTab,
    email: renderEmailTab,
  }

  return (
    <AppLayout>

      {applicationsError && (
        <div className="rounded-xl border border-error/20 bg-red-50 p-4 text-body-md text-error flex items-start gap-3 mb-lg">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Failed to Load Applications</p>
            <p className="text-error/80 mt-0.5">{applicationsError}</p>
          </div>
          <button onClick={() => setApplicationsError(null)} className="p-1 rounded hover:bg-error/10 transition-colors shrink-0" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {exportError && (
        <div className="rounded-xl border border-error/20 bg-red-50 p-4 text-body-md text-error flex items-start gap-3 mb-lg">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Export Failed</p>
            <p className="text-error/80 mt-0.5">{exportError}</p>
          </div>
          <button onClick={() => setExportError(null)} className="p-1 rounded hover:bg-error/10 transition-colors shrink-0" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {contentError && (
        <div className="rounded-xl border border-error/20 bg-red-50 p-4 text-body-md text-error flex items-start gap-3 mb-lg">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Generation Failed</p>
            <p className="text-error/80 mt-0.5">{contentError}</p>
          </div>
          <button onClick={() => setContentError(null)} className="p-1 rounded hover:bg-error/10 transition-colors shrink-0" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-md mb-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search applications..."
            />
          </div>
          <Select
            options={filteredApps}
            value={selectedAppId}
            onChange={setSelectedAppId}
            placeholder="Select an application"
            className="w-full sm:w-72"
            label="Application"
          />
        </div>
      </div>

      <Tabs
        tabs={EXPORT_TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        className="mb-lg"
      />

      {selectedAppId ? (
        tabContent[activeTab]?.() ?? renderResumeTab()
      ) : (
        <div className="py-xl text-center">
          <Download className="h-12 w-12 text-on-surface-variant/40 mx-auto mb-3" />
          <p className="text-headline-md text-on-surface-variant mb-1">Select an Application</p>
          <p className="text-body-md text-on-surface-variant">
            Choose an application above to export its resume, cover letter, or email.
          </p>
        </div>
      )}

      {exportedFileName && (
        <div className="mt-lg p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <p className="text-body-md text-emerald-700">
            ✓ Exported as <strong>{exportedFileName}</strong>
          </p>
        </div>
      )}
    </AppLayout>
  )
}
