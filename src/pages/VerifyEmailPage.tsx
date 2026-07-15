import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Briefcase, CheckCircle, XCircle, Loader2, Mail } from '../lib/icons'
import { verifyEmail, resendVerification } from '../services/auth'
import { useToast } from '../components/layout/useToast'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const toast = useToast()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Verifying your email...')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided. Please use the link from your email.')
      return
    }

    async function verify() {
      try {
        const result = await verifyEmail(token)
        setStatus('success')
        setMessage(result.message || 'Email verified successfully!')
      } catch (err: unknown) {
        setStatus('error')
        const msg = err instanceof Error ? err.message : 'Verification failed. The link may have expired.'
        setMessage(msg)
      }
    }

    // Small delay so the user can see the spinner
    const timer = setTimeout(() => verify(), 800)
    return () => clearTimeout(timer)
  }, [token])

  return (
    <div className="min-h-screen flex bg-surface-container">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white mb-6">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-display-md font-bold text-white mb-3">ApplyFlow AI</h1>
          <p className="text-headline-sm text-white/90">
            Your Intelligent Job Application OS
          </p>
        </div>
      </div>

      {/* Content panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm text-center">
            {status === 'loading' && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Verifying</h2>
                <p className="text-body-md text-on-surface-variant">{message}</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 text-success mb-4">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Email Verified!</h2>
                <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
                >
                  Go to Dashboard
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error mb-4">
                  <XCircle className="h-7 w-7" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Verification Failed</h2>
                <p className="text-body-md text-on-surface-variant mb-6">{message}</p>
                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      setResending(true)
                      try {
                        await resendVerification()
                        toast.showToast('Verification email sent!', 'success')
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : 'Failed to resend'
                        toast.showToast(msg, 'error')
                      } finally {
                        setResending(false)
                      }
                    }}
                    disabled={resending}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {resending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Resend Verification Email
                  </button>
                  <div>
                    <Link
                      to="/auth/login"
                      className="text-primary font-medium hover:underline"
                    >
                      Go to login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
