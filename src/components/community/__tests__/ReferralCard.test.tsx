import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ReferralCard } from '../ReferralCard'
import type { Referral } from '../../../services/community/referrals'

function makeReferral(overrides: Partial<Referral> = {}): Referral {
  return {
    _id: 'ref-1',
    type: 'offer',
    userId: 'user-1',
    company: 'Acme',
    roleTitle: 'Senior Engineer',
    location: 'Remote',
    roleLevel: 'senior',
    message: 'Happy to refer strong candidates to the platform team.',
    status: 'open',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function renderCard(referral: Referral) {
  return render(
    <MemoryRouter>
      <ReferralCard referral={referral} />
    </MemoryRouter>,
  )
}

describe('ReferralCard', () => {
  it('renders company, role, location, and role level', () => {
    renderCard(makeReferral())
    expect(screen.getByRole('heading', { level: 3, name: /acme/i })).toBeInTheDocument()
    expect(screen.getByText(/senior engineer/i)).toBeInTheDocument()
    expect(screen.getByTestId('referral-card-location')).toHaveTextContent(/remote/i)
    expect(screen.getByTestId('referral-card-role-level')).toHaveTextContent(/senior/i)
  })

  it('renders the message body', () => {
    renderCard(makeReferral())
    expect(screen.getByTestId('referral-card-message')).toHaveTextContent(
      /happy to refer strong candidates/i,
    )
  })

  it('renders the status badge with the correct status', () => {
    renderCard(makeReferral({ status: 'matched' }))
    const badge = screen.getByTestId('referral-status-badge')
    expect(badge).toHaveAttribute('data-status', 'matched')
    expect(badge).toHaveTextContent(/matched/i)
  })

  it('renders the type badge', () => {
    renderCard(makeReferral({ type: 'request' }))
    const typeBadge = screen.getByTestId('referral-card-type')
    expect(typeBadge).toHaveTextContent(/request/i)
  })

  it('truncates long messages', () => {
    const longMessage = 'a'.repeat(500)
    renderCard(makeReferral({ message: longMessage }))
    const message = screen.getByTestId('referral-card-message')
    expect(message.textContent?.length ?? 0).toBeLessThan(longMessage.length)
    expect(message.textContent).toMatch(/…$/)
  })

  it('does not show Accept for requests', () => {
    const onAccept = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <ReferralCard
          referral={makeReferral({ type: 'request', status: 'open' })}
          onAccept={onAccept}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('referral-card-accept')).not.toBeInTheDocument()
  })

  it('does not show Accept for non-open offers', () => {
    const onAccept = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <ReferralCard
          referral={makeReferral({ type: 'offer', status: 'matched' })}
          onAccept={onAccept}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('referral-card-accept')).not.toBeInTheDocument()
  })

  it('calls onAccept when the Accept button is clicked', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <ReferralCard
          referral={makeReferral({ type: 'offer', status: 'open' })}
          onAccept={onAccept}
        />
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId('referral-card-accept'))
    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onAccept).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'ref-1', type: 'offer' }),
    )
  })

  it('calls onWithdraw when the Withdraw button is clicked', async () => {
    const user = userEvent.setup()
    const onWithdraw = vi.fn().mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <ReferralCard
          referral={makeReferral({ status: 'open' })}
          onWithdraw={onWithdraw}
        />
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId('referral-card-withdraw'))
    expect(onWithdraw).toHaveBeenCalledTimes(1)
    expect(onWithdraw).toHaveBeenCalledWith(expect.objectContaining({ _id: 'ref-1' }))
  })

  it('calls onView when the View details button is clicked', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    render(
      <MemoryRouter>
        <ReferralCard referral={makeReferral()} onView={onView} />
      </MemoryRouter>,
    )
    await user.click(screen.getByTestId('referral-card-view'))
    expect(onView).toHaveBeenCalledTimes(1)
    expect(onView).toHaveBeenCalledWith(expect.objectContaining({ _id: 'ref-1' }))
  })

  it('hides actions when showActions is false', () => {
    render(
      <MemoryRouter>
        <ReferralCard
          referral={makeReferral({ type: 'offer', status: 'open' })}
          onAccept={vi.fn().mockResolvedValue(undefined)}
          onWithdraw={vi.fn().mockResolvedValue(undefined)}
          onView={vi.fn()}
          showActions={false}
        />
      </MemoryRouter>,
    )
    expect(screen.queryByTestId('referral-card-accept')).not.toBeInTheDocument()
    expect(screen.queryByTestId('referral-card-withdraw')).not.toBeInTheDocument()
    expect(screen.queryByTestId('referral-card-view')).not.toBeInTheDocument()
  })

  it('omits location when not provided', () => {
    const ref = makeReferral()
    delete ref.location
    renderCard(ref)
    expect(screen.queryByTestId('referral-card-location')).not.toBeInTheDocument()
  })

  it('omits role level when not provided', () => {
    const ref = makeReferral()
    delete ref.roleLevel
    renderCard(ref)
    expect(screen.queryByTestId('referral-card-role-level')).not.toBeInTheDocument()
  })

  it('renders data-referral-id, data-referral-type, and data-referral-status attributes', () => {
    const { container } = renderCard(
      makeReferral({ _id: 'attr-1', type: 'offer', status: 'completed' }),
    )
    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-referral-id', 'attr-1')
    expect(article).toHaveAttribute('data-referral-type', 'offer')
    expect(article).toHaveAttribute('data-referral-status', 'completed')
  })

  it('renders the message inside the message node', () => {
    renderCard(makeReferral({ message: 'Specific message text' }))
    const message = screen.getByTestId('referral-card-message')
    expect(within(message).getByText(/specific message text/i)).toBeInTheDocument()
  })
})
