import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../useLayout', () => ({
  useLayout: () => ({
    sidebarCollapsed: false,
    toggleSidebar: vi.fn(),
    mobileSidebarOpen: false,
    setMobileSidebarOpen: vi.fn(),
  }),
}))

import { Sidebar } from '../Sidebar'

function renderSidebar(initialPath = '/community/feed') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar />
    </MemoryRouter>,
  )
}

describe('Sidebar — Community navigation', () => {
  it('renders the Feed nav item', () => {
    renderSidebar()
    expect(screen.getByRole('link', { name: 'Feed' })).toBeInTheDocument()
  })

  it('renders all community items (Feed, Discussions, Referrals) alongside Jobs', () => {
    renderSidebar()
    const expectedItems = ['Feed', 'Discussions', 'Referrals', 'Jobs']
    for (const label of expectedItems) {
      expect(
        screen.getByRole('link', { name: label }),
        `expected to find nav item "${label}"`,
      ).toBeInTheDocument()
    }
  })

  it('marks the Feed item as current when the current path is /community/feed', () => {
    renderSidebar('/community/feed')
    const feedLink = screen.getByRole('link', { name: 'Feed' })
    expect(feedLink).toHaveAttribute('aria-current', 'page')
  })
})
