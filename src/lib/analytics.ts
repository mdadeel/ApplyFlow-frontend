const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com'

let posthog: typeof import('posthog-js') | null = null

async function ensurePostHog() {
  if (posthog) return
  if (!POSTHOG_KEY) return
  try {
    const mod = await import('posthog-js')
    mod.default.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      loaded: (ph) => {
        posthog = mod.default
        ph.register_for_session({ app: 'applyflow-ai' })
      },
    })
  } catch {
    // PostHog unavailable — events silently dropped
  }
}

const isDev = import.meta.env.DEV

export function trackPageView(page: string) {
  if (isDev) {
    console.log('[analytics] page_view:', page)
    return
  }
  ensurePostHog()
  posthog?.capture('page_view', { page })
}

export function trackAction(action: string, page: string) {
  if (isDev) {
    console.log('[analytics] action:', action, 'page:', page)
    return
  }
  ensurePostHog()
  posthog?.capture('action_click', { action, page })
}

export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (isDev) {
    console.log('[analytics] event:', name, data)
    return
  }
  ensurePostHog()
  posthog?.capture(name, data)
}
