import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { parseListInput, formatListInput } from './shared'
import type { Experience } from '../../types'

export function ExperienceForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Experience
  submitting: boolean
  onSubmit: (data: Partial<Experience>) => void
  onCancel: () => void
}) {
  const [company, setCompany] = useState(item?.company || '')
  const [role, setRole] = useState(item?.role || '')
  const [startDate, setStartDate] = useState(item?.startDate || '')
  const [endDate, setEndDate] = useState(item?.endDate || '')
  const [current, setCurrent] = useState(item?.current || false)
  const [responsibilities, setResponsibilities] = useState(formatListInput(item?.responsibilities || []))
  const [technologies, setTechnologies] = useState(formatListInput(item?.technologies || []))
  const [achievements, setAchievements] = useState(formatListInput(item?.achievements || []))
  const [metrics, setMetrics] = useState(formatListInput(item?.metrics || []))

  const handleSubmit = () => {
    if (!company.trim() || !role.trim() || !startDate.trim()) return
    onSubmit({
      company: company.trim(),
      role: role.trim(),
      startDate,
      endDate: current ? undefined : endDate || undefined,
      current,
      responsibilities: parseListInput(responsibilities),
      technologies: parseListInput(technologies),
      achievements: parseListInput(achievements),
      metrics: parseListInput(metrics),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Job title" />
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={current} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} className="rounded border-outline-variant" />
        <span className="text-body-md text-on-surface">I currently work here</span>
      </label>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Responsibilities (one per line)</label>
        <textarea value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Led frontend development..." />
      </div>
      <Input label="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, TypeScript, Node.js" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Achievements (one per line)</label>
        <textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Shipped a new feature..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Metrics (one per line)</label>
        <textarea value={metrics} onChange={(e) => setMetrics(e.target.value)} rows={2} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Increased performance by 40%" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!company.trim() || !role.trim() || !startDate.trim()}>Save</Button>
      </div>
    </div>
  )
}
