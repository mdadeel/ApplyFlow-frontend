export type ApplicationStatus =
  | 'draft' | 'analyzing' | 'planning' | 'generating'
  | 'reviewing' | 'ready' | 'exported' | 'applied'
  | 'interview' | 'assessment' | 'offer' | 'rejected' | 'ghosted'

export interface User {
  _id: string
  email: string
  name: string
  avatarUrl?: string
  authProvider: string
  onboardingComplete: boolean
  preferences: UserPreferences
  connectedProviders?: string[]
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  aiProvider: string
  model: string
  temperature: number
  writingTone: string
  defaultTemplate: string
  defaultExportFormat: string
  notifications: {
    applicationUpdates: boolean
    interviewReminders: boolean
    newFeatures: boolean
    weeklyDigest: boolean
    marketingEmails: boolean
  }
  apiKeys?: Record<string, string>
  twoFactorEnabled?: boolean
}

export interface Experience {
  _id: string
  company: string
  role: string
  startDate: string
  endDate?: string
  current: boolean
  responsibilities: string[]
  technologies: string[]
  achievements: string[]
  metrics: string[]
  projects?: string[]
  links?: Array<{ displayText: string, url: string, platform: string }>
}

export interface Project {
  _id: string
  title: string
  description: string
  technologies: string[]
  features: string[]
  outcome?: string
  github?: string
  demo?: string
  links?: Array<{ displayText: string, url: string, platform: string }>
}

export interface Skill {
  _id: string
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud' | 'Testing' | 'DevOps' | 'Languages' | 'Soft Skills'
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
}

export interface Education {
  _id: string
  degree: string
  institution: string
  startDate: string
  endDate: string
  result?: string
}

export interface Certificate {
  _id: string
  name: string
  issuer: string
  date: string
  url?: string
}

export interface Award {
  _id: string
  title: string
  issuer: string
  date?: string
  description?: string
  url?: string
}

export interface Publication {
  _id: string
  title: string
  publisher: string
  date?: string
  url?: string
  description?: string
  authors?: string[]
}

export interface Volunteering {
  _id: string
  organization: string
  role: string
  startDate?: string
  endDate?: string
  current: boolean
  description?: string
  technologies?: string[]
  url?: string
}

export interface Language {
  _id: string
  name: string
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'
}

export interface Interest {
  _id: string
  name: string
  category?: string
}

export interface ExtractedLink {
  displayText: string
  url: string
  platform: string
  confidence: 'High' | 'Medium' | 'Low'
}

