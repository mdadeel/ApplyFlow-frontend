import { Modal } from '../ui/Modal'
import { Sparkles, Bug, Zap } from '../../lib/icons'

interface WhatsNewModalProps {
  open: boolean
  onClose: () => void
}

interface ReleaseItem {
  icon: typeof Sparkles
  iconColor: string
  title: string
  description: string
}

const RELEASES: ReleaseItem[] = [
  {
    icon: Sparkles,
    iconColor: 'text-amber-500',
    title: 'AI Interview Prep',
    description:
      'Generate role-specific interview questions, talking points, and STAR answers from any application.',
  },
  {
    icon: Zap,
    iconColor: 'text-blue-500',
    title: 'Resume Validation Center',
    description:
      'Run ATS, grammar, and truth validation checks before exporting your tailored resume.',
  },
  {
    icon: Bug,
    iconColor: 'text-green-500',
    title: 'Fixes & Improvements',
    description:
      'Fixed infinite re-render loop, standardized API response format, added Zod validation to all routes, and hardened auth types.',
  },
]

export function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="What's New" size="md">
      <div className="space-y-6">
        <p className="text-body-md text-on-surface-variant">
          Latest updates to ApplyFlow AI
        </p>

        <div className="space-y-4">
          {RELEASES.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low"
              >
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${item.iconColor}`} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-title-md text-on-surface mb-1">{item.title}</h3>
                  <p className="text-body-md text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
