import { post, get, del } from './api'
import type { UploadedResume } from '../types'

export function uploadResume(file: File): Promise<{ resume: UploadedResume }> {
  const form = new FormData()
  form.append('resume', file)
  return post<{ resume: UploadedResume }>('/profile/resumes/upload', form)
}

export function getResumes(): Promise<{ resumes: UploadedResume[] }> {
  return get<{ resumes: UploadedResume[] }>('/profile/resumes')
}

export function getResume(id: string): Promise<{ resume: UploadedResume }> {
  return get<{ resume: UploadedResume }>(`/profile/resumes/${id}`)
}

export function deleteResume(id: string): Promise<void> {
  return del<void>(`/profile/resumes/${id}`)
}

export const resumeLibraryService = {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
}
