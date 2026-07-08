import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Code,
  GraduationCap,
  Award,
  ExternalLink,
  Code2,
  AlertTriangle,
  X,
  FileText,
  Check,
  Upload,
} from '../lib/icons'
import { AppLayout } from '../components/layout/AppLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { Dialog } from '../components/ui/Dialog'
import { Chip } from '../components/ui/Chip'
import { Skeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/layout/useToast'
import { profileService, type PersonalData } from '../services/profile'
import type {
  Experience,
  Project,
  Skill,
  Education,
  Certificate,
  ExtractedProfile,
  ExtractedExperience,
  ExtractedProject,
  ExtractedSkill,
  ExtractedEducation,
  ExtractedCertificate,
} from '../types'



const skillCategories = [
  'Frontend', 'Backend', 'Database', 'Cloud', 'Testing', 'DevOps', 'Languages', 'Soft Skills',
] as const

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

function parseListInput(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatListInput(items: string[]): string {
  return items.join(', ')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function ExperienceCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Experience
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-6 space-y-4 group hover:border-primary/30 transition-all duration-300 shadow-card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-border flex items-center justify-center shrink-0 text-text-secondary group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 shadow-sm">
          <Briefcase className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <h3 className="text-heading-3 font-bold text-text-primary leading-snug">{item.role}</h3>
              <p className="text-body-sm text-text-secondary font-semibold">{item.company}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-border transition-all text-text-secondary hover:text-text-primary"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-danger"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-caption text-text-tertiary font-medium mt-1.5">
            {formatDate(item.startDate)} – {item.current ? 'Present' : formatDate(item.endDate || '')}
          </p>
          {item.responsibilities.length > 0 && (
            <ul className="list-disc list-outside ml-4 mt-3.5 space-y-1.5">
              {item.responsibilities.slice(0, 3).map((r, i) => (
                <li key={i} className="text-body-sm text-text-secondary leading-relaxed">{r}</li>
              ))}
              {item.responsibilities.length > 3 && (
                <li className="text-caption text-text-tertiary list-none -ml-4 mt-2">+{item.responsibilities.length - 3} more</li>
              )}
            </ul>
          )}
          {item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.technologies.map((t) => (
                <Chip key={t} label={t} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function ProjectCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Project
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-6 space-y-4 group hover:border-primary/30 transition-all duration-300 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-border flex items-center justify-center shrink-0 text-text-secondary group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300 shadow-sm">
            <Code className="h-6 w-6" />
          </div>
          <div className="space-y-1 min-w-0">
            <h3 className="text-heading-3 font-bold text-text-primary leading-snug truncate">{item.title}</h3>
            <p className="text-body-sm text-text-secondary leading-relaxed line-clamp-2">{item.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-neutral-50 border border-transparent hover:border-border transition-all text-text-secondary hover:text-text-primary"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100 transition-all text-danger"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="ml-16 space-y-3.5 pl-0.5">
        {item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.technologies.map((t) => (
              <Chip key={t} label={t} />
            ))}
          </div>
        )}
        {item.features.length > 0 && (
          <ul className="list-disc list-outside ml-4 mt-2 space-y-1.5">
            {item.features.slice(0, 3).map((f, i) => (
              <li key={i} className="text-body-sm text-text-secondary leading-relaxed">{f}</li>
            ))}
            {item.features.length > 3 && (
              <li className="text-caption text-text-tertiary list-none -ml-4 mt-2">+{item.features.length - 3} more</li>
            )}
          </ul>
        )}
        <div className="flex items-center gap-3 pt-1">
          {item.github && (
            <a href={item.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-md transition-colors">
              <Code2 className="h-3.5 w-3.5" /> Source Code
            </a>
          )}
          {item.demo && (
            <a href={item.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-caption font-semibold text-primary hover:text-primary-hover bg-primary/5 hover:bg-primary/10 border border-primary/10 px-3 py-1.5 rounded-md transition-colors">
              <ExternalLink className="h-3.5 w-3.5" /> Live Demo
            </a>
          )}
        </div>
      </div>
    </Card>
  )
}

function EducationCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Education
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-md group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.institution}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.degree}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-error"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-label-sm text-on-surface-variant">
            <span>{formatDate(item.startDate)} – {formatDate(item.endDate)}</span>
            {item.result && (
              <>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="text-on-surface font-medium">Grade: {item.result}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function CertificateCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Certificate
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-md group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Award className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.name}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.issuer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant"
                aria-label="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-error"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2">
            <p className="text-label-sm text-on-surface-variant">Issued: {formatDate(item.date)}</p>
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-label-sm text-primary hover:underline bg-primary/5 px-2.5 py-1 rounded-md transition-colors hover:bg-primary/10">
                <ExternalLink className="h-3.5 w-3.5" /> View Credential
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function SkillCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Skill
  onEdit?: () => void
  onDelete?: () => void
}) {
  const levelColor: Record<string, 'default' | 'warning' | 'success'> = {
    Beginner: 'default',
    Intermediate: 'default',
    Advanced: 'warning',
    Expert: 'success',
  }

  return (
    <div className="group relative inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant hover:border-primary/40 hover:bg-surface-container transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-body-sm font-medium text-on-surface truncate">{item.name}</span>
        <Badge variant={levelColor[item.level] || 'default'}>
          {item.level}
        </Badge>
      </div>
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 ml-1">
        <button
          onClick={onEdit}
          className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          aria-label="Edit"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded-full hover:bg-red-100 transition-colors text-error"
          aria-label="Delete"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export function CareerProfilePage() {
  const { showToast } = useToast()
  const [searchValue, setSearchValue] = useState('')

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [personal, setPersonal] = useState<PersonalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)
  const [manualMode, setManualMode] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // PDF upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [extractedOpen, setExtractedOpen] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedProfile | null>(null)
  const [extractedFileName, setExtractedFileName] = useState<string>('')
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set())
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())

  // Drag and drop / Progress state
  const [isDragging, setIsDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStage, setProgressStage] = useState('')

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const processFile = async (file: File) => {
    setUploading(true)
    setExtractedFileName(file.name)
    setProgress(0)
    setProgressStage('Uploading resume PDF...')

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) {
          return prev + 5
        } else if (prev < 60) {
          setProgressStage('Parsing document text...')
          return prev + 2
        } else if (prev < 90) {
          setProgressStage('Extracting components with AI...')
          return prev + 1
        } else if (prev < 98) {
          setProgressStage('Structuring career database...')
          return prev + 0.5
        }
        return prev
      })
    }, 150)

    try {
      const { extracted } = await profileService.uploadResumePDF(file)
      clearInterval(progressInterval)
      setProgress(100)
      setProgressStage('Extraction complete!')

      // brief delay for user feedback
      await new Promise((resolve) => setTimeout(resolve, 500))

      setExtractedData(extracted)
      setExtractedOpen(true)
      setDismissedKeys(new Set())
      setSavedKeys(new Set())
      const total =
        (extracted?.experiences?.length || 0) +
        (extracted?.projects?.length || 0) +
        (extracted?.skills?.length || 0) +
        (extracted?.education?.length || 0) +
        (extracted?.certificates?.length || 0)
      showToast(
        total > 0
          ? `Extracted ${total} item${total === 1 ? '' : 's'} from your resume.`
          : 'No items extracted. You can try again with a different PDF.',
        total > 0 ? 'success' : 'info',
      )
    } catch (err) {
      clearInterval(progressInterval)
      const message = err instanceof Error ? err.message : 'Failed to process PDF.'
      showToast(message, 'error')
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      setProgress(0)
    }
  }

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.type && file.type !== 'application/pdf') {
      showToast('Please select a PDF file.', 'error')
      return
    }
    await processFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (file.type && file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('Please select a PDF file.', 'error')
      return
    }

    await processFile(file)
  }

  const closeExtractedModal = () => {
    setExtractedOpen(false)
    setExtractedData(null)
    setDismissedKeys(new Set())
    setSavedKeys(new Set())
  }

  const dismissExtractedItem = (key: string) => {
    setDismissedKeys((prev) => {
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }

  const handleSaveExperience = async (item: ExtractedExperience, key: string) => {
    try {
      const payload: Omit<Experience, '_id'> = {
        company: item.company || '',
        role: item.role || '',
        startDate: item.startDate || '',
        endDate: item.endDate || undefined,
        current: Boolean(item.current),
        responsibilities: item.responsibilities || [],
        technologies: item.technologies || [],
        achievements: item.achievements || [],
        metrics: item.metrics || [],
        links: item.links || [],
      }
      const created = await profileService.createExperience(payload)
      setExperiences((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Experience added', 'success')
    } catch {
      showToast('Failed to add experience', 'error')
    }
  }

  const handleSaveProject = async (item: ExtractedProject, key: string) => {
    try {
      const payload: Omit<Project, '_id'> = {
        title: item.title || '',
        description: item.description || '',
        technologies: item.technologies || [],
        features: item.features || [],
        outcome: item.outcome || undefined,
        github: item.github || undefined,
        demo: item.demo || undefined,
        links: item.links || [],
      }
      const created = await profileService.createProject(payload)
      setProjects((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Project added', 'success')
    } catch {
      showToast('Failed to add project', 'error')
    }
  }

  const handleSaveSkill = async (item: ExtractedSkill, key: string) => {
    try {
      const payload: Omit<Skill, '_id'> = {
        name: item.name,
        category: item.category as Skill['category'],
        level: item.level,
      }
      const created = await profileService.createSkill(payload)
      setSkills((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Skill added', 'success')
    } catch {
      showToast('Failed to add skill', 'error')
    }
  }

  const handleSaveEducation = async (item: ExtractedEducation, key: string) => {
    try {
      const payload: Omit<Education, '_id'> = {
        degree: item.degree || '',
        institution: item.institution || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        result: item.result || undefined,
      }
      const created = await profileService.createEducation(payload)
      setEducation((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Education added', 'success')
    } catch {
      showToast('Failed to add education', 'error')
    }
  }

  const handleSaveCertificate = async (item: ExtractedCertificate, key: string) => {
    try {
      const payload: Omit<Certificate, '_id'> = {
        name: item.name || '',
        issuer: item.issuer || '',
        date: item.date || '',
        url: item.url || undefined,
      }
      const created = await profileService.createCertificate(payload)
      setCertificates((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Certificate added', 'success')
    } catch {
      showToast('Failed to add certificate', 'error')
    }
  }

  const handleSavePersonal = async (item: ExtractedProfile['personal'], key: string) => {
    if (!item) return
    try {
      const payload: Partial<PersonalData> = {
        name: item.name,
        title: item.title,
        summary: item.summary,
        email: item.email,
        phone: item.phone,
        location: item.location,
      }
      // If links exist, we map them (if backend supports saving them inside PersonalData).
      // Since we just updated PersonalData to allow github/linkedin/portfolio, we could map them.
      if (item.links && item.links.length > 0) {
        item.links.forEach(link => {
          const p = link.platform?.toLowerCase()
          if (p === 'linkedin') payload.linkedIn = link.url
          else if (p === 'github') payload.github = link.url
          else if (p === 'portfolio' || p === 'website') payload.portfolio = link.url
        })
      }
      const updated = await profileService.updatePersonal(payload)
      setPersonal(updated)
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Personal info updated', 'success')
    } catch {
      showToast('Failed to update personal info', 'error')
    }
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [exp, proj, sk, edu, cert, pers] = await Promise.all([
          profileService.getExperiences(),
          profileService.getProjects(),
          profileService.getSkills(),
          profileService.getEducation(),
          profileService.getCertificates(),
          profileService.getPersonal().catch(() => null),
        ])
        if (cancelled) return
        setExperiences(Array.isArray(exp) ? exp : [])
        setProjects(Array.isArray(proj) ? proj : [])
        setSkills(Array.isArray(sk) ? sk : [])
        setEducation(Array.isArray(edu) ? edu : [])
        setCertificates(Array.isArray(cert) ? cert : [])
        setPersonal(pers && (pers.name || pers.title || pers.summary) ? pers : null)
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load profile data from the server.'
          setError(message === 'Unauthorized' ? 'Your session has expired. Please sign in again.' : 'Failed to load profile data from the server.')
          if (message !== 'Unauthorized') {
            showToast('Failed to load profile data', 'error')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [showToast])

  const openAddModal = (type: string) => {
    setModalType(type)
    setEditingId(null)
    setModalOpen(true)
  }

  const openEditModal = (type: string, id: string) => {
    setModalType(type)
    setEditingId(id)
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const { type, id } = deleteTarget
      switch (type) {
        case 'experience':
          await profileService.deleteExperience(id)
          setExperiences((prev) => prev.filter((e) => e._id !== id))
          break
        case 'project':
          await profileService.deleteProject(id)
          setProjects((prev) => prev.filter((p) => p._id !== id))
          break
        case 'skill':
          await profileService.deleteSkill(id)
          setSkills((prev) => prev.filter((s) => s._id !== id))
          break
        case 'education':
          await profileService.deleteEducation(id)
          setEducation((prev) => prev.filter((e) => e._id !== id))
          break
        case 'certificate':
          await profileService.deleteCertificate(id)
          setCertificates((prev) => prev.filter((c) => c._id !== id))
          break
      }
      showToast('Deleted successfully', 'success')
    } catch {
      showToast('Failed to delete', 'error')
    }
    setDeleteTarget(null)
  }

  const getItemForEdit = () => {
    if (!editingId || !modalType) return undefined
    switch (modalType) {
      case 'experience':
        return experiences.find((e) => e._id === editingId)
      case 'project':
        return projects.find((p) => p._id === editingId)
      case 'skill':
        return skills.find((s) => s._id === editingId)
      case 'education':
        return education.find((e) => e._id === editingId)
      case 'certificate':
        return certificates.find((c) => c._id === editingId)
    }
  }

  const matchesQuery = (text: string | undefined): boolean => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return true
    return (text ?? '').toLowerCase().includes(query)
  }

  const filteredExperiences = experiences.filter(
    (e) => matchesQuery(e.company) || matchesQuery(e.role)
  )
  const filteredProjects = projects.filter(
    (p) => matchesQuery(p.title) || matchesQuery(p.description)
  )
  const filteredSkills = skills.filter((s) => matchesQuery(s.name))
  const filteredEducation = education.filter(
    (e) => matchesQuery(e.degree) || matchesQuery(e.institution)
  )
  const filteredCertificates = certificates.filter(
    (c) => matchesQuery(c.name) || matchesQuery(c.issuer)
  )

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const hasProfile =
    experiences.length > 0 ||
    projects.length > 0 ||
    skills.length > 0 ||
    education.length > 0 ||
    certificates.length > 0 ||
    personal !== null

  const renderHeroUpload = (compact: boolean = false) => (
    <Card
      className={`border-2 border-dashed transition-all ${
        isDragging
          ? 'border-primary bg-primary/5 border-solid shadow-md'
          : 'border-outline-variant hover:border-primary/40 bg-surface-container-lowest'
      } ${compact ? 'p-md' : 'p-lg'}`}
      data-testid="career-profile-hero-upload"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelected}
        className="hidden"
        aria-hidden="true"
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={compact ? 'flex items-center gap-4' : 'flex flex-col items-center text-center py-4'}
      >
        {uploading ? (
          <div className="w-full max-w-md space-y-3 py-4">
            <div className="flex items-center justify-between text-label-sm font-medium text-on-surface">
              <span className="animate-pulse truncate mr-2">{progressStage}</span>
              <span className="text-primary font-semibold shrink-0">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : compact ? (
          <>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-md font-medium text-on-surface truncate" data-testid="career-profile-hero-filename">
                {extractedFileName || 'Your CV'}
              </p>
              <p className="text-label-sm text-on-surface-variant truncate">
                {extractedFileName ? 'Drag & drop a new PDF or click replace' : 'Drag & drop a PDF or click to upload'}
              </p>
            </div>
            <Button
              onClick={handleUploadClick}
              variant="secondary"
              size="sm"
              icon={<Upload className="h-4 w-4" />}
            >
              Replace CV
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Upload className="h-8 w-8" />
            </div>
            <h3 className="text-headline-md text-on-surface mb-2">Upload your CV / Resume</h3>
            <p className="text-body-md text-on-surface-variant mb-5 max-w-md">
              We'll extract your experience, skills, education, and projects automatically
            </p>
            <Button
              onClick={handleUploadClick}
              icon={<Upload className="h-4 w-4" />}
              size="lg"
            >
              Choose PDF file
            </Button>
            <p className="text-label-sm text-on-surface-variant mt-4">
              or drag and drop · Supported format: PDF
            </p>
          </>
        )}
      </div>
    </Card>
  )

  const renderProfileSummary = () => {
    if (!personal) return null
    return (
      <Card className="p-md" data-testid="career-profile-summary">
        <h3 className="text-headline-sm text-on-surface mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" /> Profile
        </h3>
        <div className="space-y-1">
          {personal.name && (
            <p className="text-body-md font-semibold text-on-surface">{personal.name}</p>
          )}
          {personal.title && (
            <p className="text-body-md text-on-surface-variant">{personal.title}</p>
          )}
          {personal.summary && (
            <p className="text-body-sm text-on-surface mt-2 leading-relaxed">{personal.summary}</p>
          )}
        </div>
      </Card>
    )
  }

  const renderOverviewSections = () => (
    <div className="space-y-6 pb-24">
      {renderProfileSummary()}
      <div className="space-y-8">
        {filteredExperiences.length > 0 && (
          <section data-testid="overview-section-experience" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" /> Experience
            </h3>
            <div className="space-y-4">
              {filteredExperiences.map((item) => (
                <ExperienceCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredProjects.length > 0 && (
          <section data-testid="overview-section-projects" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" /> Projects
            </h3>
            <div className="space-y-4">
              {filteredProjects.map((item) => (
                <ProjectCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredSkills.length > 0 && (
          <section data-testid="overview-section-skills" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((item) => (
                <SkillCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredEducation.length > 0 && (
          <section data-testid="overview-section-education" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" /> Education
            </h3>
            <div className="space-y-4">
              {filteredEducation.map((item) => (
                <EducationCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredCertificates.length > 0 && (
          <section data-testid="overview-section-certificates" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Certificates
            </h3>
            <div className="space-y-4">
              {filteredCertificates.map((item) => (
                <CertificateCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )

  const renderManualSections = () => {
    const groupedFiltered = filteredSkills.reduce<Record<string, Skill[]>>((acc, s) => {
      if (!acc[s.category]) acc[s.category] = []
      acc[s.category].push(s)
      return acc
    }, {})

    return (
      <div className="space-y-12 pb-24">
        {/* Experience Section */}
        <section id="experience" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Experience</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('experience')}>Add</Button>
          </div>
          {filteredExperiences.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-8 w-8" />}
              title={searchValue ? 'No matching experience' : 'No experience yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your work experience to get started.'}
              action={searchValue ? undefined : { label: 'Add Experience', onClick: () => openAddModal('experience') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredExperiences.map((item) => (
                <ExperienceCard key={item._id} item={item} onEdit={() => openEditModal('experience', item._id)} onDelete={() => setDeleteTarget({ type: 'experience', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Projects Section */}
        <section id="projects" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Code className="h-5 w-5 text-primary" /> Projects</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('project')}>Add</Button>
          </div>
          {filteredProjects.length === 0 ? (
            <EmptyState
              icon={<Code className="h-8 w-8" />}
              title={searchValue ? 'No matching projects' : 'No projects yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your projects to showcase your work.'}
              action={searchValue ? undefined : { label: 'Add Project', onClick: () => openAddModal('project') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((item) => (
                <ProjectCard key={item._id} item={item} onEdit={() => openEditModal('project', item._id)} onDelete={() => setDeleteTarget({ type: 'project', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Skills Section */}
        <section id="skills" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Code2 className="h-5 w-5 text-primary" /> Skills</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('skill')}>Add</Button>
          </div>
          {filteredSkills.length === 0 ? (
            <EmptyState
              icon={<Code className="h-8 w-8" />}
              title={searchValue ? 'No matching skills' : 'No skills yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your skills to help match with job descriptions.'}
              action={searchValue ? undefined : { label: 'Add Skill', onClick: () => openAddModal('skill') }}
            />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedFiltered).map(([category, catskills]) => (
                <div key={category}>
                  <h4 className="text-body-md font-medium text-on-surface mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {catskills.map((item) => (
                      <SkillCard key={item._id} item={item} onEdit={() => openEditModal('skill', item._id)} onDelete={() => setDeleteTarget({ type: 'skill', id: item._id })} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Education Section */}
        <section id="education" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Education</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('education')}>Add</Button>
          </div>
          {filteredEducation.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-8 w-8" />}
              title={searchValue ? 'No matching education' : 'No education yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your educational background.'}
              action={searchValue ? undefined : { label: 'Add Education', onClick: () => openAddModal('education') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredEducation.map((item) => (
                <EducationCard key={item._id} item={item} onEdit={() => openEditModal('education', item._id)} onDelete={() => setDeleteTarget({ type: 'education', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Certificates Section */}
        <section id="certificates" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Certificates</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('certificate')}>Add</Button>
          </div>
          {filteredCertificates.length === 0 ? (
            <EmptyState
              icon={<Award className="h-8 w-8" />}
              title={searchValue ? 'No matching certificates' : 'No certificates yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your certifications and credentials.'}
              action={searchValue ? undefined : { label: 'Add Certificate', onClick: () => openAddModal('certificate') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((item) => (
                <CertificateCard key={item._id} item={item} onEdit={() => openEditModal('certificate', item._id)} onDelete={() => setDeleteTarget({ type: 'certificate', id: item._id })} />
              ))}
            </div>
          )}
        </section>
      </div>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={100} />
          ))}
        </div>
      )
    }
    return (
      <div className="space-y-6 pb-24">
        {renderHeroUpload(hasProfile)}
        {!hasProfile ? (
          <div className="flex justify-center">
            <Button
              variant="secondary"
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => setManualMode(true)}
              data-testid="career-profile-edit-manually"
            >
              Edit manually
            </Button>
          </div>
        ) : manualMode ? (
          renderManualSections()
        ) : (
          <div className="space-y-6">
            {renderOverviewSections()}
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                icon={<Pencil className="h-4 w-4" />}
                onClick={() => setManualMode(true)}
                data-testid="career-profile-edit-manually"
              >
                Edit manually
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const completeness = [
    experiences.length > 0,
    projects.length > 0,
    skills.length > 0,
    education.length > 0,
    certificates.length > 0,
  ].filter(Boolean).length * 20

  return (
    <AppLayout onSearch={setSearchValue} searchValue={searchValue}>
      <div className="flex flex-col lg:flex-row gap-xl items-start relative max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-lg gap-3 flex-wrap">
            <div>
              <div>
                <h1 className="text-heading-2 text-text-primary">Career Profile</h1>
                <p className="text-body-sm text-text-secondary mt-0.5">Your professional story — experiences, skills, and credentials</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger/20 bg-red-50 p-4 text-body-sm text-danger flex items-start gap-3 mb-lg">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to Load Profile</p>
                <p className="mt-0.5 opacity-80">{error}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-1.5 rounded-lg bg-danger text-white text-meta font-medium hover:opacity-90 transition-colors"
                >
                  Retry
                </button>
                <button onClick={() => setError(null)} className="p-1.5 rounded hover:bg-danger/10 transition-colors" aria-label="Dismiss">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {renderContent()}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
          {/* Profile Completeness */}
          <Card className="p-5">
            <h3 className="text-heading-3 text-text-primary mb-3">Profile Completeness</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-surface-tertiary rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${completeness}%` }} />
              </div>
              <span className="text-body-sm font-semibold text-primary">{completeness}%</span>
            </div>
            <ul className="space-y-2">
              {[
                { id: 'experience', label: 'Experience', done: experiences.length > 0 },
                { id: 'projects', label: 'Projects', done: projects.length > 0 },
                { id: 'skills', label: 'Skills', done: skills.length > 0 },
                { id: 'education', label: 'Education', done: education.length > 0 },
                { id: 'certificates', label: 'Certificates', done: certificates.length > 0 },
              ].map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-primary text-white' : 'bg-surface-tertiary'}`}>
                    {item.done && <Check className="h-2.5 w-2.5" />}
                  </div>
                  <button onClick={() => scrollTo(item.id)} className={`text-meta hover:underline ${item.done ? 'text-text-primary' : 'text-text-tertiary'}`}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Navigation ScrollSpy */}
          <Card className="p-5 hidden lg:block">
            <h3 className="text-heading-3 text-text-primary mb-3">Quick Navigation</h3>
            <div className="flex flex-col items-start gap-1">
              <button onClick={() => scrollTo('experience')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Experience</button>
              <button onClick={() => scrollTo('projects')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Projects</button>
              <button onClick={() => scrollTo('skills')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Skills</button>
              <button onClick={() => scrollTo('education')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Education</button>
              <button onClick={() => scrollTo('certificates')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Certificates</button>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit ${modalType}` : `Add ${modalType}`}
        size="lg"
      >
        {modalType === 'experience' && (
          <ExperienceForm
            item={getItemForEdit() as Experience | undefined}
            submitting={submitting}
            onSubmit={async (data) => {
              setSubmitting(true)
              try {
                if (editingId) {
                  const updated = await profileService.updateExperience(editingId, data)
                  setExperiences((prev) => prev.map((e) => (e._id === editingId ? updated : e)))
                  showToast('Experience updated', 'success')
                } else {
                  const created = await profileService.createExperience(data as Omit<Experience, '_id'>)
                  setExperiences((prev) => [created, ...prev])
                  showToast('Experience added', 'success')
                }
                setModalOpen(false)
              } catch {
                showToast('Failed to save experience', 'error')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'project' && (
          <ProjectForm
            item={getItemForEdit() as Project | undefined}
            submitting={submitting}
            onSubmit={async (data) => {
              setSubmitting(true)
              try {
                if (editingId) {
                  const updated = await profileService.updateProject(editingId, data)
                  setProjects((prev) => prev.map((p) => (p._id === editingId ? updated : p)))
                  showToast('Project updated', 'success')
                } else {
                  const created = await profileService.createProject(data as Omit<Project, '_id'>)
                  setProjects((prev) => [created, ...prev])
                  showToast('Project added', 'success')
                }
                setModalOpen(false)
              } catch {
                showToast('Failed to save project', 'error')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'skill' && (
          <SkillForm
            item={getItemForEdit() as Skill | undefined}
            submitting={submitting}
            onSubmit={async (data) => {
              setSubmitting(true)
              try {
                if (editingId) {
                  const updated = await profileService.updateSkill(editingId, data)
                  setSkills((prev) => prev.map((s) => (s._id === editingId ? updated : s)))
                  showToast('Skill updated', 'success')
                } else {
                  const created = await profileService.createSkill(data as Omit<Skill, '_id'>)
                  setSkills((prev) => [created, ...prev])
                  showToast('Skill added', 'success')
                }
                setModalOpen(false)
              } catch {
                showToast('Failed to save skill', 'error')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'education' && (
          <EducationForm
            item={getItemForEdit() as Education | undefined}
            submitting={submitting}
            onSubmit={async (data) => {
              setSubmitting(true)
              try {
                if (editingId) {
                  const updated = await profileService.updateEducation(editingId, data)
                  setEducation((prev) => prev.map((e) => (e._id === editingId ? updated : e)))
                  showToast('Education updated', 'success')
                } else {
                  const created = await profileService.createEducation(data as Omit<Education, '_id'>)
                  setEducation((prev) => [created, ...prev])
                  showToast('Education added', 'success')
                }
                setModalOpen(false)
              } catch {
                showToast('Failed to save education', 'error')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'certificate' && (
          <CertificateForm
            item={getItemForEdit() as Certificate | undefined}
            submitting={submitting}
            onSubmit={async (data) => {
              setSubmitting(true)
              try {
                if (editingId) {
                  const updated = await profileService.updateCertificate(editingId, data)
                  setCertificates((prev) => prev.map((c) => (c._id === editingId ? updated : c)))
                  showToast('Certificate updated', 'success')
                } else {
                  const created = await profileService.createCertificate(data as Omit<Certificate, '_id'>)
                  setCertificates((prev) => [created, ...prev])
                  showToast('Certificate added', 'success')
                }
                setModalOpen(false)
              } catch {
                showToast('Failed to save certificate', 'error')
              } finally {
                setSubmitting(false)
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />

      <ExtractedResumeModal
        open={extractedOpen}
        onClose={closeExtractedModal}
        data={extractedData}
        fileName={extractedFileName}
        dismissedKeys={dismissedKeys}
        savedKeys={savedKeys}
        onDismiss={dismissExtractedItem}
        onSaveExperience={handleSaveExperience}
        onSaveProject={handleSaveProject}
        onSaveSkill={handleSaveSkill}
        onSaveEducation={handleSaveEducation}
        onSaveCertificate={handleSaveCertificate}
        onSavePersonal={handleSavePersonal}
      />
    </AppLayout>
  )
}

function ExperienceForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Experience
  submitting: boolean
  onSubmit: (data: Partial<Experience>) => void
  onCancel: () => void
}) {
  const [company, setCompany] = useState(item?.company || '')
  const [role, setRole] = useState(item?.role || '')
  const [startDate, setStartDate] = useState(item?.startDate || '')
  const [endDate, setEndDate] = useState(item?.endDate || '')
  const [current, setCurrent] = useState(item?.current || false)
  const [responsibilities, setResponsibilities] = useState(formatListInput(item?.responsibilities || []))
  const [technologies, setTechnologies] = useState(formatListInput(item?.technologies || []))
  const [achievements, setAchievements] = useState(formatListInput(item?.achievements || []))
  const [metrics, setMetrics] = useState(formatListInput(item?.metrics || []))

  const handleSubmit = () => {
    if (!company.trim() || !role.trim() || !startDate.trim()) return
    onSubmit({
      company: company.trim(),
      role: role.trim(),
      startDate,
      endDate: current ? undefined : endDate || undefined,
      current,
      responsibilities: parseListInput(responsibilities),
      technologies: parseListInput(technologies),
      achievements: parseListInput(achievements),
      metrics: parseListInput(metrics),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job title" />
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={current} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} className="rounded border-outline-variant" />
        <span className="text-body-md text-on-surface">I currently work here</span>
      </label>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Responsibilities (one per line)</label>
        <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Led frontend development..." />
      </div>
      <Input label="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, TypeScript, Node.js" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Achievements (one per line)</label>
        <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Shipped a new feature..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Metrics (one per line)</label>
        <textarea value={metrics} onChange={(e) => setMetrics(e.target.value)} rows={2} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Increased performance by 40%" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!company.trim() || !role.trim() || !startDate.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ProjectForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Project
  submitting: boolean
  onSubmit: (data: Partial<Project>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(item?.title || '')
  const [description, setDescription] = useState(item?.description || '')
  const [technologies, setTechnologies] = useState(formatListInput(item?.technologies || []))
  const [features, setFeatures] = useState(formatListInput(item?.features || []))
  const [outcome, setOutcome] = useState(item?.outcome || '')
  const [github, setGithub] = useState(item?.github || '')
  const [demo, setDemo] = useState(item?.demo || '')

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      technologies: parseListInput(technologies),
      features: parseListInput(features),
      outcome: outcome.trim() || undefined,
      github: github.trim() || undefined,
      demo: demo.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project name" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="A brief description of the project" />
      </div>
      <Input label="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node.js, MongoDB" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Features (one per line)</label>
        <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="User authentication..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Outcome</label>
        <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Served 1000+ users" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
        <Input label="Demo URL" value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!title.trim() || !description.trim()}>Save</Button>
      </div>
    </div>
  )
}

function SkillForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Skill
  submitting: boolean
  onSubmit: (data: Partial<Skill>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || 'Frontend')
  const [level, setLevel] = useState(item?.level || 'Intermediate')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), category: category as Skill['category'], level: level as Skill['level'] })
  }

  return (
    <div className="space-y-4">
      <Input label="Skill Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. React" />
      <Select label="Category" options={skillCategories.map((c) => ({ value: c, label: c }))} value={category} onChange={(v) => setCategory(v as Skill['category'])} />
      <Select label="Level" options={skillLevels.map((l) => ({ value: l, label: l }))} value={level} onChange={(v) => setLevel(v as Skill['level'])} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim()}>Save</Button>
      </div>
    </div>
  )
}

function EducationForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Education
  submitting: boolean
  onSubmit: (data: Partial<Education>) => void
  onCancel: () => void
}) {
  const [degree, setDegree] = useState(item?.degree || '')
  const [institution, setInstitution] = useState(item?.institution || '')
  const [startDate, setStartDate] = useState(item?.startDate || '')
  const [endDate, setEndDate] = useState(item?.endDate || '')
  const [result, setResult] = useState(item?.result || '')

  const handleSubmit = () => {
    if (!degree.trim() || !institution.trim() || !startDate.trim() || !endDate.trim()) return
    onSubmit({
      degree: degree.trim(),
      institution: institution.trim(),
      startDate,
      endDate,
      result: result.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="B.Sc. in Computer Science" />
      <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="University name" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Input label="Result (optional)" value={result} onChange={(e) => setResult(e.target.value)} placeholder="GPA 3.8/4.0" />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!degree.trim() || !institution.trim() || !startDate.trim() || !endDate.trim()}>Save</Button>
      </div>
    </div>
  )
}

function CertificateForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Certificate
  submitting: boolean
  onSubmit: (data: Partial<Certificate>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [issuer, setIssuer] = useState(item?.issuer || '')
  const [date, setDate] = useState(item?.date || '')
  const [url, setUrl] = useState(item?.url || '')

  const handleSubmit = () => {
    if (!name.trim() || !issuer.trim() || !date.trim()) return
    onSubmit({
      name: name.trim(),
      issuer: issuer.trim(),
      date,
      url: url.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Certificate Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="AWS Solutions Architect" />
      <Input label="Issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Amazon Web Services" />
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://credential.example.com/..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim() || !issuer.trim() || !date.trim()}>Save</Button>
      </div>
    </div>
  )
}

function ExtractedItemRow({
  title,
  subtitle,
  details,
  onAdd,
  onRemove,
  isSaved,
  isDismissed,
}: {
  title: string
  subtitle?: string
  details?: React.ReactNode
  onAdd: () => void
  onRemove: () => void
  isSaved: boolean
  isDismissed: boolean
}) {
  if (isDismissed) return null
  return (
    <div className="rounded-lg border border-outline-variant bg-surface p-3 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-body-md text-on-surface font-medium truncate">{title}</p>
          {subtitle && (
            <p className="text-label-sm text-on-surface-variant truncate">{subtitle}</p>
          )}
          {details && <div className="mt-1.5">{details}</div>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isSaved ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-label-sm text-success bg-green-50">
              <Check className="h-3.5 w-3.5" />
              Added
            </span>
          ) : (
            <Button size="sm" onClick={onAdd} icon={<Plus className="h-3.5 w-3.5" />}>
              Add
            </Button>
          )}
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant"
            aria-label="Remove suggestion"
            disabled={isSaved}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ExtractedResumeModal({
  open,
  onClose,
  data,
  fileName,
  dismissedKeys,
  savedKeys,
  onDismiss,
  onSaveExperience,
  onSaveProject,
  onSaveSkill,
  onSaveEducation,
  onSaveCertificate,
  onSavePersonal,
}: {
  open: boolean
  onClose: () => void
  data: ExtractedProfile | null
  fileName: string
  dismissedKeys: Set<string>
  savedKeys: Set<string>
  onDismiss: (key: string) => void
  onSaveExperience: (item: ExtractedExperience, key: string) => void
  onSaveProject: (item: ExtractedProject, key: string) => void
  onSaveSkill: (item: ExtractedSkill, key: string) => void
  onSaveEducation: (item: ExtractedEducation, key: string) => void
  onSaveCertificate: (item: ExtractedCertificate, key: string) => void
  onSavePersonal: (item: ExtractedProfile['personal'], key: string) => void
}) {
  if (!data) return null

  const experiences = data.experiences || []
  const projects = data.projects || []
  const skills = data.skills || []
  const education = data.education || []
  const certificates = data.certificates || []

  const total =
    experiences.length + projects.length + skills.length + education.length + certificates.length

  const groupedSkills = skills.reduce<Record<string, ExtractedSkill[]>>((acc, s) => {
    const key = s.category || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  const renderEmpty = (label: string) => (
    <p className="text-label-sm text-on-surface-variant">No {label} detected.</p>
  )

  return (
    <Modal open={open} onClose={onClose} title="Review Extracted Resume Data" size="full">
      <div className="space-y-6">
        <div className="flex items-start gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-3">
          <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-body-md text-on-surface font-medium">
              {fileName || 'resume.pdf'}
            </p>
            <p className="text-label-sm text-on-surface-variant">
              {total > 0
                ? `Found ${total} item${total === 1 ? '' : 's'} across ${[experiences.length > 0, projects.length > 0, skills.length > 0, education.length > 0, certificates.length > 0].filter(Boolean).length} categor${[experiences.length > 0, projects.length > 0, skills.length > 0, education.length > 0, certificates.length > 0].filter(Boolean).length === 1 ? 'y' : 'ies'}. Add the ones you want to your profile.`
                : 'No items could be detected. You can close this and add items manually.'}
            </p>
          </div>
        </div>

        {data.personal && (data.personal.name || data.personal.title || data.personal.summary) && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Personal</h3>
            <ExtractedItemRow
              title={data.personal.name || 'Personal Information'}
              subtitle={data.personal.title || data.personal.email || ''}
              details={
                <div className="space-y-2">
                  {data.personal.summary && <p className="text-body-sm text-on-surface">{data.personal.summary}</p>}
                  <div className="flex flex-wrap gap-2 text-label-sm text-on-surface-variant">
                    {data.personal.email && <span>{data.personal.email}</span>}
                    {data.personal.phone && <span>• {data.personal.phone}</span>}
                    {data.personal.location && <span>• {data.personal.location}</span>}
                  </div>
                  {data.personal.links && data.personal.links.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {data.personal.links.map((link, i) => (
                         <Chip key={i} label={link.platform || link.displayText} />
                      ))}
                    </div>
                  )}
                </div>
              }
              onAdd={() => onSavePersonal(data.personal!, 'personal-0')}
              onRemove={() => onDismiss('personal-0')}
              isSaved={savedKeys.has('personal-0')}
              isDismissed={dismissedKeys.has('personal-0')}
            />
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">Experiences ({experiences.length})</h3>
          {experiences.length === 0 ? (
            renderEmpty('experience')
          ) : (
            <div className="space-y-2">
              {experiences.map((item, idx) => {
                const key = `experience-${idx}`
                const subtitle = [item.role, item.company].filter(Boolean).join(' at ')
                const dates = [item.startDate, item.current ? 'Present' : item.endDate].filter(Boolean).join(' – ')
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.company || item.role || 'Experience'}
                    subtitle={[subtitle, dates].filter(Boolean).join(' · ')}
                    details={
                      item.responsibilities?.length ? (
                        <ul className="list-disc list-inside space-y-0.5">
                          {item.responsibilities.slice(0, 3).map((r, i) => (
                            <li key={i} className="text-body-sm text-on-surface">{r}</li>
                          ))}
                          {item.responsibilities.length > 3 && (
                            <li className="text-label-sm text-on-surface-variant">+{item.responsibilities.length - 3} more</li>
                          )}
                        </ul>
                      ) : null
                    }
                    onAdd={() => onSaveExperience(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            renderEmpty('projects')
          ) : (
            <div className="space-y-2">
              {projects.map((item, idx) => {
                const key = `project-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.title || 'Untitled project'}
                    subtitle={item.description}
                    details={
                      item.technologies?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {item.technologies.slice(0, 8).map((t) => (
                            <Chip key={t} label={t} />
                          ))}
                        </div>
                      ) : null
                    }
                    onAdd={() => onSaveProject(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">Skills ({skills.length})</h3>
          {skills.length === 0 ? (
            renderEmpty('skills')
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([category, items]) => (
                <div key={category}>
                  <p className="text-label-md text-on-surface-variant mb-2">{category}</p>
                  <div className="space-y-2">
                    {items.map((item, idx) => {
                      const key = `skill-${category}-${idx}`
                      return (
                        <ExtractedItemRow
                          key={key}
                          title={`${item.name} — ${item.level}`}
                          onAdd={() => onSaveSkill(item, key)}
                          onRemove={() => onDismiss(key)}
                          isSaved={savedKeys.has(key)}
                          isDismissed={dismissedKeys.has(key)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">Education ({education.length})</h3>
          {education.length === 0 ? (
            renderEmpty('education')
          ) : (
            <div className="space-y-2">
              {education.map((item, idx) => {
                const key = `education-${idx}`
                const dates = [item.startDate, item.endDate].filter(Boolean).join(' – ')
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.degree || item.institution || 'Education'}
                    subtitle={[item.institution, dates].filter(Boolean).join(' · ')}
                    onAdd={() => onSaveEducation(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-headline-sm text-on-surface">Certificates ({certificates.length})</h3>
          {certificates.length === 0 ? (
            renderEmpty('certificates')
          ) : (
            <div className="space-y-2">
              {certificates.map((item, idx) => {
                const key = `certificate-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.name || 'Certificate'}
                    subtitle={[item.issuer, item.date].filter(Boolean).join(' · ')}
                    onAdd={() => onSaveCertificate(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          )}
        </section>

        <div className="flex justify-end pt-2 border-t border-outline-variant">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}
