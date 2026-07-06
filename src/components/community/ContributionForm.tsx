import { useState } from 'react'
import type { ContributionType } from '../../services/community/contributions'

const CONTRIBUTION_TYPES: { value: ContributionType; label: string; icon: string }[] = [
  { value: 'jd_verification', label: 'JD Verification', icon: '✅' },
  { value: 'salary_update', label: 'Salary Update', icon: '💰' },
  { value: 'interview_insight', label: 'Interview Insight', icon: '🎙️' },
  { value: 'culture_review', label: 'Culture Review', icon: '🏢' },
  { value: 'referral_available', label: 'Referral Available', icon: '🤝' },
  { value: 'application_tip', label: 'Application Tip', icon: '💡' },
  { value: 'skill_suggestion', label: 'Skill Suggestion', icon: '🔧' },
  { value: 'deadline_update', label: 'Deadline Update', icon: '📅' },
  { value: 'general', label: 'General', icon: '📝' },
]

interface ContributionFormProps {
  onSubmit: (type: ContributionType, title: string, body: string, isAnonymous?: boolean) => Promise<void>
}

export function ContributionForm({ onSubmit }: ContributionFormProps) {
  const [step, setStep] = useState<'type' | 'form'>('type')
  const [type, setType] = useState<ContributionType | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!type || !title.trim() || !body.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(type, title.trim(), body.trim(), isAnonymous)
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'type') {
    return (
      <div className="p-4 rounded-lg border border-outline-variant bg-surface-container-low">
        <h3 className="text-headline-sm text-on-surface font-semibold mb-3">Select Contribution Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {CONTRIBUTION_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => { setType(t.value); setStep('form') }}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant bg-surface hover:border-primary/50 transition-colors"
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-label-xs text-on-surface-variant text-center">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-lg border border-outline-variant bg-surface-container-low">
      <h3 className="text-headline-sm text-on-surface font-semibold mb-3">
        {CONTRIBUTION_TYPES.find(t => t.value === type)?.icon} {CONTRIBUTION_TYPES.find(t => t.value === type)?.label}
      </h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary"
        />
        <textarea
          placeholder="Share your insight..."
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary resize-none"
        />
        <label className="flex items-center gap-2 text-label-sm text-on-surface-variant cursor-pointer">
          <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded border-outline-variant" />
          Post anonymously
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStep('type')}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-label-sm"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !body.trim() || submitting}
            className="px-4 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
