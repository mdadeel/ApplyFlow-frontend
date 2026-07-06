import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import { createOpportunity } from '../../services/community/opportunities'
import { ArrowLeft, Link, Pencil, Upload, Loader2, Sparkles } from '../../lib/icons'

type SourceTab = 'url' | 'manual' | 'file'

export function CreateOpportunityPage() {
  const navigate = useNavigate()
  const [sourceTab, setSourceTab] = useState<SourceTab>('url')
  const [submitting, setSubmitting] = useState(false)

  // URL mode
  const [sourceUrl, setSourceUrl] = useState('')

  // Manual mode
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [locationType, setLocationType] = useState('unspecified')
  const [roleLevel, setRoleLevel] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const opp = await createOpportunity({
        title: sourceTab === 'manual' ? title : '',
        company: sourceTab === 'manual' ? company : '',
        source: sourceTab === 'url' ? 'url' : sourceTab === 'manual' ? 'manual' : 'pdf',
        sourceUrl: sourceTab === 'url' ? sourceUrl : undefined,
        description: sourceTab === 'manual' ? description : undefined,
        location: sourceTab === 'manual' ? location : undefined,
        locationType: sourceTab === 'manual' ? locationType : undefined,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        roleLevel: roleLevel || undefined,
        employmentType: employmentType || undefined,
        requiredSkills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        deadline: deadline || undefined,
      })
      navigate(`/community/opportunities/${opp._id}`)
    } finally {
      setSubmitting(false)
    }
  }

  const isManualValid = title && company

  return (
    <AppLayout>
      <button
        onClick={() => navigate('/community/opportunities')}
        className="flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-headline-lg text-on-surface font-semibold mb-xl">Add Opportunity</h1>

        <div className="flex gap-1 mb-xl border-b border-outline-variant">
          {([['url', 'From URL', Link], ['manual', 'Manual', Pencil], ['file', 'File Upload', Upload]] as [SourceTab, string, typeof Link][]).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setSourceTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-label-sm font-medium transition-colors ${
                sourceTab === id ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        <Card>
          {sourceTab === 'url' && (
            <div className="space-y-4">
              <p className="text-body-md text-on-surface-variant">Paste a job posting URL to automatically extract details</p>
              <input
                type="url"
                placeholder="https://example.com/jobs/..."
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary"
              />
              <button
                onClick={handleSubmit}
                disabled={!sourceUrl.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Processing...' : 'Fetch & Create'}
              </button>
            </div>
          )}

          {sourceTab === 'file' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-10 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-10 h-10 text-on-surface-variant mx-auto mb-3" />
                <p className="text-body-md text-on-surface-variant">Drop a PDF or image here, or click to browse</p>
                <p className="text-label-sm text-on-surface-variant mt-1">PDF, PNG, JPG up to 10MB</p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Processing...' : 'Upload & Create'}
              </button>
            </div>
          )}

          {sourceTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="Software Engineer" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Company *</label>
                  <input value={company} onChange={e => setCompany(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="Acme Corp" />
                </div>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary resize-none" placeholder="Job description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="San Francisco, CA" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Location Type</label>
                  <select value={locationType} onChange={e => setLocationType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary">
                    <option value="unspecified">Unspecified</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Role Level</label>
                  <select value={roleLevel} onChange={e => setRoleLevel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary">
                    <option value="">Select...</option>
                    <option value="intern">Intern</option>
                    <option value="entry">Entry</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Employment Type</label>
                  <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary">
                    <option value="">Select...</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Salary Min</label>
                  <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="80000" />
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Salary Max</label>
                  <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="120000" />
                </div>
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1">Required Skills (comma-separated)</label>
                <input value={requiredSkills} onChange={e => setRequiredSkills(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" placeholder="React, TypeScript, Node.js" />
              </div>
              <div>
                <label className="text-label-sm text-on-surface-variant block mb-1">Deadline</label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary" />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!isManualValid || submitting}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {submitting ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
