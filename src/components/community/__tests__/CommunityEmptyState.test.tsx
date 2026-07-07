import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommunityEmptyState } from '../CommunityEmptyState'
import { Sparkles } from '../../../lib/icons'

const renderWithRouter = (ui: React.ReactNode) =>
  render(<MemoryRouter>{ui}</MemoryRouter>)

describe('CommunityEmptyState', () => {
  it('renders the title and description', () => {
    renderWithRouter(
      <CommunityEmptyState
        icon={Sparkles}
        title="Nothing here yet"
        description="Come back later."
      />,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: /nothing here yet/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/come back later/i)).toBeInTheDocument()
  })

  it('renders the icon at the muted/large size', () => {
    const { container } = renderWithRouter(
      <CommunityEmptyState icon={Sparkles} title="t" description="d" />,
    )
    const iconWrapper = container.querySelector('svg')?.parentElement
    expect(iconWrapper).not.toBeNull()
    expect(iconWrapper?.className).toMatch(/text-on-surface-variant/)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class') ?? '').toMatch(/w-12/)
    expect(svg?.getAttribute('class') ?? '').toMatch(/h-12/)
  })

  it('renders a primary action as a Link when href is provided', () => {
    renderWithRouter(
      <CommunityEmptyState
        icon={Sparkles}
        title="t"
        description="d"
        primaryAction={{ label: 'Browse', href: '/community/opportunities' }}
      />,
    )
    const link = screen.getByRole('link', { name: /browse/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/community/opportunities')
  })

  it('renders a primary action as a button when only onClick is provided', async () => {
    const onClick = vi.fn()
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderWithRouter(
      <CommunityEmptyState
        icon={Sparkles}
        title="t"
        description="d"
        primaryAction={{ label: 'Click me', onClick }}
      />,
    )
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a secondary action with a separate handler', () => {
    const onSecondary = vi.fn()
    renderWithRouter(
      <CommunityEmptyState
        icon={Sparkles}
        title="t"
        description="d"
        primaryAction={{ label: 'Primary', href: '/x' }}
        secondaryAction={{ label: 'Secondary', onClick: onSecondary }}
      />,
    )
    expect(screen.getByRole('link', { name: /primary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument()
  })

  it('renders the example slot when provided', () => {
    renderWithRouter(
      <CommunityEmptyState
        icon={Sparkles}
        title="t"
        description="d"
        example={<div data-testid="example-content">Example card</div>}
      />,
    )
    const example = screen.getByTestId('empty-state-example')
    expect(example).toBeInTheDocument()
    expect(screen.getByTestId('example-content')).toBeInTheDocument()
  })

  it('does not render the example slot when omitted', () => {
    renderWithRouter(
      <CommunityEmptyState icon={Sparkles} title="t" description="d" />,
    )
    expect(screen.queryByTestId('empty-state-example')).not.toBeInTheDocument()
  })

  it('does not render any actions when none are provided', () => {
    renderWithRouter(
      <CommunityEmptyState icon={Sparkles} title="t" description="d" />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
