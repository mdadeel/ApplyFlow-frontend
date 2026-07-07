import { get, post, del } from '../api'
import type { Application } from '../../types'

export type WorkspaceStatus = 'idle' | 'analyzing' | 'tailoring' | 'ready' | 'submitted'

export interface TailoredResume {
  content: string
  lastGenerated: string
  atsScore?: number
}

export interface CoverLetter {
  content: string
  version: number
  lastGenerated: string
}

export interface RecruiterEmail {
  subject: string
  body: string
  version: number
  lastGenerated: string
}

export interface InterviewPrep {
  questions: Array<{ question: string; talkingPoints: string[] }>
  companyResearch: string
  lastGenerated: string
}

export interface AtsAnalysis {
  score: number
  missingKeywords: string[]
  formattingIssues: string[]
  suggestions: string[]
  lastGenerated: string
}

export interface SkillGap {
  missingSkills: string[]
  recommendations: string[]
  lastGenerated: string
}

export interface ApplicationWorkspace {
  _id: string
  userId: string
  opportunityId: string | { _id: string; title: string; company: string }
  status: WorkspaceStatus
  statusMessage?: string
  isPinned: boolean
  tailoredResume?: TailoredResume
  coverLetter?: CoverLetter
  recruiterEmail?: RecruiterEmail
  interviewPrep?: InterviewPrep
  atsAnalysis?: AtsAnalysis
  skillGap?: SkillGap
  createdAt: string
  updatedAt: string
}

export function getWorkspace(id: string): Promise<ApplicationWorkspace> {
  return get<ApplicationWorkspace>(`/workspaces/${id}`)
}

export function listWorkspaces(): Promise<ApplicationWorkspace[]> {
  return get<ApplicationWorkspace[]>('/workspaces')
}

export function createWorkspace(opportunityId: string): Promise<ApplicationWorkspace> {
  return post<ApplicationWorkspace>('/workspaces', { opportunityId })
}

export function generateContent(id: string, type: 'resume' | 'cover-letter' | 'email' | 'interview-prep'): Promise<ApplicationWorkspace> {
  return post<ApplicationWorkspace>(`/workspaces/${id}/generate`, { type })
}

export function analyzeWorkspace(id: string, type: 'ats' | 'skill-gap'): Promise<ApplicationWorkspace> {
  return post<ApplicationWorkspace>(`/workspaces/${id}/analyze`, { type })
}

export function submitWorkspace(id: string): Promise<ApplicationWorkspace> {
  return post<ApplicationWorkspace>(`/workspaces/${id}/submit`)
}

export function deleteWorkspace(id: string): Promise<void> {
  return del<void>(`/workspaces/${id}`)
}

export type ExportFormat = 'pdf' | 'docx' | 'markdown'

export function sendToResumeLibrary(workspaceId: string): Promise<void> {
  return post<void>(`/workspaces/${workspaceId}/send-to-resume-library`)
}

export function sendToExportCenter(workspaceId: string, format: ExportFormat): Promise<void> {
  return post<void>(`/workspaces/${workspaceId}/export`, { format })
}

export function createApplicationFromWorkspace(workspaceId: string): Promise<Application> {
  return post<Application>(`/workspaces/${workspaceId}/create-application`)
}
