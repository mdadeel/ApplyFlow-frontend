import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { parseListInput, formatListInput } from './shared'
import type { Volunteering } from '../../types'

export function VolunteeringForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Volunteering
  submitting: boolean
  onSubmit: (data: Partial<Volunteering>) => void
  onCancel: () => void
}) {
  const [organization, setOrganization] = useState(item?.organization || '')
  const [role, setRole] = useState(item?.role || '')
  const [startDate, setStartDate] = useState(item?.startDate || '')
  const [endDate, setEndDate] = useState(item?.endDate || '')
  const [current, setCurrent] = useState(item?.current || false)
  const [description, setDescription] = useState(item?.description || '')
  const [technologies, setTechnologies] = useState(formatListInput(item?.technologies || []))

  const handleSubmit = () => {
    if (!organization.trim() || !role.trim()) return
    onSubmit({
      organization: organization.trim(),
      role: role.trim(),
      startDate: startDate || undefined,
      endDate: current ? undefined : endDate || undefined,
      current,
      description: description.trim() || undefined,
      technologies: parseListInput(technologies),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Organization" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Nonprofit name" />
        <Input label="Role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Volunteer role" />
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={current} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={current} onChange={(e) => setCurrent(e.target.checked)} className="rounded border-outline-variant" />
        <span className="text-body-md text-on-surface">I currently volunteer here</span>
      </label>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="What you did..." />
      </div>
      <Input label="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, TypeScript" />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!organization.trim() || !role.trim()}>Save</Button>
      </div>
    </div>
  )
}
