import { Modal } from '../ui/Modal'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

interface ShortcutGroup {
  group: string
  shortcuts: { keys: string; desc: string }[]
}

const SHORTCUTS: ShortcutGroup[] = [
  {
    group: 'Navigation',
    shortcuts: [
      { keys: 'G then D', desc: 'Go to Dashboard' },
      { keys: 'G then A', desc: 'Go to Applications' },
      { keys: 'G then P', desc: 'Go to Career Profile' },
      { keys: 'G then S', desc: 'Go to Settings' },
    ],
  },
  {
    group: 'Actions',
    shortcuts: [
      { keys: 'C', desc: 'Create new application' },
      { keys: '/', desc: 'Focus search' },
      { keys: 'Escape', desc: 'Close modal / panel' },
    ],
  },
  {
    group: 'Application Detail',
    shortcuts: [
      { keys: 'J', desc: 'Next application' },
      { keys: 'K', desc: 'Previous application' },
      { keys: '?', desc: 'Toggle this shortcuts panel' },
    ],
  },
]

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-1.5 rounded-md border border-outline-variant bg-surface-container-low text-label-sm text-on-surface-variant font-mono shadow-sm">
      {children}
    </kbd>
  )
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-6">
        {SHORTCUTS.map((group) => (
          <div key={group.group}>
            <h3 className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold mb-3">
              {group.group}
            </h3>
            <div className="space-y-2">
              {group.shortcuts.map((s) => (
                <div
                  key={s.keys}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  <span className="text-body-md text-on-surface">{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.split(' then ').map((part, i) => (
                      <span key={part} className="flex items-center gap-1">
                        {i > 0 && <span className="text-on-surface-variant text-label-sm">then</span>}
                        {part.split(' + ').length > 1 ? (
                          <span className="flex items-center gap-0.5">
                            {part.split(' + ').map((k, j) => (
                              <span key={k} className="flex items-center gap-0.5">
                                {j > 0 && <span className="text-on-surface-variant text-label-sm">+</span>}
                                <Kbd>{k}</Kbd>
                              </span>
                            ))}
                          </span>
                        ) : (
                          <Kbd>{part}</Kbd>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <p className="text-label-sm text-on-surface-variant text-center pt-2 border-t border-outline-variant">
          Press <Kbd>?</Kbd> anywhere to toggle this panel
        </p>
      </div>
    </Modal>
  )
}
