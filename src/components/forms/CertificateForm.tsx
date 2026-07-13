import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { Certificate } from '../../types'

export function CertificateForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item?: Certificate
  submitting: boolean
  onSubmit: (data: Partial<Certificate>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [issuer, setIssuer] = useState(item?.issuer || '')
  const [date, setDate] = useState(item?.date || '')
  const [url, setUrl] = useState(item?.url || '')

  const handleSubmit = () => {
    if (!name.trim() || !issuer.trim() || !date.trim()) return
    onSubmit({
      name: name.trim(),
      issuer: issuer.trim(),
      date,
      url: url.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Input label="Certificate Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="AWS Solutions Architect" />
      <Input label="Issuer" value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Amazon Web Services" />
      <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <Input label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://credential.example.com/..." />
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim() || !issuer.trim() || !date.trim()}>Save</Button>
      </div>
    </div>
  )
}
