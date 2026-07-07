import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ContributionList } from '../ContributionList'
import type { Contribution } from '../../../services/community/contributions'

const markHelpfulMock = vi.hoisted(() => vi.fn())

vi.mock('../../../services/community/contributions', async () => {
  const actual = await vi.importActual<typeof import('../../../services/community/contributions')>(
    '../../../services/community/contributions',
  )
  return {
    ...actual,
    markHelpful: markHelpfulMock,
  }
})

function makeContribution(overrides: Partial<Contribution> = {}): Contribution {
  return {
    _id: 'c-1',
    opportunityId: 'opp-1',
    userId: 'user-1',
    type: 'general',
    title: 'Sample insight',
    body: 'Detailed insight body.',
    helpfulCount: 2,
    isAnonymous: false,
    createdAt: new Date('2024-01-02T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-02T10:00:00Z').toISOString(),
    ...overrides,
  }
}

describe('ContributionList', () => {
  beforeEach(() => {
    markHelpfulMock.mockReset()
    markHelpfulMock.mockResolvedValue(undefined)
  })

  it('renders nothing when contributions array is empty (parent renders empty state)', () => {
    const { container } = render(
      <ContributionList opportunityId="opp-1" contributions={[]} />,
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByTestId('contribution-list')).not.toBeInTheDocument()
  })

  it('renders each contribution with title and body', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[
          makeContribution({ _id: 'a', title: 'First tip', body: 'Body A' }),
          makeContribution({ _id: 'b', title: 'Second tip', body: 'Body B' }),
        ]}
      />,
    )
    expect(screen.getByText('First tip')).toBeInTheDocument()
    expect(screen.getByText('Body A')).toBeInTheDocument()
    expect(screen.getByText('Second tip')).toBeInTheDocument()
    expect(screen.getByText('Body B')).toBeInTheDocument()
  })

  it('shows the helpful count for each contribution', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[
          makeContribution({ _id: 'a', helpfulCount: 5 }),
          makeContribution({ _id: 'b', helpfulCount: 0 }),
        ]}
      />,
    )
    const counts = screen.getAllByTestId('contribution-helpful-count')
    expect(counts.map(c => c.textContent)).toEqual(['5', '0'])
  })

  it('sorts by newest by default', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[
          makeContribution({ _id: 'old', title: 'Old', createdAt: '2024-01-01T00:00:00Z' }),
          makeContribution({ _id: 'new', title: 'New', createdAt: '2024-02-01T00:00:00Z' }),
        ]}
      />,
    )
    const items = screen.getAllByTestId('contribution-item')
    expect(items[0]).toHaveTextContent('New')
    expect(items[1]).toHaveTextContent('Old')
  })

  it('switches to most-helpful sort when toggle clicked', async () => {
    const user = userEvent.setup()
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[
          makeContribution({ _id: 'low', title: 'Low helpful', helpfulCount: 1 }),
          makeContribution({ _id: 'high', title: 'High helpful', helpfulCount: 50 }),
        ]}
      />,
    )

    await user.click(screen.getByTestId('contribution-sort-helpful'))

    const items = screen.getAllByTestId('contribution-item')
    expect(items[0]).toHaveTextContent('High helpful')
    expect(items[1]).toHaveTextContent('Low helpful')
  })

  it('marks newest sort button as pressed by default', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution()]}
      />,
    )
    expect(screen.getByTestId('contribution-sort-newest')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('contribution-sort-helpful')).toHaveAttribute('aria-pressed', 'false')
  })

  it('calls markHelpful when helpful toggle clicked and updates count optimistically', async () => {
    const user = userEvent.setup()
    markHelpfulMock.mockResolvedValue(makeContribution({ _id: 'a', helpfulCount: 6 }))

    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ _id: 'a', helpfulCount: 5 })]}
      />,
    )

    const toggle = screen.getByTestId('contribution-helpful-toggle')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('contribution-helpful-count')).toHaveTextContent('5')

    await user.click(toggle)

    expect(markHelpfulMock).toHaveBeenCalledWith('opp-1', 'a')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByTestId('contribution-helpful-count')).toHaveTextContent('6')
  })

  it('rolls back optimistic update when markHelpful rejects', async () => {
    const user = userEvent.setup()
    markHelpfulMock.mockRejectedValueOnce(new Error('network'))

    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ _id: 'a', helpfulCount: 5 })]}
      />,
    )

    const toggle = screen.getByTestId('contribution-helpful-toggle')
    await user.click(toggle)

    // Wait for promise rejection to settle
    await new Promise(r => setTimeout(r, 0))

    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByTestId('contribution-helpful-count')).toHaveTextContent('5')
  })

  it('uses onToggleHelpful override when provided', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn().mockResolvedValue(undefined)

    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ _id: 'a' })]}
        onToggleHelpful={onToggle}
      />,
    )

    await user.click(screen.getByTestId('contribution-helpful-toggle'))

    expect(onToggle).toHaveBeenCalledWith('opp-1', 'a', true)
    expect(markHelpfulMock).not.toHaveBeenCalled()
  })

  it('shows author name and reputation badge when not anonymous', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ userId: 'u1' })]}
        authors={{
          u1: { id: 'u1', name: 'Alex', reputation: 750, contributionsCount: 30 },
        }}
      />,
    )
    expect(screen.getByText('Alex')).toBeInTheDocument()
    expect(screen.getByTestId('trust-badge')).toHaveTextContent(/top contributor/i)
  })

  it('does not render a trust badge when author data is missing', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ userId: 'unknown' })]}
      />,
    )
    expect(screen.queryByTestId('trust-badge')).not.toBeInTheDocument()
  })

  it('shows Anonymous when contribution is flagged anonymous', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ isAnonymous: true, userId: 'u1' })]}
        authors={{ u1: { id: 'u1', name: 'Should Not Show' } }}
      />,
    )
    expect(screen.getByText(/anonymous/i)).toBeInTheDocument()
    expect(screen.queryByText('Should Not Show')).not.toBeInTheDocument()
  })

  it('renders the contribution type label', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ type: 'interview_insight' })]}
      />,
    )
    const item = screen.getByTestId('contribution-item')
    expect(within(item).getByText(/interview insight/i)).toBeInTheDocument()
  })

  it('renders the contribution count summary', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[
          makeContribution({ _id: 'a' }),
          makeContribution({ _id: 'b' }),
          makeContribution({ _id: 'c' }),
        ]}
      />,
    )
    expect(screen.getByText(/3 contributions/i)).toBeInTheDocument()
  })

  it('uses singular contribution when only one', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution()]}
      />,
    )
    expect(screen.getByText(/^1 contribution$/i)).toBeInTheDocument()
  })

  it('honors isHelpful from server on initial render', () => {
    render(
      <ContributionList
        opportunityId="opp-1"
        contributions={[makeContribution({ _id: 'a', helpfulCount: 4, isHelpful: true })]}
      />,
    )
    const toggle = screen.getByTestId('contribution-helpful-toggle')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    // base 4 + 1 from isHelpful = 5
    expect(screen.getByTestId('contribution-helpful-count')).toHaveTextContent('5')
  })
})
