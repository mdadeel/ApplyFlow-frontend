import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from '../lib/icons'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  maxRetries?: number
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  error: Error | null
}

const DEFAULT_MAX_RETRIES = 3

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /** Tracks consecutive retries across error resets — lives outside state so getDerivedStateFromError doesn't reset it. */
  private consecutiveRetries = 0

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught render error:', error.message)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(_prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState): void {
    // Reset retry counter on successful recovery (transition from error → no error)
    if (prevState.error && !this.state.error) {
      this.consecutiveRetries = 0
    }
  }

  handleRetry = (): void => {
    this.consecutiveRetries++
    const maxRetries = this.props.maxRetries ?? DEFAULT_MAX_RETRIES
    if (this.consecutiveRetries > maxRetries) {
      // Exceeded max retries — full reload to get a clean slate
      window.location.reload()
      return
    }
    this.setState({ error: null })
  }

  render(): ReactNode {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[60vh] p-lg">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>

            <div className="space-y-2">
              <h2 className="text-headline-lg text-on-surface font-semibold">
                Something went wrong
              </h2>
              <p className="text-body-md text-on-surface-variant">
                This page encountered an unexpected error. Please try reloading.
              </p>
              {import.meta.env.DEV && (
                <details className="mt-3 text-left">
                  <summary className="text-label-sm text-on-surface-variant cursor-pointer hover:text-on-surface">
                    Error details
                  </summary>
                  <pre className="mt-2 p-3 rounded-lg bg-surface-container-low text-body-sm text-on-surface-variant overflow-auto max-h-32 text-left">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-label-md font-medium hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </button>
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-label-md font-medium hover:bg-surface-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Try Again{this.consecutiveRetries > 0 ? ` (${this.consecutiveRetries}/${this.props.maxRetries ?? DEFAULT_MAX_RETRIES})` : ''}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
