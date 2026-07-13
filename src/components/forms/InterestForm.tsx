import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Interest } from '../../types'

export function InterestForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Interest
  submitting: boolean
  onSubmit: (data: Partial<Interest>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || '')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), category: category.trim() || undefined })
  }

  return (
    <div className="space-y-4">
      <Input label="Interest" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Machine Learning, Hiking" />
      <Input label="Category (optional)" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Technology, Sports" />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim()}>Save</Button>
      </div>
    </div>
  )
}
