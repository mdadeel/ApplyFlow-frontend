import { post } from './api'
import type { JDAnalysis } from '../types'

export interface EmailRequest {
  jdAnalysis: JDAnalysis
  profile: Record<string, unknown>
  tone: string
}

export interface CoverLetterRequest {
  jdAnalysis: JDAnalysis
  profile: Record<string, unknown>
}

export interface ContentResponse {
  content: string
  subject?: string
}

export function generateEmail(jdAnalysis: JDAnalysis, profile: Record<string, unknown>, tone: string): Promise<ContentResponse> {
  return post<ContentResponse>('/content/email', { jdAnalysis, profile, tone })
}

export function generateCoverLetter(jdAnalysis: JDAnalysis, profile: Record<string, unknown>): Promise<ContentResponse> {
  return post<ContentResponse>('/content/cover-letter', { jdAnalysis, profile })
}

export function humanize(text: string): Promise<{ text: string }> {
  return post<{ text: string }>('/content/humanize', { text })
}

export const contentService = { generateEmail, generateCoverLetter, humanize }
