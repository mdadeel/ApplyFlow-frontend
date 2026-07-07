import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom'
import { FeedPage } from '../FeedPage'
import * as feedService from '../../../services/community/feed'
import { LayoutProvider } from '../../../components/layout/LayoutContext'
import { ToastProvider } from '../../../components/layout/ToastContext'

vi.mock('../../../services/community/feed', async () => {
  const actual = await vi.importActual<typeof feedService>('../../../services/community/feed')
  return {
    ...actual,
    getCommunityFeed: vi.fn(),
  }
})

function mockFeedResponse(tab: 'for-you' | 'trending' | 'my-activity') {
  const mocked = vi.mocked(feedService.getCommunityFeed)

  if (tab === 'for-you') {
    mocked.mockResolvedValueOnce({
      items: [
        {
          id: 'f-1',
          type: 'new_opportunity',
          title: 'Frontend Engineer at Acme',
          summary: 'React, TS · Remote',
          timestamp: new Date().toISOString(),
          entityId: 'opp-1',
          entityType: 'opportunity',
        },
        {
          id: 'f-2',
          type: 'deadline_approaching',
          title: 'Apply by Friday',
          summary: '2 days remaining',
          timestamp: new Date().toISOString(),
          entityId: 'opp-2',
          entityType: 'opportunity',
        },
      ],
      nextCursor: 'cursor-1',
      hasMore: true,
    })
  }

  if (tab === 'trending') {
    mocked.mockResolvedValueOnce({
      topCompanies: [{ company: 'Acme', count: 10 }, { company: 'Globex', count: 6 }],
      topSkills: [{ skill: 'TypeScript', count: 24, byLevel: { senior: 12 } }],
      salaryBands: [{ roleLevel: 'senior', min: 120000, max: 180000, count: 30 }],
      hiringVelocity: [
        { week: '2026-W22', count: 12 },
        { week: '2026-W23', count: 18 },
      ],
    })
  }

  if (tab === 'my-activity') {
    mocked.mockResolvedValueOnce({
      savedCount: 4,
      appliedCount: 2,
      contributionsCount: 1,
      referralsCount: 0,
      recentActions: [
        {
          id: 'a-1',
          type: 'saved_opportunity_update',
          title: 'Update on Staff Engineer',
          summary: 'New referral offer',
          timestamp: new Date().toISOString(),
          entityId: 'opp-9',
          entityType: 'opportunity',
        },
      ],
    })
  }

  return mocked
}

