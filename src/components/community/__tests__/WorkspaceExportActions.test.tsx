import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mocks = vi.hoisted(() => ({
  sendToResumeLibrary: vi.fn(),
  sendToExportCenter: vi.fn(),
  createApplicationFromWorkspace: vi.fn(),
  showToast: vi.fn(),
}))

vi.mock('../../../services/community/workspaces', () => ({
  sendToResumeLibrary: mocks.sendToResumeLibrary,
  sendToExportCenter: mocks.sendToExportCenter,
  createApplicationFromWorkspace: mocks.createApplicationFromWorkspace,
}))

import { WorkspaceExportActions } from '../WorkspaceExportActions'
import { ToastContext, type ToastContextValue } from '../../layout/useToast'

const toastValue: ToastContextValue = {
  showToast: mocks.showToast,
  toasts: [],
  dismissToast: vi.fn(),
}

function renderActions(props: {
  tailoredResume?: { content: string; atsScore?: number }
  coverLetter?: { content: string }
  email?: { subject: string; body: string }
} = {}) {
  return render(
    <ToastContext.Provider value={toastValue}>
      <WorkspaceExportActions
        workspaceId="ws-1"
        tailoredResume={props.tailoredResume}
        coverLetter={props.coverLetter}
        email={props.email}
      />
    </ToastContext.Provider>,
  )
}

describe('WorkspaceExportActions', () => {
  beforeEach(() => {
    mocks.sendToResumeLibrary.mockReset()
    mocks.sendToExportCenter.mockReset()
    mocks.createApplicationFromWorkspace.mockReset()
    mocks.showToast.mockReset()
    mocks.sendToResumeLibrary.mockResolvedValue(undefined)
    mocks.sendToExportCenter.mockResolvedValue(undefined)
    mocks.createApplicationFromWorkspace.mockResolvedValue({} as never)
  })

  it('disables all action buttons when no content exists', () => {
    renderActions()
    expect(screen.getByRole('button', { name: /send to resume library/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /export cover letter/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /export email/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /create application/i })).toBeDisabled()
  })

  it('enables only the actions whose content is provided', () => {
    renderActions({ tailoredResume: { content: 'r' } })
    expect(screen.getByRole('button', { name: /send to resume library/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /create application/i })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: /export cover letter/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /export email/i })).toBeDisabled()
  })

  it('sends tailored resume to the resume library on click', async () => {
    const user = userEvent.setup()
    renderActions({ tailoredResume: { content: 'tailored' } })

    await user.click(screen.getByRole('button', { name: /send to resume library/i }))

    await waitFor(() => {
      expect(mocks.sendToResumeLibrary).toHaveBeenCalledWith('ws-1')
    })
    expect(mocks.showToast).toHaveBeenCalledWith('Resume sent to Resume Library', 'success')
  })

  it('exports the cover letter as PDF on click', async () => {
    const user = userEvent.setup()
    renderActions({ tailoredResume: { content: 'r' }, coverLetter: { content: 'cl' } })

    await user.click(screen.getByRole('button', { name: /export cover letter/i }))

    await waitFor(() => {
      expect(mocks.sendToExportCenter).toHaveBeenCalledWith('ws-1', 'pdf')
    })
    expect(mocks.showToast).toHaveBeenCalledWith('Cover Letter exported', 'success')
  })

  it('exports the recruiter email as PDF on click', async () => {
    const user = userEvent.setup()
    renderActions({
      tailoredResume: { content: 'r' },
      email: { subject: 'Hi', body: 'Body' },
    })

    await user.click(screen.getByRole('button', { name: /export email/i }))

    await waitFor(() => {
      expect(mocks.sendToExportCenter).toHaveBeenCalledWith('ws-1', 'pdf')
    })
    expect(mocks.showToast).toHaveBeenCalledWith('Email exported', 'success')
  })

  it('creates an application from the workspace on click', async () => {
    const user = userEvent.setup()
    renderActions({ tailoredResume: { content: 'r' } })

    await user.click(screen.getByRole('button', { name: /create application/i }))

    await waitFor(() => {
      expect(mocks.createApplicationFromWorkspace).toHaveBeenCalledWith('ws-1')
    })
    expect(mocks.showToast).toHaveBeenCalledWith('Application created', 'success')
  })

  it('surfaces an error toast when send-to-library fails', async () => {
    const user = userEvent.setup()
    mocks.sendToResumeLibrary.mockRejectedValueOnce(new Error('Network down'))
    renderActions({ tailoredResume: { content: 'r' } })

    await user.click(screen.getByRole('button', { name: /send to resume library/i }))

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith('Network down', 'error')
    })
  })

  it('disables all buttons when the disabled prop is set', () => {
    render(
      <ToastContext.Provider value={toastValue}>
        <WorkspaceExportActions
          workspaceId="ws-1"
          tailoredResume={{ content: 'r' }}
          coverLetter={{ content: 'c' }}
          email={{ subject: 's', body: 'b' }}
          disabled
        />
      </ToastContext.Provider>,
    )
    expect(screen.getByRole('button', { name: /send to resume library/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /export cover letter/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /export email/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /create application/i })).toBeDisabled()
  })
})
