import { get, post } from './api'

export interface LearningPreferences {
  preferredVerbs: Record<string, number>
  removedPhrases: string[]
  shorterSummaries: boolean
}

export interface FeedbackRequest {
  section: string
  original: string
  edited: string
}

export function getPreferences(): Promise<LearningPreferences> {
  return get<LearningPreferences>('/learning/preferences')
}

export function sendFeedback(section: string, original: string, edited: string): Promise<void> {
  return post<void>('/learning/feedback', { section, original, edited })
}

export const learningService = { getPreferences, sendFeedback }
