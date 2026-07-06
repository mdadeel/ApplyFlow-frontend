import { Pencil, Trash2 } from '../../lib/icons'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { IconButton } from '../ui/IconButton'
import type { Task } from '../../types'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
}

const statusLabels: Record<Task['status'], string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

const statusVariants: Record<Task['status'], 'default' | 'info' | 'success'> = {
  todo: 'default',
  in_progress: 'info',
  done: 'success',
}

const priorityVariants: Record<Task['priority'], 'default' | 'warning' | 'error'> = {
  low: 'default',
  medium: 'warning',
  high: 'error',
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const dueDateLabel = formatDate(task.dueDate)

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-headline-sm text-on-surface ${
            task.status === 'done' ? 'line-through text-on-surface-variant' : ''
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <IconButton
              aria-label={`Edit task ${task.title}`}
              icon={<Pencil className="h-4 w-4" />}
              onClick={() => onEdit(task)}
            />
          )}
          {onDelete && (
            <IconButton
              aria-label={`Delete task ${task.title}`}
              icon={<Trash2 className="h-4 w-4" />}
              onClick={() => onDelete(task)}
              className="text-on-surface-variant hover:text-error"
            />
          )}
        </div>
      </div>

      {task.description && (
        <p className="text-body-sm text-on-surface-variant line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={statusVariants[task.status]} size="sm">
          {statusLabels[task.status]}
        </Badge>
        <Badge variant={priorityVariants[task.priority]} size="sm">
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority
        </Badge>
        {dueDateLabel && (
          <span className="text-label-sm text-on-surface-variant">Due {dueDateLabel}</span>
        )}
      </div>
    </Card>
  )
}
