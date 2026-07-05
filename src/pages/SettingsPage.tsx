import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Dialog } from '../components/ui/Dialog'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/auth'
import { useToast } from '../components/layout/useToast'
import {
  User,
  Save,
  AlertTriangle,
  Sparkles,
  Shield,
  Bell,
  Key,
  Link,
  CheckCircle,
  ExternalLink,
  GitPullRequest,
  Globe,
  Trash2,
} from '../lib/icons'

type SettingsTab = 'profile' | 'ai-preferences' | 'security' | 'integrations' | 'notifications'

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Account', icon: User },
  { id: 'ai-preferences', label: 'AI Preferences', icon: Sparkles },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Link },
  { id: 'notifications', label: 'Notifications', icon: Bell },
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
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)

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
      await authService.updateProfile({ name: user?.name ?? '', password: currentPassword, newPassword } as any & { password: string; newPassword: string })
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
      useAuthStore.getState().logout()
      toast.showToast('Account deleted', 'info')
      navigate('/auth/login', { replace: true })
    } catch {
      toast.showToast('Failed to delete account', 'error')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  function ToggleSwitch({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-outline-variant'}`}
        role="switch"
        aria-checked={enabled}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    )
  }

  function renderProfileTab() {
    return (
      <div className="space-y-xl">
        <div>
          <h3 className="text-headline-md text-on-surface mb-1">Account Settings</h3>
          <p className="text-body-md text-on-surface-variant">Update your personal information and public profile.</p>
        </div>
        <div className="space-y-md">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="h-4 w-4" />}
          />
          <Input
            label="Email Address"
            value={user?.email ?? ''}
            disabled
            helperText="Email cannot be changed"
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} loading={profileSaving} icon={<Save className="h-4 w-4" />}>
              Save Changes
            </Button>
          </div>
        </div>

        <hr className="border-outline-variant" />

        <div>
          <h4 className="text-headline-md text-on-surface mb-1">Danger Zone</h4>
          <p className="text-body-md text-on-surface-variant mb-md">Irreversible actions</p>
          <div className="flex items-start justify-between gap-4 p-md rounded-xl border border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-body-md font-medium text-on-surface">Delete Account</h4>
                <p className="text-label-sm text-on-surface-variant mt-0.5">Permanently delete your account and all associated data.</p>
              </div>
            </div>
            <Button variant="danger" onClick={() => setShowDeleteDialog(true)} className="shrink-0">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    )
  }

  function renderAIPreferencesTab() {
    return (
      <div className="space-y-xl">
        <div>
          <h3 className="text-headline-md text-on-surface mb-1">AI Preferences</h3>
          <p className="text-body-md text-on-surface-variant">Configure how ApplyFlow AI interacts with your data and generates applications.</p>
        </div>
        <div className="space-y-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <Select
              label="AI Provider"
              value={preferences.aiProvider}
              onChange={(v) => setPreferences(prev => ({ ...prev, aiProvider: v }))}
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

          <div className="space-y-1.5">
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
              className="w-full h-2 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-label-sm text-on-surface-variant">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
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
                { value: 'txt', label: 'Plain Text' },
              ]}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSavePreferences} loading={prefSaving} icon={<Save className="h-4 w-4" />}>
              Save Preferences
            </Button>
          </div>
        </div>

        <hr className="border-outline-variant" />

        <div className="space-y-md">
          <div>
            <h4 className="text-headline-md text-on-surface mb-1">Provider API Keys</h4>
            <p className="text-body-md text-on-surface-variant">
              Store your own API keys so ApplyFlow AI can call providers on your behalf. Keys are encrypted at rest and never displayed back.
            </p>
          </div>

          <div className="space-y-md">
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
                <div key={provider} className="rounded-xl border border-outline-variant p-md space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label htmlFor={inputId} className="text-body-md font-medium text-on-surface">
                        {labelMap[provider]}
                      </label>
                      <p className="text-label-sm text-on-surface-variant font-mono mt-0.5">
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
                        Delete
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id={inputId}
                      type="password"
                      autoComplete="off"
                      placeholder={configured ? 'Enter a new key to replace the current one' : `Paste your ${labelMap[provider]} API key`}
                      value={apiKeyInputs[provider]}
                      onChange={(e) => setApiKeyInputs(prev => ({ ...prev, [provider]: e.target.value }))}
                    />
                    <Button
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
      <div className="space-y-xl">
        <div>
          <h3 className="text-headline-md text-on-surface mb-1">Security</h3>
          <p className="text-body-md text-on-surface-variant">Manage your account credentials and authentication settings.</p>
        </div>

        <div className="flex items-center justify-between p-md rounded-xl border border-outline-variant bg-surface-container-low">
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-on-surface-variant mt-0.5" />
            <div>
              <p className="text-body-md font-medium text-on-surface">Two-factor authentication (2FA)</p>
              <p className="text-label-sm text-on-surface-variant mt-0.5">Adds an extra layer of security to your account.</p>
            </div>
          </div>
          <ToggleSwitch enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
        </div>

        <div className="rounded-xl border border-outline-variant p-md space-y-md">
          <h4 className="text-body-md font-medium text-on-surface">Change Password</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      <div className="space-y-xl">
        <div>
          <h3 className="text-headline-md text-on-surface mb-1">Integrations</h3>
          <p className="text-body-md text-on-surface-variant">Connect your third-party tools to streamline your application process.</p>
        </div>

        <div className="grid grid-cols-1 gap-md">
          {integrations.map((integration) => {
            const Icon = integration.icon
            const isConnected = connectedSet.has(integration.key)
            const isOAuth = integration.oauthProvider !== undefined
            return (
              <div
                key={integration.name}
                className="flex items-center gap-4 p-md rounded-xl border border-outline-variant hover:border-primary transition-colors"
              >
                <div className={`w-10 h-10 ${integration.iconBg} flex items-center justify-center rounded-lg ${integration.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-md font-medium text-on-surface">{integration.name}</p>
                  <p className="text-label-sm text-on-surface-variant">{integration.description}</p>
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
      <div className="space-y-xl">
        <div>
          <h3 className="text-headline-md text-on-surface mb-1">Notifications</h3>
          <p className="text-body-md text-on-surface-variant">Manage what notifications you receive and how.</p>
        </div>

        <div className="space-y-1">
          {notificationItems.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 p-md rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-body-md font-medium text-on-surface">{item.label}</p>
                <p className="text-label-sm text-on-surface-variant mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch
                enabled={emailNotifications[item.key]}
                onChange={(v) => setEmailNotifications(prev => ({ ...prev, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
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

      <div className="flex flex-col md:flex-row gap-lg">
        {/* Tab Navigation */}
        <nav className="w-full md:w-56 shrink-0 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all whitespace-nowrap text-body-md ${
                  isActive
                    ? 'bg-surface-container-high text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-surface border border-outline-variant rounded-xl p-lg min-h-[400px]">
          {tabContent[activeTab]()}
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
