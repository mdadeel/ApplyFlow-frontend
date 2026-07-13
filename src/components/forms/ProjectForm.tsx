import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { parseListInput, formatListInput } from './shared'
import type { Project } from '../../types'

export function ProjectForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Project
  submitting: boolean
  onSubmit: (data: Partial<Project>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(item?.title || '')
  const [description, setDescription] = useState(item?.description || '')
  const [technologies, setTechnologies] = useState(formatListInput(item?.technologies || []))
  const [features, setFeatures] = useState(formatListInput(item?.features || []))
  const [outcome, setOutcome] = useState(item?.outcome || '')
  const [github, setGithub] = useState(item?.github || '')
  const [demo, setDemo] = useState(item?.demo || '')

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      technologies: parseListInput(technologies),
      features: parseListInput(features),
      outcome: outcome.trim() || undefined,
      github: github.trim() || undefined,
      demo: demo.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project name" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="A brief description of the project" />
      </div>
      <Input label="Technologies (comma-separated)" value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node.js, MongoDB" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Features (one per line)</label>
        <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="User authentication..." />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Outcome</label>
        <textarea value={outcome} onChange={(e) => setOutcome(e.target.value)} rows={2} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Served 1000+ users" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
        <Input label="Demo URL" value={demo} onChange={(e) => setDemo(e.target.value)} placeholder="https://..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!title.trim() || !description.trim()}>Save</Button>
      </div>
    </div>
  )
}
