import { useState, useEffect, useRef } from 'react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const barData = [
  { month: 'Jan', score: 62 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 74 },
  { month: 'Apr', score: 76 },
  { month: 'May', score: 82 },
  { month: 'Jun', score: 85 },
  { month: 'Jul', score: 90 },
]

const donutData = [
  { name: 'Completed', value: 234, color: '#22c55e' },
  { name: 'In Progress', value: 89, color: '#3b82f6' },
  { name: 'Not Started', value: 45, color: '#6b7280' },
]

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        {/* Top bar */}
        <div className="bg-[#0d1117] flex items-center justify-between px-8 py-1">

          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Right side */}
          <div className="flex items-center gap-4">

            {/* Admin info — dark pill */}
            <div className="flex items-center gap-3 bg-[#1a1a2e] rounded-full pl-1 pr-5 py-1">
              <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <div className="flex flex-col items-start">
                <p className="text-white font-bold text-sm leading-tight">John Doe</p>
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-0.5 rounded-full mt-0.5">
                  ADMIN
                </span>
              </div>
            </div>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative text-white hover:text-blue-400 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0d1117]" />
              </button>

              {/* Notification dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                    <p className="text-gray-800 text-sm font-extrabold uppercase tracking-widest text-center">
                      Notification
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3 bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-600 text-sm font-bold">
                          Welcome to Averion 1.0
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          New Updates on Averion 1.0 .........
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-8">

          {/* Page heading */}
          <h1 className="text-gray-800 text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mb-6">
            Organization-wide security training overview
          </p>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Total Users</p>
              <p className="text-blue-600 text-3xl font-bold">368</p>
              <p className="text-green-500 text-xs mt-1">+12% this month</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Average Score</p>
              <p className="text-blue-600 text-3xl font-bold">
                82<span className="text-xl">%</span>
              </p>
              <p className="text-green-500 text-xs mt-1">+5% improvement</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Completion Rate</p>
              <p className="text-blue-600 text-3xl font-bold">
                64<span className="text-xl">%</span>
              </p>
              <p className="text-green-500 text-xs mt-1">234 completed</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-red-500 text-xs font-semibold mb-1">At Risk Users</p>
              <p className="text-red-500 text-3xl font-bold">23</p>
              <p className="text-gray-400 text-xs mt-1">Need attention</p>
            </div>

          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Bar chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-gray-800 text-lg font-bold mb-1">
                Average Performance
              </h2>
              <p className="text-gray-400 text-xs mb-4">Monthly average scores</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2744',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Donut chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-gray-800 text-lg font-bold mb-1">
                Training Status
              </h2>
              <p className="text-gray-400 text-xs mb-4">Overall completion breakdown</p>
              <div className="flex items-center justify-between">
                <ResponsiveContainer width="60%" height={220}>
                  <PieChart>
                    <Tooltip
                      formatter={(value, name) => [`${value} users`, name]}
                      contentStyle={{
                        backgroundColor: '#1a2744',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      activeOuterRadius={100}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex flex-col gap-4">
                  {donutData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="text-gray-800 text-sm font-semibold">
                          {item.name}
                        </p>
                        <p className="text-gray-400 text-xs">{item.value} users</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom insight cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Key Insights */}
            <div className="bg-[#1a2744] rounded-xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">
                Key Insights & Recommendations
              </h2>
              <p className="text-blue-400 font-semibold text-sm mb-2">Strengths</p>
              <ul className="text-white text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Finance department shows exceptional password security awareness (91%)
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Overall phishing detection skills improved by 15% this quarter
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Training completion rate increased to 64%
                </li>
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-[#1a2744] rounded-xl p-6">
              <h2 className="text-yellow-400 text-xl font-bold mb-4">
                Areas for Improvement
              </h2>
              <ul className="text-white text-sm space-y-3">
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Operations department needs focused social engineering training
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Operations department needs focused social engineering training
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 flex-shrink-0">•</span>
                  Operations department needs focused social engineering training
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard