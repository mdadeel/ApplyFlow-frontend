import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mocks = vi.hoisted(() => ({
  saveOpportunity: vi.fn(),
  unsaveOpportunity: vi.fn(),
  updateSavedOpportunity: vi.fn(),
  listSavedOpportunities: vi.fn(),
  showToast: vi.fn(),
}))

// Mock the API service functions used by the hook.
vi.mock('../../../services/community/savedOpportunities', () => ({
  saveOpportunity: mocks.saveOpportunity,
  unsaveOpportunity: mocks.unsaveOpportunity,
  updateSavedOpportunity: mocks.updateSavedOpportunity,
  listSavedOpportunities: mocks.listSavedOpportunities,
}))

import { SaveOpportunityButton } from '../SaveOpportunityButton'
import { SavedOpportunitiesProvider } from '../../../hooks/useSavedOpportunities'
import { ToastContext, type ToastContextValue } from '../../layout/useToast'

const toastValue: ToastContextValue = {
  showToast: mocks.showToast,
  toasts: [],
  dismissToast: vi.fn(),
}

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'saved-1',
    userId: 'user-1',
    opportunityId: 'opp-123',
    savedAt: '2026-07-06T12:00:00.000Z',
    alertEnabled: true,
    ...overrides,
  }
}

function renderButton(opportunityId = 'opp-123') {
  return render(
    <ToastContext.Provider value={toastValue}>
      <SavedOpportunitiesProvider>
        <SaveOpportunityButton opportunityId={opportunityId} />
      </SavedOpportunitiesProvider>
    </ToastContext.Provider>,
  )
}

