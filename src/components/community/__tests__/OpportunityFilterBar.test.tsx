import { describe, it, expect, vi } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OpportunityFilterBar } from '../OpportunityFilterBar'
import type { OpportunitySearchParams } from '../../../services/community/opportunities'

function renderBar(
  filters: OpportunitySearchParams = {},
  onChange = vi.fn(),
  onClearAll = vi.fn(),
) {
  return render(
    <OpportunityFilterBar
      filters={filters}
      onChange={onChange}
      onClearAll={onClearAll}
    />,
  )
}

describe('OpportunityFilterBar', () => {
  it('renders all filter controls', () => {
    renderBar()

    // The bar wrapper exposes its filter controls via the search input.
    expect(screen.getByTestId('filter-q')).toBeInTheDocument()

    // Search
    expect(screen.getByTestId('filter-q')).toBeInTheDocument()
    expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument()

    // Location type
    const location = screen.getByTestId('filter-locationType')
    expect(location).toBeInTheDocument()
    expect(within(location).getByRole('option', { name: 'All' })).toBeInTheDocument()
    expect(within(location).getByRole('option', { name: 'Remote' })).toBeInTheDocument()
    expect(within(location).getByRole('option', { name: 'Hybrid' })).toBeInTheDocument()
    expect(within(location).getByRole('option', { name: 'On-site' })).toBeInTheDocument()

    // Role level
    const roleLevel = screen.getByTestId('filter-roleLevel')
    expect(roleLevel).toBeInTheDocument()
    expect(within(roleLevel).getByRole('option', { name: 'Intern' })).toBeInTheDocument()
    expect(within(roleLevel).getByRole('option', { name: 'Entry' })).toBeInTheDocument()
    expect(within(roleLevel).getByRole('option', { name: 'Senior' })).toBeInTheDocument()
    expect(within(roleLevel).getByRole('option', { name: 'Lead' })).toBeInTheDocument()

    // Employment type
    const employment = screen.getByTestId('filter-employmentType')
    expect(employment).toBeInTheDocument()
    expect(within(employment).getByRole('option', { name: 'Full-time' })).toBeInTheDocument()
    expect(within(employment).getByRole('option', { name: 'Part-time' })).toBeInTheDocument()
    expect(within(employment).getByRole('option', { name: 'Contract' })).toBeInTheDocument()
    expect(within(employment).getByRole('option', { name: 'Internship' })).toBeInTheDocument()

    // Recency
    const recency = screen.getByTestId('filter-recency')
    expect(recency).toBeInTheDocument()
    expect(within(recency).getByRole('option', { name: 'Any time' })).toBeInTheDocument()
    expect(within(recency).getByRole('option', { name: 'Last 24h' })).toBeInTheDocument()
    expect(within(recency).getByRole('option', { name: 'Last week' })).toBeInTheDocument()
    expect(within(recency).getByRole('option', { name: 'Last month' })).toBeInTheDocument()

    // Salary inputs
    expect(screen.getByTestId('filter-salaryMin')).toBeInTheDocument()
    expect(screen.getByTestId('filter-salaryMax')).toBeInTheDocument()
    expect(screen.getByLabelText(/^salary min$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^salary max$/i)).toBeInTheDocument()

    // Skills input
    expect(screen.getByTestId('filter-skills-input')).toBeInTheDocument()
    expect(screen.getByTestId('filter-skills-add')).toBeInTheDocument()
    expect(screen.getByLabelText(/skills \(comma separated\)/i)).toBeInTheDocument()

    // No chips or clear-all when filters are empty.
    expect(screen.queryByTestId('filter-skills-chips')).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-clear-all')).not.toBeInTheDocument()
  })

  it('reflects the supplied initial filter values', () => {
    renderBar({
      q: 'react',
      locationType: 'remote',
      roleLevel: 'senior',
      employmentType: 'full-time',
      recency: 'week',
      salaryMin: 100000,
      salaryMax: 200000,
      skills: ['typescript'],
    })

    expect(screen.getByTestId('filter-q')).toHaveValue('react')
    expect(screen.getByTestId('filter-locationType')).toHaveValue('remote')
    expect(screen.getByTestId('filter-roleLevel')).toHaveValue('senior')
    expect(screen.getByTestId('filter-employmentType')).toHaveValue('full-time')
    expect(screen.getByTestId('filter-recency')).toHaveValue('week')
    expect(screen.getByTestId('filter-salaryMin')).toHaveValue(100000)
    expect(screen.getByTestId('filter-salaryMax')).toHaveValue(200000)

    // Skills chip present for the supplied skill.
    const chips = screen.getByTestId('filter-skills-chips')
    expect(within(chips).getByText('typescript')).toBeInTheDocument()
  })

  it('changing location type calls onChange with the new value and resets page to 1', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({ page: 3, locationType: 'remote' }, onChange)

    const select = screen.getByTestId('filter-locationType')
    await user.selectOptions(select, 'hybrid')

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ locationType: 'hybrid', page: 1 }),
    )
  })

  it('changing role level calls onChange with the new value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({}, onChange)

    await user.selectOptions(screen.getByTestId('filter-roleLevel'), 'mid')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ roleLevel: 'mid', page: 1 }),
    )
  })

  it('changing employment type calls onChange with the new value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({}, onChange)

    await user.selectOptions(screen.getByTestId('filter-employmentType'), 'contract')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ employmentType: 'contract', page: 1 }),
    )
  })

  it('changing recency calls onChange with the new value', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({}, onChange)

    await user.selectOptions(screen.getByTestId('filter-recency'), '24h')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ recency: '24h', page: 1 }),
    )
  })

  it('updating salary min and max calls onChange with numeric values', () => {
    const onChange = vi.fn()
    renderBar({}, onChange)

    fireEvent.change(screen.getByTestId('filter-salaryMin'), { target: { value: '80000' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ salaryMin: 80000, page: 1 }),
    )

    fireEvent.change(screen.getByTestId('filter-salaryMax'), { target: { value: '120000' } })

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ salaryMax: 120000, page: 1 }),
    )
  })

  it('adding a skill via the Add button calls onChange with skills array updated', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({ skills: ['react'] }, onChange)

    const input = screen.getByTestId('filter-skills-input')
    await user.type(input, 'typescript')
    await user.click(screen.getByTestId('filter-skills-add'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ['react', 'typescript'],
        page: 1,
      }),
    )

    // Input should be cleared after adding.
    expect(input).toHaveValue('')

    // Chip is rendered.
    const chips = screen.getByTestId('filter-skills-chips')
    expect(within(chips).getByText('react')).toBeInTheDocument()
    expect(within(chips).getByText('typescript')).toBeInTheDocument()
  })

  it('adding skills on Enter calls onChange with skills array updated', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({}, onChange)

    const input = screen.getByTestId('filter-skills-input')
    await user.type(input, 'go{Enter}')

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ['go'],
        page: 1,
      }),
    )
    expect(input).toHaveValue('')
  })

  it('parses comma-separated skill input and de-duplicates entries', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({ skills: ['react'] }, onChange)

    const input = screen.getByTestId('filter-skills-input')
    await user.type(input, 'typescript, react , graphql')
    await user.click(screen.getByTestId('filter-skills-add'))

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        skills: ['react', 'typescript', 'graphql'],
        page: 1,
      }),
    )
  })

  it('removing a skill chip updates the skills array', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({ skills: ['react', 'typescript'] }, onChange)

    await user.click(screen.getByRole('button', { name: /remove react/i }))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: ['typescript'],
        page: 1,
      }),
    )
  })

  it('removing the last skill sends undefined for skills', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({ skills: ['react'] }, onChange)

    await user.click(screen.getByRole('button', { name: /remove react/i }))

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        skills: undefined,
        page: 1,
      }),
    )

    // Chips container should disappear when no skills remain.
    expect(screen.queryByTestId('filter-skills-chips')).not.toBeInTheDocument()
  })

  it('does not call onChange when the skills input is empty or whitespace-only', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderBar({}, onChange)

    await user.click(screen.getByTestId('filter-skills-add'))
    expect(onChange).not.toHaveBeenCalled()

    const input = screen.getByTestId('filter-skills-input')
    await user.type(input, '   ')
    await user.click(screen.getByTestId('filter-skills-add'))
    expect(onChange).not.toHaveBeenCalled()

    await user.type(input, '{Enter}')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('Clear all button is shown when any filter is active and calls onClearAll', async () => {
    const user = userEvent.setup()
    const onClearAll = vi.fn()
    renderBar({ locationType: 'remote' }, vi.fn(), onClearAll)

    const clearAll = screen.getByTestId('filter-clear-all')
    expect(clearAll).toBeInTheDocument()

    await user.click(clearAll)

    expect(onClearAll).toHaveBeenCalledTimes(1)
  })

  it('Clear all appears when skills are set even without other filters', async () => {
    const onClearAll = vi.fn()
    renderBar({ skills: ['react'] }, vi.fn(), onClearAll)

    expect(screen.getByTestId('filter-clear-all')).toBeInTheDocument()
  })
})
