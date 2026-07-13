import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Education } from '../../types'

export function EducationForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Education
  submitting: boolean
  onSubmit: (data: Partial<Education>) => void
  onCancel: () => void
}) {
  const [degree, setDegree] = useState(item?.degree || '')
  const [institution, setInstitution] = useState(item?.institution || '')
  const [startDate, setStartDate] = useState(item?.startDate || '')
  const [endDate, setEndDate] = useState(item?.endDate || '')
  const [result, setResult] = useState(item?.result || '')

  const handleSubmit = () => {
    if (!degree.trim() || !institution.trim() || !startDate.trim() || !endDate.trim()) return
    onSubmit({
      degree: degree.trim(),
      institution: institution.trim(),
      startDate,
      endDate,
      result: result.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Degree" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="B.Sc. in Computer Science" />
      <Input label="Institution" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="University name" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <Input label="Result (optional)" value={result} onChange={(e) => setResult(e.target.value)} placeholder="GPA 3.8/4.0" />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!degree.trim() || !institution.trim() || !startDate.trim() || !endDate.trim()}>Save</Button>
      </div>
    </div>
  )
}
