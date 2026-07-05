import { post, get } from './api'

export interface JDAnalysisOutput {
  company: string
  role: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship'
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'principal'
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  keywords: string[]
  atsKeywords: string[]
  softSkills: string[]
  redFlags: string[]
  matchPercent: number
  salaryRange: string | null
  location: string | null
}

export interface ResumeExperienceItem {
  company: string
  role: string
  startDate: string
  endDate: string
  bullets: string[]
}

export interface ResumeProjectItem {
  title: string
  description: string
  technologies: string[]
  bullets: string[]
}

export interface ResumeSkillCategory {
  category: string
  items: string[]
}

export interface ResumeEducationItem {
  degree: string
  institution: string
  year: string
}

export interface ResumeCertificationItem {
  name: string
  issuer: string
  year: string
}

export interface ResumeSectionsOutput {
  summary: string
  experience: ResumeExperienceItem[]
  projects: ResumeProjectItem[]
  skills: ResumeSkillCategory[]
  education: ResumeEducationItem[]
  certifications: ResumeCertificationItem[]
}

export interface ResumeOutput {
  markdown: string
  sections: ResumeSectionsOutput
}

export interface EmailOutput {
  subject: string
  body: string
  tone: 'professional' | 'enthusiastic' | 'concise'
}

export interface ValidationHintsOutput {
  atsKeywordsToInclude: string[]
  truthFlags: string[]
  humanizationTips: string[]
}

export interface SmartApplicationOutput {
  analysis: JDAnalysisOutput
  resume: ResumeOutput
  email: EmailOutput
  coverLetter: string
  validationHints: ValidationHintsOutput
}

export interface SmartApplicationScores {
  ats: number
  match: number
  overall: number
}

export interface SmartApplicationResult {
  applicationId: string
  output: SmartApplicationOutput
  exportPath: string
  scores: SmartApplicationScores
}

export interface SmartCreateInput {
  jdText: string
  company?: string
  role?: string
  masterCVText?: string
  masterCVFile?: File
  resumeId?: string
}

export interface BulkJDItem {
  company: string
  role: string
  jdText: string
}

export interface BulkCreateInput {
  jds: BulkJDItem[]
  masterCVText?: string
  masterCVFile?: File
  resumeId?: string
}

export interface SmartExportResult {
  files: Array<{ format: string; path: string; filename: string }>
}

export function smartCreate(data: SmartCreateInput): Promise<SmartApplicationResult> {
  const formData = new FormData()
  formData.append('jdText', data.jdText)
  if (data.company) formData.append('company', data.company)
  if (data.role) formData.append('role', data.role)
  if (data.masterCVText) formData.append('masterCVText', data.masterCVText)
  if (data.masterCVFile) formData.append('masterCV', data.masterCVFile)

  return post<SmartApplicationResult>('/applications/smart-create', formData)
}

export function bulkCreate(data: BulkCreateInput): Promise<{ jobId: string; results: Array<SmartApplicationResult | { error: string; company: string; role: string }> }> {
  const formData = new FormData()
  if (data.jds.length > 0) {
    formData.append('jds', JSON.stringify(data.jds))
  }
  if (data.masterCVText) formData.append('masterCVText', data.masterCVText)
  if (data.masterCVFile) formData.append('masterCV', data.masterCVFile)
  if (data.resumeId) formData.append('resumeId', data.resumeId)

  return post('/applications/bulk-create', formData)
}

export function exportAllFormats(applicationId: string, formats?: string[]): Promise<SmartExportResult> {
  return get<SmartExportResult>(`/applications/${applicationId}/export-all`, formats ? { formats: formats.join(',') } : undefined)
}

export const smartApplicationService = {
  smartCreate,
  bulkCreate,
  exportAllFormats,
}
