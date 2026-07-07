import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ReferralList, type Referral } from '../ReferralList'

function makeReferral(overrides: Partial<Referral> = {}): Referral {
  return {
    _id: 'r-1',
    type: 'offer',
    userId: 'user-1',
    company: 'Acme',
    roleTitle: 'Senior Engineer',
    message: 'Happy to refer a strong candidate.',
    status: 'open',
    createdAt: new Date('2024-01-02T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-02T10:00:00Z').toISOString(),
    ...overrides,
  }
}

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ReferralList', () => {
  it('shows the empty state when there are no referrals', () => {
    renderWithRouter(
      <ReferralList referrals={[]} companyName="Acme" />,
    )
    expect(screen.getByTestId('referral-empty')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText(/no open referrals/i)).toBeInTheDocument()
    expect(screen.getByText(/acme/i)).toBeInTheDocument()
  })

  it('renders both offers and requests when both are present', () => {
    const referrals: Referral[] = [
      makeReferral({ _id: 'o1', type: 'offer', message: 'I can refer' }),
      makeReferral({ _id: 'r1', type: 'request', message: 'Looking for a referral' }),
    ]
    renderWithRouter(<ReferralList referrals={referrals} companyName="Acme" />)
    expect(screen.getByTestId('referral-list')).toBeInTheDocument()
    expect(screen.getByText(/open offers \(1\)/i)).toBeInTheDocument()
    expect(screen.getByText(/open requests \(1\)/i)).toBeInTheDocument()
    expect(screen.getAllByTestId('referral-item')).toHaveLength(2)
  })

  it('shows only offers section when there are no requests', () => {
    const referrals: Referral[] = [
      makeReferral({ _id: 'o1', type: 'offer' }),
    ]
    renderWithRouter(<ReferralList referrals={referrals} companyName="Acme" />)
    expect(screen.getByText(/open offers \(1\)/i)).toBeInTheDocument()
    expect(screen.queryByText(/open requests/i)).not.toBeInTheDocument()
  })

  it('shows only requests section when there are no offers', () => {
    const referrals: Referral[] = [
      makeReferral({ _id: 'r1', type: 'request' }),
    ]
    renderWithRouter(<ReferralList referrals={referrals} companyName="Acme" />)
    expect(screen.queryByText(/open offers/i)).not.toBeInTheDocument()
    expect(screen.getByText(/open requests \(1\)/i)).toBeInTheDocument()
  })

  it('renders referral company, role title, status badge, and posted date', () => {
    const referral = makeReferral({
      company: 'Globex',
      roleTitle: 'Staff Engineer',
      status: 'open',
      createdAt: '2024-03-15T00:00:00Z',
    })
    renderWithRouter(
      <ReferralList referrals={[referral]} companyName="Globex" />,
    )
    const item = screen.getByTestId('referral-item')
    expect(within(item).getByText('Globex')).toBeInTheDocument()
    expect(within(item).getByText(/staff engineer/i)).toBeInTheDocument()
    const status = screen.getByTestId('referral-status')
    expect(status).toHaveTextContent(/open/i)
    expect(within(item).getByText(/posted/i)).toBeInTheDocument()
  })

  it('shows Accept button only for open offers when onAccept provided', async () => {
    const user = userEvent.setup()
    const onAccept = vi.fn().mockResolvedValue(undefined)
    const referrals: Referral[] = [
      makeReferral({ _id: 'open-offer', type: 'offer', status: 'open' }),
      makeReferral({ _id: 'open-request', type: 'request', status: 'open' }),
      makeReferral({ _id: 'completed', type: 'offer', status: 'completed' }),
    ]
    renderWithRouter(
      <ReferralList
        referrals={referrals}
        companyName="Acme"
        onAccept={onAccept}
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /^accept$/i })
    expect(buttons).toHaveLength(1)

    await user.click(buttons[0])
    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onAccept).toHaveBeenCalledWith('open-offer')
  })

  it('disables Accept button while accept is in flight', async () => {
    const user = userEvent.setup()
    let resolveAccept!: () => void
    const onAccept = vi.fn(
      () => new Promise<void>(resolve => { resolveAccept = resolve }),
    )
    renderWithRouter(
      <ReferralList
        referrals={[makeReferral({ _id: 'a', type: 'offer', status: 'open' })]}
        companyName="Acme"
        onAccept={onAccept}
      />,
    )

    const button = screen.getByRole('button', { name: /^accept$/i })
    await user.click(button)
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent(/accepting/i)
    resolveAccept()
    await user.click(button).catch(() => undefined)
  })

  it('uses empty state primary action when provided', () => {
    const onClick = vi.fn()
    renderWithRouter(
      <ReferralList
        referrals={[]}
        companyName="Acme"
        emptyStatePrimary={{ label: 'Custom request', onClick }}
      />,
    )
    const button = screen.getByRole('button', { name: /custom request/i })
    expect(button).toBeInTheDocument()
  })

  it('does not show Request/Offer action buttons in non-empty state unless callbacks are passed', () => {
    renderWithRouter(
      <ReferralList
        referrals={[makeReferral()]}
        companyName="Acme"
      />,
    )
    expect(screen.queryByRole('button', { name: /request referral/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /offer referral/i })).not.toBeInTheDocument()
  })

  it('shows Request and Offer action buttons when callbacks provided', () => {
    renderWithRouter(
      <ReferralList
        referrals={[makeReferral()]}
        companyName="Acme"
        onRequest={vi.fn()}
        onOffer={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: /request referral/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /offer referral/i })).toBeInTheDocument()
  })
})
