import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Dialog } from '../components/ui/Dialog'
import { Tabs } from '../components/ui/Tabs'
import { Toggle } from '../components/ui/Toggle'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/auth'
import { getNotifications, markAsRead, dismiss, type NotificationItem } from '../services/notifications'
import { useToast } from '../components/layout/useToast'
import { AvatarUploader } from '../components/settings/AvatarUploader'
import {
  Save,
  AlertTriangle,
  Shield,
  Key,
  Link,
  CheckCircle,
  Check,
  ExternalLink,
  GitPullRequest,
  Globe,
  Trash2,
  Bell,
  X,
} from '../lib/icons'

type SettingsTab = 'profile' | 'ai-preferences' | 'security' | 'integrations' | 'notifications'

const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Account' },
  { id: 'ai-preferences', label: 'AI Preferences' },
  { id: 'security', label: 'Security' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const [name, setName] = useState(user?.name ?? '')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [prefSaving, setPrefSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // 2FA toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSaving, setTwoFactorSaving] = useState(false)

  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)

  // Notification history
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationBusy, setNotificationBusy] = useState<Record<string, boolean>>({})

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState({
    applicationUpdates: true,
    interviewReminders: true,
    newFeatures: false,
    weeklyDigest: true,
    marketingEmails: false,
  })

  const [preferences, setPreferences] = useState({
    aiProvider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    writingTone: 'professional',
    defaultExportFormat: 'pdf',
  })

  // API keys — inputs per provider and a local map of which providers are
  // currently configured. The server never returns the key values, so we
  // track configuration state client-side.
  const apiKeyProviders = ['openai', 'anthropic', 'gemini', 'openrouter'] as const
  type ApiKeyProvider = (typeof apiKeyProviders)[number]
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<ApiKeyProvider, string>>({
    openai: '',
    anthropic: '',
    gemini: '',
    openrouter: '',
  })
  const [apiKeyConfigured, setApiKeyConfigured] = useState<Record<ApiKeyProvider, boolean>>({
    openai: false,
    anthropic: false,
    gemini: false,
    openrouter: false,
  })
  const [apiKeySaving, setApiKeySaving] = useState<Partial<Record<ApiKeyProvider, boolean>>>({})
  const [apiKeyDeleting, setApiKeyDeleting] = useState<Partial<Record<ApiKeyProvider, boolean>>>({})

  // Integrations — which OAuth providers are configured on the backend, and
  // a ref to any open OAuth popup so we can detect it closing.
  const [integrationStatus, setIntegrationStatus] = useState<{ github: boolean; linkedin: boolean }>({
    github: false,
    linkedin: false,
  })
  const oauthPopupRef = useRef<Window | null>(null)

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        aiProvider: user.preferences.aiProvider ?? prev.aiProvider,
        model: user.preferences.model ?? prev.model,
        temperature: user.preferences.temperature ?? prev.temperature,
        writingTone: user.preferences.writingTone ?? prev.writingTone,
        defaultExportFormat: user.preferences.defaultExportFormat ?? prev.defaultExportFormat,
      }))
    }
  }, [user])

  // Fetch backend integration status (which OAuth providers have CLIENT_ID/SECRET configured).
  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/integrations/status')
      .then(res => res.ok ? res.json() : { data: { github: false, linkedin: false } })
      .then(body => {
        if (cancelled) return
        const status = (body?.data ?? body) as { github?: boolean; linkedin?: boolean }
        setIntegrationStatus({
          github: Boolean(status.github),
          linkedin: Boolean(status.linkedin),
        })
      })
      .catch(() => {
        // Backend unreachable or not configured — leave as false.
      })
    return () => { cancelled = true }
  }, [])

  // Load persisted settings on mount: preferences, configured API keys, and notification history.
  // Each fetch is independent — a single failure shows one error toast and does not block the others.
  useEffect(() => {
    let cancelled = false
    let loadErrors = 0

    const markError = (label: string) => {
      if (cancelled) return
      loadErrors += 1
      if (loadErrors === 1) {
        toast.showToast(`Failed to load ${label}`, 'error')
      }
    }

    authService.getPreferences()
      .then((prefs) => {
        if (cancelled) return
        if (prefs) {
          setPreferences(prev => ({
            ...prev,
            aiProvider: prefs.aiProvider ?? prev.aiProvider,
            model: prefs.model ?? prev.model,
            temperature: typeof prefs.temperature === 'number' ? prefs.temperature : prev.temperature,
            writingTone: prefs.writingTone ?? prev.writingTone,
            defaultExportFormat: prefs.defaultExportFormat ?? prev.defaultExportFormat,
          }))
          if (prefs.notifications) {
            setEmailNotifications(prev => ({
              applicationUpdates: prefs.notifications.applicationUpdates ?? prev.applicationUpdates,
              interviewReminders: prefs.notifications.interviewReminders ?? prev.interviewReminders,
              newFeatures: prefs.notifications.newFeatures ?? prev.newFeatures,
              weeklyDigest: prefs.notifications.weeklyDigest ?? prev.weeklyDigest,
              marketingEmails: prefs.notifications.marketingEmails ?? prev.marketingEmails,
            }))
          }
          setTwoFactorEnabled(Boolean(prefs.twoFactorEnabled))
        }
      })
      .catch(() => markError('preferences'))

    authService.getApiKeysConfigured()
      .then((res) => {
        if (cancelled) return
        const configured = (res?.providers ?? []).reduce<Record<string, boolean>>((acc, p) => {
          acc[p] = true
          return acc
        }, {})
        setApiKeyConfigured(prev => {
          const next = { ...prev }
          for (const provider of apiKeyProviders) {
            if (configured[provider]) next[provider] = true
          }
          return next
        })
      })
      .catch(() => markError('API keys'))

    getNotifications()
      .then((res) => {
        if (cancelled) return
        setNotifications(res?.items ?? [])
      })
      .catch(() => markError('notifications'))

    return () => { cancelled = true }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listen for postMessage from the OAuth popup. On success, refresh user data.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; provider?: string; status?: string } | null
      if (!data || data.type !== 'oauth-callback') return
      const provider = data.provider
      if (provider !== 'linkedin' && provider !== 'github') return

      const ok = data.status === 'connected'
      if (ok) {
        // Refresh user data so the connected badge updates.
        authService.getMe()
          .then((fresh) => setUser(fresh))
          .catch(() => { /* swallow — badge will refresh on next load */ })
          .finally(() => {
            toast.showToast(`${provider === 'github' ? 'GitHub' : 'LinkedIn'} connected`, 'success')
          })
      } else {
        toast.showToast(`Failed to connect ${provider === 'github' ? 'GitHub' : 'LinkedIn'}`, 'error')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [setUser, toast])

  // If this page mounted inside an OAuth popup (window.opener exists), detect
  // the callback query params from the backend redirect, forward them to the
  // opener, and close ourselves.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.opener) return

    const params = new URLSearchParams(window.location.search)
    const linkedinStatus = params.get('linkedin')
    const githubStatus = params.get('github')

    let forwarded: { provider: 'linkedin' | 'github'; status: 'connected' | 'error' } | null = null
    if (linkedinStatus === 'connected' || linkedinStatus === 'error') {
      forwarded = { provider: 'linkedin', status: linkedinStatus as 'connected' | 'error' }
    } else if (githubStatus === 'connected' || githubStatus === 'error') {
      forwarded = { provider: 'github', status: githubStatus as 'connected' | 'error' }
    }

    if (!forwarded) return

    try {
      window.opener.postMessage({ type: 'oauth-callback', ...forwarded }, window.location.origin)
    } catch {
      // opener may have navigated away — best-effort only.
    }
    // Brief delay so the message has a chance to flush before we close.
    setTimeout(() => { window.close() }, 50)
  }, [])

  function openOAuthPopup(provider: 'github' | 'linkedin') {
    if (!integrationStatus[provider]) {
      toast.showToast(
        `${provider === 'github' ? 'GitHub' : 'LinkedIn'} OAuth not configured. Add CLIENT_ID and CLIENT_SECRET to backend .env`,
        'warning',
      )
      return
    }
    if (oauthPopupRef.current && !oauthPopupRef.current.closed) {
      oauthPopupRef.current.focus()
      return
    }
    const popup = window.open(`/api/auth/${provider}`, 'oauth_popup', 'width=600,height=720')
    if (!popup) {
      toast.showToast('Popup blocked. Please allow popups for this site.', 'warning')
      return
    }
    oauthPopupRef.current = popup
  }

  async function handleSaveProfile() {
    if (!name.trim()) {
      toast.showToast('Name cannot be empty', 'error')
      return
    }
    setProfileSaving(true)
    try {
      await authService.updateProfile({ name: name.trim() })
      toast.showToast('Profile updated successfully', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      toast.showToast(message, 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleSavePreferences() {
    setPrefSaving(true)
    try {
      await authService.updatePreferences(preferences)
      toast.showToast('Preferences saved successfully', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save preferences'
      toast.showToast(message, 'error')
    } finally {
      setPrefSaving(false)
    }
  }

  async function handleSaveNotificationPreferences() {
    setSavingNotifications(true)
    try {
      await authService.updatePreferences({ notifications: emailNotifications })
      toast.showToast('Notification preferences saved', 'success')
    } catch {
      toast.showToast('Failed to save preferences', 'error')
    } finally {
      setSavingNotifications(false)
    }
  }

  async function handleSaveApiKey(provider: ApiKeyProvider) {
    const value = apiKeyInputs[provider].trim()
    if (!value) {
      toast.showToast(`Enter a key for ${provider}`, 'warning')
      return
    }
    setApiKeySaving(prev => ({ ...prev, [provider]: true }))
    try {
      await authService.saveApiKey(provider, value)
      setApiKeyConfigured(prev => ({ ...prev, [provider]: true }))
      setApiKeyInputs(prev => ({ ...prev, [provider]: '' }))
      toast.showToast(`${provider} API key saved`, 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save API key'
      toast.showToast(message, 'error')
    } finally {
      setApiKeySaving(prev => ({ ...prev, [provider]: false }))
    }
  }

  async function handleDeleteApiKey(provider: ApiKeyProvider) {
    setApiKeyDeleting(prev => ({ ...prev, [provider]: true }))
    try {
      await authService.deleteApiKey(provider)
      setApiKeyConfigured(prev => ({ ...prev, [provider]: false }))
      toast.showToast(`${provider} API key removed`, 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete API key'
      toast.showToast(message, 'error')
    } finally {
      setApiKeyDeleting(prev => ({ ...prev, [provider]: false }))
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      toast.showToast('Fill in both password fields', 'warning')
      return
    }
    if (newPassword.length < 8) {
      toast.showToast('Password must be at least 8 characters', 'error')
      return
    }
    setPasswordSaving(true)
    try {
      await authService.changePassword({ currentPassword, newPassword })
      toast.showToast('Password updated successfully', 'success')
      setCurrentPassword('')
      setNewPassword('')
    } catch {
      toast.showToast('Failed to update password', 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await authService.deleteAccount()
      useAuthStore.getState().logout()
      toast.showToast('Account deleted', 'info')
      navigate('/auth/login', { replace: true })
    } catch {
      toast.showToast('Failed to delete account', 'error')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  async function handleToggle2FA(value: boolean) {
    const previous = twoFactorEnabled
    setTwoFactorEnabled(value)
    setTwoFactorSaving(true)
    try {
      await authService.updatePreferences({ twoFactorEnabled: value })
      toast.showToast(value ? '2FA enabled' : '2FA disabled', 'success')
    } catch (err: unknown) {
      setTwoFactorEnabled(previous)
      const message = err instanceof Error ? err.message : 'Failed to update 2FA'
      toast.showToast(message, 'error')
    } finally {
      setTwoFactorSaving(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    setNotificationBusy(prev => ({ ...prev, [id]: true }))
    try {
      const updated = await markAsRead(id)
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: updated.read } : n)))
    } catch {
      toast.showToast('Failed to mark notification as read', 'error')
    } finally {
      setNotificationBusy(prev => ({ ...prev, [id]: false }))
    }
  }

  async function handleDismiss(id: string) {
    setNotificationBusy(prev => ({ ...prev, [id]: true }))
    try {
      await dismiss(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch {
      toast.showToast('Failed to dismiss notification', 'error')
    } finally {
      setNotificationBusy(prev => ({ ...prev, [id]: false }))
    }
  }

  function renderProfileTab() {
    return (
      <div className="space-y-md">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Account Settings</h3>
          <p className="text-label-md text-on-surface-variant">Update your personal information and public profile.</p>
        </div>
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-4">
            <AvatarUploader />
            <div>
              <p className="text-body-md font-medium text-on-surface">Profile Picture</p>
              <p className="text-label-sm text-on-surface-variant">Upload a profile photo. JPG or PNG, max 5MB.</p>
            </div>
          </div>
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div>
            <Input
              label="Email Address"
              value={user?.email ?? ''}
              disabled
            />
            <p className="text-meta text-text-tertiary mt-1">Email cannot be changed</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} loading={profileSaving} icon={<Save className="h-4 w-4" />}>
              Save Changes
            </Button>
          </div>
        </div>

        <hr className="border-outline-variant" />

        <div>
          <h4 className="text-body-md font-semibold text-on-surface mb-2">Danger Zone</h4>
          <div className="flex items-center justify-between gap-4 p-md rounded-lg border border-red-200 bg-red-50">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 shrink-0">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-body-md font-medium text-on-surface">Delete Account</p>
                <p className="text-label-sm text-on-surface-variant">Permanently delete your account and all data.</p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteDialog(true)} className="shrink-0">
              Delete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderAIPreferencesTab() {
    return (
      <div className="space-y-md">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">AI Preferences</h3>
          <p className="text-label-md text-on-surface-variant">Configure how ApplyFlow AI interacts with your data.</p>
        </div>
        <div className="space-y-3 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="AI Provider"
              value={preferences.aiProvider}
              onChange={(v) => {
                const providerDefaults: Record<string, { model: string }> = {
                  openai: { model: 'gpt-4o' },
                  anthropic: { model: 'claude-3-sonnet' },
                  gemini: { model: 'gemini-pro' },
                }
                const defaults = providerDefaults[v] ?? { model: preferences.model }
                setPreferences(prev => ({ ...prev, aiProvider: v, model: defaults.model }))
              }}
              options={[
                { value: 'openai', label: 'OpenAI' },
                { value: 'anthropic', label: 'Anthropic' },
                { value: 'gemini', label: 'Google Gemini' },
              ]}
            />
            <Select
              label="Model"
              value={preferences.model}
              onChange={(v) => setPreferences(prev => ({ ...prev, model: v }))}
              options={[
                { value: 'gpt-4', label: 'GPT-4' },
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                { value: 'claude-3-opus', label: 'Claude 3 Opus' },
                { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
                { value: 'gemini-pro', label: 'Gemini Pro' },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="font-label-md text-on-surface">
              Temperature: {preferences.temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={preferences.temperature}
              onChange={(e) => setPreferences(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-label-sm text-on-surface-variant">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Writing Tone"
              value={preferences.writingTone}
              onChange={(v) => setPreferences(prev => ({ ...prev, writingTone: v }))}
              options={[
                { value: 'professional', label: 'Professional' },
                { value: 'confident', label: 'Confident' },
                { value: 'friendly', label: 'Friendly' },
                { value: 'enthusiastic', label: 'Enthusiastic' },
                { value: 'formal', label: 'Formal' },
              ]}
            />
            <Select
              label="Default Export Format"
              value={preferences.defaultExportFormat}
              onChange={(v) => setPreferences(prev => ({ ...prev, defaultExportFormat: v }))}
              options={[
                { value: 'pdf', label: 'PDF' },
                { value: 'docx', label: 'DOCX' },
                { value: 'md', label: 'Markdown' },
              ]}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSavePreferences} loading={prefSaving} icon={<Save className="h-4 w-4" />}>
              Save Preferences
            </Button>
          </div>
        </div>

        <hr className="border-outline-variant" />

        <div className="space-y-3">
          <div>
            <h4 className="text-body-md font-semibold text-on-surface">Provider API Keys</h4>
            <p className="text-label-md text-on-surface-variant">
              Store your own keys so ApplyFlow AI can call providers on your behalf. Encrypted at rest, never displayed back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apiKeyProviders.map((provider) => {
              const configured = apiKeyConfigured[provider]
              const labelMap: Record<ApiKeyProvider, string> = {
                openai: 'OpenAI',
                anthropic: 'Anthropic',
                gemini: 'Google Gemini',
                openrouter: 'OpenRouter',
              }
              const maskedPreview = configured ? `${provider.slice(0, 2)}-****` : 'Not configured'
              const inputId = `api-key-${provider}`
              return (
                <div key={provider} className="rounded-lg border border-outline-variant p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <label htmlFor={inputId} className="text-body-md font-medium text-on-surface block truncate">
                        {labelMap[provider]}
                      </label>
                      <p className="text-label-sm text-on-surface-variant font-mono">
                        {maskedPreview}
                      </p>
                    </div>
                    {configured && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteApiKey(provider)}
                        loading={!!apiKeyDeleting[provider]}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id={inputId}
                      type="password"
                      autoComplete="off"
                      placeholder={configured ? 'New key to replace' : `Paste ${labelMap[provider]} key`}
                      value={apiKeyInputs[provider]}
                      onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider]: e.target.value }))}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleSaveApiKey(provider)}
                      loading={!!apiKeySaving[provider]}
                      icon={<Save className="h-4 w-4" />}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function renderSecurityTab() {
    return (
      <div className="space-y-md">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Security</h3>
          <p className="text-label-md text-on-surface-variant">Manage your credentials and authentication.</p>
        </div>

        <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-outline-variant bg-surface-container-low">
          <div className="flex items-center gap-3 min-w-0">
            <Key className="h-4 w-4 text-on-surface-variant shrink-0" />
            <div className="min-w-0">
              <p className="text-body-md font-medium text-on-surface">Two-factor authentication (2FA)</p>
              <p className="text-label-sm text-on-surface-variant">Adds an extra layer of security.</p>
            </div>
          </div>
          <Toggle checked={twoFactorEnabled} onChange={handleToggle2FA} disabled={twoFactorSaving} />
        </div>

        <div className="rounded-lg border border-outline-variant p-3 space-y-3 max-w-2xl">
          <h4 className="text-body-md font-medium text-on-surface">Change Password</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleChangePassword}
              loading={passwordSaving}
              icon={<Shield className="h-4 w-4" />}
              disabled={!currentPassword || !newPassword}
            >
              Update Password
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderIntegrationsTab() {
    const connectedSet = new Set(
      (user?.connectedProviders ?? []).map(p => p.toLowerCase()),
    )

    const integrations: Array<{
      name: string
      key: 'github' | 'linkedin' | 'greenhouse' | 'google-drive'
      description: string
      icon: typeof Globe
      iconBg: string
      iconColor: string
      oauthProvider?: 'github' | 'linkedin'
    }> = [
      {
        name: 'LinkedIn',
        key: 'linkedin',
        description: 'Sync job history and skills.',
        icon: Globe,
        iconBg: 'bg-[#0077b5]/10',
        iconColor: 'text-[#0077b5]',
        oauthProvider: 'linkedin',
      },
      {
        name: 'GitHub',
        key: 'github',
        description: 'Showcase your public repositories.',
        icon: GitPullRequest,
        iconBg: 'bg-black/5',
        iconColor: 'text-black',
        oauthProvider: 'github',
      },
      {
        name: 'Greenhouse',
        key: 'greenhouse',
        description: 'Import direct opportunities from Greenhouse.',
        icon: ExternalLink,
        iconBg: 'bg-[#2ECC71]/10',
        iconColor: 'text-[#2ECC71]',
      },
      {
        name: 'Google Drive',
        key: 'google-drive',
        description: 'Access and store resumes in Drive.',
        icon: ExternalLink,
        iconBg: 'bg-[#4285F4]/10',
        iconColor: 'text-[#4285F4]',
      },
    ]

    return (
      <div className="space-y-md">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Integrations</h3>
          <p className="text-label-md text-on-surface-variant">Connect third-party tools to streamline your applications.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isConnected = connectedSet.has(integration.key)
            const isOAuth = integration.oauthProvider !== undefined
            return (
              <div
                key={integration.name}
                className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary transition-colors"
              >
                <div className={`w-9 h-9 ${integration.iconBg} flex items-center justify-center rounded-md ${integration.iconColor} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface truncate">{integration.name}</p>
                  <p className="text-label-sm text-on-surface-variant truncate">{integration.description}</p>
                </div>
                {isConnected ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-primary text-label-sm font-medium">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Connected
                  </div>
                ) : isOAuth ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openOAuthPopup(integration.oauthProvider!)}
                  >
                    <Link className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toast.showToast(`${integration.name} integration coming soon`, 'info')}
                  >
                    <Link className="h-3.5 w-3.5" />
                    Connect
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  function renderNotificationsTab() {
    const notificationItems = [
      { key: 'applicationUpdates' as const, label: 'Application Updates', desc: 'Get notified when application status changes' },
      { key: 'interviewReminders' as const, label: 'Interview Reminders', desc: 'Reminders for upcoming interviews and assessments' },
      { key: 'newFeatures' as const, label: 'New Features', desc: 'Updates about new ApplyFlow AI capabilities' },
      { key: 'weeklyDigest' as const, label: 'Weekly Digest', desc: 'A weekly summary of your application activity' },
      { key: 'marketingEmails' as const, label: 'Marketing Emails', desc: 'Tips, resources, and promotional content' },
    ]

    return (
      <div className="space-y-md">
        <div>
          <h3 className="text-body-md font-semibold text-on-surface">Notifications</h3>
          <p className="text-label-md text-on-surface-variant">Manage what notifications you receive.</p>
        </div>

        {notifications.length > 0 && (
          <div className="space-y-2 max-w-2xl">
            <h4 className="text-body-md font-medium text-on-surface">Recent Notifications</h4>
            <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className="flex items-start justify-between gap-3 px-3 py-2.5 hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <Bell className="h-4 w-4 text-on-surface-variant mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-body-md font-medium text-on-surface truncate">{n.title}</p>
                      <p className="text-label-sm text-on-surface-variant line-clamp-2">{n.message}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(n._id)}
                        loading={!!notificationBusy[n._id]}
                        icon={<Check className="h-3.5 w-3.5" />}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(n._id)}
                      loading={!!notificationBusy[n._id]}
                      icon={<X className="h-3.5 w-3.5" />}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-outline-variant rounded-lg border border-outline-variant overflow-hidden max-w-2xl">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 px-3 py-2.5 hover:bg-surface-container-low transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-on-surface">{item.label}</p>
                <p className="text-label-sm text-on-surface-variant">{item.desc}</p>
              </div>
              <Toggle
                checked={emailNotifications[item.key]}
                onChange={(v) => setEmailNotifications(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end max-w-2xl">
          <Button
            size="sm"
            onClick={handleSaveNotificationPreferences}
            loading={savingNotifications}
            icon={<Save className="h-4 w-4" />}
          >
            Save Preferences
          </Button>
        </div>
      </div>
    )
  }

  const tabContent: Record<SettingsTab, () => React.ReactNode> = {
    'profile': renderProfileTab,
    'ai-preferences': renderAIPreferencesTab,
    'security': renderSecurityTab,
    'integrations': renderIntegrationsTab,
    'notifications': renderNotificationsTab,
  }

  return (
    <AppLayout>
      <div className="space-y-md">
        <div>
          <h1 className="text-headline-md text-on-surface">Settings</h1>
          <p className="text-label-md text-on-surface-variant">Manage your account and preferences.</p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
          <div className="px-md">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as SettingsTab)}
            />
          </div>
          <div className="p-md min-h-[280px]">
            {tabContent[activeTab]()}
          </div>
        </div>
      </div>

      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? All your applications, resumes, and data will be permanently removed."
        confirmLabel={deleting ? 'Deleting...' : 'Yes, Delete My Account'}
        variant="danger"
      />
    </AppLayout>
  )
}
