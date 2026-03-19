// packages/client/src/App.jsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

// Layouts
import AppLayout from '@/components/layout/AppLayout'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import OnboardingPage from '@/pages/OnboardingPage'
import DashboardPage from '@/pages/DashboardPage'
import WorldsPage from '@/pages/WorldsPage'
import WorldDetailPage from '@/pages/WorldDetailPage'
import ProblemPage from '@/pages/ProblemPage'
import ProblemsPage from '@/pages/ProblemsPage'
import QuestsPage from '@/pages/QuestsPage'
import SkillTreePage from '@/pages/SkillTreePage'
import LeaderboardPage from '@/pages/LeaderboardPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import AdminPage from '@/pages/AdminPage'
import ProfilePage from '@/pages/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'

// Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore()
  if (isLoading) return <FullscreenLoader />
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const OnboardingGuard = ({ children }) => {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <FullscreenLoader />
  if (!user?.onboardingDone) return <Navigate to="/onboarding" replace />
  return children
}

const AdminGuard = ({ children }) => {
  const { user } = useAuthStore()
  return user?.role === 'ADMIN' ? children : <Navigate to="/dashboard" replace />
}

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) {
    return <Navigate to={user?.onboardingDone ? '/dashboard' : '/onboarding'} replace />
  }
  return children
}

const FullscreenLoader = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
      <p className="text-text-secondary text-sm font-mono">Initializing LevelUp...</p>
    </div>
  </div>
)

export default function App() {
  const init = useAuthStore(s => s.init)

  useEffect(() => { init() }, [init])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111827',
            color: '#F0F4FF',
            border: '1px solid #1E2A3A',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#22C55E', secondary: '#111827' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

        {/* App (requires auth + onboarding) */}
        <Route element={<PrivateRoute><OnboardingGuard><AppLayout /></OnboardingGuard></PrivateRoute>}>
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/worlds"        element={<WorldsPage />} />
          <Route path="/worlds/:slug"  element={<WorldDetailPage />} />
          <Route path="/problems"      element={<ProblemsPage />} />
          <Route path="/problems/:slug" element={<ProblemPage />} />
          <Route path="/quests"        element={<QuestsPage />} />
          <Route path="/skill-tree"    element={<SkillTreePage />} />
          <Route path="/leaderboard"   element={<LeaderboardPage />} />
          <Route path="/analytics"     element={<AnalyticsPage />} />
          <Route path="/profile"       element={<ProfilePage />} />
          <Route path="/admin"         element={<AdminGuard><AdminPage /></AdminGuard>} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
