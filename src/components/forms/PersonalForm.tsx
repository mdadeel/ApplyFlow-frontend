import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { PersonalData } from '../../services/profile'

export function PersonalForm({
  item,
  submitting,
  onSubmit,
  onCancel,
}: {
  item: PersonalData | null
  submitting: boolean
  onSubmit: (data: Partial<PersonalData>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(item?.name || '')
  const [email, setEmail] = useState(item?.email || '')
  const [phone, setPhone] = useState(item?.phone || '')
  const [location, setLocation] = useState(item?.location || '')
  const [title, setTitle] = useState(item?.title || '')
  const [summary, setSummary] = useState(item?.summary || '')
  const [portfolio, setPortfolio] = useState(item?.portfolio || '')
  const [linkedIn, setLinkedIn] = useState(item?.linkedIn || '')
  const [github, setGithub] = useState(item?.github || '')

  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      location: location.trim() || undefined,
      title: title.trim() || undefined,
      summary: summary.trim() || undefined,
      portfolio: portfolio.trim() || undefined,
      linkedIn: linkedIn.trim() || undefined,
      github: github.trim() || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="San Francisco, CA" />
      </div>
      <Input label="Professional Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Software Engineer" />
      <div className="flex flex-col gap-1.5">
        <label className="font-label-md text-on-surface">Summary / Bio</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 p-3 resize-none" placeholder="Experienced full-stack developer with 8+ years..." />
      </div>
      <h4 className="text-body-sm font-semibold text-on-surface pt-2 border-t border-outline-variant">Links</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input label="Portfolio URL" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://yoursite.com" />
        <Input label="LinkedIn URL" value={linkedIn} onChange={(e) => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/..." />
        <Input label="GitHub URL" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} loading={submitting} disabled={!name.trim() || !email.trim()}>Save</Button>
      </div>
    </div>
  )
}
