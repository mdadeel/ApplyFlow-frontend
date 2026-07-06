import { post, get, put, del } from './api'
import type { User, UserPreferences } from '../types'

export function login(email: string, password: string): Promise<{ user: User }> {
  return post<{ user: User }>('/auth/login', { email, password })
}

export function register(email: string, password: string, name: string): Promise<{ user: User }> {
  return post<{ user: User }>('/auth/register', { email, password, name })
}

export function demoLogin(): Promise<{ user: User }> {
  return post<{ user: User }>('/auth/dev-login')
}

export function logout(): Promise<{ ok: boolean }> {
  return post<{ ok: boolean }>('/auth/logout')
}

export function getMe(): Promise<User> {
  return get<User>('/auth/me')
}

export function updatePreferences(prefs: Partial<UserPreferences>): Promise<User> {
  return put<User>('/auth/preferences', prefs)
}

export function getPreferences(): Promise<UserPreferences> {
  return get<UserPreferences>('/auth/preferences')
}

export function updateProfile(data: { name: string }): Promise<User> {
  return put<User>('/profile/personal/', data)
}

export function saveApiKey(provider: string, key: string): Promise<User> {
  return post<User>('/auth/api-key', { provider, key })
}

export function deleteApiKey(provider: string): Promise<User> {
  return del<User>(`/auth/api-key/${encodeURIComponent(provider)}`)
}

export function changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ ok: boolean }> {
  return put<{ ok: boolean }>('/auth/password', data)
}

export function deleteAccount(): Promise<{ ok: boolean }> {
  return del<{ ok: boolean }>('/auth/account')
}

export function getApiKeysConfigured(): Promise<{ providers: string[] }> {
  return get<{ providers: string[] }>('/auth/api-keys')
}

export const authService = {
  login,
  register,
  demoLogin,
  logout,
  getMe,
  updateProfile,
  updatePreferences,
  getPreferences,
  saveApiKey,
  deleteApiKey,
  changePassword,
  deleteAccount,
  getApiKeysConfigured,
}