function renderFeed(initialPath = '/community/feed') {
  return render(
    <LayoutProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/community/feed" element={<FeedPage />} />
            <Route path="/community" element={<FeedPage />} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </LayoutProvider>,
  )
}

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page header, title, and CTA buttons', async () => {
    mockFeedResponse('for-you')

    renderFeed()

    expect(screen.getByRole('heading', { level: 1, name: /community/i })).toBeInTheDocument()
    const notifButton = screen.getByRole('button', { name: /notifications/i })
    expect(notifButton).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add opportunity/i })).toBeInTheDocument()

    // Wait for the default For You fetch to resolve so we don't leak pending timers.
    await waitFor(() => {
      expect(screen.getByText(/frontend engineer at acme/i)).toBeInTheDocument()
    })
  })

  it('renders all three tabs with proper accessibility roles', async () => {
    mockFeedResponse('for-you')

    renderFeed()

    const tablist = screen.getByRole('tablist', { name: /community feed tabs/i })
    expect(tablist).toBeInTheDocument()
    expect(within(tablist).getByRole('tab', { name: /^for you$/i })).toHaveAttribute('aria-selected', 'true')
    expect(within(tablist).getByRole('tab', { name: /^trending$/i })).toHaveAttribute('aria-selected', 'false')
    expect(within(tablist).getByRole('tab', { name: /^my activity$/i })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches tabs on click and refetches data', async () => {
    const user = userEvent.setup()
    mockFeedResponse('for-you')
    mockFeedResponse('trending')
    const mocked = vi.mocked(feedService.getCommunityFeed)

    renderFeed()

    // Initial fetch for For You.
    await waitFor(() => expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'for-you' }),
      expect.anything(),
    ))

    await user.click(screen.getByRole('tab', { name: /^trending$/i }))

    await waitFor(() => expect(mocked).toHaveBeenCalledWith(
      expect.objectContaining({ tab: 'trending' }),
      expect.anything(),
    ))

    // Trending widgets render.
    expect(await screen.findByText(/top companies hiring/i)).toBeInTheDocument()
    expect(screen.getByTestId('trending-companies')).toBeInTheDocument()
  })

  it('supports arrow-key navigation between tabs', async () => {
    const user = userEvent.setup()
    mockFeedResponse('for-you')
    mockFeedResponse('trending')

    renderFeed()

    const forYouTab = screen.getByRole('tab', { name: /^for you$/i })
    forYouTab.focus()

    await user.keyboard('{ArrowRight}')

    expect(screen.getByRole('tab', { name: /^trending$/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders the FeedSkeleton while loading', () => {
    vi.mocked(feedService.getCommunityFeed).mockReturnValue(new Promise(() => {}))

    renderFeed()

    expect(screen.getByTestId('feed-skeleton')).toBeInTheDocument()
  })

  it('renders the Trending widgets when on the Trending tab', async () => {
    const user = userEvent.setup()
    mockFeedResponse('for-you')
    mockFeedResponse('trending')

    renderFeed()

    await waitFor(() => expect(screen.getByText(/frontend engineer at acme/i)).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /^trending$/i }))

    expect(await screen.findByTestId('trending-grid')).toBeInTheDocument()
    expect(screen.getByTestId('trending-companies')).toHaveTextContent(/acme/i)
    expect(screen.getByTestId('trending-skills')).toHaveTextContent(/typescript/i)
    expect(screen.getByTestId('trending-salary')).toHaveTextContent(/senior/i)
    expect(screen.getByTestId('trending-velocity')).toBeInTheDocument()
  })

  it('renders the My Activity summary cards when on the My Activity tab', async () => {
    const user = userEvent.setup()
    mockFeedResponse('for-you')
    mockFeedResponse('my-activity')

    renderFeed()

    await waitFor(() => expect(screen.getByText(/frontend engineer at acme/i)).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: /^my activity$/i }))

    expect(await screen.findByTestId('my-activity-summary')).toBeInTheDocument()
    expect(screen.getByTestId('activity-saved')).toHaveTextContent(/saved/i)
    expect(screen.getByTestId('activity-saved').textContent).toMatch(/4/)
    expect(screen.getByTestId('activity-applied')).toHaveTextContent(/applied/i)
    expect(screen.getByTestId('activity-contributions')).toHaveTextContent(/contributions/i)
    expect(screen.getByTestId('activity-referrals')).toHaveTextContent(/referrals/i)

    // Recent actions list shows the seeded feed item.
    expect(screen.getByTestId('my-activity-recent')).toHaveTextContent(/update on staff engineer/i)
  })

  it('renders an empty state on the For You tab when no items are returned', async () => {
    const user = userEvent.setup()
    // Three fetches are triggered: initial For You, Trending (after click), and
    // the re-fetch when switching back to For You. Each must return a payload
    // matching its tab shape so the component does not crash on undefined data.
    vi.mocked(feedService.getCommunityFeed)
      .mockResolvedValueOnce(feedService.emptyForYouPage())
      .mockResolvedValueOnce(feedService.emptyTrending())
      .mockResolvedValueOnce(feedService.emptyForYouPage())

    renderFeed()

    expect(await screen.findByText(/your feed is quiet right now/i)).toBeInTheDocument()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()

    // Switch to Trending then back to For You to confirm re-fetch.
    await user.click(screen.getByRole('tab', { name: /^trending$/i }))
    await user.click(screen.getByRole('tab', { name: /^for you$/i }))
    expect(await screen.findByText(/your feed is quiet right now/i)).toBeInTheDocument()
  })

  it('shows an error retry card when the feed request fails', async () => {
    vi.mocked(feedService.getCommunityFeed).mockRejectedValueOnce(new Error('Network down'))

    renderFeed()

    expect(await screen.findByTestId('feed-error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^retry$/i })).toBeInTheDocument()
  })

  it('reflects the active tab in the URL search params', async () => {
    const user = userEvent.setup()
    mockFeedResponse('for-you')
    mockFeedResponse('trending')

    // BrowserRouter is required here so setSearchParams updates
    // window.location; MemoryRouter keeps URL state in memory only.
    window.history.replaceState({}, '', '/community/feed')
    render(
      <LayoutProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/community/feed" element={<FeedPage />} />
              <Route path="/community" element={<FeedPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </LayoutProvider>,
    )

    await user.click(screen.getByRole('tab', { name: /^trending$/i }))

    await waitFor(() => {
      // Window location reflects the URL state.
      expect(window.location.search).toContain('tab=trending')
    })
  })
})
