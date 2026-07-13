import { useState } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { languageProficiencies } from './shared'
import type { Language } from '../../types'

export function LanguageForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Language
  submitting: boolean
  onSubmit: (data: Partial<Language>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [proficiency, setProficiency] = useState(item?.proficiency || 'Intermediate')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      proficiency: proficiency as Language['proficiency'],
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Language" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. English, Spanish" />
      <Select label="Proficiency" options={languageProficiencies.map((p) => ({ value: p, label: p }))} value={proficiency} onChange={(v) => setProficiency(v as Language['proficiency'])} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim()}>Save</Button>
      </div>
    </div>
  )
}
