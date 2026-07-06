import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/layout/AppLayout'
import { Card } from '../../components/ui/Card'
import {
  getWorkspace, generateContent, analyzeWorkspace, submitWorkspace,
} from '../../services/community/workspaces'
import type { ApplicationWorkspace, WorkspaceStatus } from '../../services/community/workspaces'
import {
  ArrowLeft, Loader2, Sparkles, CheckCircle, FileText, Mail, BrainCircuit, Target, Code
} from '../../lib/icons'

const STATUS_BADGES: Record<WorkspaceStatus, { label: string; color: string }> = {
  idle: { label: 'Idle', color: 'bg-gray-500/10 text-gray-600' },
  analyzing: { label: 'Analyzing...', color: 'bg-amber-500/10 text-amber-600' },
  tailoring: { label: 'Generating...', color: 'bg-blue-500/10 text-blue-600' },
  ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-600' },
  submitted: { label: 'Submitted', color: 'bg-primary/10 text-primary' },
}

type TabId = 'resume' | 'cover-letter' | 'email' | 'ats' | 'interview' | 'skill-gap'

const TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'resume', label: 'Resume', icon: FileText },
  { id: 'cover-letter', label: 'Cover Letter', icon: Sparkles },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'ats', label: 'ATS Analysis', icon: Target },
  { id: 'interview', label: 'Interview Prep', icon: BrainCircuit },
  { id: 'skill-gap', label: 'Skill Gap', icon: Code },
]

export function WorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState<ApplicationWorkspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('resume')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!id) return
    getWorkspace(id)
      .then(setWorkspace)
      .catch(() => navigate('/community/opportunities'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleGenerate = async (type: 'resume' | 'cover-letter' | 'email' | 'interview-prep') => {
    if (!id) return
    setGenerating(true)
    try {
      const updated = await generateContent(id, type)
      setWorkspace(updated)
    } finally {
      setGenerating(false)
    }
  }

  const handleAnalyze = async (type: 'ats' | 'skill-gap') => {
    if (!id) return
    setGenerating(true)
    try {
      const updated = await analyzeWorkspace(id, type)
      setWorkspace(updated)
    } finally {
      setGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (!id) return
    try {
      const updated = await submitWorkspace(id)
      setWorkspace(updated)
    } catch { /* transition error */ }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
        </div>
      </AppLayout>
    )
  }

  if (!workspace) return null

  const opp = typeof workspace.opportunityId === 'object' ? workspace.opportunityId : null
  const statusBadge = STATUS_BADGES[workspace.status]

  return (
    <AppLayout>
      <button
        onClick={() => navigate('/community/opportunities')}
        className="flex items-center gap-1.5 text-label-sm text-on-surface-variant hover:text-on-surface mb-lg transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to opportunities
      </button>

      <div className="flex items-center justify-between mb-xl">
        <div>
          <h1 className="text-headline-lg text-on-surface font-semibold">
            {opp ? `${opp.title} at ${opp.company}` : 'Application Workspace'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-label-xs font-medium ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
        </div>
        {workspace.status === 'ready' && (
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-label-md font-medium hover:opacity-90 transition-opacity"
          >
            <CheckCircle className="w-4 h-4" />
            Mark as Submitted
          </button>
        )}
      </div>

      <div className="flex gap-1 mb-xl overflow-x-auto pb-2 border-b border-outline-variant">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-label-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary/5 text-primary border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'resume' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-headline-md text-on-surface font-semibold">Tailored Resume</h3>
            {workspace.status !== 'submitted' && (
              <button
                onClick={() => handleGenerate('resume')}
                disabled={generating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {workspace.tailoredResume ? 'Regenerate' : 'Generate'}
              </button>
            )}
          </div>
          {generating ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
            </div>
          ) : workspace.tailoredResume ? (
            <div>
              {workspace.tailoredResume.atsScore !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-label-sm text-on-surface-variant">ATS Score:</span>
                  <span className={`text-label-sm font-medium ${
                    workspace.tailoredResume.atsScore >= 80 ? 'text-emerald-600' :
                    workspace.tailoredResume.atsScore >= 60 ? 'text-amber-600' : 'text-red-500'
                  }`}>
                    {workspace.tailoredResume.atsScore}%
                  </span>
                </div>
              )}
              <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant whitespace-pre-wrap text-body-sm text-on-surface max-h-96 overflow-y-auto">
                {workspace.tailoredResume.content}
              </div>
            </div>
          ) : (
            <p className="text-body-md text-on-surface-variant text-center py-md">Generate a tailored resume for this opportunity</p>
          )}
        </Card>
      )}

      {activeTab === 'cover-letter' && <ContentTab label="Cover Letter" content={workspace.coverLetter?.content} onGenerate={() => handleGenerate('cover-letter')} generating={generating} disabled={workspace.status === 'submitted'} />}
      {activeTab === 'email' && <EmailTab email={workspace.recruiterEmail} onGenerate={() => handleGenerate('email')} generating={generating} disabled={workspace.status === 'submitted'} />}
      {activeTab === 'interview' && <InterviewTab prep={workspace.interviewPrep} onGenerate={() => handleGenerate('interview-prep')} generating={generating} disabled={workspace.status === 'submitted'} />}
      {activeTab === 'ats' && <AtsTab analysis={workspace.atsAnalysis} onAnalyze={() => handleAnalyze('ats')} generating={generating} disabled={workspace.status === 'submitted'} />}
      {activeTab === 'skill-gap' && <SkillGapTab gap={workspace.skillGap} onAnalyze={() => handleAnalyze('skill-gap')} generating={generating} disabled={workspace.status === 'submitted'} />}
    </AppLayout>
  )
}

