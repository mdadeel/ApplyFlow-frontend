import { test, expect, type Route } from '@playwright/test'

// ── URL pattern constants ──────────────────────────────────────────────────

const FEED_URL = '**/api/v1/community/feed**'
const OPPORTUNITIES_URL = '**/api/opportunities**'
const OPPORTUNITIES_SEARCH_URL = '**/api/opportunities/search**'
const DISCUSSIONS_URL = '**/api/discussions**'
const REFERRALS_URL = '**/api/referrals**'
const NOTIFICATIONS_URL = '**/api/notifications**'
const SAVED_URL = '**/api/saved-opportunities**'
const REPUTATION_URL = '**/api/reputation**'
const PROFILE_URL = '**/api/profile**'

// ── Mock data factories ────────────────────────────────────────────────────

function mockFeedForYou() {
  return {
    items: [
      {
        id: 'e2e-feed-1',
        type: 'new_opportunity',
        title: 'Senior Frontend Engineer at Acme',
        summary: 'React, TypeScript, Tailwind · Remote · $150k-$200k',
        timestamp: new Date().toISOString(),
        entityId: 'opp-e2e-1',
        entityType: 'opportunity',
      },
      {
        id: 'e2e-feed-2',
        type: 'deadline_approaching',
        title: 'Apply by Friday — Staff Engineer at Globex',
        summary: '2 days remaining',
        timestamp: new Date().toISOString(),
        entityId: 'opp-e2e-2',
        entityType: 'opportunity',
      },
    ],
    nextCursor: null,
    hasMore: false,
  }
}

function mockFeedTrending() {
  return {
    topCompanies: [
      { company: 'Acme Corp', count: 12 },
      { company: 'Globex Inc', count: 8 },
    ],
    topSkills: [
      { skill: 'TypeScript', count: 24, byLevel: { senior: 12, mid: 10 } },
      { skill: 'React', count: 20, byLevel: { senior: 10, mid: 8 } },
    ],
    salaryBands: [
      { roleLevel: 'senior', min: 120000, max: 200000, count: 35 },
      { roleLevel: 'mid', min: 80000, max: 140000, count: 20 },
    ],
    hiringVelocity: [
      { week: '2026-W25', count: 15 },
      { week: '2026-W26', count: 22 },
    ],
  }
}

function mockFeedMyActivity() {
  return {
    savedCount: 3,
    appliedCount: 1,
    contributionsCount: 2,
    referralsCount: 0,
    recentActions: [
      {
        id: 'e2e-activity-1',
        type: 'saved_opportunity_update',
        title: 'Update on Senior Frontend Engineer at Acme',
        summary: 'New referral offer available',
        timestamp: new Date().toISOString(),
        entityId: 'opp-e2e-1',
        entityType: 'opportunity',
      },
    ],
  }
}

