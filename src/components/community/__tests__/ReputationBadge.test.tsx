import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReputationBadge } from '../ReputationBadge'
import type { ReputationLevel } from '../../../services/community/reputation'

function renderBadge(level: ReputationLevel) {
  return render(<ReputationBadge level={level} />)
}

describe('ReputationBadge', () => {
  it('renders "New" for new reputation level', () => {
    renderBadge('new')
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-tone', 'new')
    expect(badge).toHaveTextContent(/new/i)
  })

  it('renders "Active" for active reputation level', () => {
    renderBadge('active')
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-tone', 'verified')
    expect(badge).toHaveTextContent(/active/i)
  })

  it('renders "Trusted" for trusted reputation level', () => {
    renderBadge('trusted')
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-tone', 'trusted')
    expect(badge).toHaveTextContent(/trusted/i)
  })

  it('renders "Expert" for expert reputation level', () => {
    renderBadge('expert')
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-tone', 'top-contributor')
    expect(badge).toHaveTextContent(/expert/i)
  })

  it('renders an SVG icon inside the badge', () => {
    renderBadge('expert')
    const badge = screen.getByTestId('trust-badge')
    // TrustBadge renders an icon SVG element
    const svg = badge.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    render(<ReputationBadge level="trusted" className="my-custom-class" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge.className).toContain('my-custom-class')
  })
})
