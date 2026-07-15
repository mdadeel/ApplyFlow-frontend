import { useState } from 'react'
import {
  MoreHorizontal, Trash2, FileText, FileSearch, BarChart3,
  Download, MessageSquare, Building, Briefcase, Calendar, Clock,
  Target, ChevronDown, ListChecks, ScrollText
} from '../../../lib/icons'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { StatusBadge } from '../../ui/StatusBadge'
import { Dropdown } from '../../ui/Dropdown'
import { EmptyState } from '../../ui/EmptyState'
import { Timeline } from '../Timeline'
import { TaskCard } from '../TaskCard'
import { ProgressBar } from '../../ui/ProgressBar'
import type { Application, ApplicationStatus, Task } from '../../../types'

interface ApplicationOverviewProps {
  application: Application
  tasks: Task[]
  onStatusChange: (status: ApplicationStatus) => void
  onDeleteClick: () => void
  onAddTaskClick: () => void
  onEditTaskClick: (task: Task) => void
  onDeleteTaskClick: (task: Task) => void
  validNextStatusValues: string[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ApplicationOverview({
  application,
  tasks,
  onStatusChange,
  onDeleteClick,
  onAddTaskClick,
  onEditTaskClick,
  onDeleteTaskClick,
  validNextStatusValues
}: ApplicationOverviewProps) {
  const scores = application?.scores
  const nextStatuses = validNextStatusValues.map((value) => ({ value, label: value }))

  return (
    <div className="space-y-lg animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-lg">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-headline-lg text-on-surface truncate">
              {application.company}
            </h2>
            <span className="text-headline-md text-on-surface-variant hidden sm:inline">@</span>
            <span className="text-headline-md text-on-surface-variant truncate block sm:inline">
              {application.role}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          <Dropdown
            align="right"
            trigger={
              <Button variant="ghost" icon={<MoreHorizontal className="h-4 w-4" />} aria-label="Actions" />
            }
            items={[
              ...nextStatuses.slice(0, 4).map((s) => ({
                label: `Move to ${s.label}`,
                onClick: () => onStatusChange(s.value as ApplicationStatus),
                icon: <ChevronDown className="h-4 w-4" />,
              })),
              {
                label: 'Delete',
                onClick: onDeleteClick,
                icon: <Trash2 className="h-4 w-4" />,
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2 space-y-lg">
          <Card className="p-md">
            <h3 className="text-headline-md text-on-surface mb-md">Timeline</h3>
            <Timeline
              events={application.timeline.map((e) => ({ ...e, status: application.status }))}
            />
          </Card>

          {application.jdText && (
            <Card className="p-md">
              <div className="flex items-center gap-2 mb-md">
                <ScrollText className="h-5 w-5 text-on-surface" />
                <h3 className="text-headline-md text-on-surface">Job Description</h3>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <pre className="text-body-md text-on-surface whitespace-pre-wrap font-body leading-relaxed">
                  {application.jdText}
                </pre>
              </div>
            </Card>
          )}

          <Card className="p-md">
            <div className="flex items-center gap-2 mb-md">
              <ListChecks className="h-5 w-5 text-on-surface" />
              <h3 className="text-headline-md text-on-surface">Tasks</h3>
              {tasks.length > 0 && (
                <span className="text-label-sm text-on-surface-variant">({tasks.length})</span>
              )}
            </div>
            {tasks.length === 0 ? (
              <EmptyState
                icon={<ListChecks className="h-8 w-8" />}
                title="No tasks yet"
                description="Track follow-ups, prep steps, or anything else related to this application."
                action={{ label: 'Add Task', onClick: onAddTaskClick }}
              />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEditTaskClick}
                    onDelete={onDeleteTaskClick}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-lg">
          <Card className="p-md">
            <h3 className="text-headline-md text-on-surface mb-md">Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Company</p>
                  <p className="text-body-md text-on-surface">{application.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Role</p>
                  <p className="text-body-md text-on-surface">{application.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Date Created</p>
                  <p className="text-body-md text-on-surface">{formatDate(application.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-on-surface-variant shrink-0" />
                <div>
                  <p className="text-label-sm text-on-surface-variant">Last Updated</p>
                  <p className="text-body-md text-on-surface">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
              <hr className="border-outline-variant" />
              {scores ? (
                <>
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">ATS Score</p>
                    <ProgressBar
                      value={scores.ats ?? 0}
                      size="md"
                      color={(scores.ats ?? 0) >= 80 ? 'success' : (scores.ats ?? 0) >= 60 ? 'warning' : 'error'}
                      showLabel
                    />
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-1">Match Score</p>
                    <ProgressBar
                      value={scores.match ?? 0}
                      size="md"
                      color={(scores.match ?? 0) >= 80 ? 'success' : (scores.match ?? 0) >= 60 ? 'warning' : 'error'}
                      showLabel
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 py-4 text-center">
                  <Target className="h-6 w-6 text-on-surface-variant" />
                  <p className="text-body-sm text-on-surface-variant">No scores yet</p>
                  <p className="text-body-sm text-on-surface-variant">Run a JD analysis to get started</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
