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

function App() {
  return (
    <ToastProvider>
      <AuthWatcher />
      <ErrorBoundary>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/smart-application" element={<SmartApplicationPage />} />
        <Route path="/profile" element={<ResumeLibraryPage />} />
        <Route path="/templates" element={<Navigate to="/applications" replace />} />
        <Route path="/jd-analysis" element={<Navigate to="/smart-application" replace />} />
        <Route path="/resume-strategy" element={<Navigate to="/smart-application" replace />} />
        <Route path="/resume-editor" element={<Navigate to="/smart-application" replace />} />
        <Route path="/validation" element={<Navigate to="/smart-application" replace />} />
        <Route path="/export" element={<ExportCenterPage />} />
        <Route path="/interview" element={<InterviewPrepPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/insights" element={<AIInsightsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App
