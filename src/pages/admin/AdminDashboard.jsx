import { useState, useEffect } from 'react'
import AdminSidebar from '../../components/Admin/AdminSidebar'
import AdminTopBar from '../../components/Admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid #1e3a5f',
        borderRadius: '12px',
        padding: '10px 14px',
      }}>
        <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const profile = useProfile()

  const [stats, setStats] = useState({
    totalUsers: 0,
    avgScore: 0,
    completionRate: 0,
    atRiskUsers: 0,
    completedCount: 0,
    inProgressCount: 0,
    notStartedCount: 0,
  })
  const [barData, setBarData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) fetchStats()
  }, [profile])

  async function fetchStats() {
    setLoading(true)

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'user')
      .eq('organization_id', profile.id)

    const totalUsers = users?.length || 0
    const userIds = users?.map(u => u.id) || []

    let avgScore = 0
    let atRiskUsers = 0
    let barData = []

    if (userIds.length > 0) {
      const { data: simResults } = await supabase
        .from('simulation_results')
        .select('score, completed_at, user_id')
        .in('user_id', userIds)
        .order('completed_at', { ascending: true })

      if (simResults && simResults.length > 0) {
        avgScore = Math.round(
          simResults.reduce((sum, r) => sum + r.score, 0) / simResults.length
        )

        const userScores = {}
        simResults.forEach(r => { userScores[r.user_id] = r.score })
        atRiskUsers = Object.values(userScores).filter(s => s < 50).length

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const grouped = {}
        simResults.forEach(r => {
          const date = new Date(r.completed_at)
          const key = `${date.getFullYear()}-${date.getMonth()}`
          if (!grouped[key]) {
            grouped[key] = { scores: [], month: monthNames[date.getMonth()] }
          }
          grouped[key].scores.push(r.score)
        })

        barData = Object.values(grouped)
          .slice(-7)
          .map(m => ({
            month: m.month,
            score: Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length)
          }))
      }
    }

    let completedCount = 0
    let inProgressCount = 0
    let notStartedCount = 0

    const { data: allModules } = await supabase
      .from('modules')
      .select('id')
      .eq('hidden', false)

    const totalModules = allModules?.length || 0

    if (userIds.length > 0 && totalModules > 0) {
      const { data: progress } = await supabase
        .from('module_progress')
        .select('user_id, completed')
        .in('user_id', userIds)

      const userProgress = {}
      userIds.forEach(id => { userProgress[id] = { completed: 0, inProgress: 0 } })
      progress?.forEach(p => {
        if (p.completed) userProgress[p.user_id].completed++
        else userProgress[p.user_id].inProgress++
      })
      userIds.forEach(id => {
        const c = userProgress[id].completed
        const ip = userProgress[id].inProgress
        if (c >= totalModules) completedCount++
        else if (c > 0 || ip > 0) inProgressCount++
        else notStartedCount++
      })
    } else {
      notStartedCount = totalUsers
    }

    const completionRate = totalUsers > 0
      ? Math.round((completedCount / totalUsers) * 100)
      : 0

    setStats({ totalUsers, avgScore, completionRate, atRiskUsers, completedCount, inProgressCount, notStartedCount })
    setBarData(barData)
    setLoading(false)
  }

  const donutData = [
    { name: 'Completed', value: stats.completedCount, color: '#22c55e' },
    { name: 'In Progress', value: stats.inProgressCount, color: '#3b82f6' },
    { name: 'Not Started', value: stats.notStartedCount, color: '#374151' },
  ]

  const statCards = [
    {
      label: 'Total Users',
      value: loading ? '—' : stats.totalUsers,
      sub: 'registered users',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      iconBg: 'bg-blue-50 text-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      label: 'Average Score',
      value: loading ? '—' : stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A',
      sub: 'across all simulations',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      iconBg: 'bg-purple-50 text-purple-500',
      valueColor: stats.avgScore >= 80 ? 'text-green-600' : stats.avgScore >= 50 ? 'text-yellow-600' : 'text-blue-600',
    },
    {
      label: 'Completion Rate',
      value: loading ? '—' : `${stats.completionRate}%`,
      sub: `${stats.completedCount} fully completed`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-green-50 text-green-500',
      valueColor: 'text-green-600',
    },
    {
      label: 'At Risk Users',
      value: loading ? '—' : stats.atRiskUsers,
      sub: 'scored below 50%',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      iconBg: 'bg-red-50 text-red-500',
      valueColor: 'text-red-500',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>

        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* Page heading */}
          <div className="mb-8">
            <h1 className="text-gray-900 text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Organization-wide security training overview</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs font-medium">{card.label}</p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    {card.icon}
                  </div>
                </div>
                <p className={`text-3xl font-extrabold ${card.valueColor}`}>{card.value}</p>
                <p className="text-gray-400 text-xs">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

            {/* Bar chart — takes 2 cols */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-gray-800 font-bold">Average Performance</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Monthly average simulation scores</p>
                </div>
                {!loading && barData.length > 0 && (
                  <div className="bg-blue-50 rounded-xl px-3 py-1.5">
                    <p className="text-blue-600 text-xs font-semibold">Last {barData.length} months</p>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-56">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : barData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                  <p className="text-gray-400 text-sm font-medium">No simulation data yet</p>
                  <p className="text-gray-300 text-xs">Scores will appear here once users complete simulations</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Donut chart — takes 1 col */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="mb-6">
                <h2 className="text-gray-800 font-bold">Training Status</h2>
                <p className="text-gray-400 text-xs mt-0.5">Completion breakdown</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-56">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : stats.totalUsers === 0 ? (
                <div className="flex flex-col items-center justify-center h-56 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm font-medium">No users yet</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Tooltip
                        formatter={(value, name) => [`${value} users`, name]}
                        contentStyle={{ backgroundColor: '#0d1117', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" activeOuterRadius={80}>
                        {donutData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3 mt-4">
                    {donutData.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <p className="text-gray-600 text-xs font-medium">{item.name}</p>
                        </div>
                        <p className="text-gray-800 text-xs font-bold">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Insights row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Strengths */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-gray-800 font-bold">Strengths</h2>
              </div>
              <div className="flex flex-col gap-3">
                {stats.avgScore >= 80 && (
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">Overall average score is excellent at <span className="font-bold text-green-600">{stats.avgScore}%</span></p>
                  </div>
                )}
                {stats.completionRate >= 50 && (
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">Training completion rate is at <span className="font-bold text-green-600">{stats.completionRate}%</span></p>
                  </div>
                )}
                {stats.atRiskUsers === 0 && stats.totalUsers > 0 && (
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">No at-risk users — all users are performing well</p>
                  </div>
                )}
                {stats.totalUsers === 0 && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-500 text-sm">Add users to start tracking performance</p>
                  </div>
                )}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h2 className="text-gray-800 font-bold">Areas for Improvement</h2>
              </div>
              <div className="flex flex-col gap-3">
                {stats.atRiskUsers > 0 && (
                  <div className="flex items-start gap-3 bg-red-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm"><span className="font-bold text-red-600">{stats.atRiskUsers} user{stats.atRiskUsers > 1 ? 's' : ''}</span> scored below 50% and need attention</p>
                  </div>
                )}
                {stats.notStartedCount > 0 && (
                  <div className="flex items-start gap-3 bg-yellow-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm"><span className="font-bold text-yellow-600">{stats.notStartedCount} user{stats.notStartedCount > 1 ? 's' : ''}</span> haven't started any training yet</p>
                  </div>
                )}
                {stats.completionRate < 50 && stats.totalUsers > 0 && (
                  <div className="flex items-start gap-3 bg-yellow-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">Completion rate is below 50% — encourage users to complete modules</p>
                  </div>
                )}
                {stats.avgScore > 0 && stats.avgScore < 80 && (
                  <div className="flex items-start gap-3 bg-yellow-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm">Average score of <span className="font-bold text-yellow-600">{stats.avgScore}%</span> is below the 80% passing threshold</p>
                  </div>
                )}
                {stats.totalUsers === 0 && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <p className="text-gray-500 text-sm">No users registered yet — add users to get started</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminDashboard