import { postBlob, post, get, del } from './api'

export interface ExportRequest {
  applicationId: string
  template?: string
  format?: string
  content?: Record<string, unknown>
}

export interface ExportRecordData {
  _id: string
  applicationId: string
  type: 'resume' | 'cover-letter' | 'email'
  content: string
  subject?: string
  format: string
  fileName: string
  createdAt: string
  updatedAt: string
}

export function exportResume(data: ExportRequest): Promise<Blob> {
  return postBlob('/export/resume', data)
}

export function exportEmail(data: ExportRequest): Promise<Blob> {
  return postBlob('/export/email', data)
}

export function exportCoverLetter(data: ExportRequest): Promise<Blob> {
  return postBlob('/export/cover-letter', data)
}

export function saveExport(data: {
  applicationId: string
  type: 'resume' | 'cover-letter' | 'email'
  content: string
  subject?: string
  format: string
  fileName: string
}): Promise<ExportRecordData> {
  return post('/exports', data)
}

export function getExports(applicationId?: string): Promise<ExportRecordData[]> {
  return get('/exports', applicationId ? { applicationId } : undefined)
}

export function deleteExport(id: string): Promise<ExportRecordData> {
  return del(`/exports/${id}`)
}

export const exportService = { exportResume, exportEmail, exportCoverLetter, saveExport, getExports, deleteExport }
