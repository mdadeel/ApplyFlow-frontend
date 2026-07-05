import { useCallback, useRef } from 'react'
import {
  Upload,
  FileText,
  Sparkles,
  Building2,
  Briefcase,
  Loader2,
  X,
  FileSpreadsheet,
} from '../../lib/icons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Tabs } from '../ui/Tabs'
import { Skeleton } from '../ui/Skeleton'
import { Badge } from '../ui/Badge'
import { useToast } from '../layout/useToast'
import type { UploadedResume } from '../../types'

export type InputMode = 'text' | 'csv'

export interface SmartApplicationInputPanelProps {
  inputMode: InputMode
  onInputModeChange: (mode: InputMode) => void
  jdText: string
  onJdTextChange: (text: string) => void
  company: string
  onCompanyChange: (company: string) => void
  role: string
  onRoleChange: (role: string) => void
  masterCVFile: File | null
  onMasterCVFileChange: (file: File | null) => void
  uploadedResumes: UploadedResume[]
  resumesLoading: boolean
  selectedResumeId: string
  onSelectedResumeIdChange: (id: string) => void
  isGenerating: boolean
  onGenerate: () => void
  jdCount: number
}

export function SmartApplicationInputPanel({
  inputMode,
  onInputModeChange,
  jdText,
  onJdTextChange,
  company,
  onCompanyChange,
  role,
  onRoleChange,
  masterCVFile,
  onMasterCVFileChange,
  uploadedResumes,
  resumesLoading,
  selectedResumeId,
  onSelectedResumeIdChange,
  isGenerating,
  onGenerate,
  jdCount,
}: SmartApplicationInputPanelProps) {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (
        file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
        file.type !== 'application/msword' &&
        file.type !== 'text/csv'
      ) {
        showToast('Only DOCX, DOC, and CSV files are supported', 'error')
        return
      }
      if (inputMode === 'csv' && file.type !== 'text/csv') {
        showToast('Please upload a CSV file for bulk CSV mode', 'error')
        return
      }
      if (inputMode !== 'csv' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && file.type !== 'application/msword') {
        showToast('Please upload a .docx or .doc file', 'error')
        return
      }
      onMasterCVFileChange(file)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (file) {
        if (inputMode === 'csv') {
          if (file.type !== 'text/csv') {
            showToast('Please upload a CSV file for bulk CSV mode', 'error')
            return
          }
        } else {
          if (
            file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
            file.type !== 'application/msword'
          ) {
            showToast('Please upload a .docx or .doc file', 'error')
            return
          }
        }
        onMasterCVFileChange(file)
      }
    },
    [showToast, inputMode, onMasterCVFileChange],
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="border-b border-outline-variant p-4">
        <h2 className="text-headline-sm font-semibold text-on-surface flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Job Description
        </h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Paste one or more job descriptions and generate a tailored package for each.
        </p>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <Tabs
          tabs={[
            { id: 'text', label: 'Paste JD(s)' },
            { id: 'csv', label: 'Upload CSV' },
          ]}
          activeTab={inputMode}
          onChange={(id) => onInputModeChange(id as InputMode)}
        />

        {inputMode === 'text' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Company (optional)"
                placeholder="e.g. Google"
                value={company}
                onChange={(e) => onCompanyChange(e.target.value)}
                icon={<Building2 className="h-4 w-4" />}
              />
              <Input
                label="Role (optional)"
                placeholder="e.g. Frontend Engineer"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                icon={<Briefcase className="h-4 w-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-body-sm font-medium text-on-surface">Job Description</label>
                {jdCount > 0 && (
                  <Badge variant="info" size="sm">
                    {jdCount} JD{jdCount > 1 ? 's' : ''} detected
                  </Badge>
                )}
              </div>
              <textarea
                value={jdText}
                onChange={(e) => onJdTextChange(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-64 p-3 bg-surface-container-low rounded-lg text-body-md text-on-surface placeholder-on-surface-variant resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-caption text-on-surface-variant">
                For multiple JDs, separate each with <code>---</code> on a new line.
                Add <code>Company:</code> and <code>Role:</code> headers for each.
              </p>
            </div>
          </div>
        )}

        {inputMode === 'csv' && (
          <div className="space-y-3">
            <div className="p-3 bg-surface-container-low rounded-lg">
              <p className="text-body-sm text-on-surface-variant">
                Upload a CSV with columns: <code>company</code>, <code>role</code>,{' '}
                <code>jd_text</code> (or <code>job_description</code>).
              </p>
            </div>
            {!masterCVFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <FileSpreadsheet className="h-10 w-10 text-on-surface-variant mx-auto mb-3" />
                <p className="text-body-md font-medium text-on-surface">Upload CSV of JDs</p>
                <p className="text-body-sm text-on-surface-variant mt-1">Drag & drop or click to browse</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-body-sm text-on-surface truncate">{masterCVFile.name}</span>
                </div>
                <button
                  onClick={() => onMasterCVFileChange(null)}
                  className="p-1 rounded hover:bg-surface-container-highest text-on-surface-variant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resume selector */}
        <div className="space-y-2">
          <label className="text-body-sm font-medium text-on-surface">Select Resume (optional)</label>
          {resumesLoading ? (
            <div className="p-3 bg-surface-container-low rounded-lg">
              <Skeleton className="h-5 w-full" />
            </div>
          ) : uploadedResumes.length > 0 ? (
            <div className="space-y-1.5">
              <select
                value={selectedResumeId}
                onChange={(e) => onSelectedResumeIdChange(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-outline-variant bg-surface text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">No resume (generate fresh)</option>
                {uploadedResumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.fileName}</option>
                ))}
              </select>
              <p className="text-caption text-on-surface-variant">
                Select an uploaded resume to use as your master CV.
                <a href="/profile" className="text-primary hover:underline ml-1">Manage resumes</a>
              </p>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Upload className="h-8 w-8 text-on-surface-variant mx-auto mb-2" />
              <p className="text-body-sm font-medium text-on-surface">Upload DOCX CV</p>
              <p className="text-caption text-on-surface-variant mt-1">Drag & drop or click to browse</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.doc,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Sticky footer with Generate button */}
      <div className="border-t border-outline-variant p-4 bg-surface shrink-0">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full gap-2"
          size="lg"
        >
          {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {isGenerating ? 'Generating...' : 'Generate Application Package'}
        </Button>
      </div>
    </Card>
  )
}