function ContentTab({ label, content, onGenerate, generating, disabled }: { label: string; content?: string; onGenerate: () => void; generating: boolean; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md text-on-surface font-semibold">{label}</h3>
        {!disabled && (
          <button onClick={onGenerate} disabled={generating} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Sparkles className="w-4 h-4" />
            {content ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>
      {generating ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" /></div>
      ) : content ? (
        <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant whitespace-pre-wrap text-body-sm text-on-surface max-h-96 overflow-y-auto">{content}</div>
      ) : (
        <p className="text-body-md text-on-surface-variant text-center py-md">Generate {label.toLowerCase()} for this opportunity</p>
      )}
    </Card>
  )
}

function EmailTab({ email, onGenerate, generating, disabled }: { email?: { subject: string; body: string }; onGenerate: () => void; generating: boolean; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md text-on-surface font-semibold">Recruiter Email</h3>
        {!disabled && (
          <button onClick={onGenerate} disabled={generating} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Sparkles className="w-4 h-4" />
            {email ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>
      {generating ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" /></div>
      ) : email ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant">
            <span className="text-label-sm text-on-surface-variant">Subject:</span>
            <p className="text-body-md text-on-surface">{email.subject}</p>
          </div>
          <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant whitespace-pre-wrap text-body-sm text-on-surface max-h-96 overflow-y-auto">{email.body}</div>
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant text-center py-md">Generate an outreach email for the recruiter</p>
      )}
    </Card>
  )
}

function InterviewTab({ prep, onGenerate, generating, disabled }: { prep?: { questions: Array<{ question: string; talkingPoints: string[] }>; companyResearch: string }; onGenerate: () => void; generating: boolean; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md text-on-surface font-semibold">Interview Prep</h3>
        {!disabled && (
          <button onClick={onGenerate} disabled={generating} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Sparkles className="w-4 h-4" />
            {prep ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>
      {generating ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" /></div>
      ) : prep ? (
        <div className="space-y-4">
          {prep.companyResearch && (
            <div>
              <h4 className="text-label-md text-on-surface-variant mb-2">Company Research</h4>
              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant text-body-sm text-on-surface whitespace-pre-wrap">{prep.companyResearch}</div>
            </div>
          )}
          <h4 className="text-label-md text-on-surface-variant">Practice Questions</h4>
          {prep.questions.map((q, i) => (
            <div key={i} className="p-3 rounded-lg bg-surface-container-low border border-outline-variant">
              <p className="text-body-md text-on-surface font-medium mb-2">Q{i + 1}: {q.question}</p>
              <ul className="list-disc list-inside space-y-1">
                {q.talkingPoints.map((p, j) => (
                  <li key={j} className="text-body-sm text-on-surface-variant">{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant text-center py-md">Generate interview preparation materials</p>
      )}
    </Card>
  )
}

function AtsTab({ analysis, onAnalyze, generating, disabled }: { analysis?: { score: number; missingKeywords: string[]; formattingIssues: string[]; suggestions: string[] }; onAnalyze: () => void; generating: boolean; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md text-on-surface font-semibold">ATS Analysis</h3>
        {!disabled && (
          <button onClick={onAnalyze} disabled={generating} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Target className="w-4 h-4" />
            {analysis ? 'Re-analyze' : 'Analyze'}
          </button>
        )}
      </div>
      {generating ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" /></div>
      ) : analysis ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-headline-lg font-bold">{analysis.score}%</span>
            <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${analysis.score >= 80 ? 'bg-emerald-500' : analysis.score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${analysis.score}%` }} />
            </div>
          </div>
          {analysis.missingKeywords.length > 0 && (
            <div>
              <h4 className="text-label-md text-on-surface-variant mb-2">Missing Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missingKeywords.map(k => <span key={k} className="px-2 py-1 bg-red-500/10 text-red-600 rounded text-label-xs">{k}</span>)}
              </div>
            </div>
          )}
          {analysis.suggestions.length > 0 && (
            <div>
              <h4 className="text-label-md text-on-surface-variant mb-2">Suggestions</h4>
              <ul className="space-y-1">
                {analysis.suggestions.map((s, i) => (
                  <li key={i} className="text-body-sm text-on-surface-variant flex items-start gap-2 before:content-['•']">{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant text-center py-md">Run ATS analysis to check keyword match and formatting</p>
      )}
    </Card>
  )
}

function SkillGapTab({ gap, onAnalyze, generating, disabled }: { gap?: { missingSkills: string[]; recommendations: string[] }; onAnalyze: () => void; generating: boolean; disabled: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-headline-md text-on-surface font-semibold">Skill Gap Analysis</h3>
        {!disabled && (
          <button onClick={onAnalyze} disabled={generating} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-label-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            <Code className="w-4 h-4" />
            {gap ? 'Re-analyze' : 'Analyze'}
          </button>
        )}
      </div>
      {generating ? (
        <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" /></div>
      ) : gap ? (
        <div className="space-y-4">
          {gap.missingSkills.length > 0 && (
            <div>
              <h4 className="text-label-md text-on-surface-variant mb-2">Missing Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {gap.missingSkills.map(s => <span key={s} className="px-2 py-1 bg-amber-500/10 text-amber-600 rounded text-label-xs">{s}</span>)}
              </div>
            </div>
          )}
          {gap.recommendations.length > 0 && (
            <div>
              <h4 className="text-label-md text-on-surface-variant mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {gap.recommendations.map((r, i) => (
                  <li key={i} className="text-body-sm text-on-surface-variant flex items-start gap-2 before:content-['•']">{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="text-body-md text-on-surface-variant text-center py-md">Run skill-gap analysis to identify missing skills</p>
      )}
    </Card>
  )
}
