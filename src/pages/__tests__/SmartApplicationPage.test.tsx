import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Hoist mock handles so vi.mock factories (also hoisted) can reference them.
const mocks = vi.hoisted(() => ({
  showToast: vi.fn(),
  smartCreate: vi.fn(),
  bulkCreate: vi.fn(),
  exportAllFormats: vi.fn(),
  getResumes: vi.fn().mockResolvedValue({ resumes: [] }),
}))

// Mock AppLayout so we don't render Sidebar/TopBar/ToastProvider.
vi.mock('../../components/layout/AppLayout', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="app-layout">{children}</div>,
}))

// Mock useToast so we don't need ToastProvider and can assert showToast was called.
vi.mock('../../components/layout/useToast', () => ({
  useToast: () => ({
    showToast: mocks.showToast,
    toasts: [],
    dismissToast: vi.fn(),
  }),
}))

// Mock the smart application service.
vi.mock('../../services/smartApplication', () => ({
  smartApplicationService: {
    aiCreate: mocks.smartCreate,
    bulkCreate: mocks.bulkCreate,
    exportAllFormats: mocks.exportAllFormats,
  },
}))

// Mock the resume library service used in the useEffect.
vi.mock('../../services/resumeLibrary', () => ({
  resumeLibraryService: {
    getResumes: mocks.getResumes,
    getResume: vi.fn(),
    uploadResume: vi.fn(),
    deleteResume: vi.fn(),
  },
}))

import { SmartApplicationPage } from '../SmartApplicationPage'
import type { SmartApplicationResult } from '../../services/smartApplication'

function makeResult(overrides: Partial<SmartApplicationResult> = {}): SmartApplicationResult {
  return {
    applicationId: 'app-1',
    exportPath: '/exports/app-1',
    scores: { ats: 82, match: 88, overall: 85 },
    output: {
      analysis: {
        company: 'Acme',
        role: 'Frontend Engineer',
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requiredSkills: ['React'],
        preferredSkills: [],
        responsibilities: [],
        keywords: [],
        atsKeywords: ['React', 'TypeScript'],
        softSkills: [],
        redFlags: [],
        matchPercent: 85,
        salaryRange: null,
        location: null,
      },
      resume: { markdown: '# Resume\n\nExperience with React', sections: {} as any },
      email: { subject: 'Application for Frontend Engineer', body: 'Hello.', tone: 'professional' },
      coverLetter: 'Dear Hiring Manager, ...',
      validationHints: {
        atsKeywordsToInclude: [],
        truthFlags: [],
        humanizationTips: [],
      },
    },
    ...overrides,
  }
}

describe('SmartApplicationPage', () => {
  beforeEach(() => {
    mocks.showToast.mockClear()
    mocks.smartCreate.mockReset()
    mocks.bulkCreate.mockReset()
    mocks.exportAllFormats.mockReset()
  })

  it('renders input tabs and an empty-state result panel', async () => {
    render(<SmartApplicationPage />)

    // Tabs in input panel
    expect(screen.getByRole('button', { name: /^paste jd\(s\)$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^upload csv$/i })).toBeInTheDocument()

    // Empty state copy in the result panel
    expect(await screen.findByText(/ready to generate/i)).toBeInTheDocument()
  })

  it('shows an error toast and does not call the API when JD is too short', async () => {
    const user = userEvent.setup()
    render(<SmartApplicationPage />)

    const textarea = screen.getByPlaceholderText(/paste one or more job descriptions here/i)
    await user.type(textarea, 'too short')

    await user.click(screen.getByRole('button', { name: /generate application package/i }))

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/at least 50 characters/i),
        'error',
      )
    })
    expect(mocks.smartCreate).not.toHaveBeenCalled()
  })

  it('calls smartApplicationService.smartCreate and renders the resume tab on success', async () => {
    const user = userEvent.setup()
    const result = makeResult()
    mocks.smartCreate.mockResolvedValueOnce(result)

    render(<SmartApplicationPage />)

    const jd =
      'We are looking for a senior frontend engineer with strong React and TypeScript experience to join our team.'
    const textarea = screen.getByPlaceholderText(/paste one or more job descriptions here/i)
    await user.type(textarea, jd)

    await user.click(screen.getByRole('button', { name: /generate application package/i }))

    await waitFor(() => {
      expect(mocks.smartCreate).toHaveBeenCalledTimes(1)
    })

    const callArg = mocks.smartCreate.mock.calls[0][0]
    expect(callArg.jdText).toBe(jd)

    // Result header shows company + match percent
    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.getByText(/85% match/)).toBeInTheDocument()

    // Success toast
    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith(
        expect.stringMatching(/generated/i),
        'success',
      )
    })
  })

  it('surfaces API error message via toast when smartCreate rejects', async () => {
    const user = userEvent.setup()
    mocks.smartCreate.mockRejectedValueOnce(new Error('Rate limit exceeded'))

    render(<SmartApplicationPage />)

    const jd =
      'A senior frontend role focused on building polished interfaces with React and TypeScript in a fast-paced team.'
    await user.type(screen.getByPlaceholderText(/paste one or more job descriptions here/i), jd)

    await user.click(screen.getByRole('button', { name: /generate application package/i }))

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith('Rate limit exceeded', 'error')
    })
  })
})
