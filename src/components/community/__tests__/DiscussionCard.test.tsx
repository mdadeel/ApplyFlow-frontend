import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DiscussionCard } from '../DiscussionCard'
import type { Discussion } from '../../../services/community/discussions'

function makeDiscussion(overrides: Partial<Discussion> = {}): Discussion {
  return {
    _id: 'disc-1',
    channel: 'resume-review',
    authorId: 'user-1',
    authorName: 'Alice Doe',
    title: 'How to polish a resume for a senior role',
    body: 'I have been working as a senior engineer for 6 years and want feedback on my resume.',
    replyCount: 3,
    helpfulCount: 7,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function renderCard(discussion: Discussion, includeChannelInHref = false) {
  return render(
    <MemoryRouter>
      <DiscussionCard
        discussion={discussion}
        includeChannelInHref={includeChannelInHref}
      />
    </MemoryRouter>,
  )
}

describe('DiscussionCard', () => {
  it('renders title and author name', () => {
    renderCard(makeDiscussion())

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: /how to polish a resume for a senior role/i,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/by alice doe/i)).toBeInTheDocument()
  })

  it('renders body preview', () => {
    renderCard(makeDiscussion())
    expect(screen.getByTestId('discussion-card-preview')).toHaveTextContent(
      /i have been working as a senior engineer/i,
    )
  })

  it('renders reply count with correct pluralization', () => {
    const { unmount } = renderCard(makeDiscussion({ replyCount: 1 }))
    expect(screen.getByTestId('discussion-card-replies')).toHaveTextContent(/^1 reply$/)
    unmount()

    renderCard(makeDiscussion({ _id: 'disc-2', replyCount: 5 }))
    expect(screen.getByTestId('discussion-card-replies')).toHaveTextContent(/^5 replies$/)
  })

  it('renders helpful count', () => {
    renderCard(makeDiscussion({ helpfulCount: 12 }))
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('renders channel label', () => {
    renderCard(makeDiscussion({ channel: 'interview-experience' }))
    expect(screen.getByText(/interview experience/i)).toBeInTheDocument()
  })

  it('shows pinned indicator when isPinned is true', () => {
    renderCard(makeDiscussion({ isPinned: true }))
    expect(screen.getByTestId('discussion-card-pinned')).toBeInTheDocument()
    expect(screen.getByText(/pinned/i)).toBeInTheDocument()
  })

  it('omits pinned indicator when isPinned is false', () => {
    renderCard(makeDiscussion({ isPinned: false }))
    expect(screen.queryByTestId('discussion-card-pinned')).not.toBeInTheDocument()
  })

  it('links to /community/discussions/:id by default', () => {
    renderCard(makeDiscussion({ _id: 'disc-link-1' }))
    const link = screen.getByTestId('discussion-card-title')
    expect(link).toHaveAttribute('href', '/community/discussions/disc-link-1')
  })

  it('links to /community/discussions/:channel/:id when includeChannelInHref is true', () => {
    renderCard(
      makeDiscussion({ _id: 'disc-link-2', channel: 'referral' }),
      true,
    )
    const link = screen.getByTestId('discussion-card-title')
    expect(link).toHaveAttribute(
      'href',
      '/community/discussions/referral/disc-link-2',
    )
  })

  it('omits author name when authorName is missing', () => {
    renderCard(makeDiscussion({ authorName: undefined }))
    expect(screen.queryByTestId('discussion-card-author')).not.toBeInTheDocument()
  })

  it('omits body preview when body is empty', () => {
    renderCard(makeDiscussion({ body: '' }))
    expect(screen.queryByTestId('discussion-card-preview')).not.toBeInTheDocument()
  })

  it('renders data-discussion-id attribute', () => {
    const { container } = renderCard(makeDiscussion({ _id: 'disc-attr-1' }))
    const article = container.querySelector('article')
    expect(article).toHaveAttribute('data-discussion-id', 'disc-attr-1')
  })
})
