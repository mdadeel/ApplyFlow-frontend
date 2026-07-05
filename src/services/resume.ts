import { post } from './api'
import type { ResumeStrategy, ResumeVersion } from '../types'

export interface StrategyRequest {
  jdKeywords: string[]
  requiredSkills: string[]
  applicationId?: string
}

export function generateStrategy(jdKeywords: string[], requiredSkills: string[]): Promise<ResumeStrategy> {
  return post<ResumeStrategy>('/strategy/strategy', { jdKeywords, requiredSkills })
}

export interface ResumeRequest {
  strategy: ResumeStrategy
  applicationId?: string
}

export function generateResume(data: ResumeRequest): Promise<ResumeVersion> {
  return post<ResumeVersion>('/resume', data)
}

export const resumeService = { generateStrategy, generateResume }
