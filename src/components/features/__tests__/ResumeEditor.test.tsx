import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResumeEditor } from '../ResumeEditor'

const initialMarkdown = '# Jane Doe\n\nTypeScript developer with React experience.'

describe('ResumeEditor', () => {
  it('renders the textarea and preview with the initial markdown', () => {
    render(
      <ResumeEditor
        markdown={initialMarkdown}
        atsKeywords={['TypeScript', 'Kubernetes']}
        onChange={vi.fn()}
      />,
    )

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea).toBeInTheDocument()
    expect(textarea.value).toBe(initialMarkdown)
    // Preview pane renders the heading text
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
  })

  it('marks found ATS keywords as success and missing as warning', () => {
    render(
      <ResumeEditor
        markdown={initialMarkdown}
        atsKeywords={['TypeScript', 'Kubernetes']}
        onChange={vi.fn()}
      />,
    )

    // Keywords appear in both the badge and the highlighted preview; pick the badge.
    const tsBadge = screen
      .getAllByText('TypeScript')
      .map((el) => el.closest('span'))
      .find((el) => el?.className.includes('rounded-full'))
    expect(tsBadge?.className).toMatch(/emerald/)

    const k8sBadge = screen
      .getAllByText('Kubernetes')
      .map((el) => el.closest('span'))
      .find((el) => el?.className.includes('rounded-full'))
    expect(k8sBadge?.className).toMatch(/amber/)

    // Missing keyword warning copy
    expect(screen.getByText(/1 keyword missing from resume/)).toBeInTheDocument()
  })

  it('switches modes and reflects preview-only state', async () => {
    const user = userEvent.setup()
    render(
      <ResumeEditor
        markdown={initialMarkdown}
        atsKeywords={[]}
        onChange={vi.fn()}
      />,
    )

    // Split mode (default) shows both textarea and heading
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()

    // Switch to preview only
    await user.click(screen.getByRole('button', { name: /^preview$/i }))
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'Jane Doe' })).toBeInTheDocument()
  })

  it('calls onChange when textarea value changes and records history for undo', () => {
    const onChange = vi.fn()
    render(
      <ResumeEditor
        markdown={initialMarkdown}
        atsKeywords={[]}
        onChange={onChange}
      />,
    )

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: '# Updated Resume' } })

    expect(onChange).toHaveBeenCalledWith('# Updated Resume')

    // Undo button should now be enabled since history grew beyond the initial entry.
    const undoButton = screen.getByRole('button', { name: /^undo$/i })
    expect(undoButton).not.toBeDisabled()
  })
})
