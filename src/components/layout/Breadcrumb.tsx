import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ChevronRight } from '../../lib/icons'
import { applicationsService } from '../../services/applications'

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  applications: 'Applications',
  profile: 'Career Profile',
  templates: 'Templates',
  'jd-analysis': 'JD Analysis',
  'resume-strategy': 'Resume Strategy',
  'resume-editor': 'Resume Editor',
  validation: 'Validation Center',
  export: 'Export Center',
  interview: 'Interview Prep',
  analytics: 'Analytics',
  settings: 'Settings',
}

function labelForSegment(segment: string, isLast: boolean, dynamicLabel?: string): string {
  if (isLast && dynamicLabel) return dynamicLabel
  if (ROUTE_LABELS[segment]) return ROUTE_LABELS[segment]
  if (/^[a-f0-9]{20,}$/i.test(segment)) return 'Details'
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const [dynamicLabel, setDynamicLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDynamicLabel() {
      if (segments[0] === 'applications' && segments.length >= 2 && segments[1]) {
        try {
          const app = await applicationsService.getApplication(segments[1])
          if (cancelled) return
          if (app && app.company && app.role) {
            setDynamicLabel(`${app.company} - ${app.role}`)
          } else {
            setDynamicLabel(null)
          }
        } catch {
          if (!cancelled) setDynamicLabel(null)
        }
      } else {
        setDynamicLabel(null)
      }
    }

    loadDynamicLabel()
    return () => { cancelled = true }
  }, [location.pathname, segments])

  if (segments.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0 text-body-md">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
      >
        <Home className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1
        const path = '/' + segments.slice(0, index + 1).join('/')
        const label = labelForSegment(segment, isLast, dynamicLabel ?? undefined)

        return (
          <div key={path} className="flex items-center gap-1.5 min-w-0">
            <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" aria-hidden="true" />
            {isLast ? (
              <span className="text-on-surface font-medium truncate" aria-current="page">
                {label}
              </span>
            ) : (
              <Link
                to={path}
                className="text-on-surface-variant hover:text-on-surface transition-colors truncate"
              >
                {label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
