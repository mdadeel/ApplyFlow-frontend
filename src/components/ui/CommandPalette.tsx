import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  Briefcase,
  User,
  Settings,
  Sparkles,
  Zap,
  FileText
} from '../../lib/icons'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

const commands = [
  { id: 'dashboard', label: 'Go to Today', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'applications', label: 'Go to Tracker', icon: Briefcase, href: '/applications' },
  { id: 'resumes', label: 'Go to Identity', icon: FileText, href: '/resume-library' },
  { id: 'network', label: 'Go to Network', icon: Sparkles, href: '/community/feed' },
  { id: 'smart-apply', label: 'Smart Apply', icon: Zap, href: '/smart-application' },
  { id: 'profile', label: 'Career Profile', icon: User, href: '/profile' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setSearch('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (open) {
          onClose()
        }
      }
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (href: string) => {
    navigate(href)
    onClose()
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-surface rounded-xl shadow-2xl border border-border overflow-hidden"
        >
          <div className="flex items-center px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-text-tertiary mr-3" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-body-lg text-text-primary placeholder:text-text-tertiary"
              placeholder="Search or jump to..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="text-meta font-medium px-1.5 py-0.5 rounded bg-surface-secondary text-text-tertiary ml-3 border border-border">
              ESC
            </span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredCommands.length > 0 ? (
              <div className="space-y-1">
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon
                  return (
                    <button
                      key={cmd.id}
                      className="w-full flex items-center px-3 py-2.5 rounded-lg text-left hover:bg-surface-secondary group transition-colors"
                      onClick={() => handleSelect(cmd.href)}
                    >
                      <Icon className="w-4 h-4 text-text-secondary group-hover:text-primary mr-3" />
                      <span className="text-body-sm font-medium text-text-primary group-hover:text-primary">
                        {cmd.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-text-tertiary text-body-sm">
                No results found.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
