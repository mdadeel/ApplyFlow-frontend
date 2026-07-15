import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Toggle } from '../components/ui/Toggle'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../components/layout/useToast'
import { Briefcase, Eye, EyeOff } from '../lib/icons'

export function LoginPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, login, demoLogin } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.showToast('Welcome back!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setError('')
    setDemoLoading(true)
    try {
      await demoLogin()
      toast.showToast('Welcome to the demo!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Demo login failed. Is the backend running?'
      setError(message)
    } finally {
      setDemoLoading(false)
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
          <p className="text-body-md text-white/70 mt-4 leading-relaxed">
            Streamline your job search with AI-powered resume tailoring,
            intelligent job matching, and automated application tracking.
          </p>
        </div>
      </div>

      {/* Login panel */}
      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm">
            <div className="text-center mb-lg">
              <h2 className="text-headline-lg font-semibold text-on-surface">Welcome Back</h2>
              <p className="text-body-md text-on-surface-variant mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-md">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <Toggle checked={remember} onChange={setRemember} label="Remember me" />
                <Link
                  to="/auth/forgot-password"
                  className="text-label-sm text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <p className="text-label-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-lg">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-3 text-label-sm text-on-surface-variant">
                  or
                </span>
              </div>
            </div>

            {/* Demo login — only shown in development */}
            {import.meta.env.DEV && (
              <>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleDemoLogin}
                  loading={demoLoading}
                >
                  Try Demo Account
                </Button>

                <p className="text-center text-body-sm text-on-surface-variant mt-2">
                  No registration needed — instantly explore all features.
                </p>
              </>
            )}

            <p className="text-center text-body-md text-on-surface-variant mt-lg">
              Don&apos;t have an account?{' '}
              <Link to="/auth/register" className="text-primary font-medium hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
