import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Mail, Briefcase, ArrowLeft, CheckCircle } from '../lib/icons'
import { forgotPassword } from '../services/auth'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

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

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm">
            {sent ? (
              /* Success state */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 text-success mb-4">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Check Your Email</h2>
                <p className="text-body-md text-on-surface-variant mb-6 leading-relaxed">
                  If an account exists for <strong className="text-on-surface">{email}</strong>,
                  we've sent a password reset link.
                </p>
                <p className="text-body-sm text-on-surface-variant mb-6">
                  Didn't receive it? Check your spam folder or{' '}
                  <button
                    onClick={() => { setSent(false); setError('') }}
                    className="text-primary font-medium hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    try again
                  </button>
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 text-body-sm text-on-surface-variant hover:text-on-surface"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            ) : (
              /* Form */
              <>
                <div className="text-center mb-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h2 className="text-headline-lg font-semibold text-on-surface">Forgot Password</h2>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Enter your email and we'll send you a reset link
                </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-md">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {error && (
                    <p className="text-label-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <Button type="submit" loading={loading} className="w-full">
                    Send Reset Link
                  </Button>
                </form>

                <p className="text-center text-body-md text-on-surface-variant mt-lg">
                  <Link to="/auth/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
