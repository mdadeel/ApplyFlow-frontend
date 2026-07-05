import { postBlob } from './api'

export interface ExportRequest {
  applicationId: string
  template?: string
  format?: string
  content?: Record<string, unknown>
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

export const exportService = { exportResume, exportEmail, exportCoverLetter }
