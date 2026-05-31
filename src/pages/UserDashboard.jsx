import { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import StatsCards from '../components/dashboard/StatsCards'
import PerformanceChart from '../components/dashboard/PerformanceChart'
import RecentActivities from '../components/dashboard/RecentActivities'
import RecommendedModules from '../components/dashboard/RecommendedModules'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const profile = useProfile()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 p-8">

          <div className="mb-6">
            <h1 className="text-gray-800 text-3xl font-bold">
              Welcome back, {firstName}!
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-semibold">
              Track your cybersecurity training progress and continue learning.
            </p>
          </div>

          <StatsCards />
          <PerformanceChart />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivities />
            <RecommendedModules />
          </div>

        </div>
      </div>
    </div>
  )
}

export default UserDashboard
