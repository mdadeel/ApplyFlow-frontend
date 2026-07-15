import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../components/layout/useToast'
import { Briefcase, Eye, EyeOff } from '../lib/icons'

export function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, register } = useAuthStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register(email, password, name)
      toast.showToast('Account created successfully!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
      toast.showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-container">
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
            Automate the tedious parts of job hunting. Focus on what matters — landing your dream role.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-lg">
        <div className="w-full max-w-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-lg shadow-sm">
            <div className="text-center mb-lg">
              <h2 className="text-headline-lg font-semibold text-on-surface">Create Account</h2>
              <p className="text-body-md text-on-surface-variant mt-1">Start your job search journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-md">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

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
                  placeholder="At least 8 characters"
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
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && (
                <p className="text-label-sm text-error bg-error/5 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Create Account
              </Button>
            </form>

            <p className="text-center text-body-md text-on-surface-variant mt-lg">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
