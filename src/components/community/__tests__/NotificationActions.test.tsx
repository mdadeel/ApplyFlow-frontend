import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { NotificationActions } from '../NotificationActions'
import type { CommunityNotification } from '../../../services/community/notifications'

function makeNotification(
  overrides: Partial<CommunityNotification> = {},
): CommunityNotification {
  return {
    _id: 'notif-1',
    userId: 'user-1',
    type: 'system',
    title: 'A system event',
    message: 'Hello world',
    read: false,
    dismissed: false,
    link: '/community/opportunities/opp-1',
    createdAt: '2026-07-06T12:00:00.000Z',
    ...overrides,
  }
}

interface RenderOptions {
  onAcceptReferral?: (id: string) => void
  onDismissJob?: (id: string) => void
  onReply?: (id: string) => void
  onSaveOpportunity?: (id: string) => void
  onView: (link: string) => void
  notification: CommunityNotification
}

function renderActions(opts: RenderOptions) {
  return render(
    <MemoryRouter>
      <NotificationActions
        notification={opts.notification}
        onAcceptReferral={opts.onAcceptReferral}
        onDismissJob={opts.onDismissJob}
        onReply={opts.onReply}
        onSaveOpportunity={opts.onSaveOpportunity}
        onView={opts.onView}
      />
    </MemoryRouter>,
  )
}

describe('NotificationActions', () => {
  it('renders a "View referral" button for referral_accepted', () => {
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'referral_accepted',
        link: '/community/referrals/abc',
      }),
      onView,
    })

    const button = screen.getByTestId('notification-action-view-referral')
    expect(button).toHaveTextContent(/view referral/i)
  })

  it('clicking the "View referral" button navigates to notification.link', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'referral_accepted',
        link: '/community/referrals/abc',
      }),
      onView,
    })

    await user.click(screen.getByTestId('notification-action-view-referral'))

    expect(onView).toHaveBeenCalledTimes(1)
    expect(onView).toHaveBeenCalledWith('/community/referrals/abc')
  })

  it('renders "Reply" + "View" actions for new_comment and uses onReply when provided', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    const onReply = vi.fn()
    renderActions({
      notification: makeNotification({
        _id: 'cmt-1',
        type: 'new_comment',
        link: '/community/discussions/general/d-1',
      }),
      onReply,
      onView,
    })

    const reply = screen.getByTestId('notification-action-reply')
    expect(reply).toHaveTextContent(/^reply$/i)
    const view = screen.getByTestId('notification-action-view')
    expect(view).toBeInTheDocument()

    await user.click(reply)
    expect(onReply).toHaveBeenCalledWith('cmt-1')
    expect(onView).not.toHaveBeenCalled()
  })

  it('falls back to onView for "Reply" when onReply is not provided', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'mention',
        link: '/community/discussions/general/d-2',
      }),
      onView,
    })

    await user.click(screen.getByTestId('notification-action-reply'))

    expect(onView).toHaveBeenCalledWith('/community/discussions/general/d-2')
  })

  it('renders "View feedback" for resume_feedback notifications', () => {
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'resume_feedback',
        link: '/community/profile/resume',
      }),
      onView,
    })

    const button = screen.getByTestId('notification-action-view-feedback')
    expect(button).toHaveTextContent(/view feedback/i)
  })

  it('clicking "View feedback" calls onView with notification.link', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'resume_feedback',
        link: '/community/profile/resume',
      }),
      onView,
    })

    await user.click(screen.getByTestId('notification-action-view-feedback'))
    expect(onView).toHaveBeenCalledWith('/community/profile/resume')
  })

  it('renders Save + Dismiss + View for company_hiring', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    const onSave = vi.fn()
    const onDismiss = vi.fn()
    renderActions({
      notification: makeNotification({
        _id: 'hire-1',
        type: 'company_hiring',
        link: '/community/opportunities/h-1',
      }),
      onSaveOpportunity: onSave,
      onDismissJob: onDismiss,
      onView,
    })

    await user.click(screen.getByTestId('notification-action-save'))
    await user.click(screen.getByTestId('notification-action-dismiss'))
    await user.click(screen.getByTestId('notification-action-view'))

    expect(onSave).toHaveBeenCalledWith('hire-1')
    expect(onDismiss).toHaveBeenCalledWith('hire-1')
    expect(onView).toHaveBeenCalledWith('/community/opportunities/h-1')
  })

  it('renders Save + View for match_found (no dismiss handler)', () => {
    const onView = vi.fn()
    const onSave = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'match_found',
        link: '/community/opportunities/m-1',
      }),
      onSaveOpportunity: onSave,
      onView,
    })

    expect(screen.getByTestId('notification-action-save')).toBeInTheDocument()
    expect(screen.getByTestId('notification-action-view')).toBeInTheDocument()
    expect(screen.queryByTestId('notification-action-dismiss')).not.toBeInTheDocument()
  })

  it('renders Save + View for deadline_approaching', () => {
    const onView = vi.fn()
    const onSave = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'deadline_approaching',
        link: '/community/opportunities/d-1',
      }),
      onSaveOpportunity: onSave,
      onView,
    })

    expect(screen.getByTestId('notification-action-save')).toBeInTheDocument()
    expect(screen.getByTestId('notification-action-view')).toBeInTheDocument()
  })

  it('renders only "View" for unhandled types and falls back to /community/notifications when link is missing', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'status_change',
        link: undefined,
      }),
      onView,
    })

    const button = screen.getByTestId('notification-action-view')
    expect(button).toHaveTextContent(/^view$/i)
    await user.click(button)
    expect(onView).toHaveBeenCalledWith('/community/notifications')
  })

  it('renders the container with the notification type data attribute', () => {
    const onView = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'application_collaboration',
        link: '/community/workspace/w-1',
      }),
      onView,
    })

    const container = screen.getByTestId('notification-actions')
    expect(container).toHaveAttribute('data-notification-type', 'application_collaboration')
  })

  it('exposes the Save button with aria-label "Save opportunity"', () => {
    const onView = vi.fn()
    const onSave = vi.fn()
    renderActions({
      notification: makeNotification({
        type: 'match_found',
        link: '/community/opportunities/m-2',
      }),
      onSaveOpportunity: onSave,
      onView,
    })

    expect(
      screen.getByRole('button', { name: /save opportunity/i }),
    ).toBeInTheDocument()
  })
})
