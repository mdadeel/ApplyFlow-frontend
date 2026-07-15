import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  Briefcase,
  Code,
  GraduationCap,
  Award as AwardIcon,
  ExternalLink,
  Code2,
  AlertTriangle,
  X,
  FileText,
  Check,
  Upload,
  Star,
  BookOpen,
  Bookmark,
  Globe,
  Target,
} from '../lib/icons'
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
import { useProfileData } from '../hooks/useProfileData'
import { resumeLibraryService } from '../services/resumeLibrary'
import {
  ExperienceForm,
  ProjectForm,
  SkillForm,
  EducationForm,
  CertificateForm,
  AwardForm,
  PublicationForm,
  VolunteeringForm,
  LanguageForm,
  InterestForm,
  PersonalForm,
} from '../components/forms'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  useCreateExperience,
  useUpdateExperience,
  useDeleteExperience,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
  useCreateCertificate,
  useUpdateCertificate,
  useDeleteCertificate,
  useCreateAward,
  useUpdateAward,
  useDeleteAward,
  useCreatePublication,
  useUpdatePublication,
  useDeletePublication,
  useCreateVolunteering,
  useUpdateVolunteering,
  useDeleteVolunteering,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
  useCreateInterest,
  useUpdateInterest,
  useDeleteInterest,
} from '../hooks/useProfileMutations'
import type {
  Experience,
  Project,
  Skill,
  Education,
  Certificate,
  Award,
  Publication,
  Volunteering,
  Language,
  Interest,
  ExtractedProfile,
  ExtractedExperience,
  ExtractedProject,
  ExtractedSkill,
  ExtractedEducation,
  ExtractedCertificate,
  UploadedResume,
} from '../types'

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
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
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
        <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
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
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
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
          <AwardIcon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.name}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.issuer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
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
      <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100 ml-1">
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

function AwardCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Award
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-md group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Star className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.issuer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-error" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {item.description && <p className="text-body-sm text-on-surface mt-2">{item.description}</p>}
          <div className="flex items-center justify-between gap-4 mt-2">
            {item.date && <p className="text-label-sm text-on-surface-variant">{formatDate(item.date)}</p>}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-label-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> View
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function PublicationCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Publication
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-md group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.title}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.publisher}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-error" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {item.authors && item.authors.length > 0 && (
            <p className="text-label-sm text-on-surface-variant mt-1">By: {item.authors.join(', ')}</p>
          )}
          {item.description && <p className="text-body-sm text-on-surface mt-2">{item.description}</p>}
          <div className="flex items-center justify-between gap-4 mt-2">
            {item.date && <p className="text-label-sm text-on-surface-variant">{formatDate(item.date)}</p>}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-label-sm text-primary hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> View
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function VolunteeringCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Volunteering
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <Card className="p-md group hover:border-primary/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          <Bookmark className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <h3 className="text-headline-sm text-on-surface">{item.role}</h3>
              <p className="text-body-md text-on-surface-variant font-medium">{item.organization}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant" aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-error" aria-label="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="text-caption text-on-surface-variant mt-1">
            {formatDate(item.startDate || '')} – {item.current ? 'Present' : formatDate(item.endDate || '')}
          </p>
          {item.description && <p className="text-body-sm text-on-surface mt-2">{item.description}</p>}
          {item.technologies && item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.technologies.map((t) => <Chip key={t} label={t} />)}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

function LanguageCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Language
  onEdit?: () => void
  onDelete?: () => void
}) {
  const proficiencyColor: Record<string, 'default' | 'warning' | 'success'> = {
    Native: 'success',
    Fluent: 'success',
    Advanced: 'warning',
    Intermediate: 'default',
    Basic: 'default',
  }

  return (
    <div className="group relative inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant hover:border-primary/40 hover:bg-surface-container transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-body-sm font-medium text-on-surface truncate">{item.name}</span>
        <Badge variant={proficiencyColor[item.proficiency] || 'default'}>
          {item.proficiency}
        </Badge>
      </div>
      <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100 ml-1">
        <button onClick={onEdit} className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant" aria-label="Edit">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-100 transition-colors text-error" aria-label="Delete">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

function InterestCard({
  item,
  onEdit,
  onDelete,
}: {
  item: Interest
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group relative inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-full bg-surface-container-low border border-outline-variant hover:border-primary/40 hover:bg-surface-container transition-all">
      <div className="flex items-center gap-2 min-w-0">
        <Target className="h-3.5 w-3.5 text-on-surface-variant" />
        <span className="text-body-sm font-medium text-on-surface truncate">{item.name}</span>
        {item.category && (
          <Badge variant="default">{item.category}</Badge>
        )}
      </div>
      <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity focus-within:opacity-100 ml-1">
        <button onClick={onEdit} className="p-1 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant" aria-label="Edit">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-100 transition-colors text-error" aria-label="Delete">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export function CareerProfileTab() {
  const { showToast } = useToast()
  const [searchValue, setSearchValue] = useState('')

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [awards, setAwards] = useState<Award[]>([])
  const [publications, setPublications] = useState<Publication[]>([])
  const [volunteering, setVolunteering] = useState<Volunteering[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [interests, setInterests] = useState<Interest[]>([])
  const [personal, setPersonal] = useState<PersonalData | null>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Mutations
  const createExperience = useCreateExperience()
  const updateExperience = useUpdateExperience()
  const deleteExperience = useDeleteExperience()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const createSkill = useCreateSkill()
  const updateSkill = useUpdateSkill()
  const deleteSkill = useDeleteSkill()
  const createEducation = useCreateEducation()
  const updateEducation = useUpdateEducation()
  const deleteEducation = useDeleteEducation()
  const createCertificate = useCreateCertificate()
  const updateCertificate = useUpdateCertificate()
  const deleteCertificate = useDeleteCertificate()
  const createAward = useCreateAward()
  const updateAward = useUpdateAward()
  const deleteAward = useDeleteAward()
  const createPublication = useCreatePublication()
  const updatePublication = useUpdatePublication()
  const deletePublication = useDeletePublication()
  const createVolunteering = useCreateVolunteering()
  const updateVolunteering = useUpdateVolunteering()
  const deleteVolunteering = useDeleteVolunteering()
  const createLanguage = useCreateLanguage()
  const updateLanguage = useUpdateLanguage()
  const deleteLanguage = useDeleteLanguage()
  const createInterest = useCreateInterest()
  const updateInterest = useUpdateInterest()
  const deleteInterest = useDeleteInterest()
  const [dismissedError, setDismissedError] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null)
  const [manualMode, setManualMode] = useState(false)
  const [personalEditOpen, setPersonalEditOpen] = useState(false)

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

  // React Query: profile data
  const profileQuery = useProfileData()

  // React Query: uploaded resumes for sidebar CV list
  const resumesQuery = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const { resumes } = await resumeLibraryService.getResumes()
      return resumes
    },
    staleTime: 60 * 1000,
  })

  // State for selected resume detail panel
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null)
  const [selectedCvContent, setSelectedCvContent] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Fetch resume detail when a CV is selected
  useEffect(() => {
    if (!selectedCvId) {
      setSelectedCvContent(null)
      return
    }
    let cancelled = false
    async function loadDetail() {
      setDetailLoading(true)
      try {
        const { resume } = await resumeLibraryService.getResume(selectedCvId)
        if (cancelled) return
        setSelectedCvContent(resume)
      } catch {
        if (!cancelled) showToast('Failed to load resume details', 'error')
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    }
    loadDetail()
    return () => { cancelled = true }
  }, [selectedCvId])

  useEffect(() => {
    if (!profileQuery.data) return
    setExperiences(profileQuery.data.experiences)
    setProjects(profileQuery.data.projects)
    setSkills(profileQuery.data.skills)
    setEducation(profileQuery.data.education)
    setCertificates(profileQuery.data.certificates)
    setAwards(profileQuery.data.awards)
    setPublications(profileQuery.data.publications)
    setVolunteering(profileQuery.data.volunteering)
    setLanguages(profileQuery.data.languages)
    setInterests(profileQuery.data.interests)
    if (profileQuery.data.personal && (profileQuery.data.personal.name || profileQuery.data.personal.title || profileQuery.data.personal.summary)) {
      setPersonal(profileQuery.data.personal)
    }
  }, [profileQuery.data])

  const loading = profileQuery.isLoading && !profileQuery.data
  const errorMessage = profileQuery.isError && profileQuery.error instanceof Error ? profileQuery.error.message : null
  const showError = !dismissedError && errorMessage != null
  const displayError = errorMessage === 'Unauthorized' ? 'Your session has expired. Please sign in again.' : 'Failed to load profile data from the server.'
  const handleRetry = () => {
    setDismissedError(false)
    profileQuery.refetch()
  }

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
      queryClient.invalidateQueries({ queryKey: ['resumes'] })
      const total =
        (extracted?.experiences?.length || 0) +
        (extracted?.projects?.length || 0) +
        (extracted?.skills?.length || 0) +
        (extracted?.education?.length || 0) +
        (extracted?.certificates?.length || 0) +
        (extracted?.awards?.length || 0) +
        (extracted?.publications?.length || 0) +
        (extracted?.volunteering?.length || 0) +
        (extracted?.languages?.length || 0) +
        (extracted?.interests?.length || 0)
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
    try {
      const created = await createExperience.mutateAsync(payload)
      setExperiences((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Experience added', 'success')
    } catch {
      showToast('Failed to add experience', 'error')
    }
  }

  const handleSaveProject = async (item: ExtractedProject, key: string) => {
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
    try {
      const created = await createProject.mutateAsync(payload)
      setProjects((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Project added', 'success')
    } catch {
      showToast('Failed to add project', 'error')
    }
  }

  const handleSaveSkill = async (item: ExtractedSkill, key: string) => {
    const payload: Omit<Skill, '_id'> = {
      name: item.name,
      category: item.category as Skill['category'],
      level: item.level,
    }
    try {
      const created = await createSkill.mutateAsync(payload)
      setSkills((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Skill added', 'success')
    } catch {
      showToast('Failed to add skill', 'error')
    }
  }

  const handleSaveEducation = async (item: ExtractedEducation, key: string) => {
    const payload: Omit<Education, '_id'> = {
      degree: item.degree || '',
      institution: item.institution || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      result: item.result || undefined,
    }
    try {
      const created = await createEducation.mutateAsync(payload)
      setEducation((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Education added', 'success')
    } catch {
      showToast('Failed to add education', 'error')
    }
  }

  const handleSaveCertificate = async (item: ExtractedCertificate, key: string) => {
    const payload: Omit<Certificate, '_id'> = {
      name: item.name || '',
      issuer: item.issuer || '',
      date: item.date || '',
      url: item.url || undefined,
    }
    try {
      const created = await createCertificate.mutateAsync(payload)
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

  const handleSaveAward = async (item: Omit<ExtractedAward, '_id'>, key: string) => {
    const payload: Omit<Award, '_id'> = {
      title: item.title || '',
      issuer: item.issuer || '',
      date: item.date || undefined,
      description: item.description || undefined,
      url: item.url || undefined,
    }
    try {
      const created = await createAward.mutateAsync(payload)
      setAwards((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Award added', 'success')
    } catch {
      showToast('Failed to add award', 'error')
    }
  }

  const handleSavePublication = async (item: { title: string; publisher: string; date?: string; url?: string; description?: string; authors?: string[] }, key: string) => {
    const payload: Omit<Publication, '_id'> = {
      title: item.title || '',
      publisher: item.publisher || '',
      date: item.date || undefined,
      url: item.url || undefined,
      description: item.description || undefined,
      authors: item.authors || [],
    }
    try {
      const created = await createPublication.mutateAsync(payload)
      setPublications((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Publication added', 'success')
    } catch {
      showToast('Failed to add publication', 'error')
    }
  }

  const handleSaveVolunteering = async (item: { organization: string; role: string; startDate?: string; endDate?: string; current: boolean; description?: string; technologies?: string[] }, key: string) => {
    const payload: Omit<Volunteering, '_id'> = {
      organization: item.organization || '',
      role: item.role || '',
      startDate: item.startDate || undefined,
      endDate: item.endDate || undefined,
      current: Boolean(item.current),
      description: item.description || undefined,
      technologies: item.technologies || [],
    }
    try {
      const created = await createVolunteering.mutateAsync(payload)
      setVolunteering((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Volunteering added', 'success')
    } catch {
      showToast('Failed to add volunteering', 'error')
    }
  }

  const handleSaveLanguage = async (item: { name: string; proficiency: string }, key: string) => {
    const payload: Omit<Language, '_id'> = {
      name: item.name || '',
      proficiency: (item.proficiency as Language['proficiency']) || 'Intermediate',
    }
    try {
      const created = await createLanguage.mutateAsync(payload)
      setLanguages((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Language added', 'success')
    } catch {
      showToast('Failed to add language', 'error')
    }
  }

  const handleSaveInterest = async (item: { name: string; category?: string }, key: string) => {
    const payload: Omit<Interest, '_id'> = {
      name: item.name || '',
      category: item.category || undefined,
    }
    try {
      const created = await createInterest.mutateAsync(payload)
      setInterests((prev) => [created, ...prev])
      setSavedKeys((prev) => new Set(prev).add(key))
      showToast('Interest added', 'success')
    } catch {
      showToast('Failed to add interest', 'error')
    }
  }

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

  const handleDelete = () => {
    if (!deleteTarget) return
    const { type, id } = deleteTarget
    setDeleteTarget(null)

    // Optimistic delete: save previous state and update immediately
    const rollback: Record<string, () => void> = {}
    switch (type) {
      case 'experience': {
        const prev = experiences
        setExperiences((p) => p.filter((e) => e._id !== id))
        rollback.experience = () => setExperiences(prev)
        deleteExperience.mutate(id, {
          onError: () => { rollback.experience?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'project': {
        const prev = projects
        setProjects((p) => p.filter((e) => e._id !== id))
        rollback.project = () => setProjects(prev)
        deleteProject.mutate(id, {
          onError: () => { rollback.project?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'skill': {
        const prev = skills
        setSkills((p) => p.filter((e) => e._id !== id))
        rollback.skill = () => setSkills(prev)
        deleteSkill.mutate(id, {
          onError: () => { rollback.skill?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'education': {
        const prev = education
        setEducation((p) => p.filter((e) => e._id !== id))
        rollback.education = () => setEducation(prev)
        deleteEducation.mutate(id, {
          onError: () => { rollback.education?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'certificate': {
        const prev = certificates
        setCertificates((p) => p.filter((e) => e._id !== id))
        rollback.certificate = () => setCertificates(prev)
        deleteCertificate.mutate(id, {
          onError: () => { rollback.certificate?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'award': {
        const prev = awards
        setAwards((p) => p.filter((e) => e._id !== id))
        rollback.award = () => setAwards(prev)
        deleteAward.mutate(id, {
          onError: () => { rollback.award?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'publication': {
        const prev = publications
        setPublications((p) => p.filter((e) => e._id !== id))
        rollback.publication = () => setPublications(prev)
        deletePublication.mutate(id, {
          onError: () => { rollback.publication?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'volunteering': {
        const prev = volunteering
        setVolunteering((p) => p.filter((e) => e._id !== id))
        rollback.volunteering = () => setVolunteering(prev)
        deleteVolunteering.mutate(id, {
          onError: () => { rollback.volunteering?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'language': {
        const prev = languages
        setLanguages((p) => p.filter((e) => e._id !== id))
        rollback.language = () => setLanguages(prev)
        deleteLanguage.mutate(id, {
          onError: () => { rollback.language?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
      case 'interest': {
        const prev = interests
        setInterests((p) => p.filter((e) => e._id !== id))
        rollback.interest = () => setInterests(prev)
        deleteInterest.mutate(id, {
          onError: () => { rollback.interest?.(); showToast('Failed to delete', 'error') },
          onSuccess: () => showToast('Deleted successfully', 'success'),
        })
        break
      }
    }
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
      case 'award':
        return awards.find((a) => a._id === editingId)
      case 'publication':
        return publications.find((p) => p._id === editingId)
      case 'volunteering':
        return volunteering.find((v) => v._id === editingId)
      case 'language':
        return languages.find((l) => l._id === editingId)
      case 'interest':
        return interests.find((i) => i._id === editingId)
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
  const filteredAwards = awards.filter(
    (a) => matchesQuery(a.title) || matchesQuery(a.issuer)
  )
  const filteredPublications = publications.filter(
    (p) => matchesQuery(p.title) || matchesQuery(p.publisher)
  )
  const filteredVolunteering = volunteering.filter(
    (v) => matchesQuery(v.organization) || matchesQuery(v.role)
  )
  const filteredLanguages = languages.filter((l) => matchesQuery(l.name))
  const filteredInterests = interests.filter((i) => matchesQuery(i.name))

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const hasProfile =
    experiences.length > 0 ||
    projects.length > 0 ||
    skills.length > 0 ||
    education.length > 0 ||
    certificates.length > 0 ||
    awards.length > 0 ||
    publications.length > 0 ||
    volunteering.length > 0 ||
    languages.length > 0 ||
    interests.length > 0 ||
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
        <div className="flex items-center justify-between">
          <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Profile
          </h3>
          <button
            onClick={() => setPersonalEditOpen(true)}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
            aria-label="Edit profile"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1">
          {personal.name && (
            <p className="text-body-md font-semibold text-on-surface">{personal.name}</p>
          )}
          {personal.email && (
            <p className="text-caption text-on-surface-variant">{personal.email}</p>
          )}
          {personal.title && (
            <p className="text-body-md text-on-surface-variant">{personal.title}</p>
          )}
          {personal.location && (
            <p className="text-caption text-on-surface-variant flex items-center gap-1 mt-1">{personal.location}</p>
          )}
          {personal.summary && (
            <p className="text-body-sm text-on-surface mt-2 leading-relaxed">{personal.summary}</p>
          )}
          {(personal.github || personal.linkedIn || personal.portfolio) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {personal.github && (
                <a href={personal.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">GitHub</a>
              )}
              {personal.linkedIn && (
                <a href={personal.linkedIn} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">LinkedIn</a>
              )}
              {personal.portfolio && (
                <a href={personal.portfolio} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-primary hover:underline bg-primary/5 px-2 py-1 rounded-md">Portfolio</a>
              )}
            </div>
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
              <AwardIcon className="h-5 w-5 text-primary" /> Certificates
            </h3>
            <div className="space-y-4">
              {filteredCertificates.map((item) => (
                <CertificateCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredAwards.length > 0 && (
          <section data-testid="overview-section-awards" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Awards
            </h3>
            <div className="space-y-4">
              {filteredAwards.map((item) => (
                <AwardCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredPublications.length > 0 && (
          <section data-testid="overview-section-publications" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Publications
            </h3>
            <div className="space-y-4">
              {filteredPublications.map((item) => (
                <PublicationCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredVolunteering.length > 0 && (
          <section data-testid="overview-section-volunteering" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" /> Volunteering
            </h3>
            <div className="space-y-4">
              {filteredVolunteering.map((item) => (
                <VolunteeringCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredLanguages.length > 0 && (
          <section data-testid="overview-section-languages" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredLanguages.map((item) => (
                <LanguageCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        )}
        {filteredInterests.length > 0 && (
          <section data-testid="overview-section-interests" className="space-y-4">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {filteredInterests.map((item) => (
                <InterestCard key={item._id} item={item} />
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
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><AwardIcon className="h-5 w-5 text-primary" /> Certificates</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('certificate')}>Add</Button>
          </div>
          {filteredCertificates.length === 0 ? (
            <EmptyState
              icon={<AwardIcon className="h-8 w-8" />}
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

        {/* Awards Section */}
        <section id="awards" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Awards</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('award')}>Add</Button>
          </div>
          {filteredAwards.length === 0 ? (
            <EmptyState
              icon={<Star className="h-8 w-8" />}
              title={searchValue ? 'No matching awards' : 'No awards yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your awards and recognitions.'}
              action={searchValue ? undefined : { label: 'Add Award', onClick: () => openAddModal('award') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredAwards.map((item) => (
                <AwardCard key={item._id} item={item} onEdit={() => openEditModal('award', item._id)} onDelete={() => setDeleteTarget({ type: 'award', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Publications Section */}
        <section id="publications" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Publications</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('publication')}>Add</Button>
          </div>
          {filteredPublications.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="h-8 w-8" />}
              title={searchValue ? 'No matching publications' : 'No publications yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your published works.'}
              action={searchValue ? undefined : { label: 'Add Publication', onClick: () => openAddModal('publication') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredPublications.map((item) => (
                <PublicationCard key={item._id} item={item} onEdit={() => openEditModal('publication', item._id)} onDelete={() => setDeleteTarget({ type: 'publication', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Volunteering Section */}
        <section id="volunteering" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary" /> Volunteering</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('volunteering')}>Add</Button>
          </div>
          {filteredVolunteering.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="h-8 w-8" />}
              title={searchValue ? 'No matching volunteering' : 'No volunteering yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your volunteer experience.'}
              action={searchValue ? undefined : { label: 'Add Volunteering', onClick: () => openAddModal('volunteering') }}
            />
          ) : (
            <div className="space-y-4">
              {filteredVolunteering.map((item) => (
                <VolunteeringCard key={item._id} item={item} onEdit={() => openEditModal('volunteering', item._id)} onDelete={() => setDeleteTarget({ type: 'volunteering', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Languages Section */}
        <section id="languages" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Languages</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('language')}>Add</Button>
          </div>
          {filteredLanguages.length === 0 ? (
            <EmptyState
              icon={<Globe className="h-8 w-8" />}
              title={searchValue ? 'No matching languages' : 'No languages yet'}
              description={searchValue ? 'Try a different search term.' : 'Add the languages you speak.'}
              action={searchValue ? undefined : { label: 'Add Language', onClick: () => openAddModal('language') }}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredLanguages.map((item) => (
                <LanguageCard key={item._id} item={item} onEdit={() => openEditModal('language', item._id)} onDelete={() => setDeleteTarget({ type: 'language', id: item._id })} />
              ))}
            </div>
          )}
        </section>

        {/* Interests Section */}
        <section id="interests" className="scroll-mt-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-sm text-on-surface flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Interests</h3>
            <Button variant="secondary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => openAddModal('interest')}>Add</Button>
          </div>
          {filteredInterests.length === 0 ? (
            <EmptyState
              icon={<Target className="h-8 w-8" />}
              title={searchValue ? 'No matching interests' : 'No interests yet'}
              description={searchValue ? 'Try a different search term.' : 'Add your professional interests.'}
              action={searchValue ? undefined : { label: 'Add Interest', onClick: () => openAddModal('interest') }}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredInterests.map((item) => (
                <InterestCard key={item._id} item={item} onEdit={() => openEditModal('interest', item._id)} onDelete={() => setDeleteTarget({ type: 'interest', id: item._id })} />
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
    awards.length > 0,
    publications.length > 0,
    volunteering.length > 0,
    languages.length > 0,
    interests.length > 0,
  ].filter(Boolean).length * 10

  return (
    <div className="space-y-lg animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row gap-xl items-start relative max-w-7xl mx-auto">
        {/* Main Content Area */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-lg gap-3 flex-wrap">
          </div>

          {showError && (
            <div className="rounded-lg border border-danger/20 bg-red-50 p-4 text-body-sm text-danger flex items-start gap-3 mb-lg">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Failed to Load Profile</p>
                <p className="mt-0.5 opacity-80">{displayError}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleRetry}
                  className="px-3 py-1.5 rounded-lg bg-danger text-white text-meta font-medium hover:opacity-90 transition-colors"
                >
                  Retry
                </button>
                <button onClick={() => setDismissedError(true)} className="p-1.5 rounded hover:bg-danger/10 transition-colors" aria-label="Dismiss">
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
                { id: 'awards', label: 'Awards', done: awards.length > 0 },
                { id: 'publications', label: 'Publications', done: publications.length > 0 },
                { id: 'volunteering', label: 'Volunteering', done: volunteering.length > 0 },
                { id: 'languages', label: 'Languages', done: languages.length > 0 },
                { id: 'interests', label: 'Interests', done: interests.length > 0 },
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

          {/* Uploaded CVs */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-heading-3 text-text-primary">Uploaded CVs</h3>
              <button
                onClick={() => navigate('/resume-library')}
                className="text-caption text-primary hover:underline font-semibold"
              >
                Manage
              </button>
            </div>
            {resumesQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
              </div>
            ) : resumesQuery.data && resumesQuery.data.length > 0 ? (
              <>
                <div className={`space-y-1 ${selectedCvContent ? 'max-h-32' : 'max-h-48'} overflow-y-auto`}>
                  {resumesQuery.data.slice(0, 5).map((resume) => (
                    <button
                      key={resume._id}
                      type="button"
                      onClick={() => {
                        setSelectedCvId(resume._id)
                        setSelectedCvContent(null)
                      }}
                      className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-colors text-left ${selectedCvId === resume._id ? 'bg-primary-container text-on-primary-container' : 'hover:bg-neutral-50'}`}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-medium text-text-primary truncate">{resume.fileName}</p>
                        <p className="text-meta text-text-tertiary">{new Date(resume.createdAt).toLocaleDateString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedCvContent && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-label-md text-text-primary">Extracted from {selectedCvContent.fileName}</h4>
                      <button
                        onClick={() => {
                          setSelectedCvId(null)
                          setSelectedCvContent(null)
                        }}
                        className="text-caption text-text-tertiary hover:text-primary"
                      >
                        Dismiss
                      </button>
                    </div>
                    <div className="space-y-3">
                      {detailLoading ? (
                        <Skeleton variant="rectangular" height={80} className="rounded-lg" />
                      ) : (
                        <>
                          <ResumeSectionPreview label="Experience" data={selectedCvContent.experiences} onClick={() => navigate('/resume-library')} />
                          <ResumeSectionPreview label="Projects" data={selectedCvContent.projects} onClick={() => navigate('/resume-library')} />
                          <ResumeSectionPreview label="Skills" data={selectedCvContent.skills} onClick={() => navigate('/resume-library')} />
                          <ResumeSectionPreview label="Education" data={selectedCvContent.education} onClick={() => navigate('/resume-library')} />
                          <ResumeSectionPreview label="Certificates" data={selectedCvContent.certificates} onClick={() => navigate('/resume-library')} />
                          <div className="mt-2 pt-2 text-center">
                            <button
                              onClick={() => navigate('/resume-library')}
                              className="text-caption text-primary hover:underline font-semibold"
                            >
                              View full breakdown on Resume Library →
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                            </>
            ) : (
              <p className="text-caption text-text-tertiary italic">No CVs uploaded yet.</p>
            )}
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
              <button onClick={() => scrollTo('awards')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Awards</button>
              <button onClick={() => scrollTo('publications')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Publications</button>
              <button onClick={() => scrollTo('volunteering')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Volunteering</button>
              <button onClick={() => scrollTo('languages')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Languages</button>
              <button onClick={() => scrollTo('interests')} className="text-body-sm text-text-primary hover:text-primary transition-colors py-1">Interests</button>
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
            onSubmit={(data) => {
              if (editingId) {
                updateExperience.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setExperiences((prev) => prev.map((e) => (e._id === editingId ? updated : e)))
                    showToast('Experience updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save experience', 'error'); setSubmitting(false) },
                })
              } else {
                createExperience.mutate(data as Omit<Experience, '_id'>, {
                  onSuccess: (created) => {
                    setExperiences((prev) => [created, ...prev])
                    showToast('Experience added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save experience', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'project' && (
          <ProjectForm
            item={getItemForEdit() as Project | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateProject.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setProjects((prev) => prev.map((p) => (p._id === editingId ? updated : p)))
                    showToast('Project updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save project', 'error'); setSubmitting(false) },
                })
              } else {
                createProject.mutate(data as Omit<Project, '_id'>, {
                  onSuccess: (created) => {
                    setProjects((prev) => [created, ...prev])
                    showToast('Project added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save project', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'skill' && (
          <SkillForm
            item={getItemForEdit() as Skill | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateSkill.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setSkills((prev) => prev.map((s) => (s._id === editingId ? updated : s)))
                    showToast('Skill updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save skill', 'error'); setSubmitting(false) },
                })
              } else {
                createSkill.mutate(data as Omit<Skill, '_id'>, {
                  onSuccess: (created) => {
                    setSkills((prev) => [created, ...prev])
                    showToast('Skill added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save skill', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'education' && (
          <EducationForm
            item={getItemForEdit() as Education | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateEducation.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setEducation((prev) => prev.map((e) => (e._id === editingId ? updated : e)))
                    showToast('Education updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save education', 'error'); setSubmitting(false) },
                })
              } else {
                createEducation.mutate(data as Omit<Education, '_id'>, {
                  onSuccess: (created) => {
                    setEducation((prev) => [created, ...prev])
                    showToast('Education added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save education', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'certificate' && (
          <CertificateForm
            item={getItemForEdit() as Certificate | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateCertificate.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setCertificates((prev) => prev.map((c) => (c._id === editingId ? updated : c)))
                    showToast('Certificate updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save certificate', 'error'); setSubmitting(false) },
                })
              } else {
                createCertificate.mutate(data as Omit<Certificate, '_id'>, {
                  onSuccess: (created) => {
                    setCertificates((prev) => [created, ...prev])
                    showToast('Certificate added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save certificate', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'award' && (
          <AwardForm
            item={getItemForEdit() as Award | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateAward.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setAwards((prev) => prev.map((a) => (a._id === editingId ? updated : a)))
                    showToast('Award updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save award', 'error'); setSubmitting(false) },
                })
              } else {
                createAward.mutate(data as Omit<Award, '_id'>, {
                  onSuccess: (created) => {
                    setAwards((prev) => [created, ...prev])
                    showToast('Award added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save award', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'publication' && (
          <PublicationForm
            item={getItemForEdit() as Publication | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updatePublication.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setPublications((prev) => prev.map((p) => (p._id === editingId ? updated : p)))
                    showToast('Publication updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save publication', 'error'); setSubmitting(false) },
                })
              } else {
                createPublication.mutate(data as Omit<Publication, '_id'>, {
                  onSuccess: (created) => {
                    setPublications((prev) => [created, ...prev])
                    showToast('Publication added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save publication', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'volunteering' && (
          <VolunteeringForm
            item={getItemForEdit() as Volunteering | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateVolunteering.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setVolunteering((prev) => prev.map((v) => (v._id === editingId ? updated : v)))
                    showToast('Volunteering updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save volunteering', 'error'); setSubmitting(false) },
                })
              } else {
                createVolunteering.mutate(data as Omit<Volunteering, '_id'>, {
                  onSuccess: (created) => {
                    setVolunteering((prev) => [created, ...prev])
                    showToast('Volunteering added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save volunteering', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'language' && (
          <LanguageForm
            item={getItemForEdit() as Language | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateLanguage.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setLanguages((prev) => prev.map((l) => (l._id === editingId ? updated : l)))
                    showToast('Language updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save language', 'error'); setSubmitting(false) },
                })
              } else {
                createLanguage.mutate(data as Omit<Language, '_id'>, {
                  onSuccess: (created) => {
                    setLanguages((prev) => [created, ...prev])
                    showToast('Language added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save language', 'error'); setSubmitting(false) },
                })
              }
            }}
            onCancel={() => setModalOpen(false)}
          />
        )}
        {modalType === 'interest' && (
          <InterestForm
            item={getItemForEdit() as Interest | undefined}
            submitting={submitting}
            onSubmit={(data) => {
              if (editingId) {
                updateInterest.mutate({ id: editingId, data }, {
                  onSuccess: (updated) => {
                    setInterests((prev) => prev.map((i) => (i._id === editingId ? updated : i)))
                    showToast('Interest updated', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save interest', 'error'); setSubmitting(false) },
                })
              } else {
                createInterest.mutate(data as Omit<Interest, '_id'>, {
                  onSuccess: (created) => {
                    setInterests((prev) => [created, ...prev])
                    showToast('Interest added', 'success')
                    setModalOpen(false)
                    setSubmitting(false)
                  },
                  onError: () => { showToast('Failed to save interest', 'error'); setSubmitting(false) },
                })
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

      {/* Personal Info Edit Modal */}
      <Modal
        open={personalEditOpen}
        onClose={() => setPersonalEditOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <PersonalForm
          item={personal}
          submitting={submitting}
          onSubmit={async (data) => {
            setSubmitting(true)
            try {
              const updated = await profileService.updatePersonal(data)
              setPersonal(updated)
              setPersonalEditOpen(false)
              showToast('Profile updated', 'success')
            } catch {
              showToast('Failed to update profile', 'error')
            } finally {
              setSubmitting(false)
            }
          }}
          onCancel={() => setPersonalEditOpen(false)}
        />
      </Modal>

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
        onSaveAward={handleSaveAward}
        onSavePublication={handleSavePublication}
        onSaveVolunteering={handleSaveVolunteering}
        onSaveLanguage={handleSaveLanguage}
        onSaveInterest={handleSaveInterest}
      />
    </div>
  )
}

function ResumeSectionPreview({ label, data, onClick }: { label: string; data: any[]; onClick: () => void }) {
  if (!data || data.length === 0) return null
  return (
    <button onClick={onClick} className="w-full text-left p-2 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-label-sm text-text-primary">{label}</span>
        <span className="text-caption text-text-tertiary">{data.length} items</span>
      </div>
      <p className="text-caption text-text-tertiary mt-0.5 truncate">{data[0]?.name || data[0]?.title || data[0]?.company || 'Click to view'}</p>
    </button>
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
  onSaveAward,
  onSavePublication,
  onSaveVolunteering,
  onSaveLanguage,
  onSaveInterest,
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
  onSaveAward: (item: { title: string; issuer: string; date?: string; description?: string; url?: string }, key: string) => void
  onSavePublication: (item: { title: string; publisher: string; date?: string; url?: string; description?: string; authors?: string[] }, key: string) => void
  onSaveVolunteering: (item: { organization: string; role: string; startDate?: string; endDate?: string; current: boolean; description?: string; technologies?: string[] }, key: string) => void
  onSaveLanguage: (item: { name: string; proficiency: string }, key: string) => void
  onSaveInterest: (item: { name: string; category?: string }, key: string) => void,
}) {
  if (!data) return null

  const experiences = data.experiences || []
  const projects = data.projects || []
  const skills = data.skills || []
  const education = data.education || []
  const certificates = data.certificates || []
  const awards = data.awards || []
  const publications = data.publications || []
  const volunteering = data.volunteering || []
  const languages = data.languages || []
  const interests = data.interests || []

  const total =
    experiences.length + projects.length + skills.length + education.length + certificates.length +
    awards.length + publications.length + volunteering.length + languages.length + interests.length

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
                ? `Found ${total} item${total === 1 ? '' : 's'} across ${[experiences.length > 0, projects.length > 0, skills.length > 0, education.length > 0, certificates.length > 0, awards.length > 0, publications.length > 0, volunteering.length > 0, languages.length > 0, interests.length > 0].filter(Boolean).length} categor${[experiences.length > 0, projects.length > 0, skills.length > 0, education.length > 0, certificates.length > 0, awards.length > 0, publications.length > 0, volunteering.length > 0, languages.length > 0, interests.length > 0].filter(Boolean).length === 1 ? 'y' : 'ies'}. Add the ones you want to your profile.`
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

        {experiences.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Experiences ({experiences.length})</h3>
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
          </section>
        )}

        {projects.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Projects ({projects.length})</h3>
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
          </section>
        )}

        {skills.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Skills ({skills.length})</h3>
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
          </section>
        )}

        {education.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Education ({education.length})</h3>
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
          </section>
        )}

        {certificates.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Certificates ({certificates.length})</h3>
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
          </section>
        )}

        {awards.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Awards ({awards.length})</h3>
            <div className="space-y-2">
              {awards.map((item, idx) => {
                const key = `award-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.title || 'Award'}
                    subtitle={[item.issuer, item.date].filter(Boolean).join(' · ')}
                    onAdd={() => onSaveAward(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {publications.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Publications ({publications.length})</h3>
            <div className="space-y-2">
              {publications.map((item, idx) => {
                const key = `publication-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.title || 'Publication'}
                    subtitle={[item.publisher, item.date].filter(Boolean).join(' · ')}
                    onAdd={() => onSavePublication(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {volunteering.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Volunteering ({volunteering.length})</h3>
            <div className="space-y-2">
              {volunteering.map((item, idx) => {
                const key = `volunteering-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.role || 'Volunteering'}
                    subtitle={[item.organization, item.startDate].filter(Boolean).join(' · ')}
                    onAdd={() => onSaveVolunteering(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Languages ({languages.length})</h3>
            <div className="space-y-2">
              {languages.map((item, idx) => {
                const key = `language-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.name || 'Language'}
                    subtitle={item.proficiency || ''}
                    onAdd={() => onSaveLanguage(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          </section>
        )}

        {interests.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-headline-sm text-on-surface">Interests ({interests.length})</h3>
            <div className="space-y-2">
              {interests.map((item, idx) => {
                const key = `interest-${idx}`
                return (
                  <ExtractedItemRow
                    key={key}
                    title={item.name || 'Interest'}
                    subtitle={item.category || ''}
                    onAdd={() => onSaveInterest(item, key)}
                    onRemove={() => onDismiss(key)}
                    isSaved={savedKeys.has(key)}
                    isDismissed={dismissedKeys.has(key)}
                  />
                )
              })}
            </div>
          </section>
        )}

        <div className="flex justify-end pt-2 border-t border-outline-variant">
          <Button variant="secondary" onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}
