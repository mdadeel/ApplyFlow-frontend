import { get, getArray, post, put, del } from './api'
import type { Application, JDAnalysis, TimelineEvent } from '../types'

export interface GetApplicationsParams {
  status?: string
  q?: string
  sort?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  applications: T[]
  total: number
  page: number
  pages: number
}

export function getApplications(params?: GetApplicationsParams): Promise<PaginatedResponse<Application>> {
  return get<PaginatedResponse<Application>>('/applications', params as Record<string, string | number | undefined>)
}

export function getApplication(id: string): Promise<Application> {
  return get<Application>(`/applications/${id}`)
}

export function createApplication(data: Omit<Application, '_id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
  return post<Application>('/applications', data)
}

export function updateApplication(id: string, data: Partial<Application>): Promise<Application> {
  return put<Application>(`/applications/${id}`, data)
}

export function deleteApplication(id: string): Promise<void> {
  return del<void>(`/applications/${id}`)
}

export function addTimelineEntry(id: string, event: Omit<TimelineEvent, 'date'>): Promise<Application> {
  return post<Application>(`/applications/${id}/timeline`, event)
}

export function getApplicationVersions(id: string): Promise<Application[]> {
  return getArray<Application>(`/applications/${id}/versions`)
}

export function autoFillApplication(jdText: string): Promise<JDAnalysis> {
  return post<JDAnalysis>('/applications/auto-fill', { jdText })
}

export const applicationsService = {
  getApplications, getApplication, createApplication, updateApplication,
  deleteApplication, addTimelineEntry, getApplicationVersions, autoFillApplication,
}
