import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/layout/ToastContext'
import { LoginPage } from './pages/LoginPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthWatcher } from './components/AuthWatcher'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { ApplicationsPage } from './pages/ApplicationsPage'
import { ApplicationDetailPage } from './pages/ApplicationDetailPage'
import { ResumeLibraryPage } from './pages/ResumeLibraryPage'

import { ExportCenterPage } from './pages/ExportCenterPage'
import { InterviewPrepPage } from './pages/InterviewPrepPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { AIInsightsPage } from './pages/AIInsightsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SmartApplicationPage } from './pages/SmartApplicationPage'
import { JDAnalysisPage } from './pages/JDAnalysisPage'
import { ResumeStrategyPage } from './pages/ResumeStrategyPage'
import { ResumeEditorPage } from './pages/ResumeEditorPage'
import { FeedPage } from './pages/community/FeedPage'
import { OpportunityBrowserPage } from './pages/community/OpportunityBrowserPage'
import { OpportunityDetailPage } from './pages/community/OpportunityDetailPage'
import { CreateOpportunityPage } from './pages/community/CreateOpportunityPage'
import { WorkspacePage } from './pages/community/WorkspacePage'
import { DiscussionsPage } from './pages/community/DiscussionsPage'
import { DiscussionThreadPage } from './pages/community/DiscussionThreadPage'
import { CreateDiscussionPage } from './pages/community/CreateDiscussionPage'
import { ReferralsPage } from './pages/community/ReferralsPage'
import { ReferralRequestPage } from './pages/community/ReferralRequestPage'
import { NotificationsPage } from './pages/community/NotificationsPage'
import { TemplatesPage } from './pages/community/TemplatesPage'
import { LearningAdminPage } from './pages/LearningAdminPage'
import { LandingPage } from './pages/LandingPage'

function App() {
  return (
    <ToastProvider>
      <AuthWatcher />
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/smart-application" element={<SmartApplicationPage />} />
        <Route path="/profile" element={<ResumeLibraryPage />} />
        <Route path="/templates" element={<Navigate to="/community/templates" replace />} />
        <Route path="/jd-analysis" element={<JDAnalysisPage />} />
        <Route path="/resume-strategy" element={<ResumeStrategyPage />} />
        <Route path="/resume-editor" element={<ResumeEditorPage />} />
        <Route path="/validation" element={<Navigate to="/smart-application" replace />} />
        <Route path="/export" element={<ExportCenterPage />} />
        <Route path="/interview" element={<InterviewPrepPage />} />
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
        <Route path="/admin/learning" element={<LearningAdminPage />} />
      </Routes>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
