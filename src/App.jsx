import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/simulations" element={<SimulationPage />} />
        <Route path="/simulation-results" element={<SimulationResults />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/training/:id" element={<ModulePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AllUsers />} />
        <Route path="/admin/users/add" element={<AddUser />} />
        <Route path="/admin/users/:id" element={<UserProfile />} />
        <Route path="/admin/simulations/add" element={<AddSimulation />} />
        <Route path="/admin/simulations" element={<ViewSimulations />} />
        <Route path="/admin/simulations/edit/:id" element={<EditSimulation />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/admin/training/add" element={<AddModule />} />
        <Route path="/admin/training" element={<ViewModules />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/training/edit/:id" element={<EditModule />} />
      </Routes>
    </Router>
  )
}

export default App
