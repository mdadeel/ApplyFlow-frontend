import { useState } from 'react'
import { useToast } from '../layout/useToast'
import {
  sendToResumeLibrary,
  sendToExportCenter,
  createApplicationFromWorkspace,
} from '../../services/community/workspaces'
import { Bookmark, Briefcase, Download, Loader2 } from '../../lib/icons'

interface TailoredResumePayload {
  content: string
  atsScore?: number
}

interface CoverLetterPayload {
  content: string
}

interface EmailPayload {
  subject: string
  body: string
}

interface InterviewPrepPayload {
  questions: unknown[]
  companyResearch: string
}

export interface WorkspaceExportActionsProps {
  workspaceId: string
  tailoredResume?: TailoredResumePayload
  coverLetter?: CoverLetterPayload
  email?: EmailPayload
  interviewPrep?: InterviewPrepPayload
  disabled?: boolean
}

type ActionType = 'resume-library' | 'cover-letter' | 'email' | 'application'

export function WorkspaceExportActions({
  workspaceId,
  tailoredResume,
  coverLetter,
  email,
  interviewPrep,
  disabled = false,
}: WorkspaceExportActionsProps) {
  const { showToast } = useToast()
  const [pending, setPending] = useState<ActionType | null>(null)

  const run = async (type: ActionType, label: string, fn: () => Promise<unknown>, success: string) => {
    if (disabled || pending) return
    setPending(type)
    try {
      await fn()
      showToast(success, 'success')
      // interviewPrep is accepted for prop completeness but no action uses it.
      void interviewPrep
    } catch (err) {
      const message = err instanceof Error ? err.message : `${label} failed`
      showToast(message, 'error')
    } finally {
      setPending(null)
    }
  }

  const handleResumeLibrary = () =>
    run(
      'resume-library',
      'Send to Resume Library',
      () => sendToResumeLibrary(workspaceId),
      'Resume sent to Resume Library',
    )

  const handleCoverLetterExport = () =>
    run(
      'cover-letter',
      'Export Cover Letter',
      () => sendToExportCenter(workspaceId, 'pdf'),
      'Cover Letter exported',
    )

  const handleEmailExport = () =>
    run(
      'email',
      'Export Email',
      () => sendToExportCenter(workspaceId, 'pdf'),
      'Email exported',
    )

  const handleCreateApplication = () =>
    run(
      'application',
      'Create Application',
      () => createApplicationFromWorkspace(workspaceId),
      'Application created',
    )

  const canResume = !!tailoredResume
  const canCoverLetter = !!coverLetter
  const canEmail = !!email
  const canApplication = !!tailoredResume

  const baseButton =
    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-label-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleResumeLibrary}
        disabled={disabled || !canResume || pending !== null}
        className={`${baseButton} bg-primary text-white hover:opacity-90`}
        aria-label="Send to Resume Library"
      >
        {pending === 'resume-library' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        Send to Resume Library
      </button>

      <button
        type="button"
        onClick={handleCoverLetterExport}
        disabled={disabled || !canCoverLetter || pending !== null}
        className={`${baseButton} bg-surface-container-high text-on-surface hover:opacity-90`}
        aria-label="Export Cover Letter"
      >
        {pending === 'cover-letter' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export Cover Letter
      </button>

      <button
        type="button"
        onClick={handleEmailExport}
        disabled={disabled || !canEmail || pending !== null}
        className={`${baseButton} bg-surface-container-high text-on-surface hover:opacity-90`}
        aria-label="Export Email"
      >
        {pending === 'email' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Export Email
      </button>

      <button
        type="button"
        onClick={handleCreateApplication}
        disabled={disabled || !canApplication || pending !== null}
        className={`${baseButton} bg-emerald-600 text-white hover:opacity-90`}
        aria-label="Create Application"
      >
        {pending === 'application' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Briefcase className="w-4 h-4" />
        )}
        Create Application
      </button>
    </div>
  )
}
