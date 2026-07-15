import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/layout/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthWatcher } from './components/AuthWatcher'
import { Skeleton } from './components/ui/Skeleton'
import { trackPageView } from './lib/analytics'

const lazyPage = <T extends string>(importFn: () => Promise<{ [K in T]: any }>, name: T) =>
  lazy(() => importFn().then(m => ({ default: m[name] })))

const LoginPage = lazyPage(() => import('./pages/LoginPage'), 'LoginPage')
const RegisterPage = lazyPage(() => import('./pages/RegisterPage'), 'RegisterPage')
const DashboardPage = lazyPage(() => import('./pages/DashboardPage'), 'DashboardPage')
const ApplicationsPage = lazyPage(() => import('./pages/ApplicationsPage'), 'ApplicationsPage')
const IdentityWorkspacePage = lazyPage(() => import('./pages/IdentityWorkspacePage'), 'IdentityWorkspacePage')
const ValidationCenterPage = lazyPage(() => import('./pages/ValidationCenterPage'), 'ValidationCenterPage')
const ExportCenterPage = lazyPage(() => import('./pages/ExportCenterPage'), 'ExportCenterPage')
const AnalyticsPage = lazyPage(() => import('./pages/AnalyticsPage'), 'AnalyticsPage')
const AIInsightsPage = lazyPage(() => import('./pages/AIInsightsPage'), 'AIInsightsPage')
const SettingsPage = lazyPage(() => import('./pages/SettingsPage'), 'SettingsPage')
const SmartApplicationPage = lazyPage(() => import('./pages/SmartApplicationPage'), 'SmartApplicationPage')
const FeedPage = lazyPage(() => import('./pages/community/FeedPage'), 'FeedPage')
const OpportunityBrowserPage = lazyPage(() => import('./pages/community/OpportunityBrowserPage'), 'OpportunityBrowserPage')
const OpportunityDetailPage = lazyPage(() => import('./pages/community/OpportunityDetailPage'), 'OpportunityDetailPage')
const CreateOpportunityPage = lazyPage(() => import('./pages/community/CreateOpportunityPage'), 'CreateOpportunityPage')
const WorkspacePage = lazyPage(() => import('./pages/community/WorkspacePage'), 'WorkspacePage')
const DiscussionsPage = lazyPage(() => import('./pages/community/DiscussionsPage'), 'DiscussionsPage')
const DiscussionThreadPage = lazyPage(() => import('./pages/community/DiscussionThreadPage'), 'DiscussionThreadPage')
const CreateDiscussionPage = lazyPage(() => import('./pages/community/CreateDiscussionPage'), 'CreateDiscussionPage')
const ReferralsPage = lazyPage(() => import('./pages/community/ReferralsPage'), 'ReferralsPage')
const ReferralRequestPage = lazyPage(() => import('./pages/community/ReferralRequestPage'), 'ReferralRequestPage')
const NotificationsPage = lazyPage(() => import('./pages/community/NotificationsPage'), 'NotificationsPage')
const TemplatesPage = lazyPage(() => import('./pages/community/TemplatesPage'), 'TemplatesPage')
const CreateTemplatePage = lazyPage(() => import('./pages/community/CreateTemplatePage'), 'CreateTemplatePage')
const LearningAdminPage = lazyPage(() => import('./pages/LearningAdminPage'), 'LearningAdminPage')
const LandingPage = lazyPage(() => import('./pages/LandingPage'), 'LandingPage')
const ForgotPasswordPage = lazyPage(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyPage(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage')
const VerifyEmailPage = lazyPage(() => import('./pages/VerifyEmailPage'), 'VerifyEmailPage')

function TrackedRoutes() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location])
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/applications" element={<ApplicationsPage />} />
      <Route path="/smart-application" element={<SmartApplicationPage />} />
      <Route path="/identity" element={<IdentityWorkspacePage />} />
      <Route path="/templates" element={<Navigate to="/community/templates" replace />} />
      <Route path="/validation" element={<ValidationCenterPage />} />
      <Route path="/export" element={<ExportCenterPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/insights" element={<AIInsightsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/community" element={<Navigate to="/community/feed" replace />} />
      <Route path="/community/feed" element={<FeedPage />} />
      <Route path="/community/opportunities" element={<OpportunityBrowserPage />} />
      <Route path="/community/opportunities/new" element={<CreateOpportunityPage />} />
      <Route path="/community/opportunities/:id" element={<OpportunityDetailPage />} />
      <Route path="/community/discussions" element={<DiscussionsPage />} />
      <Route path="/community/discussions/new" element={<CreateDiscussionPage />} />
      <Route path="/community/discussions/:channel" element={<DiscussionsPage />} />
      <Route path="/community/discussions/:channel/:threadId" element={<DiscussionThreadPage />} />
      <Route path="/community/referrals" element={<ReferralsPage />} />
      <Route path="/community/referrals/request" element={<ReferralRequestPage />} />
      <Route path="/community/workspace/:id" element={<WorkspacePage />} />
      <Route path="/community/notifications" element={<NotificationsPage />} />
      <Route path="/community/templates" element={<TemplatesPage />} />
      <Route path="/community/templates/create" element={<CreateTemplatePage />} />
      <Route path="/admin/learning" element={<LearningAdminPage />} />
    </Routes>
  )
}

function PageSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton variant="text" width="40%" height={32} />
      <Skeleton variant="text" width="60%" />
      <div className="grid grid-cols-3 gap-4 mt-8">
        <Skeleton variant="rounded" width="100%" height={120} />
        <Skeleton variant="rounded" width="100%" height={120} />
        <Skeleton variant="rounded" width="100%" height={120} />
      </div>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthWatcher />
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <TrackedRoutes />
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
