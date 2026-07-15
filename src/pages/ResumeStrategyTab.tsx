import { useState, useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { SplitPanel } from '../components/layout/SplitPanel'
import { Section } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Chip } from '../components/ui/Chip'
import { EmptyState } from '../components/ui/EmptyState'
import { Skeleton } from '../components/ui/Skeleton'
import { useToast } from '../components/layout/useToast'
import { jdService } from '../services/jd'
import { resumeService } from '../services/resume'
import { applicationsService } from '../services/applications'
import type { ResumeStrategy, JDAnalysis } from '../types'
import {
  Sparkles,
  Target,
  ArrowRight,
  GripVertical,
  Lightbulb,
  Layers,
  AlertTriangle,
  X,
} from '../lib/icons'

export function ResumeStrategyTab() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const initialAnalysis = (location.state as { analysis?: JDAnalysis })?.analysis || null

  const [analysis, setAnalysis] = useState<JDAnalysis | null>(initialAnalysis)
  const [strategy, setStrategy] = useState<ResumeStrategy | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderExperiences, setOrderExperiences] = useState<string[]>([])
  const [orderProjects, setOrderProjects] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  useEffect(() => {
    const appId = searchParams.get('application')
    if (!appId) return

    setLoading(true)
    applicationsService.getApplication(appId)
      .then((app) => {
        if (app.jdText) {
          return jdService.analyzeJD(app.jdText)
        }
        throw new Error('No job description found in this application')
      })
      .then((result) => {
        setAnalysis(result)
      })
      .catch((err) => {
        console.error('Failed to load application JD for Strategy', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [searchParams])

  async function handleGenerateStrategy() {
    if (!analysis) {
      toast.showToast('No JD analysis available. Please analyze a JD first.', 'warning')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await resumeService.generateStrategy(
        analysis.keywords,
        analysis.requiredSkills,
      )
      setStrategy(result)
      setOrderExperiences(result.ordering.experiences ?? [])
      setOrderProjects(result.ordering.projects ?? [])
      setSelectedSkills(result.matchedSkills ?? [])
      toast.showToast('Resume strategy generated', 'success')
    } catch {
      setError('Failed to generate resume strategy. Please try again.')
      toast.showToast('Failed to generate strategy', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleProceedToEditor() {
    navigate('/resume-editor', { state: { strategy, analysis } })
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    )
  }

  function moveItem(arr: string[], fromIndex: number, toIndex: number) {
    const copy = [...arr]
    const [removed] = copy.splice(fromIndex, 1)
    copy.splice(toIndex, 0, removed)
    return copy
  }

  function moveExperienceUp(index: number) {
    if (index === 0) return
    setOrderExperiences(moveItem(orderExperiences, index, index - 1))
  }

  function moveExperienceDown(index: number) {
    if (index === orderExperiences.length - 1) return
    setOrderExperiences(moveItem(orderExperiences, index, index + 1))
  }

  function moveProjectUp(index: number) {
    if (index === 0) return
    setOrderProjects(moveItem(orderProjects, index, index - 1))
  }

  function moveProjectDown(index: number) {
    if (index === orderProjects.length - 1) return
    setOrderProjects(moveItem(orderProjects, index, index + 1))
  }

  return (
    <div className="space-y-lg animate-in fade-in duration-200 h-full">
      <SplitPanel
        leftWeight={1}
        rightWeight={2}
        left={
          <div className="space-y-md">
            <Section
              title="Skill Mapping"
              description="Select which skills and experiences to highlight"
            >
              {!analysis ? (
                <EmptyState
                  icon={<Target className="h-10 w-10" />}
                  title="No JD Data"
                  description="Go back and analyze a job description first"
                  action={{
                    label: 'Analyze JD',
                    onClick: () => navigate('/smart-application'),
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-2">
                      {'Required Skills from JD'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.requiredSkills.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          onRemove={
                            selectedSkills.includes(skill)
                              ? () => toggleSkill(skill)
                              : undefined
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-label-sm text-on-surface-variant mb-2">{'Matched Skills'}</p>
                    {selectedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="success">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-body-md text-on-surface-variant italic">
                        {'Skills will appear after generating strategy'}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Section>

            <Button
              onClick={handleGenerateStrategy}
              loading={loading}
              className="w-full"
              size="lg"
              icon={<Sparkles className="h-4 w-4" />}
            >
              {'Generate Strategy'}
            </Button>
          </div>
        }
        right={
          loading ? (
            <div className="space-y-4">
              <Skeleton variant="rectangular" width="100%" height={60} />
              <Skeleton variant="rectangular" width="100%" height={120} />
              <Skeleton variant="rectangular" width="100%" height={120} />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-error/20 bg-red-50 p-4 text-body-md text-error flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{'Strategy Generation Failed'}</p>
                <p className="text-error/80 mt-0.5">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 rounded hover:bg-error/10 transition-colors shrink-0" aria-label="Dismiss">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : strategy ? (
            <div className="space-y-md">
              <Section
                title="Strategy Preview"
                description="Review ordering decisions and reasoning"
              >
                {Object.keys(strategy.reasoning).length > 0 && (
                  <div className="space-y-3 mb-4">
                    {Object.entries(strategy.reasoning).map(([key, reason]) => (
                      <Card key={key} className="p-3">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-body-md font-medium text-on-surface capitalize">
                              {key.replace(/-/g, ' ')}
                            </p>
                            <p className="text-body-md text-on-surface-variant mt-0.5">
                              {reason}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-label-sm text-on-surface-variant mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Experience Order
                  </p>
                  <div className="space-y-2">
                    {orderExperiences.map((expId, index) => (
                      <Card key={expId} className="p-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-on-surface-variant shrink-0" />
                          <div className="flex-1">
                            <p className="text-body-md text-on-surface">{expId}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveExperienceUp(index)}
                              disabled={index === 0}
                              className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveExperienceDown(index)}
                              disabled={index === orderExperiences.length - 1}
                              className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-label-sm text-on-surface-variant mb-2 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Projects Order
                  </p>
                  <div className="space-y-2">
                    {orderProjects.map((projId, index) => (
                      <Card key={projId} className="p-3">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-on-surface-variant shrink-0" />
                          <div className="flex-1">
                            <p className="text-body-md text-on-surface">{projId}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => moveProjectUp(index)}
                              disabled={index === 0}
                              className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveProjectDown(index)}
                              disabled={index === orderProjects.length - 1}
                              className="p-1 text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {strategy.excludedItems.length > 0 && (
                  <div className="mt-4">
                    <p className="text-label-sm text-on-surface-variant mb-2">{'Excluded Items'}</p>
                    <div className="space-y-1.5">
                      {strategy.excludedItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 text-body-md text-on-surface-variant"
                        >
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-on-surface-variant shrink-0" />
                          <span>
                            <strong>{item.id}</strong> — {item.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              <div className="flex justify-end">
                <Button
                  onClick={handleProceedToEditor}
                  icon={<ArrowRight className="h-4 w-4" />}
                  size="lg"
                >
                  {'Proceed to Resume Editor'}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Lightbulb className="h-12 w-12" />}
              title="No Strategy Generated"
              description="Click 'Generate Strategy' to create a tailored resume plan based on the JD analysis."
            />
          )
        }
      />
    </div>
  )
}