describe('SaveOpportunityButton', () => {
  beforeEach(() => {
    mocks.saveOpportunity.mockReset()
    mocks.unsaveOpportunity.mockReset()
    mocks.updateSavedOpportunity.mockReset()
    mocks.listSavedOpportunities.mockReset()
    mocks.showToast.mockReset()

    // Track the most recently saved entry so updateSavedOpportunity can
    // return a properly shaped object (preserving opportunityId, _id, etc.)
    // rather than a default makeEntry() with the wrong opportunityId.
    let lastSaved = makeEntry()

    // Default: no saved opportunities initially.
    mocks.listSavedOpportunities.mockResolvedValue([])
    mocks.saveOpportunity.mockImplementation(async (id: string, alertEnabled: boolean) => {
      lastSaved = makeEntry({ opportunityId: id, alertEnabled })
      return lastSaved
    })
    mocks.unsaveOpportunity.mockResolvedValue(undefined)
    mocks.updateSavedOpportunity.mockImplementation(async (_id: string, data: { alertEnabled?: boolean }) => ({
      ...lastSaved,
      alertEnabled: data.alertEnabled ?? true,
    }))
  })

  it('renders an unsaved (bookmark outline) button initially', async () => {
    renderButton()

    const button = screen.getByRole('button', { name: /save opportunity/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
    // Alert button should be hidden while unsaved.
    expect(screen.queryByRole('button', { name: /deadline alerts/i })).not.toBeInTheDocument()
  })

  it('clicking the button toggles saved state and calls the save API', async () => {
    const user = userEvent.setup()
    renderButton('opp-abc')

    const button = screen.getByRole('button', { name: /save opportunity/i })
    await user.click(button)

    await waitFor(() => {
      expect(mocks.saveOpportunity).toHaveBeenCalledTimes(1)
    })
    expect(mocks.saveOpportunity).toHaveBeenCalledWith('opp-abc', true)
    expect(mocks.unsaveOpportunity).not.toHaveBeenCalled()

    // Button now reports the saved state.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unsave opportunity/i })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
    })
  })

  it('clicking again toggles back to unsaved and calls the unsave API', async () => {
    const user = userEvent.setup()
    renderButton('opp-xyz')

    // First click — save.
    await user.click(screen.getByRole('button', { name: /save opportunity/i }))
    await waitFor(() => expect(mocks.saveOpportunity).toHaveBeenCalledTimes(1))

    // Second click — unsave.
    const unsaveButton = await screen.findByRole('button', { name: /unsave opportunity/i })
    await user.click(unsaveButton)

    await waitFor(() => {
      expect(mocks.unsaveOpportunity).toHaveBeenCalledWith('opp-xyz')
    })

    // Back to unsaved state.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save opportunity/i })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
    })
  })

  it('shows the alert toggle button only when the opportunity is saved', async () => {
    const user = userEvent.setup()
    renderButton('opp-1')

    expect(screen.queryByRole('button', { name: /deadline alerts/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /save opportunity/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /disable deadline alerts/i })).toBeInTheDocument(),
    )
  })

  it('opens the alert menu when the bell button is clicked while saved', async () => {
    const user = userEvent.setup()
    renderButton('opp-1')

    // Save first.
    await user.click(screen.getByRole('button', { name: /save opportunity/i }))
    const bell = await screen.findByRole('button', { name: /disable deadline alerts/i })
    await user.click(bell)

    const menu = await screen.findByRole('menu', { name: /alert preferences/i })
    expect(menu).toBeInTheDocument()
    // Accessible name of the "On" item is "On" + ("Active" badge when selected),
    // so use a prefix match rather than an exact match.
    expect(within(menu).getByRole('menuitemcheckbox', { name: /^on/i })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitemcheckbox', { name: /^off/i })).toBeInTheDocument()
  })

  it('toggling alert off calls updateSavedOpportunity and updates UI', async () => {
    const user = userEvent.setup()
    renderButton('opp-1')

    // Save first.
    await user.click(screen.getByRole('button', { name: /save opportunity/i }))
    await waitFor(() => expect(mocks.saveOpportunity).toHaveBeenCalled())

    // Open the menu.
    const bell = await screen.findByRole('button', { name: /disable deadline alerts/i })
    await user.click(bell)

    // Click "Off".
    const offItem = await screen.findByRole('menuitemcheckbox', { name: /^off$/i })
    await user.click(offItem)

    await waitFor(() => {
      expect(mocks.updateSavedOpportunity).toHaveBeenCalledWith('saved-1', { alertEnabled: false })
    })

    // Bell should now indicate alerts are disabled.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable deadline alerts/i })).toBeInTheDocument()
    })
  })

  it('renders the alert button with disabled style when alertEnabled is false on mount', async () => {
    mocks.listSavedOpportunities.mockResolvedValue([
      makeEntry({ opportunityId: 'opp-saved', alertEnabled: false }),
    ])

    renderButton('opp-saved')

    // Wait for the initial load to populate state.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enable deadline alerts/i })).toBeInTheDocument()
    })

    // The bell-off button should be visible.
    expect(screen.getByRole('button', { name: /save opportunity/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('surfaces an error toast when save fails', async () => {
    const user = userEvent.setup()
    mocks.saveOpportunity.mockRejectedValueOnce(new Error('Network down'))

    renderButton('opp-fail')

    await user.click(screen.getByRole('button', { name: /save opportunity/i }))

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith('Network down', 'error')
    })

    // Optimistic state was rolled back — still unsaved.
    expect(screen.getByRole('button', { name: /save opportunity/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('rolls back optimistic state when unsave fails', async () => {
    const user = userEvent.setup()
    mocks.listSavedOpportunities.mockResolvedValue([makeEntry({ opportunityId: 'opp-rb' })])
    mocks.unsaveOpportunity.mockRejectedValueOnce(new Error('boom'))

    renderButton('opp-rb')

    // Wait until saved state is reflected.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unsave opportunity/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /unsave opportunity/i }))

    await waitFor(() => {
      expect(mocks.showToast).toHaveBeenCalledWith('boom', 'error')
    })

    // Rollback: still saved.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /unsave opportunity/i })).toBeInTheDocument()
    })
  })
})
