import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskCard } from '../TaskCard'
import type { Task } from '../../../types'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    _id: 'task-1',
    title: 'Follow up with recruiter',
    description: 'Send a thank-you email after the onsite.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-07-15T00:00:00.000Z',
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('TaskCard', () => {
  it('renders the task title and metadata', () => {
    render(<TaskCard task={makeTask()} />)

    expect(screen.getByText('Follow up with recruiter')).toBeInTheDocument()
    expect(screen.getByText(/Send a thank-you email after the onsite\./)).toBeInTheDocument()
    expect(screen.getByText('To Do')).toBeInTheDocument()
    expect(screen.getByText('Medium priority')).toBeInTheDocument()
    expect(screen.getByText(/Due /)).toBeInTheDocument()
  })

  it('renders a high priority badge when priority is high', () => {
    render(<TaskCard task={makeTask({ priority: 'high' })} />)
    expect(screen.getByText('High priority')).toBeInTheDocument()
  })

  it('renders in-progress status and does not show due date when not provided', () => {
    render(
      <TaskCard
        task={makeTask({
          status: 'in_progress',
          dueDate: undefined,
        })}
      />,
    )
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.queryByText(/Due /)).not.toBeInTheDocument()
  })

  it('strikes through the title when status is done', () => {
    render(<TaskCard task={makeTask({ status: 'done', title: 'Submit references' })} />)
    const title = screen.getByText('Submit references')
    expect(title.className).toMatch(/line-through/)
  })

  it('does not render edit/delete buttons when callbacks are not provided', () => {
    render(<TaskCard task={makeTask()} />)

    expect(screen.queryByRole('button', { name: /edit task/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete task/i })).not.toBeInTheDocument()
  })

  it('invokes onEdit with the task when the edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const task = makeTask({ _id: 't-42', title: 'Update resume' })

    render(<TaskCard task={task} onEdit={onEdit} />)

    await user.click(screen.getByRole('button', { name: /edit task update resume/i }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(task)
  })

  it('invokes onDelete with the task when the delete button is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const task = makeTask({ _id: 't-7', title: 'Schedule mock interview' })

    render(<TaskCard task={task} onDelete={onDelete} />)

    await user.click(screen.getByRole('button', { name: /delete task schedule mock interview/i }))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(task)
  })
})
