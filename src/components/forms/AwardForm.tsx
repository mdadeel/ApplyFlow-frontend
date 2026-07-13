import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Award } from '../../types'

export function AwardForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Award
  submitting: boolean
  onSubmit: (data: Partial<Award>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(item?.title || '')
  const [issuer, setIssuer] = useState(item?.issuer || '')
  const [date, setDate] = useState(item?.date || '')
  const [description, setDescription] = useState(item?.description || '')
  const [url, setUrl] = useState(item?.url || '')

  const handleSubmit = () => {
    if (!title.trim() || !issuer.trim()) return
    onSubmit({
      title: title.trim(),
      issuer: issuer.trim(),
      date: date || undefined,
      description: description.trim() || undefined,
      url: url.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Award Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Employee of the Month" />
      <Input label="Issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Company name" />
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Description (optional)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="What this award was for..." />
      </div>
      <Input label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!title.trim() || !issuer.trim()}>Save</Button>
      </div>
    </div>
  )
}
