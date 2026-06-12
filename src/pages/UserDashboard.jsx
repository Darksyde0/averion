import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import StatsCards from '../components/dashboard/StatsCards'
import PerformanceChart from '../components/dashboard/PerformanceChart'
import RecentActivities from '../components/dashboard/RecentActivities'
import RecommendedModules from '../components/dashboard/RecommendedModules'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'
import { supabase } from '../supabaseClient'

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const profile = useProfile()
  const navigate = useNavigate()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || null

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-gray-900 text-2xl font-bold">
              {firstName
                ? `Welcome back, ${firstName}`
                : <span className="inline-block w-40 h-7 bg-gray-100 rounded-lg animate-pulse" />
              }
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">
              Track your cybersecurity training progress and continue learning.
            </p>
          </div>

          <StatsCards />
          <PerformanceChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentActivities />
            <RecommendedModules />
          </div>

        </div>
      </div>
    </div>
  )
}

export default UserDashboard