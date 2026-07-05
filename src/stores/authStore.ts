import { create } from 'zustand'
import * as authApi from '../services/auth'
import type { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string, name: string) => Promise<User>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  demoLogin: () => Promise<User>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const res = await authApi.login(email, password)
      set({ user: res.user, loading: false, error: null })
      return res.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      set({ loading: false, error: message })
      throw err
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null })
    try {
      const res = await authApi.register(email, password, name)
      set({ user: res.user, loading: false, error: null })
      return res.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      set({ loading: false, error: message })
      throw err
    }
  },

  logout: async () => {
    try {
      await authApi.logout()
    } catch {
      // Server call may fail if session already expired — clear local state regardless.
    }
    set({ user: null, error: null })
  },

  checkSession: async () => {
    // Skip if we already have a user.
    if (useAuthStore.getState().user) return

    set({ loading: true })
    try {
      const user = await authApi.getMe()
      set({ user, loading: false, error: null })
    } catch {
      set({ user: null, loading: false, error: null })
    }
  },

  demoLogin: async () => {
    set({ loading: true, error: null })
    try {
      const res = await authApi.demoLogin()
      set({ user: res.user, loading: false, error: null })
      return res.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Demo login failed'
      set({ loading: false, error: message })
      throw err
    }
  },
}))
