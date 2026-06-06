import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

import HomePage from './pages/HomePage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UserDashboard from './pages/UserDashboard'
import SimulationPage from './pages/SimulationPage'
import SimulationResults from './pages/SimulationResults'
import TrainingPage from './pages/TrainingPage'
import ModulePage from './pages/ModulePage'
import SettingsPage from './pages/SettingsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllUsers from './pages/admin/AllUsers'
import AddUser from './pages/admin/AddUser'
import AddSimulation from './pages/admin/AddSimulation'
import ViewSimulations from './pages/admin/ViewSimulations'
import EditSimulation from './pages/admin/EditSimulation'
import AdminSettings from './pages/admin/AdminSettings'
import ChangePasswordPage from './pages/ChangePasswordPage'
import AchievementsPage from './pages/AchievementsPage'
import AddModule from './pages/admin/AddModule'
import ViewModules from './pages/admin/ViewModules'
import AboutPage from './pages/AboutPage'
import EditModule from './pages/admin/EditModule'
import UserProfile from './pages/admin/UserProfile'
import CookieDeclaration from './pages/CookieDeclaration'
import TermsAndConditions from './pages/TermsAndConditions'

// ── Protected Route ──
function ProtectedRoute({ children, adminOnly = false }) {
  const [session, setSession] = useState(undefined)
  const [role, setRole] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setRole(data?.role || null))
      }
    })
  }, [])

  // ── Still loading ──
  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Not logged in ──
  if (!session) return <Navigate to="/login" replace />

  // ── Logged in but not admin trying to access admin route ──
  if (adminOnly && role && role !== 'admin') return <Navigate to="/dashboard" replace />

  // ── Still fetching role for admin routes ──
  if (adminOnly && !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ── Public routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cookies" element={<CookieDeclaration />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />

        {/* ── User protected routes ── */}
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/simulations" element={<ProtectedRoute><SimulationPage /></ProtectedRoute>} />
        <Route path="/simulation-results" element={<ProtectedRoute><SimulationResults /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><TrainingPage /></ProtectedRoute>} />
        <Route path="/training/:id" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />

        {/* ── Admin protected routes ── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AllUsers /></ProtectedRoute>} />
        <Route path="/admin/users/add" element={<ProtectedRoute adminOnly><AddUser /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute adminOnly><UserProfile /></ProtectedRoute>} />
        <Route path="/admin/simulations" element={<ProtectedRoute adminOnly><ViewSimulations /></ProtectedRoute>} />
        <Route path="/admin/simulations/add" element={<ProtectedRoute adminOnly><AddSimulation /></ProtectedRoute>} />
        <Route path="/admin/simulations/edit/:id" element={<ProtectedRoute adminOnly><EditSimulation /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute adminOnly><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/training" element={<ProtectedRoute adminOnly><ViewModules /></ProtectedRoute>} />
        <Route path="/admin/training/add" element={<ProtectedRoute adminOnly><AddModule /></ProtectedRoute>} />
        <Route path="/admin/training/edit/:id" element={<ProtectedRoute adminOnly><EditModule /></ProtectedRoute>} />

      </Routes>
    </Router>
  )
}

export default App