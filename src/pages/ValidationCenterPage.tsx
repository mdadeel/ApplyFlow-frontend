import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Section } from '../components/layout/Section'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Stepper } from '../components/ui/Stepper'
import { ValidationResults } from '../components/features/ValidationResults'
import { Skeleton } from '../components/ui/Skeleton'
import { validationService } from '../services/validation'
import { useToast } from '../components/layout/useToast'
import type { ValidationReport } from '../types'
import {
  FileCheck,
  RotateCw,
  Download,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from '../lib/icons'

const initialSteps = [
  { label: 'Validate', status: 'active' as const },
  { label: 'Review', status: 'pending' as const },
  { label: 'Fix', status: 'pending' as const },
  { label: 'Approve', status: 'pending' as const },
]

export function ValidationCenterPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const toast = useToast()

  const [report, setReport] = useState<ValidationReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [expandedFix, setExpandedFix] = useState<string | null>(null)

  async function handleValidate() {
    const versionId = id ?? 'latest'
    setLoading(true)
    try {
      const result = await validationService.validateResume(versionId)
      setReport(result)
      setCurrentStep(result.blocked ? 2 : 3)
      if (result.blocked) {
        toast.showToast('Validation blocked — issues found', 'error')
      } else if (result.overallPassed) {
        toast.showToast('All validations passed!', 'success')
      }
    } catch {
      toast.showToast('Validation failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleReRun() {
    setReport(null)
    setCurrentStep(0)
    handleValidate()
  }

  function handleExport() {
    navigate('/export')
  }

  function toggleFix(sectionName: string) {
    setExpandedFix((prev) => (prev === sectionName ? null : sectionName))
  }

  const steps = initialSteps.map((step, i) => ({
    ...step,
    status: i < currentStep ? 'completed' as const : i === currentStep ? 'active' as const : 'pending' as const,
  }))

  return (
    <AppLayout>
      <div className="space-y-lg">
        <div className="flex items-center justify-between gap-3 mb-lg">
          <Stepper steps={steps} currentStep={currentStep} className="flex-1" />
          <Button
            onClick={handleReRun}
            variant="ghost"
            icon={<RotateCw className="h-4 w-4" />}
            className="shrink-0"
          >
            New Validation
          </Button>
        </div>

        {!report && !loading && (
          <Section
            title="Resume Validation"
            description="Run ATS and quality checks on your resume"
          >
            <div className="flex justify-center py-lg">
              <Button
                onClick={handleValidate}
                size="lg"
                icon={<FileCheck className="h-4 w-4" />}
              >
                Validate Resume
              </Button>
            </div>
          </Section>
        )}

        {loading && (
          <div className="space-y-4">
            <Skeleton variant="rectangular" width="100%" height={80} />
            <Skeleton variant="rectangular" width="100%" height={120} />
            <Skeleton variant="rectangular" width="100%" height={120} />
          </div>
        )}

        {report && (
          <>
            <ValidationResults report={report} />

            {report.blocked && (
              <Section title="Fix Issues">
                <div className="space-y-2">
                  {report.results
                    .filter((r) => !r.passed)
                    .map((result) => (
                      <Card key={result.name} className="overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleFix(result.name)}
                          className="w-full flex items-center justify-between p-3 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-body-md font-medium text-on-surface">
                              {result.name}
                            </span>
                          </div>
                          {expandedFix === result.name ? (
                            <ChevronUp className="h-4 w-4 text-on-surface-variant" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-on-surface-variant" />
                          )}
                        </button>
                        {expandedFix === result.name && (
                          <div className="px-3 pb-3 space-y-3">
                            {result.issues.map((issue, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-body-md"
                              >
                                <span
                                  className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${
                                    issue.severity === 'error'
                                      ? 'bg-red-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                <div className="flex-1">
                                  <p className="text-on-surface">{issue.message}</p>
                                </div>
                              </div>
                            ))}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                toast.showToast(`Fixing ${result.name}...`, 'info')
                              }
                            >
                              Auto-fix
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              </Section>
            )}

            {!report.blocked && report.overallPassed && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-body-md font-semibold text-emerald-700">
                    All Checks Passed
                  </p>
                  <p className="text-body-md text-emerald-600 mt-0.5">
                    Your resume is ready for export.
                  </p>
                </div>
                <Button onClick={handleExport} icon={<Download className="h-4 w-4" />}>
                  Export
                </Button>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={handleReRun} icon={<RotateCw className="h-4 w-4" />}>
                Re-run Validation
              </Button>
              {!report.blocked && report.overallPassed && (
                <Button onClick={handleExport} icon={<Download className="h-4 w-4" />}>
                  Export Resume
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
