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

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const sim = payload.find(p => p.dataKey === 'score')
  const pass = payload.find(p => p.dataKey === 'passRate')
  const risk = payload.find(p => p.dataKey === 'atRisk')
  const users = payload.find(p => p.dataKey === 'activeUsers')
  const rows = [
    sim && { label: 'Avg Score', value: `${sim.value}%`, color: '#3b82f6' },
    pass && { label: 'Pass Rate', value: `${pass.value}%`, color: '#10b981' },
    risk && { label: 'At Risk', value: `${risk.value}%`, color: '#ef4444' },
    users && { label: 'Active Users', value: users.value, color: '#94a3b8' },
  ].filter(Boolean)
  return (
    <div style={{
      backgroundColor: '#111827',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px',
      padding: '12px 16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      minWidth: '170px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500, marginBottom: '10px', letterSpacing: '0.02em' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: row.color }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{row.label}</span>
            </div>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{row.value}</span>
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
            if (!userScores[r.user_id] || r.completed_at > userScores[r.user_id].date)
              userScores[r.user_id] = { score: r.score, date: r.completed_at }
          })
          atRiskUsers = Object.values(userScores).filter(s => s.score < 50).length
          const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
          const grouped = {}
          simResults.forEach(r => {
            const date = new Date(r.completed_at)
            const key = `${date.getFullYear()}-${date.getMonth()}`
            if (!grouped[key]) grouped[key] = { scores: [], users: new Set(), month: monthNames[date.getMonth()], date }
            grouped[key].scores.push(r.score)
            grouped[key].users.add(r.user_id)
          })
          allBarData = Object.values(grouped).sort((a, b) => a.date - b.date).map(m => ({
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
      const { data: allModules } = await supabase.from('modules').select('id').eq('hidden', false).eq('organization_id', profile.id)
      const totalModules = allModules?.length || 0

      if (userIds.length > 0 && totalModules > 0) {
        const moduleIds = allModules.map(m => m.id)
        const { data: progress } = await supabase.from('module_progress')
          .select('user_id, module_id, quiz_completed').in('user_id', userIds).in('module_id', moduleIds)
        const userModuleMap = {}
        userIds.forEach(id => { userModuleMap[id] = { completedModules: new Set(), startedModules: new Set() } })
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
      const { data: users } = await supabase.from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)
      if (!users || users.length === 0) { setLeaderboardLoading(false); return }
      const userIds = users.map(u => u.id)
      const userMap = {}
      users.forEach(u => { userMap[u.id] = { name: u.full_name || 'User', avatar: u.avatar_url || null } })
      const { data: simResults } = await supabase.from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false })
      if (!simResults || simResults.length === 0) { setLeaderboardLoading(false); return }
      const userStats = {}
      simResults.forEach(r => {
        if (!userStats[r.user_id]) userStats[r.user_id] = { scores: [] }
        userStats[r.user_id].scores.push(r.score)
      })
      const ranked = Object.entries(userStats).map(([userId, data]) => ({
        userId, name: userMap[userId]?.name || 'User', avatar: userMap[userId]?.avatar || null,
        avgScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.scores.length,
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
      const { data: users } = await supabase.from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)
      if (!users || users.length === 0) { setActivityLoading(false); return }
      const userIds = users.map(u => u.id)
      const userMap = {}
      users.forEach(u => { userMap[u.id] = { name: u.full_name || 'A user', avatar: u.avatar_url || null } })
      const { data: simResults } = await supabase.from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false }).limit(10)
      const simActivities = (simResults || []).map(r => ({
        id: `sim-${r.user_id}-${r.completed_at}`, user: userMap[r.user_id]?.name || 'A user',
        avatar: userMap[r.user_id]?.avatar || null, action: 'Simulation', score: r.score,
        time: r.completed_at, type: 'simulation',
      }))
      const { data: moduleProgress } = await supabase.from('module_progress')
        .select('user_id, score, completed_at, modules(name)').in('user_id', userIds)
        .eq('quiz_completed', true).order('completed_at', { ascending: false }).limit(10)
      const moduleActivities = (moduleProgress || []).map(p => ({
        id: `mod-${p.user_id}-${p.completed_at}`, user: userMap[p.user_id]?.name || 'A user',
        avatar: userMap[p.user_id]?.avatar || null, action: 'Module', score: p.score,
        time: p.completed_at, type: 'module',
      }))
      setRecentActivity([...simActivities, ...moduleActivities]
        .sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8))
    } catch (err) {
      console.error('fetchRecentActivity error:', err)
    } finally {
      setActivityLoading(false)
    }
  }

  function getFilteredData() {
    if (allBarData.length === 0) return []
    const now = new Date()
    if (view === '7D') { const c = new Date(now); c.setDate(c.getDate() - 7); return allBarData.filter(d => new Date(d.date) >= c) }
    if (view === '1M') { const c = new Date(now); c.setMonth(c.getMonth() - 1); return allBarData.filter(d => new Date(d.date) >= c) }
    if (view === '6M') return allBarData.slice(-6)
    if (view === '1Y') return allBarData.slice(-12)
    return allBarData
  }

  const barData = getFilteredData()

  const donutData = [
    { name: 'Completed', value: stats.completedCount, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressCount, color: '#3b82f6' },
    { name: 'Not Started', value: stats.notStartedCount, color: '#e5e7eb' },
  ]

  const scoreColor = (s) => s >= 80 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">
              {profile?.full_name?.split(' ')[0] ? `Good day, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Security training overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Stat cards — compact horizontal */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: 'Total Users', value: loading ? '—' : stats.totalUsers,
                sub: 'registered', valueColor: '#111827',
              },
              {
                label: 'Avg Score',
                value: loading ? '—' : stats.avgScore > 0 ? `${stats.avgScore}%` : '—',
                sub: 'all simulations',
                valueColor: loading ? '#111827' : scoreColor(stats.avgScore),
              },
              {
                label: 'Completion', value: loading ? '—' : `${stats.completionRate}%`,
                sub: `${stats.completedCount} of ${stats.totalUsers} users`, valueColor: '#111827',
              },
              {
                label: 'At Risk', value: loading ? '—' : stats.atRiskUsers,
                sub: 'below 50%', valueColor: stats.atRiskUsers > 0 ? '#ef4444' : '#111827',
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl px-5 py-4 border border-gray-100">
                <p className="text-gray-400 text-xs mb-2">{card.label}</p>
                <p className="text-2xl font-bold tracking-tight mb-0.5" style={{ color: card.valueColor }}>
                  {card.value}
                </p>
                <p className="text-gray-400 text-xs">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

            {/* Performance chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-50">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Performance</p>
                  <p className="text-gray-400 text-xs mt-0.5">Simulation scores, pass rate & risk over time</p>
                </div>
                <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-lg p-0.5">
                  {['7D', '1M', '6M', '1Y'].map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition
                        ${view === v ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Legend */}
              {!loading && barData.length > 0 && (
                <div className="px-5 pt-3 flex items-center gap-4 flex-wrap">
                  {[
                    { color: '#3b82f6', label: 'Avg Score', dashed: false },
                    { color: '#10b981', label: 'Pass Rate', dashed: true },
                    { color: '#ef4444', label: 'At Risk', dashed: true },
                    { color: '#e2e8f0', label: 'Active Users', bar: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {item.bar ? (
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                      ) : (
                        <svg width="16" height="4">
                          {item.dashed
                            ? <line x1="0" y1="2" x2="16" y2="2" stroke={item.color} strokeWidth="1.5" strokeDasharray="3 2" />
                            : <line x1="0" y1="2" x2="16" y2="2" stroke={item.color} strokeWidth="2" />
                          }
                        </svg>
                      )}
                      <span className="text-gray-400 text-xs">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-2 py-3">
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : barData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <p className="text-gray-400 text-sm">No data for this period</p>
                    <p className="text-gray-300 text-xs">Try a longer time range</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={210}>
                    <ComposedChart data={barData} margin={{ top: 8, right: 44, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} ticks={[0, 25, 50, 75, 100]} />
                      <YAxis yAxisId="users" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.06)', strokeWidth: 1, strokeDasharray: '3 3' }} />
                      <Bar yAxisId="users" dataKey="activeUsers" fill="#e2e8f0" radius={[2, 2, 0, 0]} maxBarSize={24} opacity={0.7} />
                      <Area yAxisId="score" type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#blueGrad)" dot={{ r: 3.5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                      <Line yAxisId="score" type="monotone" dataKey="passRate" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3, fill: '#fff', stroke: '#10b981', strokeWidth: 1.5 }} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                      <Line yAxisId="score" type="monotone" dataKey="atRisk" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 3, fill: '#fff', stroke: '#ef4444', strokeWidth: 1.5 }} activeDot={{ r: 4, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }} connectNulls={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Training status */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                <p className="text-gray-800 text-sm font-semibold">Training Status</p>
                <p className="text-gray-400 text-xs mt-0.5">Module completion breakdown</p>
              </div>
              <div className="px-5 py-4">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stats.totalUsers === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-1">
                    <p className="text-gray-400 text-sm">No users yet</p>
                    <p className="text-gray-300 text-xs">Add users to see breakdown</p>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-4">
                      <ResponsiveContainer width="100%" height={120}>
                        <PieChart>
                          <Tooltip formatter={(v, n) => [`${v} users`, n]}
                            contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                          <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={52} dataKey="value" strokeWidth={0}>
                            {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-gray-900 text-base font-bold">{stats.totalUsers}</p>
                        <p className="text-gray-400 text-xs">users</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {donutData.map((item, i) => {
                        const pct = stats.totalUsers > 0 ? Math.round((item.value / stats.totalUsers) * 100) : 0
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <p className="text-gray-500 text-xs flex-1">{item.name}</p>
                            <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                            </div>
                            <p className="text-gray-700 text-xs font-semibold w-5 text-right flex-shrink-0">{item.value}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Top performers */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Top Performers</p>
                  <p className="text-gray-400 text-xs mt-0.5">Highest avg simulation scores</p>
                </div>
                <span className="text-gray-400 text-xs">{topPerformers.length} users</span>
              </div>
              <div className="px-5 py-2">
                {leaderboardLoading ? (
                  <div className="flex flex-col gap-3 py-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                          <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topPerformers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1">
                    <p className="text-gray-400 text-xs">No data yet</p>
                    <p className="text-gray-300 text-xs">Complete simulations to appear here</p>
                  </div>
                ) : topPerformers.map((user, i) => (
                  <div key={user.userId} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-300 text-xs font-mono w-4 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs font-medium truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.attempts} attempt{user.attempts > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${user.avgScore}%`, backgroundColor: scoreColor(user.avgScore) }} />
                      </div>
                      <p className="text-xs font-semibold w-8 text-right" style={{ color: scoreColor(user.avgScore) }}>{user.avgScore}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs attention */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Needs Attention</p>
                  <p className="text-gray-400 text-xs mt-0.5">Users scoring below 50%</p>
                </div>
                {atRiskList.length > 0 && (
                  <span className="text-red-400 text-xs font-medium">{atRiskList.length} at risk</span>
                )}
              </div>
              <div className="px-5 py-2">
                {leaderboardLoading ? (
                  <div className="flex flex-col gap-3 py-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                          <div className="h-1.5 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : atRiskList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-xs font-medium">All users passing</p>
                    <p className="text-gray-300 text-xs">No one below 50%</p>
                  </div>
                ) : atRiskList.map((user) => (
                  <div key={user.userId} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs font-medium truncate">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.attempts} attempt{user.attempts > 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-red-400" style={{ width: `${user.avgScore}%` }} />
                      </div>
                      <p className="text-xs font-semibold text-red-400 w-8 text-right">{user.avgScore}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Recent Activity</p>
                  <p className="text-gray-400 text-xs mt-0.5">Latest completions</p>
                </div>
                <span className="text-gray-400 text-xs">{recentActivity.length} events</span>
              </div>
              <div className="px-3 py-1">
                {activityLoading ? (
                  <div className="flex flex-col gap-2 py-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3 px-2 py-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                          <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1">
                    <p className="text-gray-400 text-xs">No activity yet</p>
                    <p className="text-gray-300 text-xs">Completions will appear here</p>
                  </div>
                ) : recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.user} className="w-6 h-6 rounded-full object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {item.user.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs font-medium truncate">{item.user}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-400 text-xs">{item.action}</span>
                        <span className="text-gray-200 text-xs">·</span>
                        <span className="text-gray-300 text-xs">{timeAgo(item.time)}</span>
                      </div>
                    </div>
                    {item.score != null && (
                      <p className="text-xs font-semibold flex-shrink-0" style={{ color: scoreColor(item.score) }}>
                        {item.score}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard