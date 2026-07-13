import { useState } from 'react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { skillCategories, skillLevels } from './shared'
import type { Skill } from '../../types'

export function SkillForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Skill
  submitting: boolean
  onSubmit: (data: Partial<Skill>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [category, setCategory] = useState(item?.category || 'Frontend')
  const [level, setLevel] = useState(item?.level || 'Intermediate')

  const handleSubmit = () => {
    if (!name.trim()) return
    onSubmit({ name: name.trim(), category: category as Skill['category'], level: level as Skill['level'] })
  }

  return (
    <div className="space-y-4">
      <Input label="Skill Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. React" />
      <Select label="Category" options={skillCategories.map((c) => ({ value: c, label: c }))} value={category} onChange={(v) => setCategory(v as Skill['category'])} />
      <Select label="Level" options={skillLevels.map((l) => ({ value: l, label: l }))} value={level} onChange={(v) => setLevel(v as Skill['level'])} />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim()}>Save</Button>
      </div>
    </div>
  )
}
