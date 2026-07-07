import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReferralStatusBadge } from '../ReferralStatusBadge'

describe('ReferralStatusBadge', () => {
  it.each([
    ['open', 'Open'],
    ['matched', 'Matched'],
    ['accepted', 'Accepted'],
    ['completed', 'Completed'],
    ['withdrawn', 'Withdrawn'],
    ['expired', 'Expired'],
  ] as const)('renders the %s status with the expected label', (status, label) => {
    render(<ReferralStatusBadge status={status} />)
    const badge = screen.getByTestId('referral-status-badge')
    expect(badge).toHaveAttribute('data-status', status)
    expect(badge).toHaveTextContent(label)
  })

  it('merges a custom className into the rendered element', () => {
    render(<ReferralStatusBadge status="open" className="custom-class" />)
    const badge = screen.getByTestId('referral-status-badge')
    expect(badge).toHaveClass('custom-class')
  })

  it('renders a span by default', () => {
    render(<ReferralStatusBadge status="open" />)
    const badge = screen.getByTestId('referral-status-badge')
    expect(badge.tagName).toBe('SPAN')
  })
})
