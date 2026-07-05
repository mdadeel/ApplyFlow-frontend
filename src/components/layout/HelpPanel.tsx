import { useEffect, useRef } from 'react'
import { BookOpen, Keyboard, MessageSquare, Sparkles } from '../../lib/icons'

interface HelpPanelProps {
  onClose: () => void
  onSelect: (id: string) => void
}

interface HelpItem {
  id: string
  label: string
  icon: typeof BookOpen
}

const HELP_ITEMS: HelpItem[] = [
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'shortcuts', label: 'Keyboard shortcuts', icon: Keyboard },
  { id: 'feedback', label: 'Send feedback', icon: MessageSquare },
  { id: 'whats-new', label: "What's new", icon: Sparkles },
]

export function HelpPanel({ onClose, onSelect }: HelpPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={panelRef}
      role="menu"
      aria-label="Help"
      className="absolute right-0 top-full mt-2 w-56 bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden"
    >
      <ul className="py-1" role="none">
        {HELP_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} role="none">
              <button
                role="menuitem"
                onClick={() => onSelect(item.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-body-md text-on-surface hover:bg-surface-container transition-colors text-left"
              >
                <Icon className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
                <span className="flex-1 truncate">{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
