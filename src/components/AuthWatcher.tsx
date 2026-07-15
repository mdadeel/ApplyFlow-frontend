import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { resetAuthExpiredGuard } from '../services/api'

/**
 * Checks for an existing session on mount (from httpOnly cookie).
 * Listens for the `auth:expired` custom event dispatched by the API service
 * and navigates to the login page via React Router (no hard page reload).
 *
 * Uses a ref to prevent concurrent logout calls and resets the API guard
 * after handling so future 401s are correctly dispatched again.
 *
 * Must be mounted inside a <BrowserRouter> context.
 */
export function AuthWatcher() {
  const navigate = useNavigate()
  const checkSession = useAuthStore((s) => s.checkSession)
  const handlingRef = useRef(false)

  // On initial mount, check if we have a valid session cookie.
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Listen for auth expiry events (e.g., 401 responses).
  useEffect(() => {
    const handleAuthExpired = async () => {
      if (handlingRef.current) return
      handlingRef.current = true
      try {
        useAuthStore.getState().setUser(null)
        navigate('/auth/login', { replace: true })
      } finally {
        handlingRef.current = false
        resetAuthExpiredGuard()
      }
    }

    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [navigate])

  return null
}
