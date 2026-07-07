import { useState, useCallback, useMemo } from 'react'
import {
  Bold,
  Italic,
  List,
  RotateCcw,
  RotateCw,
  Eye,
  Edit3,
  Highlighter,
  Check,
  X,
} from '../../lib/icons'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface ResumeEditorProps {
  markdown: string
  atsKeywords: string[]
  atsKeywordsFound?: string[]
  onChange: (markdown: string) => void
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedPreview({
  markdown,
  atsKeywords,
}: {
  markdown: string
  atsKeywords: string[]
}) {
  const lowerMarkdown = markdown.toLowerCase()
  const foundKeywords = atsKeywords.filter((k) => lowerMarkdown.includes(k.toLowerCase()))

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, lineIndex) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={lineIndex} className="text-heading-1 text-text-primary mt-4 mb-2">
            {highlightKeywords(line.slice(2), foundKeywords)}
          </h1>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={lineIndex} className="text-heading-2 text-text-primary mt-3 mb-2">
            {highlightKeywords(line.slice(3), foundKeywords)}
          </h2>
        )
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={lineIndex} className="text-heading-3 text-text-primary mt-2 mb-1">
            {highlightKeywords(line.slice(4), foundKeywords)}
          </h3>
        )
      }
      if (line.startsWith('- ')) {
        return (
          <li key={lineIndex} className="ml-4 list-disc text-body text-text-secondary">
            {highlightKeywords(line.slice(2), foundKeywords)}
          </li>
        )
      }
      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />
      }
      return (
        <p key={lineIndex} className="text-body text-text-secondary">
          {highlightKeywords(line, foundKeywords)}
        </p>
      )
    })
  }

  const highlightKeywords = (text: string, found: string[]) => {
    if (found.length === 0) return text

    const pattern = new RegExp(
      `(${found.map(escapeRegExp).join('|')})`,
      'gi'
    )

    const parts = text.split(pattern)
    return parts.map((part, index) => {
      const isKeyword = found.some(
        (k) => part.toLowerCase() === k.toLowerCase()
      )
      if (isKeyword) {
        return (
          <mark
            key={index}
            className="bg-amber-200/70 text-text-primary rounded px-0.5"
          >
            {part}
          </mark>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="prose prose-sm max-w-none p-3 bg-surface-secondary rounded-lg min-h-[320px]">
      {renderMarkdown(markdown)}
    </div>
  )
}

export function ResumeEditor({ markdown, atsKeywords, onChange }: ResumeEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split')
  const [history, setHistory] = useState<string[]>([markdown])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showKeywords, setShowKeywords] = useState(true)

  const updateMarkdown = useCallback(
    (newValue: string, recordHistory = true) => {
      onChange(newValue)
      if (recordHistory) {
        const nextHistory = history.slice(0, historyIndex + 1)
        nextHistory.push(newValue)
        setHistory(nextHistory)
        setHistoryIndex(nextHistory.length - 1)
      }
    },
    [history, historyIndex, onChange]
  )

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1
      setHistoryIndex(nextIndex)
      onChange(history[nextIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      setHistoryIndex(nextIndex)
      onChange(history[nextIndex])
    }
  }

  const wrapSelection = (before: string, after: string) => {
    const textarea = document.getElementById('resume-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = markdown.slice(start, end)
    const replacement = `${before}${selected}${after}`
    const newValue = markdown.slice(0, start) + replacement + markdown.slice(end)
    updateMarkdown(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertBullet = () => {
    const textarea = document.getElementById('resume-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = markdown.lastIndexOf('\n', start - 1) + 1
    const newValue = `${markdown.slice(0, lineStart)}- ${markdown.slice(lineStart)}`
    updateMarkdown(newValue)
  }

  const foundKeywords = useMemo(() => {
    const lowerMarkdown = markdown.toLowerCase()
    return atsKeywords.filter((k) => lowerMarkdown.includes(k.toLowerCase()))
  }, [markdown, atsKeywords])

  const missingKeywords = useMemo(
    () => atsKeywords.filter((k) => !foundKeywords.includes(k)),
    [atsKeywords, foundKeywords]
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex items-center gap-1">
          <Button
            variant={mode === 'edit' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
            className="gap-1"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant={mode === 'split' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('split')}
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            Split
          </Button>
          <Button
            variant={mode === 'preview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="gap-1"
          >
            <RotateCw className="h-4 w-4" />
            Redo
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="ghost" size="sm" onClick={() => wrapSelection('**', '**')} className="gap-1">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => wrapSelection('*', '*')} className="gap-1">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={insertBullet} className="gap-1">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {atsKeywords.length > 0 && (
        <div className="border-b border-border p-3 bg-surface-secondary">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Highlighter className="h-4 w-4 text-primary" />
              <span className="text-body-sm font-medium text-text-primary">ATS Keywords</span>
            </div>
            <button
              onClick={() => setShowKeywords(!showKeywords)}
              className="text-caption text-text-tertiary hover:text-primary"
            >
              {showKeywords ? 'Hide' : 'Show'}
            </button>
          </div>
          {showKeywords && (
            <div className="flex flex-wrap gap-1.5">
              {atsKeywords.map((keyword) => {
                const found = foundKeywords.includes(keyword)
                return (
                  <Badge key={keyword} variant={found ? 'success' : 'warning'} className="flex items-center gap-1">
                    {found ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {keyword}
                  </Badge>
                )
              })}
            </div>
          )}
          {missingKeywords.length > 0 && (
            <p className="mt-2 text-caption text-amber-600">
              {missingKeywords.length} keyword{missingKeywords.length > 1 ? 's' : ''} missing from resume
            </p>
          )}
        </div>
      )}

      <div className="p-3">
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            id="resume-editor"
            value={markdown}
            onChange={(e) => updateMarkdown(e.target.value)}
            className={`w-full min-h-[320px] p-3 bg-surface-secondary rounded-lg text-body text-text-primary placeholder:text-text-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-primary font-mono leading-relaxed ${
              mode === 'split' ? 'mb-3' : ''
            }`}
            placeholder="Your tailored resume will appear here..."
          />
        )}
        {(mode === 'preview' || mode === 'split') && (
          <HighlightedPreview markdown={markdown} atsKeywords={atsKeywords} />
        )}
      </div>
    </Card>
  )
}
