import { get, post, put } from './api'
import type { InterviewPrep, JDAnalysis } from '../types'

export interface InterviewGenerateRequest {
  applicationId: string
  jdAnalysis: JDAnalysis
  profile: Record<string, unknown>
}

export interface STARRequest {
  experience: string
  question: string
}

export interface STARResponse {
  star: { situation: string; task: string; action: string; result: string }
}

export function generateInterviewPrep(
  applicationId: string, jdAnalysis: JDAnalysis, profile: Record<string, unknown>
): Promise<InterviewPrep> {
  return post<InterviewPrep>('/interview/generate', { applicationId, jdAnalysis, profile })
}

export function getInterviewPrep(applicationId: string): Promise<InterviewPrep> {
  return get<InterviewPrep>(`/interview/${applicationId}`)
}

export function generateSTAR(experience: string, question: string): Promise<STARResponse> {
  return post<STARResponse>('/interview/star', { experience, question })
}

export function saveAnswer(applicationId: string, questionId: string, answer: string): Promise<InterviewPrep> {
  return put<InterviewPrep>(`/interview/${applicationId}/answer`, { questionId, answer })
}

export function markPracticed(applicationId: string, questionId: string, practiced: boolean): Promise<InterviewPrep> {
  return post<InterviewPrep>(`/interview/${applicationId}/practice`, { questionId, practiced })
}

export function refreshResearch(applicationId: string): Promise<{ companyResearch: string }> {
  return get<{ companyResearch: string }>(`/interview/${applicationId}/research`)
}

export const interviewService = {
  generateInterviewPrep,
  getInterviewPrep,
  generateSTAR,
  saveAnswer,
  markPracticed,
  refreshResearch,
}
