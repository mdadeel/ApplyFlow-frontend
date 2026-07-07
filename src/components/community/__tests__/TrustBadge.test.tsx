import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TrustBadge } from '../TrustBadge'

describe('TrustBadge', () => {
  it('renders a default verified badge with correct label', () => {
    render(<TrustBadge tone="verified" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent(/verified/i)
    expect(badge).toHaveAttribute('data-tone', 'verified')
  })

  it('applies success variant by default for verified tone', () => {
    render(<TrustBadge tone="verified" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-variant', 'success')
    expect(badge.className).toMatch(/emerald/)
  })

  it('applies primary variant for top-contributor tone', () => {
    render(<TrustBadge tone="top-contributor" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-variant', 'primary')
    expect(badge.className).toMatch(/primary/)
    expect(badge).toHaveTextContent(/top contributor/i)
  })

  it('applies info variant for trusted tone', () => {
    render(<TrustBadge tone="trusted" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-variant', 'info')
    expect(badge.className).toMatch(/blue/)
  })

  it('applies warning variant for new tone', () => {
    render(<TrustBadge tone="new" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-variant', 'warning')
    expect(badge.className).toMatch(/amber/)
  })

  it('overrides variant when explicitly provided', () => {
    render(<TrustBadge tone="verified" variant="danger" />)
    const badge = screen.getByTestId('trust-badge')
    expect(badge).toHaveAttribute('data-variant', 'danger')
    expect(badge.className).toMatch(/red/)
  })

  it('renders a custom label when provided', () => {
    render(<TrustBadge tone="verified" label="Email Confirmed" />)
    expect(screen.getByTestId('trust-badge')).toHaveTextContent(/email confirmed/i)
  })

  it('renders children content instead of label when provided', () => {
    render(
      <TrustBadge tone="verified">
        <span data-testid="custom-child">Custom Content</span>
      </TrustBadge>,
    )
    expect(screen.getByTestId('custom-child')).toBeInTheDocument()
    expect(screen.getByTestId('trust-badge')).toHaveTextContent(/custom content/i)
  })

  it('renders an SVG icon with a fill weight', () => {
    const { container } = render(<TrustBadge tone="verified" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('width') ?? '').toMatch(/12/)
    expect(svg?.getAttribute('height') ?? '').toMatch(/12/)
  })

  it('appends extra className', () => {
    render(<TrustBadge tone="verified" className="ml-2" />)
    expect(screen.getByTestId('trust-badge').className).toMatch(/ml-2/)
  })

  it('sets a title attribute matching the label for accessibility', () => {
    render(<TrustBadge tone="trusted" />)
    expect(screen.getByTestId('trust-badge')).toHaveAttribute('title', 'Trusted')
  })
})
