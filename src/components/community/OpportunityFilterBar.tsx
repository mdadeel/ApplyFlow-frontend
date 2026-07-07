import { useState, useEffect } from 'react'
import { X, Plus } from '../../lib/icons'
import { Card } from '../ui/Card'
import type { OpportunitySearchParams } from '../../services/community/opportunities'

export interface OpportunityFilterBarProps {
  filters: OpportunitySearchParams
  onChange: (next: OpportunitySearchParams) => void
  onClearAll: () => void
}

const LOCATION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site' },
]

const ROLE_LEVEL_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'intern', label: 'Intern' },
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
]

const EMPLOYMENT_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const RECENCY_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '24h', label: 'Last 24h' },
  { value: 'week', label: 'Last week' },
  { value: 'month', label: 'Last month' },
]

function Chip<T extends string>({ label, onRemove }: { label: T; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-on-secondary-container/10"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

export function OpportunityFilterBar({ filters, onChange, onClearAll }: OpportunityFilterBarProps) {
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(filters.skills ?? [])

  useEffect(() => {
    setSkills(filters.skills ?? [])
  }, [filters.skills])

  const update = (patch: Partial<OpportunitySearchParams>) => {
    onChange({ ...filters, ...patch, page: 1 })
  }

  const addSkills = () => {
    const parts = skillInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = Array.from(new Set([...skills, ...parts]))
    setSkills(next)
    setSkillInput('')
    update({ skills: next })
  }

  const removeSkill = (skill: string) => {
    const next = skills.filter(s => s !== skill)
    setSkills(next)
    update({ skills: next.length > 0 ? next : undefined })
  }

  const hasAnyFilter =
    !!filters.q ||
    !!filters.locationType ||
    !!filters.roleLevel ||
    !!filters.employmentType ||
    !!filters.recency ||
    !!filters.salaryMin ||
    !!filters.salaryMax ||
    skills.length > 0

  return (
    <Card className="mb-lg" data-testid="opportunity-filter-bar">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[14rem]">
            <label htmlFor="opp-filter-q" className="text-label-sm text-on-surface-variant block mb-1">
              Search
            </label>
            <input
              id="opp-filter-q"
              data-testid="filter-q"
              type="search"
              placeholder="Search by title, company, or keyword..."
              value={filters.q ?? ''}
              onChange={e => update({ q: e.target.value || undefined })}
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="opp-filter-loc" className="text-label-sm text-on-surface-variant block mb-1">
              Location
            </label>
            <select
              id="opp-filter-loc"
              data-testid="filter-locationType"
              value={filters.locationType ?? ''}
              onChange={e => update({ locationType: e.target.value || undefined })}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            >
              {LOCATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opp-filter-level" className="text-label-sm text-on-surface-variant block mb-1">
              Role level
            </label>
            <select
              id="opp-filter-level"
              data-testid="filter-roleLevel"
              value={filters.roleLevel ?? ''}
              onChange={e => update({ roleLevel: e.target.value || undefined })}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            >
              {ROLE_LEVEL_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opp-filter-emp" className="text-label-sm text-on-surface-variant block mb-1">
              Employment
            </label>
            <select
              id="opp-filter-emp"
              data-testid="filter-employmentType"
              value={filters.employmentType ?? ''}
              onChange={e => update({ employmentType: e.target.value || undefined })}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            >
              {EMPLOYMENT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="opp-filter-recency" className="text-label-sm text-on-surface-variant block mb-1">
              Posted
            </label>
            <select
              id="opp-filter-recency"
              data-testid="filter-recency"
              value={filters.recency ?? ''}
              onChange={e => update({ recency: (e.target.value || undefined) as OpportunitySearchParams['recency'] })}
              className="px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            >
              {RECENCY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-28">
            <label htmlFor="opp-filter-salmin" className="text-label-sm text-on-surface-variant block mb-1">
              Salary min
            </label>
            <input
              id="opp-filter-salmin"
              data-testid="filter-salaryMin"
              type="number"
              min={0}
              placeholder="0"
              value={filters.salaryMin ?? ''}
              onChange={e => update({ salaryMin: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            />
          </div>

          <div className="w-28">
            <label htmlFor="opp-filter-salmax" className="text-label-sm text-on-surface-variant block mb-1">
              Salary max
            </label>
            <input
              id="opp-filter-salmax"
              data-testid="filter-salaryMax"
              type="number"
              min={0}
              placeholder="∞"
              value={filters.salaryMax ?? ''}
              onChange={e => update({ salaryMax: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
            />
          </div>

          <div className="flex-1 min-w-[16rem]">
            <label htmlFor="opp-filter-skills" className="text-label-sm text-on-surface-variant block mb-1">
              Skills (comma separated)
            </label>
            <div className="flex gap-2">
              <input
                id="opp-filter-skills"
                data-testid="filter-skills-input"
                type="text"
                placeholder="e.g. react, typescript"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    addSkills()
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface"
              />
              <button
                type="button"
                data-testid="filter-skills-add"
                onClick={addSkills}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2" data-testid="filter-skills-chips">
                {skills.map(s => (
                  <Chip key={s} label={s} onRemove={() => removeSkill(s)} />
                ))}
              </div>
            )}
          </div>

          {hasAnyFilter && (
            <button
              type="button"
              data-testid="filter-clear-all"
              onClick={onClearAll}
              className="text-label-sm text-primary hover:underline self-end pb-2"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}