export interface ExtractedExperience {
  company: string
  role: string
  employmentType?: string
  location?: string
  workMode?: string
  startDate: string
  endDate?: string
  current: boolean
  description?: string
  responsibilities: string[]
  technologies: string[]
  achievements: string[]
  metrics: string[]
  projects: string[]
  links?: ExtractedLink[]
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedProject {
  title: string
  description: string
  problem?: string
  solution?: string
  impact?: string
  technologies: string[]
  features: string[]
  challenges: string[]
  outcome?: string
  github?: string
  demo?: string
  documentation?: string
  duration?: string
  teamSize?: string
  role?: string
  tags: string[]
  links?: ExtractedLink[]
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedSkill {
  category: string
  name: string
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  aliases?: string[]
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedEducation {
  degree: string
  institution: string
  startDate: string
  endDate: string
  result?: string
  coursework?: string[]
  activities?: string[]
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedCertificate {
  name: string
  issuer: string
  date: string
  expiryDate?: string
  credentialId?: string
  url?: string
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedAward {
  title: string
  issuer: string
  date?: string
  description?: string
  url?: string
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedPublication {
  title: string
  publisher: string
  date?: string
  url?: string
  description?: string
  authors?: string[]
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedVolunteering {
  organization: string
  role: string
  startDate?: string
  endDate?: string
  current: boolean
  description?: string
  technologies?: string[]
  url?: string
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedLanguage {
  name: string
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic'
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface ExtractedInterest {
  name: string
  category?: string
  confidence?: 'High' | 'Medium' | 'Low'
}

export interface CustomSection {
  title: string
  type: string
  order: number
  items: Array<{
    originalText: string
    structuredFields: Record<string, any>
    links: ExtractedLink[]
    confidence: 'High' | 'Medium' | 'Low'
  }>
  confidence: 'High' | 'Medium' | 'Low'
}

export interface ExtractedProfile {
  personal?: {
    name?: string
    title?: string
    summary?: string
    email?: string
    phone?: string
    location?: string
    links?: ExtractedLink[]
  }
  experiences: ExtractedExperience[]
  projects: ExtractedProject[]
  skills: ExtractedSkill[]
  education: ExtractedEducation[]
  certificates: ExtractedCertificate[]
  awards?: ExtractedAward[]
  publications?: ExtractedPublication[]
  volunteering?: ExtractedVolunteering[]
  languages?: ExtractedLanguage[]
  interests?: ExtractedInterest[]
  customSections?: CustomSection[]
  links?: ExtractedLink[]
  documentStructure?: {
    detectedSections: string[]
    totalHeadings: number
    totalBullets: number
    totalLinks: number
    confidence: 'High' | 'Medium' | 'Low'
  }
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Application {
  _id: string
  company: string
  role: string
  jdText?: string
  jdAnalysisId?: string
  status: ApplicationStatus
  timeline: TimelineEvent[]
  notes: string
  tags: string[]
  scores?: { ats?: number; match?: number; overall?: number }
  trackerTasks?: Task[]
  createdAt: string
  updatedAt: string
}

export interface TimelineEvent {
  event: string
  date: string
  notes?: string
}

export interface JDAnalysis {
  _id: string
  company: string
  role: string
  location?: string
  experienceLevel?: string
  requiredSkills: string[]
  niceToHaveSkills: string[]
  keywords: string[]
  atsTerms: string[]
  redFlags: string[]
  matchScore?: number
  summary?: string
}

export interface ResumeStrategy {
  selectedExperienceIds: string[]
  selectedProjectIds: string[]
  excludedItems: { id: string; reason: string }[]
  ordering: { experiences: string[]; projects: string[] }
  matchedSkills: string[]
  reasoning: Record<string, string>
}

export interface ResumeVersion {
  _id: string
  applicationId: string
  version: number
  strategySnapshot: Record<string, any>
  content: ResumeContent
  template: string
  scores?: { ats?: number; overall?: number }
}

export interface ResumeContent {
  summary: string
  experiences: Record<string, any>[]
  projects: Record<string, any>[]
  skills: string[]
  education: Record<string, any>[]
  certificates: Record<string, any>[]
}

export interface ValidationReport {
  _id: string
  results: ValidatorResult[]
  overallPassed: boolean
  blocked: boolean
  createdAt: string
}

export interface ValidatorResult {
  name: string
  score: number
  passed: boolean
  issues: { severity: 'error' | 'warning'; message: string }[]
}

export interface UploadedResumeContent {
  summary: string
  experiences: Record<string, any>[]
  projects: Record<string, any>[]
  skills: Record<string, any>[]
  education: Record<string, any>[]
  certificates: Record<string, any>[]
}

export interface UploadedResume {
  _id: string
  userId: string
  fileName: string
  fileType: 'docx' | 'doc'
  content: UploadedResumeContent
  createdAt: string
  updatedAt: string
}

export interface InterviewPrep {
  _id: string
  questions: { question: string; type: string; answer?: string }[]
  answers?: { questionId: string; answer: string; practiced: boolean }[]
  companyResearch: string
  starAnswers: any[]
  talkingPoints: string[]
  weakAreas: string[]
}

export interface AnalyticsSummary {
  totalApps: number
  byStatus: Record<string, number>
  interviewRate: number
  offerRate: number
  avgMatchScore: number | null
}
