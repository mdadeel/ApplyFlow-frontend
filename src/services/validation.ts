import { post } from './api'
import type { ValidationReport } from '../types'

export function validateResume(resumeVersionId: string): Promise<ValidationReport> {
  return post<ValidationReport>('/validate', { resumeVersionId })
}

export const validationService = { validateResume }
