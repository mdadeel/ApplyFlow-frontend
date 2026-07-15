import { useState } from 'react'
import { interviewService } from '../../../services/interview'
import { useToast } from '../../layout/useToast'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'
import { Badge } from '../../ui/Badge'
import { Section } from '../../layout/Section'
import { InterviewPrepCard } from '../InterviewPrepCard'
import { EmptyState } from '../../ui/EmptyState'
import { Skeleton } from '../../ui/Skeleton'
import type { Application, InterviewPrep, JDAnalysis } from '../../../types'
import {
  Sparkles,
  BrainCircuit,
  Eye,
  EyeOff,
  Star,
} from '../../../lib/icons'

interface ApplicationInterviewProps {
  application: Application
}

export function ApplicationInterview({ application }: ApplicationInterviewProps) {
  const { showToast } = useToast()

  const [prep, setPrep] = useState<InterviewPrep | null>(null)
  const [loading, setLoading] = useState(false)

  const [starExperience, setStarExperience] = useState('')
  const [starQuestion, setStarQuestion] = useState('')
  const [starResult, setStarResult] = useState<any>(null)
  const [starLoading, setStarLoading] = useState(false)

  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set())
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})
  const [savingAnswer, setSavingAnswer] = useState<string | null>(null)
  const [researchLoading, setResearchLoading] = useState(false)

  async function handleGeneratePrep() {
    setLoading(true)
    try {
      const mockAnalysis: JDAnalysis = {
        _id: application.jdAnalysisId ?? '',
        company: application.company ?? '',
        role: application.role ?? '',
        requiredSkills: [],
        niceToHaveSkills: [],
        keywords: [],
        atsTerms: [],
        redFlags: [],
      }
      const result = await interviewService.generateInterviewPrep(
        application._id,
        mockAnalysis,
        {},
      )
      setPrep(result)
      setRevealedAnswers(new Set())
      showToast('Interview prep generated', 'success')
    } catch {
      showToast('Failed to generate interview prep', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateSTAR() {
    if (!starExperience || !starQuestion) {
      showToast('Fill in experience and question', 'warning')
      return
    }

    setStarLoading(true)
    try {
      const result = await interviewService.generateSTAR(starExperience, starQuestion)
      setStarResult(result)
      showToast('STAR answer generated', 'success')
    } catch {
      showToast('Failed to generate STAR answer', 'error')
    } finally {
      setStarLoading(false)
    }
  }

  async function handleSaveAnswer(questionId: string) {
    if (!prep) return
    const answer = answerDrafts[questionId] ?? ''
    setSavingAnswer(questionId)
    try {
      const updated = await interviewService.saveAnswer(prep._id, questionId, answer)
      setPrep(updated)
      showToast('Answer saved', 'success')
    } catch {
      showToast('Failed to save answer', 'error')
    } finally {
      setSavingAnswer(null)
    }
  }

  async function handleTogglePracticed(questionId: string, current: boolean) {
    if (!prep) return
    try {
      const updated = await interviewService.markPracticed(prep._id, questionId, !current)
      setPrep(updated)
    } catch {
      showToast('Failed to update practice status', 'error')
    }
  }

  async function handleRefreshResearch() {
    if (!prep) return
    setResearchLoading(true)
    try {
      const { companyResearch } = await interviewService.refreshResearch(prep._id)
      setPrep({ ...prep, companyResearch })
      showToast('Company research refreshed', 'success')
    } catch {
      showToast('Failed to refresh research', 'error')
    } finally {
      setResearchLoading(false)
    }
  }

  function getAnswerForQuestion(questionId: string): string {
    if (answerDrafts[questionId] !== undefined) return answerDrafts[questionId]
    return prep?.answers?.find((a) => a.questionId === questionId)?.answer ?? ''
  }

  function isPracticed(questionId: string): boolean {
    return prep?.answers?.find((a) => a.questionId === questionId)?.practiced ?? false
  }

  function toggleAnswer(index: number) {
    setRevealedAnswers((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="space-y-lg animate-in fade-in duration-200">
      
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height={400} />
      ) : prep ? (
        <InterviewPrepCard prep={prep} onRefreshResearch={handleRefreshResearch} researchLoading={researchLoading} />
      ) : (
        <EmptyState
          icon={<BrainCircuit className="h-12 w-12" />}
          title="No Interview Prep"
          description={`Generate interview preparation materials for ${application.role} at ${application.company}.`}
          action={{
            label: 'Generate Prep',
            onClick: handleGeneratePrep,
          }}
        />
      )}

      <Section
        title="STAR Method Builder"
        description="Build structured STAR answers for common questions"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={starExperience}
              onChange={(e) => setStarExperience(e.target.value)}
              placeholder="e.g., Led frontend migration at Metro Optics"
              className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="text"
              value={starQuestion}
              onChange={(e) => setStarQuestion(e.target.value)}
              placeholder="e.g., Tell me about a challenging project"
              className="flex-1 h-10 px-3 rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              onClick={handleGenerateSTAR}
              loading={starLoading}
              icon={<Star className="h-4 w-4" />}
            >
              Generate STAR
            </Button>
          </div>

          {starResult && (
            <Card className="p-4">
              <div className="space-y-3">
                {Object.entries(starResult.star ?? starResult).map(
                  ([key, value]) => (
                    <div key={key}>
                      <p className="text-label-sm text-primary font-semibold uppercase mb-1">
                        {key}
                      </p>
                      <p className="text-body-md text-on-surface">
                        {String(value)}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </Card>
          )}
        </div>
      </Section>

      {prep && prep.questions.length > 0 && (
        <Section title="Practice Mode" description="Test yourself before the interview">
          <div className="space-y-3">
            {prep.questions.map((q, i) => {
              const questionId = `${prep._id}-${i}`
              const practiced = isPracticed(questionId)
              return (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-label-sm text-on-surface-variant">
                          Question {i + 1}
                        </span>
                        <Badge variant="default">
                          {q.type}
                        </Badge>
                      </div>
                      <p className="text-body-md font-medium text-on-surface">
                        {q.question}
                      </p>
                      {revealedAnswers.has(i) && q.answer && (
                        <div className="mt-3 p-3 rounded-lg bg-surface-container-low">
                          <p className="text-label-sm text-on-surface-variant mb-1">
                            Suggested Answer
                          </p>
                          <p className="text-body-md text-on-surface">{q.answer}</p>
                        </div>
                      )}
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={getAnswerForQuestion(questionId)}
                          onChange={(e) =>
                            setAnswerDrafts((prev) => ({ ...prev, [questionId]: e.target.value }))
                          }
                          placeholder="Type your answer here..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface font-body-md text-on-surface placeholder:text-on-surface-variant outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y"
                        />
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer">
                            <input
                              type="checkbox"
                              checked={practiced}
                              onChange={() => handleTogglePracticed(questionId, practiced)}
                              className="h-4 w-4 rounded border-outline-variant accent-primary cursor-pointer"
                            />
                            <span className="font-medium">Practiced</span>
                          </label>
                          <Button
                            size="sm"
                            onClick={() => handleSaveAnswer(questionId)}
                            loading={savingAnswer === questionId}
                          >
                            Save Answer
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAnswer(i)}
                      icon={
                        revealedAnswers.has(i) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )
                      }
                    >
                      {revealedAnswers.has(i) ? 'Hide' : 'Reveal'}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
