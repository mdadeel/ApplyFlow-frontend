import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Trash2, Briefcase, Code, GraduationCap, Award, Sparkles, Clock, ExternalLink } from '../lib/icons'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Chip } from '../components/ui/Chip'
import { Badge } from '../components/ui/Badge'
import { Dialog } from '../components/ui/Dialog'
import { useToast } from '../components/layout/useToast'
import { resumeLibraryService } from '../services/resumeLibrary'
import type { UploadedResume } from '../types'

type TabKey = 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certificates'

const sectionTabs: { id: TabKey; label: string; icon: typeof Briefcase }[] = [
  { id: 'summary', label: 'Summary', icon: Sparkles },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'skills', label: 'Skills', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'certificates', label: 'Certificates', icon: Award },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function ResumeSectionExperiences({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-body-sm text-on-surface-variant py-4">No experience data extracted.</p>
  return (
    <div className="space-y-4">
      {data.map((exp, i) => (
        <Card key={i} className="p-md space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-headline-sm text-on-surface">{exp.company || 'Unknown Company'}</h4>
              {exp.role && <p className="text-body-md text-on-surface-variant">{exp.role}</p>}
            </div>
            <Badge variant={exp.current ? 'success' : 'default'}>
              {exp.current ? 'Current' : formatDate(exp.endDate)}
            </Badge>
          </div>
          <p className="text-label-sm text-on-surface-variant">
            {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate || '')}
          </p>
          {exp.responsibilities?.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5">
              {exp.responsibilities.map((r: string, j: number) => (
                <li key={j} className="text-body-sm text-on-surface">{r}</li>
              ))}
            </ul>
          )}
          {exp.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {exp.technologies.map((t: string) => (
                <Chip key={t} label={t} />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}

function ResumeSectionProjects({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-body-sm text-on-surface-variant py-4">No project data extracted.</p>
  return (
    <div className="space-y-4">
      {data.map((proj, i) => (
        <Card key={i} className="p-md space-y-2">
          <h4 className="text-headline-sm text-on-surface">{proj.title || 'Untitled Project'}</h4>
          {proj.description && <p className="text-body-md text-on-surface-variant">{proj.description}</p>}
          {proj.features?.length > 0 && (
            <ul className="list-disc list-inside space-y-0.5">
              {proj.features.map((f: string, j: number) => (
                <li key={j} className="text-body-sm text-on-surface">{f}</li>
              ))}
            </ul>
          )}
          {proj.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {proj.technologies.map((t: string) => (
                <Chip key={t} label={t} />
              ))}
            </div>
          )}
          {proj.outcome && <p className="text-body-sm text-primary mt-1">Outcome: {proj.outcome}</p>}
        </Card>
      ))}
    </div>
  )
}

function ResumeSectionSkills({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-body-sm text-on-surface-variant py-4">No skill data extracted.</p>
  const grouped = data.reduce<Record<string, Record<string, any>[]>>((acc, s) => {
    const cat = s.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})
  const levelColor: Record<string, 'default' | 'warning' | 'success'> = {
    Beginner: 'default', Intermediate: 'default', Advanced: 'warning', Expert: 'success',
  }
  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category}>
          <h4 className="text-label-md text-on-surface-variant mb-2 uppercase tracking-wide">{category}</h4>
          <div className="space-y-2">
            {skills.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-low">
                <span className="text-body-md text-on-surface">{s.name}</span>
                <Badge variant={levelColor[s.level] || 'default'}>{s.level}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ResumeSectionEducation({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-body-sm text-on-surface-variant py-4">No education data extracted.</p>
  return (
    <div className="space-y-4">
      {data.map((edu, i) => (
        <Card key={i} className="p-md space-y-1">
          <h4 className="text-headline-sm text-on-surface">{edu.degree || 'Degree'}</h4>
          {edu.institution && <p className="text-body-md text-on-surface-variant">{edu.institution}</p>}
          <p className="text-label-sm text-on-surface-variant">
            {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
          </p>
          {edu.result && <p className="text-body-sm text-on-surface mt-1">Result: {edu.result}</p>}
        </Card>
      ))}
    </div>
  )
}

function ResumeSectionCertificates({ data }: { data: Record<string, any>[] }) {
  if (!data || data.length === 0) return <p className="text-body-sm text-on-surface-variant py-4">No certificate data extracted.</p>
  return (
    <div className="space-y-3">
      {data.map((cert, i) => (
        <Card key={i} className="p-md space-y-1">
          <h4 className="text-headline-sm text-on-surface">{cert.name || 'Certificate'}</h4>
          {cert.issuer && <p className="text-body-md text-on-surface-variant">{cert.issuer}</p>}
          {cert.date && <p className="text-label-sm text-on-surface-variant">{formatDate(cert.date)}</p>}
          {cert.url && (
            <a href={cert.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-label-sm text-primary hover:underline mt-1">
              <ExternalLink className="h-3.5 w-3.5" /> View Certificate
            </a>
          )}
        </Card>
      ))}
    </div>
  )
}

export function ResumeLibraryPage() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resumes, setResumes] = useState<UploadedResume[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectedResume, setSelectedResume] = useState<UploadedResume | null>(null)
  const [activeSection, setActiveSection] = useState<TabKey>('experience')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  // Load resume list
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const { resumes: list } = await resumeLibraryService.getResumes()
        if (cancelled) return
        setResumes(list)
        // Auto-select the first resume if none selected
        if (list.length > 0 && !selectedId) {
          setSelectedId(list[0]._id)
        }
      } catch {
        if (!cancelled) showToast('Failed to load resumes', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load selected resume detail
  useEffect(() => {
    if (!selectedId) {
      setSelectedResume(null)
      return
    }
    let cancelled = false
    async function loadDetail() {
      setDetailLoading(true)
      try {
        const { resume } = await resumeLibraryService.getResume(selectedId!)
        if (cancelled) return
        setSelectedResume(resume)
      } catch {
        if (!cancelled) showToast('Failed to load resume details', 'error')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    loadDetail()
    return () => { cancelled = true }
  }, [selectedId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    // Validate file type
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    const isDoc = file.type === 'application/msword'
    const isPdf = file.type === 'application/pdf'
    if (!isDocx && !isDoc && !isPdf) {
      showToast('Please select a .pdf, .docx or .doc file.', 'error')
      return
    }

    setUploading(true)
    try {
      const { resume } = await resumeLibraryService.uploadResume(file)
      setResumes((prev) => [resume, ...prev])
      setSelectedId(resume._id)
      setActiveSection('experience')
      showToast(`"${resume.fileName}" processed successfully`, 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process document.'
      showToast(message, 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await resumeLibraryService.deleteResume(deleteTarget)
      setResumes((prev) => prev.filter((r) => r._id !== deleteTarget))
      if (selectedId === deleteTarget) {
        setSelectedId(resumes.length > 1 ? resumes.find((r) => r._id !== deleteTarget)?._id || null : null)
        setSelectedResume(null)
      }
      showToast('Resume deleted', 'success')
    } catch {
      showToast('Failed to delete resume', 'error')
    }
    setDeleteTarget(null)
  }

  const renderSectionContent = () => {
    if (!selectedResume) return null
    const content = selectedResume.content
    switch (activeSection) {
      case 'experience':
        return <ResumeSectionExperiences data={content.experiences} />
      case 'projects':
        return <ResumeSectionProjects data={content.projects} />
      case 'skills':
        return <ResumeSectionSkills data={content.skills} />
      case 'education':
        return <ResumeSectionEducation data={content.education} />
      case 'certificates':
        return <ResumeSectionCertificates data={content.certificates} />
      case 'summary':
        return (
          <div className="py-2">
            {content.summary ? (
              <p className="text-body-md text-on-surface leading-relaxed">{content.summary}</p>
            ) : (
              <p className="text-body-sm text-on-surface-variant">No summary extracted.</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const sectionCount = (key: TabKey): number => {
    if (!selectedResume) return 0
    const c = selectedResume.content
    switch (key) {
      case 'experience': return c.experiences?.length || 0
      case 'projects': return c.projects?.length || 0
      case 'skills': return c.skills?.length || 0
      case 'education': return c.education?.length || 0
      case 'certificates': return c.certificates?.length || 0
      case 'summary': return c.summary ? 1 : 0
    }
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-lg gap-3 flex-wrap">
        <div>
          <h2 className="text-headline-md text-on-surface">My Resumes</h2>
          <p className="text-body-md text-on-surface-variant">Upload your .pdf, .docx or .doc resumes. AI extracts all sections automatically.</p>
        </div>
        <Button
          icon={uploading ? undefined : <Upload className="h-4 w-4" />}
          onClick={handleUploadClick}
          loading={uploading}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Upload Resume'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          onChange={handleFileSelected}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-lg">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={56} />
            ))}
          </div>
          <Skeleton variant="rectangular" height={400} />
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No resumes yet"
          description="Upload a PDF, .docx or .doc resume to get started. AI will extract your experience, projects, skills, education, and certificates."
          action={{ label: 'Upload Resume', onClick: handleUploadClick }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-lg">
          {/* Resume List */}
          <div className="space-y-1">
            <p className="text-label-sm text-on-surface-variant mb-2 px-1">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
            </p>
            {resumes.map((r) => (
              <div
                key={r._id}
                className={`w-full group flex items-center gap-2 p-1.5 rounded-lg transition-colors ${
                  selectedId === r._id
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface hover:bg-surface-container'
                }`}
              >
                <button
                  onClick={() => setSelectedId(r._id)}
                  className="flex-1 flex items-center gap-3 text-left min-w-0"
                >
                  <FileText className={`h-5 w-5 shrink-0 ${selectedId === r._id ? 'text-on-primary-container' : 'text-on-surface-variant'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-body-md truncate ${selectedId === r._id ? 'text-on-primary-container font-medium' : 'text-on-surface'}`}>
                      {r.fileName}
                    </p>
                    <p className={`text-label-sm flex items-center gap-1 ${selectedId === r._id ? 'text-on-primary-container/70' : 'text-on-surface-variant'}`}>
                      <Clock className="h-3 w-3" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(r._id) }}
                  className={`p-1.5 rounded text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all ${
                    selectedId === r._id ? 'hover:bg-primary-container/20 text-on-primary-container' : 'hover:bg-red-50'
                  }`}
                  aria-label="Delete resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Resume Detail Panel */}
          <div className="min-h-0">
            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton variant="rectangular" height={40} />
                <Skeleton variant="rectangular" height={200} />
              </div>
            ) : selectedResume ? (
              <div className="space-y-4">
                {/* Resume header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-headline-sm text-on-surface">{selectedResume.fileName}</h3>
                    <p className="text-label-sm text-on-surface-variant">
                      {selectedResume.fileType.toUpperCase()} · Uploaded {new Date(selectedResume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Section tabs */}
                <div className="flex flex-wrap gap-1 border-b border-outline-variant pb-1">
                  {sectionTabs.map((tab) => {
                    const count = sectionCount(tab.id)
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-label-sm font-medium transition-colors ${
                          activeSection === tab.id
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                        {count > 0 && (
                          <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[11px] ${
                            activeSection === tab.id ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Section content */}
                <div className="pb-lg">
                  {renderSectionContent()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-body-md text-on-surface-variant">Select a resume to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to delete this resume? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </AppLayout>
  )
}
