import { useState } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import StatsCards from '../components/dashboard/StatsCards'
import PerformanceChart from '../components/dashboard/PerformanceChart'
import RecentActivities from '../components/dashboard/RecentActivities'
import RecommendedModules from '../components/dashboard/RecommendedModules'

function UserDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">John Doe</p>
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                USER
              </span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          <div className="mb-6">
            <h1 className="text-gray-800 text-3xl font-bold">Welcome back, John!</h1>
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