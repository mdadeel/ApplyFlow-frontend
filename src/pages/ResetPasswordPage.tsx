import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Briefcase, Eye, EyeOff, CheckCircle, AlertTriangle } from '../lib/icons'
import { useToast } from '../components/layout/useToast'
import { resetPassword } from '../services/auth'

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()

  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. No token provided.')
    }
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid reset link.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      toast.showToast('Password reset successfully!', 'success')
      setTimeout(() => navigate('/dashboard', { replace: true }), 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reset password. The link may have expired.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (!token && !error) {
    return null // Still checking
  }

  return (
    <div className="min-h-screen flex bg-surface-container">
      {/* Brand panel */}
      <div className="hidden md:flex md:w-1/2 bg-primary-container items-center justify-center p-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-6">
            <Briefcase className="h-8 w-8" />
          </div>
          <h1 className="text-display-md font-bold text-on-primary mb-3">ApplyFlow AI</h1>
          <p className="text-headline-sm text-on-primary-container opacity-90">
            Your Intelligent Job Application OS
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm">
            {success ? (
              /* Success state */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success/10 text-success mb-4">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Password Reset!</h2>
                <p className="text-body-md text-on-surface-variant mb-6">
                  Your password has been updated. Redirecting you to the dashboard...
                </p>
              </div>
            ) : error && !token ? (
              /* Invalid link */
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 text-error mb-4">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <h2 className="text-headline-lg font-semibold text-on-surface mb-2">Invalid Link</h2>
                <p className="text-body-md text-on-surface-variant mb-6">
                  This password reset link is invalid or missing a token.
                </p>
                <Link
                  to="/auth/forgot-password"
                  className="text-primary font-medium hover:underline"
                >
                  Request a new reset link
                </Link>
              </div>
            ) : (
              /* Form */
              <>
                <div className="text-center mb-lg">
                  <h2 className="text-headline-lg font-semibold text-on-surface">Set New Password</h2>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Choose a strong password for your account
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-md">
                  <div className="relative">
                    <Input
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-on-surface-variant hover:text-on-surface"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  {error && (
                    <p className="text-label-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <Button type="submit" loading={loading} className="w-full">
                    Reset Password
                  </Button>
                </form>

                <p className="text-center text-body-md text-on-surface-variant mt-lg">
                  <Link to="/auth/login" className="text-primary font-medium hover:underline">
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
