import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityCard } from '../OpportunityCard'
import type { Opportunity } from '../../../services/community/opportunities'
import type { UseSavedOpportunitiesValue } from '../../../hooks/useSavedOpportunities'

const mocks = vi.hoisted(() => ({
  toggle: vi.fn(),
  save: vi.fn(),
  unsave: vi.fn(),
  setAlert: vi.fn(),
  refresh: vi.fn(),
  isSaved: vi.fn(() => false),
  showToast: vi.fn(),
}))

vi.mock('../../../hooks/useSavedOpportunities', () => ({
  useSavedOpportunities: (): UseSavedOpportunitiesValue => ({
    savedIds: new Set<string>(),
    savedByOppId: new Map(),
    isLoading: false,
    save: mocks.save,
    unsave: mocks.unsave,
    toggle: mocks.toggle,
    isSaved: mocks.isSaved,
    setAlert: mocks.setAlert,
    refresh: mocks.refresh,
  }),
}))

vi.mock('../../layout/useToast', () => ({
  useToast: () => ({ showToast: mocks.showToast, toasts: [], dismissToast: vi.fn() }),
}))

function makeOpp(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    _id: 'opp-1',
    title: 'Senior Frontend Engineer',
    company: 'Acme Corp',
    location: 'Berlin, Germany',
    locationType: 'remote',
    description: 'Build the next generation of UI.',
    salaryMin: 100000,
    salaryMax: 150000,
    salaryInterval: 'yearly',
    roleLevel: 'senior',
    employmentType: 'full-time',
    requiredSkills: ['react', 'typescript', 'tailwind', 'vitest', 'css'],
    preferredSkills: [],
    matchCount: 0,
    averageMatchScore: 0.82,
    totalContributions: 12,
    totalWorkspaces: 3,
    referralAvailable: false,
    isExpired: false,
    pipelineStatus: 'open',
    aiConfidence: 0,
    source: 'manual',
    createdBy: 'user-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function renderCard(opp: Opportunity, onClick?: () => void) {
  return render(<OpportunityCard opportunity={opp} {...(onClick ? { onClick } : {})} />)
}

describe('OpportunityCard', () => {
  beforeEach(() => {
    mocks.toggle.mockReset()
    mocks.save.mockReset()
    mocks.unsave.mockReset()
    mocks.setAlert.mockReset()
    mocks.refresh.mockReset()
    mocks.showToast.mockReset()
    mocks.isSaved.mockReset()
    mocks.isSaved.mockReturnValue(false)
    mocks.toggle.mockResolvedValue(undefined)
  })

  it('renders title and company', () => {
    renderCard(makeOpp())

    expect(screen.getByRole('heading', { level: 3, name: /senior frontend engineer/i })).toBeInTheDocument()
    expect(screen.getByText(/acme corp/i)).toBeInTheDocument()
  })

  it('renders the location type badge', () => {
    renderCard(makeOpp({ locationType: 'remote' }))
    expect(screen.getByText('remote')).toBeInTheDocument()

    renderCard(makeOpp({ locationType: 'hybrid', _id: 'opp-2' } as Opportunity))
    expect(screen.getByText('hybrid')).toBeInTheDocument()
  })

  it('renders the match score badge when averageMatchScore is present', () => {
    renderCard(makeOpp({ averageMatchScore: 0.82 }))

    const badge = screen.getByTestId('opportunity-match-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent(/82% match/)
  })

  it('omits the match score badge when averageMatchScore is not a number', () => {
    renderCard(makeOpp({ averageMatchScore: undefined as unknown as number }))
    expect(screen.queryByTestId('opportunity-match-badge')).not.toBeInTheDocument()
  })

  it('renders the New badge when createdAt is recent (within 7 days)', () => {
    const recent = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    renderCard(makeOpp({ createdAt: recent }))

    expect(screen.getByTestId('opportunity-new-badge')).toBeInTheDocument()
    expect(screen.getByText(/^new$/i)).toBeInTheDocument()
  })

  it('does not render the New badge when createdAt is older than 7 days', () => {
    const old = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    renderCard(makeOpp({ createdAt: old }))

    expect(screen.queryByTestId('opportunity-new-badge')).not.toBeInTheDocument()
  })

  it('renders a save button and clicking it does not trigger card onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    mocks.toggle.mockResolvedValue(undefined)

    renderCard(makeOpp({ _id: 'opp-save' }), onClick)

    const saveButton = screen.getByRole('button', { name: /save opportunity/i })
    expect(saveButton).toBeInTheDocument()

    await user.click(saveButton)

    expect(mocks.toggle).toHaveBeenCalledTimes(1)
    expect(mocks.toggle).toHaveBeenCalledWith('opp-save', true)
    // Card onClick should NOT have been triggered.
    expect(onClick).not.toHaveBeenCalled()
  })

  it('calls onClick when the card body is clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { container } = renderCard(makeOpp({ _id: 'opp-click' }), onClick)

    // Click the outer card container (the first child div is the card root).
    const cardRoot = container.firstElementChild as HTMLElement
    expect(cardRoot).not.toBeNull()
    await user.click(cardRoot)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not throw when no onClick handler is provided and the card is clicked', async () => {
    const user = userEvent.setup()
    const { container } = renderCard(makeOpp())

    const cardRoot = container.firstElementChild as HTMLElement
    await expect(user.click(cardRoot)).resolves.not.toThrow()
  })

  it('renders the location text when provided', () => {
    renderCard(makeOpp({ location: 'Berlin, Germany' }))
    expect(screen.getByText(/berlin, germany/i)).toBeInTheDocument()
  })

  it('renders required skills chips (capped at 4 with a +N overflow)', () => {
    renderCard(makeOpp({
      requiredSkills: ['react', 'typescript', 'tailwind', 'vitest', 'css', 'graphql'],
    }))

    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('tailwind')).toBeInTheDocument()
    expect(screen.getByText('vitest')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('renders salary range when salaryMin/salaryMax are provided', () => {
    renderCard(makeOpp({ salaryMin: 80000, salaryMax: 120000 }))
    expect(screen.getByText(/\$80,000/)).toBeInTheDocument()
    expect(screen.getByText(/\$120,000/)).toBeInTheDocument()
  })

  it('renders the contributor count', () => {
    renderCard(makeOpp({ totalContributions: 7 }))
    expect(screen.getByTestId('opportunity-contributor-count')).toHaveTextContent('7')
  })

  it('renders the referral indicator when referralAvailable is true', () => {
    renderCard(makeOpp({ referralAvailable: true, referralCount: 2 }))
    expect(screen.getByTestId('opportunity-referral-indicator')).toBeInTheDocument()
    expect(screen.getByText(/2 referrals/i)).toBeInTheDocument()
  })
})