function mockOpportunities() {
  return [
    {
      _id: 'opp-e2e-1',
      title: 'Senior Frontend Engineer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      locationType: 'hybrid',
      description: 'Build the next generation of UI at scale.',
      salaryMin: 150000,
      salaryMax: 200000,
      salaryCurrency: 'USD',
      salaryInterval: 'yearly',
      roleLevel: 'senior',
      employmentType: 'full-time',
      requiredSkills: ['React', 'TypeScript', 'Tailwind CSS'],
      preferredSkills: ['GraphQL', 'Next.js'],
      source: 'manual',
      averageMatchScore: 0.82,
      totalContributions: 5,
      totalWorkspaces: 2,
      referralAvailable: true,
      referralCount: 2,
      isExpired: false,
      pipelineStatus: 'open',
      aiConfidence: 0.85,
      createdBy: 'user-1',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'opp-e2e-2',
      title: 'Staff Engineer',
      company: 'Globex Inc',
      location: 'Remote',
      locationType: 'remote',
      description: 'Lead architecture decisions for our platform team.',
      salaryMin: 180000,
      salaryMax: 250000,
      salaryCurrency: 'USD',
      salaryInterval: 'yearly',
      roleLevel: 'staff',
      employmentType: 'full-time',
      requiredSkills: ['System Design', 'TypeScript', 'AWS'],
      preferredSkills: ['Kubernetes', 'GraphQL'],
      source: 'manual',
      averageMatchScore: 0.65,
      totalContributions: 2,
      totalWorkspaces: 0,
      referralAvailable: false,
      isExpired: false,
      pipelineStatus: 'open',
      aiConfidence: 0.9,
      createdBy: 'user-2',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}

function mockDiscussions(channel?: string) {
  const all: Array<{
    _id: string; channel: string; authorId: string; authorName: string;
    title: string; body: string; replyCount: number; helpfulCount: number;
    createdAt: string; updatedAt: string; isPinned?: boolean;
  }> = [
    {
      _id: 'disc-e2e-1',
      channel: 'general',
      authorId: 'user-1',
      authorName: 'Alice Smith',
      title: 'What skills are most in demand right now?',
      body: 'I am seeing a lot of AI/ML roles but my background is in frontend. Is it worth pivoting?',
      replyCount: 8,
      helpfulCount: 15,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: true,
    },
    {
      _id: 'disc-e2e-2',
      channel: 'resume-review',
      authorId: 'user-2',
      authorName: 'Bob Jones',
      title: 'Can someone review my resume?',
      body: 'I have been applying for 3 months with no callbacks.',
      replyCount: 3,
      helpfulCount: 7,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'disc-e2e-3',
      channel: 'interview-experience',
      authorId: 'user-3',
      authorName: 'Carol Chen',
      title: 'Google onsite interview experience',
      body: 'Just completed my Google onsite. Here is my detailed breakdown.',
      replyCount: 12,
      helpfulCount: 32,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  if (channel) return all.filter(d => d.channel === channel)
  return all
}

function mockReferrals(type: 'request' | 'offer' | undefined) {
  const all = [
    {
      _id: 'ref-e2e-1',
      type: 'offer',
      userId: 'user-1',
      company: 'Stripe',
      roleTitle: 'Senior Frontend Engineer',
      location: 'Remote',
      roleLevel: 'senior',
      message: 'Happy to refer strong frontend candidates to my team at Stripe. Looking for React and TypeScript expertise.',
      status: 'open',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'ref-e2e-2',
      type: 'request',
      userId: 'user-2',
      company: 'Netflix',
      roleTitle: 'Senior UX Designer',
      location: 'Los Angeles, CA',
      roleLevel: 'senior',
      message: 'Looking for a referral to Netflix for a Senior UX role. I have 6 years of experience in product design.',
      status: 'open',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  if (type) return all.filter(r => r.type === type)
  return all
}

function mockNotifications() {
  return {
    items: [
      {
        _id: 'notif-e2e-1',
        userId: 'user-test',
        type: 'referral_accepted',
        title: 'Referral accepted',
        message: 'Bob Jones accepted your referral offer at Stripe.',
        read: false,
        dismissed: false,
        link: '/community/referrals',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        _id: 'notif-e2e-2',
        userId: 'user-test',
        type: 'new_comment',
        title: 'New reply on your discussion',
        message: 'Carol commented on "What skills are in demand?"',
        read: false,
        dismissed: false,
        link: '/community/discussions/general/disc-e2e-1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'notif-e2e-3',
        userId: 'user-test',
        type: 'company_hiring',
        title: 'Acme Corp is hiring',
        message: 'New Senior Frontend Engineer role posted at Acme Corp',
        read: true,
        dismissed: false,
        link: '/community/opportunities/opp-e2e-1',
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: 'notif-e2e-4',
        userId: 'user-test',
        type: 'mention',
        title: 'You were mentioned',
        message: 'Alice mentioned you in a discussion about skill trends.',
        read: false,
        dismissed: false,
        link: '/community/discussions/general/disc-e2e-1',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
    unreadCount: 3,
  }
}

// ── Mock setup helper ──────────────────────────────────────────────────────

async function mockCommunityAPIs(page: import('@playwright/test').Page) {
  // Feed endpoints
  await page.route(FEED_URL, async (route: Route) => {
    const url = new URL(route.request().url())
    const tab = url.searchParams.get('tab') || 'for-you'
    let data: unknown
    if (tab === 'trending') {
      data = mockFeedTrending()
    } else if (tab === 'my-activity') {
      data = mockFeedMyActivity()
    } else {
      data = mockFeedForYou()
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data }),
    })
  })

  // Opportunities endpoints
  await page.route(OPPORTUNITIES_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockOpportunities() }),
    })
  })

  await page.route(OPPORTUNITIES_SEARCH_URL, async (route: Route) => {
    const url = new URL(route.request().url())
    const q = url.searchParams.get('q')?.toLowerCase() || ''
    const items = mockOpportunities().filter(
      opp =>
        opp.title.toLowerCase().includes(q) ||
        opp.company.toLowerCase().includes(q) ||
        opp.requiredSkills.some(s => s.toLowerCase().includes(q)),
    )
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { items, total: items.length, suggestions: [] } }),
    })
  })

  // Discussions endpoints
  await page.route(DISCUSSIONS_URL, async (route: Route) => {
    const url = new URL(route.request().url())
    const pathname = url.pathname

    // GET /discussions — list
    if (route.request().method() === 'GET' && pathname === '/api/discussions') {
      const channel = url.searchParams.get('channel') as DiscussionChannel | null
      const data = channel ? mockDiscussions(channel) : mockDiscussions()
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data }),
      })
      return
    }

    // GET /discussions/:id — single discussion with replies
    if (route.request().method() === 'GET' && pathname.startsWith('/api/discussions/')) {
      const id = pathname.replace('/api/discussions/', '')
      const discussion = mockDiscussions().find(d => d._id === id) || mockDiscussions()[0]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            discussion,
            replies: [
              {
                _id: 'reply-e2e-1',
                discussionId: id,
                authorId: 'user-2',
                authorName: 'Bob Jones',
                body: 'Great question! I think TypeScript is the most valuable skill right now.',
                helpfulCount: 5,
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              },
              {
                _id: 'reply-e2e-2',
                discussionId: id,
                authorId: 'user-3',
                authorName: 'Carol Chen',
                body: 'I agree. TypeScript + React is a powerful combo.',
                helpfulCount: 3,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              },
            ],
          },
        }),
      })
      return
    }

    // POST /discussions — create
    if (route.request().method() === 'POST' && pathname === '/api/discussions') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            _id: 'disc-e2e-new',
            channel: 'general',
            authorId: 'user-test',
            authorName: 'Test User',
            title: 'E2E Test Discussion',
            body: 'This is a test discussion created by Playwright.',
            replyCount: 0,
            helpfulCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
      return
    }

    // Fallback
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockDiscussions() }),
    })
  })

  // Referrals endpoints
  await page.route(REFERRALS_URL, async (route: Route) => {
    const url = new URL(route.request().url())

    if (route.request().method() === 'GET') {
      const typeParam = url.searchParams.get('type') as 'request' | 'offer' | null
      const data = {
        items: typeParam ? mockReferrals(typeParam) : mockReferrals(undefined),
        total: typeParam ? mockReferrals(typeParam).length : mockReferrals(undefined).length,
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data }),
      })
      return
    }

    // POST — create referral
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            _id: 'ref-e2e-new',
            type: 'request',
            userId: 'user-test',
            company: 'Test Company',
            roleTitle: 'Test Role',
            location: 'Remote',
            roleLevel: 'senior',
            message: 'This is a test referral request.',
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }),
      })
    }
  })

  // Notifications endpoint
  await page.route(NOTIFICATIONS_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: mockNotifications() }),
    })
  })

  // Saved opportunities
  await page.route(SAVED_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    })
  })

  // Reputation
  await page.route(REPUTATION_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          'user-1': { userId: 'user-1', helpfulVotesReceived: 45, contributionsCount: 12, reviewsGiven: 8, referralsGiven: 3, referralsSuccessful: 2, level: 'trusted' },
          'user-2': { userId: 'user-2', helpfulVotesReceived: 12, contributionsCount: 5, reviewsGiven: 2, referralsGiven: 1, referralsSuccessful: 0, level: 'active' },
          'user-3': { userId: 'user-3', helpfulVotesReceived: 78, contributionsCount: 25, reviewsGiven: 15, referralsGiven: 8, referralsSuccessful: 6, level: 'expert' },
        },
      }),
    })
  })

  // Profile (loaded by sidebar)
  await page.route(PROFILE_URL, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { name: 'Test User', email: 'test@applyflow.ai' } }),
    })
  })
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe('Community Module (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await mockCommunityAPIs(page)
  })

  // ── Navigation ─────────────────────────────────────────────────────────

  test.describe('Navigation', () => {
    test('sidebar shows community nav items under Network section', async ({ page }) => {
      await page.goto('/dashboard')
      const sidebar = page.locator('aside[aria-label="Main navigation"]')

      await expect(sidebar.getByText('Network')).toBeVisible()
      await expect(sidebar.getByLabel('Feed')).toBeVisible()
      await expect(sidebar.getByLabel('Discussions')).toBeVisible()
      await expect(sidebar.getByLabel('Referrals')).toBeVisible()
    })

    test('Feed link navigates to /community/feed', async ({ page }) => {
      await page.goto('/dashboard')
      await page.getByLabel('Feed').click()
      await expect(page).toHaveURL('/community/feed')
    })

    test('Discussions link navigates to /community/discussions', async ({ page }) => {
      await page.goto('/dashboard')
      await page.getByLabel('Discussions').click()
      await expect(page).toHaveURL('/community/discussions')
    })

    test('Referrals link navigates to /community/referrals', async ({ page }) => {
      await page.goto('/dashboard')
      await page.getByLabel('Referrals').click()
      await expect(page).toHaveURL('/community/referrals')
    })

    test('/community redirects to /community/feed', async ({ page }) => {
      await page.goto('/community')
      await expect(page).toHaveURL('/community/feed')
    })
  })

  // ── Feed Page ──────────────────────────────────────────────────────────

  test.describe('Feed Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/community/feed')
    })

    test('renders the page header with title and Add Opportunity button', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1, name: /community/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /add opportunity/i })).toBeVisible()
    })

    test('renders all three tabs with For You active by default', async ({ page }) => {
      const tablist = page.getByRole('tablist', { name: /community feed tabs/i })
      await expect(tablist).toBeVisible()

      await expect(tablist.getByRole('tab', { name: /^for you$/i })).toHaveAttribute('aria-selected', 'true')
      await expect(tablist.getByRole('tab', { name: /^trending$/i })).toHaveAttribute('aria-selected', 'false')
      await expect(tablist.getByRole('tab', { name: /^my activity$/i })).toHaveAttribute('aria-selected', 'false')
    })

    test('For You tab renders feed items with titles and summaries', async ({ page }) => {
      await expect(page.getByText('Senior Frontend Engineer at Acme')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Apply by Friday — Staff Engineer at Globex')).toBeVisible()
      await expect(page.getByText('React, TypeScript, Tailwind · Remote · $150k-$200k')).toBeVisible()
    })

    test('switching to Trending tab shows analytics widgets', async ({ page }) => {
      await page.getByRole('tab', { name: /^trending$/i }).click()

      await expect(page.getByTestId('trending-grid')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Top companies hiring')).toBeVisible()
      await expect(page.getByText('Trending skills')).toBeVisible()
      await expect(page.getByText('Salary bands')).toBeVisible()
      await expect(page.getByText('Hiring velocity')).toBeVisible()
    })

    test('switching to My Activity tab shows summary cards', async ({ page }) => {
      await page.getByRole('tab', { name: /^my activity$/i }).click()

      await expect(page.getByTestId('my-activity-summary')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByTestId('activity-saved')).toContainText('3')
      await expect(page.getByTestId('activity-applied')).toContainText('1')
      await expect(page.getByTestId('activity-contributions')).toContainText('2')
      await expect(page.getByTestId('activity-referrals')).toContainText('0')
    })

    test('top bar notification bell is visible on feed page', async ({ page }) => {
      await expect(page.getByLabel('Notifications')).toBeVisible()
    })
  })

  // ── Opportunities Browser ─────────────────────────────────────────────

  test.describe('Opportunities Browser', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/community/opportunities')
    })

    test('renders the page title and opportunities list', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1, name: /opportunities/i })).toBeVisible()
      await expect(page.getByText('Senior Frontend Engineer')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Acme Corp')).toBeVisible()
      await expect(page.getByText('Staff Engineer')).toBeVisible()
      await expect(page.getByText('Globex Inc')).toBeVisible()
    })

    test('renders opportunity details: location type, skills, match score', async ({ page }) => {
      const firstCard = page.getByText('Senior Frontend Engineer').locator('..')
      await expect(firstCard).toContainText('hybrid')

      // Skills chips
      await expect(page.getByText('React').first()).toBeVisible()
      await expect(page.getByText('TypeScript').first()).toBeVisible()

      // Match score badge (82% from mock)
      await expect(page.getByText('82% match')).toBeVisible()
    })

    test('shows referral indicators when available', async ({ page }) => {
      await expect(page.getByTestId('opportunity-referral-indicator').first()).toBeVisible()
      await expect(page.getByText('2 referrals')).toBeVisible()
    })
  })

  // ── Discussions ────────────────────────────────────────────────────────

  test.describe('Discussions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/community/discussions')
    })

    test('renders discussion list with cards', async ({ page }) => {
      await expect(page.getByText('All discussions')).toBeVisible()
      await expect(page.getByText('What skills are most in demand right now?')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Can someone review my resume?')).toBeVisible()
      await expect(page.getByText('Google onsite interview experience')).toBeVisible()
    })

    test('renders channel navigation sidebar', async ({ page }) => {
      const nav = page.getByTestId('channel-nav')
      await expect(nav).toBeVisible()

      await expect(page.getByTestId('channel-nav-all')).toBeVisible()
      await expect(page.getByTestId('channel-nav-general')).toBeVisible()
      await expect(page.getByTestId('channel-nav-resume-review')).toContainText('Resume Review')
      await expect(page.getByTestId('channel-nav-interview-experience')).toContainText('Interview Experience')
      await expect(page.getByTestId('channel-nav-referral')).toContainText('Referrals')
    })

    test('filtering by channel shows only matching discussions', async ({ page }) => {
      await page.getByTestId('channel-nav-resume-review').click()

      await expect(page).toHaveURL(/\/community\/discussions\/resume-review/)
      await expect(page.getByText('Can someone review my resume?')).toBeVisible({ timeout: 10_000 })
      // Should NOT show general channel discussions
      await expect(page.getByText('What skills are most in demand right now?')).toBeHidden()
    })

    test('clicking a discussion card navigates to the thread', async ({ page }) => {
      await page.getByText('What skills are most in demand right now?').click()
      await expect(page).toHaveURL(/\/community\/discussions\/general\/disc-e2e-1/)
    })

    test('discussion thread shows replies and reply form', async ({ page }) => {
      await page.getByText('What skills are most in demand right now?').click()
      await expect(page).toHaveURL(/\/community\/discussions\/general\/disc-e2e-1/)

      // Thread title
      await expect(page.getByTestId('discussion-thread-title')).toContainText('What skills are most in demand right now?')

      // Replies section
      await expect(page.getByText('Replies (2)')).toBeVisible()
      await expect(page.getByText('Great question! I think TypeScript is the most valuable skill right now.')).toBeVisible()
      await expect(page.getByText('I agree. TypeScript + React is a powerful combo.')).toBeVisible()

      // Reply form
      await expect(page.getByText('Add a reply')).toBeVisible()
    })

    test('Start a discussion button navigates to create page', async ({ page }) => {
      await page.getByRole('button', { name: /start a discussion/i }).click()
      await expect(page).toHaveURL(/\/community\/discussions\/new/)
    })

    test('create discussion page has form fields', async ({ page }) => {
      await page.getByRole('button', { name: /start a discussion/i }).click()

      await expect(page.getByRole('heading', { name: /new discussion/i })).toBeVisible()
      await expect(page.getByTestId('discussion-title')).toBeVisible()
      await expect(page.getByTestId('discussion-body')).toBeVisible()
      await expect(page.getByTestId('discussion-channel')).toBeVisible()
      await expect(page.getByRole('button', { name: /post discussion/i })).toBeVisible()
    })
  })

  // ── Referrals ──────────────────────────────────────────────────────────

  test.describe('Referrals', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/community/referrals')
    })

    test('renders the referrals page with header and CTAs', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1, name: /referrals/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /offer a referral/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /request a referral/i })).toBeVisible()
    })

    test('shows Open Requests tab by default with referral cards', async ({ page }) => {
      await expect(page.getByTestId('referral-card')).toBeVisible({ timeout: 10_000 })
      // Open Requests tab filters to type='request'
      await expect(page.getByText('Netflix')).toBeVisible()
      await expect(page.getByText('Senior UX Designer')).toBeVisible()
    })

    test('switching to Open Offers tab shows offer-type cards', async ({ page }) => {
      await page.getByRole('tab', { name: /open offers/i }).click()

      await expect(page.getByTestId('referral-card')).toBeVisible({ timeout: 10_000 })
      await expect(page.getByText('Stripe')).toBeVisible()
      await expect(page.getByText('Senior Frontend Engineer')).toBeVisible()
    })

    test('switching to My Referrals tab shows empty state', async ({ page }) => {
      await page.getByRole('tab', { name: /my referrals/i }).click()

      await expect(page.getByTestId('referrals-empty')).toBeVisible({ timeout: 10_000 })
    })

    test('Offer a referral button navigates to offer page', async ({ page }) => {
      await page.getByRole('button', { name: /offer a referral/i }).click()
      await expect(page).toHaveURL(/\/community\/referrals\/offer/)
    })

    test('Request a referral button navigates to request page', async ({ page }) => {
      await page.getByRole('button', { name: /request a referral/i }).click()
      await expect(page).toHaveURL(/\/community\/referrals\/request/)
    })

    test('request referral form submits successfully', async ({ page }) => {
      await page.getByRole('button', { name: /request a referral/i }).click()

      await expect(page.getByRole('heading', { name: /request a referral/i })).toBeVisible()

      await page.getByLabel('Company *').fill('Playwright Corp')
      await page.getByLabel('Target role').fill('Senior Test Engineer')
      await page.getByLabel('Message *').fill('I have extensive experience with Playwright and want to join your testing infrastructure team.')

      await page.getByRole('button', { name: /submit request/i }).click()

      // Should navigate back to referrals page after success
      await expect(page).toHaveURL(/\/community\/referrals/, { timeout: 10_000 })
    })
  })

  // ── Notifications ──────────────────────────────────────────────────────

  test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/community/notifications')
    })

    test('renders the notifications page with heading', async ({ page }) => {
      await expect(page.getByRole('heading', { level: 1, name: /notifications/i })).toBeVisible()
    })

    test('shows notification items with type icons and message content', async ({ page }) => {
      const rows = page.getByTestId('notification-row')
      await expect(rows).toHaveCount(4)

      await expect(page.getByText('Referral accepted')).toBeVisible()
      await expect(page.getByText('New reply on your discussion')).toBeVisible()
      await expect(page.getByText('Acme Corp is hiring')).toBeVisible()
      await expect(page.getByText('You were mentioned')).toBeVisible()
    })

    test('unread notifications have unread styling and count badge', async ({ page }) => {
      // Unread count badge in header
      await expect(page.getByText('3').first()).toBeVisible() // 3 unread from mock

      // Mark all read button visible when unread > 0
      await expect(page.getByRole('button', { name: /mark all read/i })).toBeVisible()
    })

    test('renders inline action buttons for referral_accepted notification', async ({ page }) => {
      // Referral accepted notification should have "View referral" action
      const referralNotif = page.getByTestId('notification-row').filter({ hasText: 'Referral accepted' })
      await expect(referralNotif.getByTestId('notification-action-view-referral')).toBeVisible()
    })

    test('renders inline action buttons for mention notification', async ({ page }) => {
      // Mention notification should have "Reply" action
      const mentionNotif = page.getByTestId('notification-row').filter({ hasText: 'You were mentioned' })
      await expect(mentionNotif.getByTestId('notification-action-reply')).toBeVisible()
      await expect(mentionNotif.getByTestId('notification-action-view')).toBeVisible()
    })

    test('renders inline action buttons for company_hiring notification', async ({ page }) => {
      // Company hiring notification should have "Save opportunity" and "View"
      const hiringNotif = page.getByTestId('notification-row').filter({ hasText: 'Acme Corp is hiring' })
      await expect(hiringNotif.getByTestId('notification-action-save')).toBeVisible()
      await expect(hiringNotif.getByTestId('notification-action-view')).toBeVisible()
    })

    test('mark all read hides the unread badge', async ({ page }) => {
      await page.getByRole('button', { name: /mark all read/i }).click()
      // After clicking, all notifications are marked read
      // The unread count badge should disappear
      await expect(page.getByText('3').first()).not.toBeVisible()
    })
  })

  // ── Empty states ───────────────────────────────────────────────────────

  test.describe('Empty States', () => {
    test('feed page shows empty state when no items returned', async ({ page }) => {
      await page.route(FEED_URL, async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { items: [], nextCursor: null, hasMore: false },
          }),
        })
      })

      await page.goto('/community/feed')
      await expect(page.getByText('Your feed is quiet right: 10_000 })
      await expect(page.getByTestId('empty-state')).toBeVisible()
    })

    test('notifications page shows empty state when no notifications', async ({ page }) => {
      await page.route(NOTIFICATIONS_URL, async (route: Route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { items: [], unreadCount: 0 } }),
        })
      })

      await page.goto('/community/notifications')
      await expect(page.getByText('All caught up')).toBeVisible({ timeout: 10_000 })
    })
  })
})
