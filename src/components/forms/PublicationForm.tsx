import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { parseListInput, formatListInput } from './shared'
import type { Publication } from '../../types'

export function PublicationForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Publication
  submitting: boolean
  onSubmit: (data: Partial<Publication>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(item?.title || '')
  const [publisher, setPublisher] = useState(item?.publisher || '')
  const [date, setDate] = useState(item?.date || '')
  const [description, setDescription] = useState(item?.description || '')
  const [url, setUrl] = useState(item?.url || '')
  const [authors, setAuthors] = useState(formatListInput(item?.authors || []))

  const handleSubmit = () => {
    if (!title.trim() || !publisher.trim()) return
    onSubmit({
      title: title.trim(),
      publisher: publisher.trim(),
      date: date || undefined,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      authors: parseListInput(authors),
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Publication title" />
      <Input label="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher or journal name" />
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="Authors (comma-separated)" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="John Doe, Jane Smith" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Brief summary..." />
      </div>
      <Input label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://doi.org/..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!title.trim() || !publisher.trim()}>Save</Button>
      </div>
    </div>
  )
}
