import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  const sim = payload.find(p => p.dataKey === 'score')
  const pass = payload.find(p => p.dataKey === 'passRate')
  const risk = payload.find(p => p.dataKey === 'atRisk')
  const users = payload.find(p => p.dataKey === 'activeUsers')

  const rows = [
    sim && { label: 'Avg Score', value: `${sim.value}%`, color: '#2563eb' },
    pass && { label: 'Pass Rate', value: `${pass.value}%`, color: '#22c55e' },
    risk && { label: 'At Risk', value: `${risk.value}%`, color: '#ef4444' },
    users && { label: 'Active Users', value: users.value, color: '#94a3b8' },
  ].filter(Boolean)

  return (
    <div style={{
      backgroundColor: '#1e2d4f',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '14px 18px',
      boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
      minWidth: '180px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontWeight: 600, marginBottom: '12px' }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: row.color, flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{row.label}</span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState('6M')
  const profile = useProfile()

  const [stats, setStats] = useState({
    totalUsers: 0, avgScore: 0, completionRate: 0, atRiskUsers: 0,
    completedCount: 0, inProgressCount: 0, notStartedCount: 0,
  })
  const [allBarData, setAllBarData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [atRiskList, setAtRiskList] = useState([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  // ── Auth guard ──
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (profile?.id) {
      fetchStats()
      fetchRecentActivity()
      fetchLeaderboard()
    }
  }, [profile])

  async function fetchStats() {
    if (!profile?.id) return
    setLoading(true)

    try {
      const { data: users } = await supabase
        .from('users').select('id, full_name')
        .eq('role', 'user').eq('organization_id', profile.id)

      const totalUsers = users?.length || 0
      const userIds = users?.map(u => u.id) || []

      let avgScore = 0, atRiskUsers = 0, allBarData = []

      if (userIds.length > 0) {
        const { data: simResults } = await supabase
          .from('simulation_results').select('score, completed_at, user_id')
          .in('user_id', userIds).order('completed_at', { ascending: true })

        if (simResults && simResults.length > 0) {
          avgScore = Math.round(simResults.reduce((sum, r) => sum + r.score, 0) / simResults.length)

          const userScores = {}
          simResults.forEach(r => {
            if (!userScores[r.user_id] || r.completed_at > userScores[r.user_id].date) {
              userScores[r.user_id] = { score: r.score, date: r.completed_at }
            }
          })
          atRiskUsers = Object.values(userScores).filter(s => s.score < 50).length

          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const grouped = {}
          simResults.forEach(r => {
            const date = new Date(r.completed_at)
            const key = `${date.getFullYear()}-${date.getMonth()}`
            if (!grouped[key]) grouped[key] = { scores: [], users: new Set(), month: monthNames[date.getMonth()], date }
            grouped[key].scores.push(r.score)
            grouped[key].users.add(r.user_id)
          })
          allBarData = Object.values(grouped)
            .sort((a, b) => a.date - b.date)
            .map(m => ({
              month: m.month,
              score: Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length),
              passRate: Math.round((m.scores.filter(s => s >= 80).length / m.scores.length) * 100),
              atRisk: Math.round((m.scores.filter(s => s < 50).length / m.scores.length) * 100),
              activeUsers: m.users.size,
              date: m.date,
            }))
        }
      }

      let completedCount = 0, inProgressCount = 0, notStartedCount = 0

      const { data: allModules } = await supabase
        .from('modules')
        .select('id')
        .eq('hidden', false)
        .eq('organization_id', profile.id)

      const totalModules = allModules?.length || 0

      if (userIds.length > 0 && totalModules > 0) {
        const moduleIds = allModules.map(m => m.id)

        const { data: progress } = await supabase
          .from('module_progress')
          .select('user_id, module_id, quiz_completed')
          .in('user_id', userIds)
          .in('module_id', moduleIds)

        const userModuleMap = {}
        userIds.forEach(id => {
          userModuleMap[id] = { completedModules: new Set(), startedModules: new Set() }
        })

        ;(progress || []).forEach(p => {
          if (!userModuleMap[p.user_id]) return
          if (p.quiz_completed === true) userModuleMap[p.user_id].completedModules.add(p.module_id)
          else userModuleMap[p.user_id].startedModules.add(p.module_id)
        })

        userIds.forEach(id => {
          const completed = userModuleMap[id].completedModules.size
          const started = userModuleMap[id].startedModules.size
          if (completed >= totalModules) completedCount++
          else if (completed > 0 || started > 0) inProgressCount++
          else notStartedCount++
        })
      } else {
        notStartedCount = totalUsers
      }

      const completionRate = totalUsers > 0 ? Math.round((completedCount / totalUsers) * 100) : 0
      setStats({ totalUsers, avgScore, completionRate, atRiskUsers, completedCount, inProgressCount, notStartedCount })
      setAllBarData(allBarData)

    } catch (err) {
      console.error('fetchStats error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchLeaderboard() {
    if (!profile?.id) return
    setLeaderboardLoading(true)

    try {
      const { data: users } = await supabase
        .from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)

      if (!users || users.length === 0) { setLeaderboardLoading(false); return }

      const userIds = users.map(u => u.id)
      const userMap = {}
      users.forEach(u => { userMap[u.id] = { name: u.full_name || 'User', avatar: u.avatar_url || null } })

      const { data: simResults } = await supabase
        .from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false })

      if (!simResults || simResults.length === 0) { setLeaderboardLoading(false); return }

      const userStats = {}
      simResults.forEach(r => {
        if (!userStats[r.user_id]) userStats[r.user_id] = { scores: [], latestDate: r.completed_at }
        userStats[r.user_id].scores.push(r.score)
      })

      const ranked = Object.entries(userStats).map(([userId, data]) => ({
        userId,
        name: userMap[userId]?.name || 'User',
        avatar: userMap[userId]?.avatar || null,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.scores.length,
        latestScore: data.scores[0],
      })).sort((a, b) => b.avgScore - a.avgScore)

      setTopPerformers(ranked.filter(u => u.avgScore >= 50).slice(0, 5))
      setAtRiskList(ranked.filter(u => u.avgScore < 50).slice(0, 5))

    } catch (err) {
      console.error('fetchLeaderboard error:', err)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  async function fetchRecentActivity() {
    if (!profile?.id) return
    setActivityLoading(true)

    try {
      const { data: users } = await supabase
        .from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)

      if (!users || users.length === 0) { setActivityLoading(false); return }

      const userIds = users.map(u => u.id)
      const userMap = {}
      users.forEach(u => {
        userMap[u.id] = { name: u.full_name || 'A user', avatar: u.avatar_url || null }
      })

      const { data: simResults } = await supabase
        .from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false }).limit(10)

      const simActivities = (simResults || []).map(r => ({
        id: `sim-${r.user_id}-${r.completed_at}`,
        user: userMap[r.user_id]?.name || 'A user',
        avatar: userMap[r.user_id]?.avatar || null,
        action: 'completed a simulation',
        score: r.score,
        time: r.completed_at,
        type: 'simulation',
      }))

      const { data: moduleProgress } = await supabase
        .from('module_progress').select('user_id, score, completed_at, modules(name)')
        .in('user_id', userIds).eq('quiz_completed', true)
        .order('completed_at', { ascending: false }).limit(10)

      const moduleActivities = (moduleProgress || []).map(p => ({
        id: `mod-${p.user_id}-${p.completed_at}`,
        user: userMap[p.user_id]?.name || 'A user',
        avatar: userMap[p.user_id]?.avatar || null,
        action: 'completed a module',
        detail: p.modules?.name || 'Training Module',
        score: p.score,
        time: p.completed_at,
        type: 'module',
      }))

      const all = [...simActivities, ...moduleActivities]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 8)

      setRecentActivity(all)

    } catch (err) {
      console.error('fetchRecentActivity error:', err)
    } finally {
      setActivityLoading(false)
    }
  }

  function getFilteredData() {
    if (allBarData.length === 0) return []
    const now = new Date()
    if (view === '7D') {
      const c = new Date(now); c.setDate(c.getDate() - 7)
      return allBarData.filter(d => new Date(d.date) >= c)
    }
    if (view === '1M') {
      const c = new Date(now); c.setMonth(c.getMonth() - 1)
      return allBarData.filter(d => new Date(d.date) >= c)
    }
    if (view === '6M') return allBarData.slice(-6)
    if (view === '1Y') return allBarData.slice(-12)
    return allBarData
  }

  const barData = getFilteredData()

  const donutData = [
    { name: 'Completed', value: stats.completedCount, color: '#22c55e' },
    { name: 'In Progress', value: stats.inProgressCount, color: '#3b82f6' },
    { name: 'Not Started', value: stats.notStartedCount, color: '#e5e7eb' },
  ]

  const statCards = [
    {
      label: 'Total Users', value: loading ? '—' : stats.totalUsers, sub: 'registered',
      color: '#3b82f6', bg: '#eff6ff',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      label: 'Avg Score',
      value: loading ? '—' : stats.avgScore > 0 ? `${stats.avgScore}%` : 'N/A',
      sub: 'all simulations',
      color: stats.avgScore >= 80 ? '#16a34a' : stats.avgScore >= 50 ? '#d97706' : '#6366f1',
      bg: stats.avgScore >= 80 ? '#f0fdf4' : stats.avgScore >= 50 ? '#fffbeb' : '#eef2ff',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    },
    {
      label: 'Completion', value: loading ? '—' : `${stats.completionRate}%`, sub: `${stats.completedCount} finished`,
      color: '#16a34a', bg: '#f0fdf4',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      label: 'At Risk', value: loading ? '—' : stats.atRiskUsers, sub: 'scored below 50%',
      color: '#dc2626', bg: '#fef2f2',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          <div className="mb-7">
            <h1 className="text-gray-900 text-2xl font-bold">
              Welcome, {profile?.full_name?.split(' ')[0] || 'Admin'} 👋
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Organization security training overview</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: card.bg, color: card.color }}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-3xl font-extrabold mb-1" style={{ color: card.color }}>{card.value}</p>
                <p className="text-gray-400 text-xs">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

            {/* Area chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 pt-5 pb-4 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-gray-800 text-sm font-bold">Average Performance</h2>
                    <p className="text-gray-400 text-xs mt-0.5">Monthly simulation scores across all users</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {['7D', '1M', '6M', '1Y'].map(v => (
                      <button key={v} onClick={() => setView(v)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition
                          ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                {!loading && barData.length > 0 && (
                  <div className="flex items-center gap-5 mt-4 flex-wrap">
                    {[
                      { color: '#2563eb', label: 'Avg Score', type: 'solid' },
                      { color: '#22c55e', label: 'Pass Rate', type: 'dashed' },
                      { color: '#ef4444', label: 'At Risk', type: 'dashed' },
                      { color: '#cbd5e1', label: 'Active Users', type: 'bar' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {item.type === 'bar' ? (
                          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                        ) : item.type === 'solid' ? (
                          <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <div className="w-4 h-0.5" style={{ backgroundColor: item.color }} />
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5">
                            <div className="w-1.5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="w-0.5 h-0.5" />
                            <div className="w-1.5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                            <div className="w-0.5 h-0.5" />
                            <div className="w-1.5 h-0.5 rounded-full" style={{ backgroundColor: item.color }} />
                          </div>
                        )}
                        <span className="text-gray-500 text-xs font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chart */}
              <div className="px-2 py-4">
                {loading ? (
                  <div className="flex items-center justify-center h-56">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : barData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-56 gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No data for this period</p>
                    <p className="text-gray-300 text-xs">Try a longer time range</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={barData} margin={{ top: 10, right: 50, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />

                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        dy={8}
                      />

                      <YAxis
                        yAxisId="score"
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => `${v}%`}
                        ticks={[0, 25, 50, 75, 100]}
                      />

                      <YAxis
                        yAxisId="users"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        content={<CustomBarTooltip />}
                        cursor={{ stroke: 'rgba(37,99,235,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      />

                      {/* Active users bars — behind everything */}
                      <Bar
                        yAxisId="users"
                        dataKey="activeUsers"
                        fill="#e2e8f0"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={28}
                        opacity={0.8}
                      />

                      {/* Avg simulation score — filled area */}
                      <Area
                        yAxisId="score"
                        type="monotone"
                        dataKey="score"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        fill="url(#simGrad)"
                        connectNulls={false}
                        dot={{ r: 4, fill: '#fff', stroke: '#2563eb', strokeWidth: 2.5 }}
                        activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2.5 }}
                      />

                      {/* Pass rate — dashed green */}
                      <Line
                        yAxisId="score"
                        type="monotone"
                        dataKey="passRate"
                        stroke="#22c55e"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={{ r: 3.5, fill: '#fff', stroke: '#22c55e', strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: '#22c55e', stroke: '#fff', strokeWidth: 2 }}
                        connectNulls={false}
                      />

                      {/* At risk — dashed red */}
                      <Line
                        yAxisId="score"
                        type="monotone"
                        dataKey="atRisk"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={{ r: 3.5, fill: '#fff', stroke: '#ef4444', strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                        connectNulls={false}
                      />

                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Donut chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                <h2 className="text-gray-800 text-sm font-bold">Training Status</h2>
                <p className="text-gray-400 text-xs mt-0.5">User completion breakdown</p>
              </div>
              <div className="px-5 py-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stats.totalUsers === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No users yet</p>
                    <p className="text-gray-300 text-xs">Add users to see breakdown</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={130}>
                        <PieChart>
                          <Tooltip
                            formatter={(value, name) => [`${value} users`, name]}
                            contentStyle={{
                              backgroundColor: '#0d1117', border: 'none',
                              borderRadius: '10px', color: '#fff', fontSize: '12px',
                            }} />
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} dataKey="value" strokeWidth={0}>
                            {donutData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-gray-900 text-lg font-extrabold leading-tight">{stats.totalUsers}</p>
                        <p className="text-gray-400 text-xs">users</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-3">
                      {donutData.map((item, i) => {
                        const pct = stats.totalUsers > 0 ? Math.round((item.value / stats.totalUsers) * 100) : 0
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                              <p className="text-gray-500 text-xs">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: item.color }} />
                              </div>
                              <p className="text-gray-800 text-xs font-bold w-4 text-right">{item.value}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Top Performers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <span className="text-xs">🏆</span>
                    </div>
                    <div>
                      <h2 className="text-gray-800 text-sm font-bold">Top Performers</h2>
                      <p className="text-gray-400 text-xs">Highest avg simulation scores</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {topPerformers.length}
                  </span>
                </div>
                <div className="px-5 py-3">
                  {leaderboardLoading ? (
                    <div className="flex flex-col gap-2 py-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1" />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : topPerformers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <p className="text-2xl">🏆</p>
                      <p className="text-gray-400 text-xs font-semibold text-center">No performers yet</p>
                      <p className="text-gray-300 text-xs text-center">Users will appear once they complete simulations</p>
                    </div>
                  ) : (
                    topPerformers.map((user, i) => (
                      <div key={user.userId} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <span className="text-sm w-5 flex-shrink-0 text-center">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-gray-300 text-xs font-bold">#{i + 1}</span>}
                        </span>
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-xs font-semibold truncate">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.attempts} attempt{user.attempts > 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-green-500 transition-all duration-500"
                              style={{ width: `${user.avgScore}%` }} />
                          </div>
                          <p className="text-xs font-extrabold text-green-600 w-8 text-right">{user.avgScore}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* At Risk */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-50 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-gray-800 text-sm font-bold">Needs Attention</h2>
                      <p className="text-gray-400 text-xs">Users scoring below 50%</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${atRiskList.length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    {atRiskList.length}
                  </span>
                </div>
                <div className="px-5 py-3">
                  {leaderboardLoading ? (
                    <div className="flex flex-col gap-2 py-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-3 py-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1" />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : atRiskList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-xs font-semibold">All users passing!</p>
                      <p className="text-gray-300 text-xs text-center">No one is below 50% — great work</p>
                    </div>
                  ) : (
                    atRiskList.map((user) => (
                      <div key={user.userId} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse flex-shrink-0" />
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-500">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-xs font-semibold truncate">{user.name}</p>
                          <p className="text-gray-400 text-xs">{user.attempts} attempt{user.attempts > 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-red-400 transition-all duration-500"
                              style={{ width: `${user.avgScore}%` }} />
                          </div>
                          <p className="text-xs font-extrabold text-red-500 w-8 text-right">{user.avgScore}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-gray-800 text-sm font-bold">Recent Activity</h2>
                  <p className="text-gray-400 text-xs mt-0.5">User completions</p>
                </div>
                <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {recentActivity.length}
                </span>
              </div>
              <div className="p-3">
                {activityLoading ? (
                  <div className="flex flex-col gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                          <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-xs font-semibold">No activity yet</p>
                    <p className="text-gray-300 text-xs text-center">User completions will appear here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="flex items-start gap-2.5 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.user}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none' }} />
                        ) : (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                            ${item.type === 'simulation' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                            {item.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-xs font-semibold leading-tight truncate">{item.user}</p>
                          <p className="text-gray-400 text-xs truncate">{item.action}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.type === 'simulation' ? (
                              <span className="font-semibold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600" style={{ fontSize: '10px' }}>Simulation</span>
                            ) : (
                              <span className="font-semibold px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600" style={{ fontSize: '10px' }}>Module</span>
                            )}
                            <span className="text-gray-300" style={{ fontSize: '10px' }}>{timeAgo(item.time)}</span>
                          </div>
                        </div>
                        {item.score !== null && item.score !== undefined && (
                          <p className={`text-xs font-extrabold flex-shrink-0
                            ${item.score >= 80 ? 'text-green-500' : item.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {item.score}%
                          </p>
                        )}
                      </div>
                    ))}
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