import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'
import {
  ComposedChart, Area, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const scoreColor = (s) => {
  if (typeof s !== 'number' || isNaN(s)) return '#9ca3af'
  if (s >= 80) return '#10b981'
  if (s >= 50) return '#f59e0b'
  return '#ef4444'
}

const safePercent = (v) => {
  if (typeof v !== 'number' || isNaN(v)) return '—'
  return `${Math.round(v)}%`
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  try {
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
        backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px', padding: '12px 16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minWidth: '170px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 500, marginBottom: '10px', letterSpacing: '0.02em' }}>
          {label}
        </p>
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
  } catch {
    return null
  }
}

function DonutTooltip({ active, payload, donutTotal }) {
  if (!active || !payload?.length) return null
  try {
    const d = payload[0]?.payload
    if (!d || typeof d.value !== 'number') return null
    const pct = donutTotal > 0 ? Math.round((d.value / donutTotal) * 100) : 0
    return (
      <div style={{
        background: '#111827', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '8px 12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>
        <p style={{ color: d.color || '#fff', fontSize: '11px', fontWeight: 600, marginBottom: '2px' }}>{d.name}</p>
        <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
          {d.value} user{d.value !== 1 ? 's' : ''}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{pct}% of total</p>
      </div>
    )
  } catch {
    return null
  }
}

function timeAgo(dateStr) {
  try {
    if (!dateStr) return 'Unknown'
    const raw = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const date = new Date(raw)
    if (isNaN(date.getTime())) return 'Unknown'
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 172800) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'Unknown'
  }
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-3">
      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-red-700 text-sm font-medium">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-red-500 text-xs font-medium mt-1 hover:text-red-700 transition underline">
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-3 py-2.5">
      <div className="w-6 h-6 rounded-full bg-gray-100 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
        <div className="h-1.5 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="w-8 h-2.5 bg-gray-100 rounded" />
    </div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const profile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView] = useState('6M')
  const [activeDonutIndex, setActiveDonutIndex] = useState(null)

  const [stats, setStats] = useState({
    totalUsers: 0, avgScore: 0, completionRate: 0, atRiskUsers: 0,
    completedCount: 0, inProgressCount: 0, notStartedCount: 0,
    totalCompletedModules: 0, totalPossibleModules: 0,
  })
  const [allBarData, setAllBarData] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [atRiskList, setAtRiskList] = useState([])

  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)

  const [statsError, setStatsError] = useState('')
  const [activityError, setActivityError] = useState('')
  const [leaderboardError, setLeaderboardError] = useState('')

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) { navigate('/login'); return }
        const { data: profile, error: profileError } = await supabase
          .from('users').select('role').eq('id', user.id).single()
        if (profileError || !profile || profile.role !== 'admin') navigate('/login')
      } catch {
        navigate('/login')
      }
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

  const fetchStats = useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    setStatsError('')
    try {
      const { data: users, error: usersError } = await supabase
        .from('users').select('id, full_name')
        .eq('role', 'user').eq('organization_id', profile.id)
      if (usersError) throw new Error('Failed to load users: ' + usersError.message)

      const totalUsers = users?.length || 0
      const userIds = (users || []).map(u => u.id).filter(Boolean)

      let avgScore = 0
      let atRiskUsers = 0
      let computedBarData = []

      if (userIds.length > 0) {
        const { data: simResults, error: simError } = await supabase
          .from('simulation_results').select('score, completed_at, user_id')
          .in('user_id', userIds).order('completed_at', { ascending: true })
        if (simError) throw new Error('Failed to load simulation results: ' + simError.message)

        if (simResults && simResults.length > 0) {
          const validResults = simResults.filter(r =>
            typeof r.score === 'number' && !isNaN(r.score) && r.completed_at
          )

          if (validResults.length > 0) {
            avgScore = Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length)

            const userScores = {}
            validResults.forEach(r => {
              if (!userScores[r.user_id] || r.completed_at > userScores[r.user_id].date) {
                userScores[r.user_id] = { score: r.score, date: r.completed_at }
              }
            })
            atRiskUsers = Object.values(userScores).filter(s => s.score < 50).length

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            // ── Determine grouping mode based on data spread ──
            const dates = validResults.map(r => new Date(r.completed_at)).filter(d => !isNaN(d))
            const minDate = new Date(Math.min(...dates))
            const maxDate = new Date(Math.max(...dates))
            const daySpread = (maxDate - minDate) / (1000 * 60 * 60 * 24)
            const groupByDay = daySpread <= 90

            const grouped = {}
            validResults.forEach(r => {
              try {
                const date = new Date(r.completed_at)
                if (isNaN(date.getTime())) return
                let key, label
                if (groupByDay) {
                  key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                  label = `${monthNames[date.getMonth()]} ${date.getDate()}`
                } else {
                  key = `${date.getFullYear()}-${date.getMonth()}`
                  label = monthNames[date.getMonth()]
                }
                if (!grouped[key]) grouped[key] = { scores: [], users: new Set(), label, date }
                grouped[key].scores.push(r.score)
                grouped[key].users.add(r.user_id)
              } catch { /* skip malformed dates */ }
            })

            computedBarData = Object.values(grouped)
              .sort((a, b) => a.date - b.date)
              .map(m => ({
                month: m.label,
                score: Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length),
                passRate: Math.round((m.scores.filter(s => s >= 80).length / m.scores.length) * 100),
                atRisk: Math.round((m.scores.filter(s => s < 50).length / m.scores.length) * 100),
                activeUsers: m.users.size,
                date: m.date,
              }))
          }
        }
      }

      let completedCount = 0, inProgressCount = 0, notStartedCount = 0
      let totalCompletedModules = 0, totalPossibleModules = 0

      const { data: allModules, error: modulesError } = await supabase
        .from('modules').select('id')
        .eq('hidden', false).eq('organization_id', profile.id)
      if (modulesError) throw new Error('Failed to load modules: ' + modulesError.message)

      const totalModules = allModules?.length || 0

      if (userIds.length > 0 && totalModules > 0) {
        const moduleIds = allModules.map(m => m.id).filter(Boolean)
        totalPossibleModules = userIds.length * totalModules

        const { data: progress, error: progressError } = await supabase
          .from('module_progress').select('user_id, module_id, quiz_completed')
          .in('user_id', userIds).in('module_id', moduleIds)
        if (progressError) throw new Error('Failed to load module progress: ' + progressError.message)

        const userModuleMap = {}
        userIds.forEach(id => {
          userModuleMap[id] = { completedModules: new Set(), startedModules: new Set() }
        })
          ; (progress || []).forEach(p => {
            if (!p.user_id || !userModuleMap[p.user_id]) return
            if (p.quiz_completed === true) {
              userModuleMap[p.user_id].completedModules.add(p.module_id)
              totalCompletedModules++
            } else {
              userModuleMap[p.user_id].startedModules.add(p.module_id)
            }
          })

        userIds.forEach(id => {
          const completed = userModuleMap[id]?.completedModules.size || 0
          const started = userModuleMap[id]?.startedModules.size || 0
          if (completed >= totalModules) completedCount++
          else if (completed > 0 || started > 0) inProgressCount++
          else notStartedCount++
        })
      } else {
        notStartedCount = totalUsers
      }

      const completionRate = totalPossibleModules > 0
        ? Math.round((totalCompletedModules / totalPossibleModules) * 100)
        : 0

      setStats({
        totalUsers, avgScore, completionRate, atRiskUsers,
        completedCount, inProgressCount, notStartedCount,
        totalCompletedModules, totalPossibleModules,
      })
      setAllBarData(computedBarData)
    } catch (err) {
      console.error('fetchStats error:', err)
      setStatsError(err.message || 'Failed to load dashboard stats.')
    } finally {
      setLoading(false)
    }
  }, [profile])

  const fetchLeaderboard = useCallback(async () => {
    if (!profile?.id) return
    setLeaderboardLoading(true)
    setLeaderboardError('')
    try {
      const { data: users, error: usersError } = await supabase
        .from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)
      if (usersError) throw new Error('Failed to load users: ' + usersError.message)
      if (!users || users.length === 0) return

      const userIds = users.map(u => u.id).filter(Boolean)
      const userMap = {}
      users.forEach(u => { userMap[u.id] = { name: u.full_name || 'User', avatar: u.avatar_url || null } })

      const { data: simResults, error: simError } = await supabase
        .from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false })
      if (simError) throw new Error('Failed to load results: ' + simError.message)
      if (!simResults || simResults.length === 0) return

      const userStats = {}
      simResults.forEach(r => {
        if (!r.user_id || typeof r.score !== 'number' || isNaN(r.score)) return
        if (!userStats[r.user_id]) userStats[r.user_id] = { scores: [] }
        userStats[r.user_id].scores.push(r.score)
      })

      const ranked = Object.entries(userStats)
        .map(([userId, data]) => ({
          userId,
          name: userMap[userId]?.name || 'User',
          avatar: userMap[userId]?.avatar || null,
          avgScore: data.scores.length > 0
            ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
            : 0,
          attempts: data.scores.length,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)

      setTopPerformers(ranked.filter(u => u.avgScore >= 50).slice(0, 5))
      setAtRiskList(ranked.filter(u => u.avgScore < 50).slice(0, 5))
    } catch (err) {
      console.error('fetchLeaderboard error:', err)
      setLeaderboardError(err.message || 'Failed to load leaderboard.')
    } finally {
      setLeaderboardLoading(false)
    }
  }, [profile])

  const fetchRecentActivity = useCallback(async () => {
    if (!profile?.id) return
    setActivityLoading(true)
    setActivityError('')
    try {
      const { data: users, error: usersError } = await supabase
        .from('users').select('id, full_name, avatar_url')
        .eq('role', 'user').eq('organization_id', profile.id)
      if (usersError) throw new Error('Failed to load users: ' + usersError.message)
      if (!users || users.length === 0) return

      const userIds = users.map(u => u.id).filter(Boolean)
      const userMap = {}
      users.forEach(u => { userMap[u.id] = { name: u.full_name || 'A user', avatar: u.avatar_url || null } })

      const { data: simResults, error: simError } = await supabase
        .from('simulation_results').select('user_id, score, completed_at')
        .in('user_id', userIds).order('completed_at', { ascending: false }).limit(10)
      if (simError) throw new Error('Failed to load simulation results: ' + simError.message)

      const { data: moduleProgress, error: modError } = await supabase
        .from('module_progress').select('user_id, score, completed_at, modules(name)')
        .in('user_id', userIds).eq('quiz_completed', true)
        .order('completed_at', { ascending: false }).limit(10)
      if (modError) throw new Error('Failed to load module progress: ' + modError.message)

      const simActivities = (simResults || [])
        .filter(r => r.user_id && r.completed_at)
        .map(r => ({
          id: `sim-${r.user_id}-${r.completed_at}`,
          user: userMap[r.user_id]?.name || 'A user',
          avatar: userMap[r.user_id]?.avatar || null,
          action: 'Simulation', score: r.score,
          time: r.completed_at, type: 'simulation',
        }))

      const moduleActivities = (moduleProgress || [])
        .filter(p => p.user_id && p.completed_at)
        .map(p => ({
          id: `mod-${p.user_id}-${p.completed_at}`,
          user: userMap[p.user_id]?.name || 'A user',
          avatar: userMap[p.user_id]?.avatar || null,
          action: 'Module', score: p.score,
          time: p.completed_at, type: 'module',
        }))

      setRecentActivity(
        [...simActivities, ...moduleActivities]
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 8)
      )
    } catch (err) {
      console.error('fetchRecentActivity error:', err)
      setActivityError(err.message || 'Failed to load activity.')
    } finally {
      setActivityLoading(false)
    }
  }, [profile])

  function getFilteredData() {
    try {
      if (!Array.isArray(allBarData) || allBarData.length === 0) return []
      const now = new Date()
      if (view === '7D') {
        const c = new Date(now); c.setDate(c.getDate() - 7)
        return allBarData.filter(d => new Date(d.date) >= c)
      }
      if (view === '1M') {
        const c = new Date(now); c.setMonth(c.getMonth() - 1)
        return allBarData.filter(d => new Date(d.date) >= c)
      }
      if (view === '6M') {
        const c = new Date(now); c.setMonth(c.getMonth() - 6)
        return allBarData.filter(d => new Date(d.date) >= c)
      }
      if (view === '1Y') {
        const c = new Date(now); c.setFullYear(c.getFullYear() - 1)
        return allBarData.filter(d => new Date(d.date) >= c)
      }
      return allBarData
    } catch {
      return []
    }
  }

  const barData = getFilteredData()

  const donutData = [
    { name: 'Completed', value: stats.completedCount, color: '#10b981', bg: '#f0fdf4' },
    { name: 'In Progress', value: stats.inProgressCount, color: '#3b82f6', bg: '#eff6ff' },
    { name: 'Not Started', value: stats.notStartedCount, color: '#9ca3af', bg: '#f9fafb' },
  ].filter(d => typeof d.value === 'number' && d.value > 0)

  const donutTotal = stats.totalUsers

  const donutDisplay = donutData.length > 0
    ? donutData
    : [{ name: 'No Data', value: 1, color: '#f3f4f6', bg: '#f9fafb' }]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-14'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6 overflow-y-auto">

          <div className="mb-6">
            <h1 className="text-gray-900 text-2xl font-bold">
              {profile?.company_name || profile?.full_name || 'Dashboard'}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Security Awareness Dashboard</p>
            <p className="text-gray-400 text-xs mt-1.5 flex items-center gap-2 flex-wrap">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              {!loading && (
                <>
                  <span className="text-gray-200">·</span>
                  <span>{stats.totalUsers} user{stats.totalUsers !== 1 ? 's' : ''}</span>
                  {recentActivity.length > 0 && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span>Last activity {timeAgo(recentActivity[0]?.time)}</span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {statsError && (
            <div className="mb-4">
              <ErrorCard message={statsError} onRetry={fetchStats} />
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: 'Total Users',
                value: loading ? '—' : stats.totalUsers,
                sub: 'registered',
                valueColor: '#111827',
              },
              {
                label: 'Avg Score',
                value: loading ? '—' : stats.avgScore > 0 ? safePercent(stats.avgScore) : '—',
                sub: 'all simulations',
                valueColor: loading || stats.avgScore === 0 ? '#111827' : scoreColor(stats.avgScore),
              },
              {
                label: 'Completion',
                value: loading ? '—' : safePercent(stats.completionRate),
                sub: loading ? '' : `${stats.totalCompletedModules} of ${stats.totalPossibleModules} modules done`,
                valueColor: '#111827',
              },
              {
                label: 'At Risk',
                value: loading ? '—' : stats.atRiskUsers,
                sub: 'below 50%',
                valueColor: stats.atRiskUsers > 0 ? '#ef4444' : '#111827',
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
                  <p className="text-gray-400 text-xs mt-0.5">Simulation scores, pass rate and risk over time</p>
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
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={barData} margin={{ top: 8, right: 60, left: -20, bottom: barData.length > 8 ? 50 : 5 }}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        dy={6}
                        interval={Math.max(0, Math.floor(barData.length / 8))}
                        angle={barData.length > 8 ? -35 : 0}
                        textAnchor={barData.length > 8 ? 'end' : 'middle'}
                        height={barData.length > 8 ? 60 : 20}
                      />
                      <YAxis yAxisId="score" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} ticks={[0, 25, 50, 75, 100]} />
                      <YAxis
                        yAxisId="users"
                        orientation="right"
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        domain={[0, dataMax => Math.max(dataMax + 1, 3)]}
                      />
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

            {/* Training Status donut */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                <p className="text-gray-800 text-sm font-semibold">Training Status</p>
                <p className="text-gray-400 text-xs mt-0.5">Module completion by user</p>
              </div>
              <div className="px-5 py-5">
                {loading ? (
                  <div className="flex items-center justify-center h-52">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : stats.totalUsers === 0 ? (
                  <div className="flex flex-col items-center justify-center h-52 gap-1">
                    <p className="text-gray-400 text-sm">No users yet</p>
                    <p className="text-gray-300 text-xs">Add users to see breakdown</p>
                  </div>
                ) : (
                  <>
                    <div className="relative flex items-center justify-center mb-5">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={donutDisplay}
                            cx="50%" cy="50%"
                            innerRadius={48} outerRadius={68}
                            dataKey="value"
                            strokeWidth={0}
                            paddingAngle={donutData.length > 1 ? 3 : 0}
                            onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                            onMouseLeave={() => setActiveDonutIndex(null)}
                            onClick={() => { }}
                          >
                            {donutDisplay.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                opacity={activeDonutIndex === null || activeDonutIndex === index ? 1 : 0.35}
                                style={{ cursor: donutData.length > 0 ? 'pointer' : 'default', outline: 'none' }}
                              />
                            ))}
                          </Pie>
                          {donutData.length > 0 && (
                            <Tooltip content={<DonutTooltip donutTotal={donutTotal} />} />
                          )}
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-gray-900 font-bold" style={{ fontSize: '22px', lineHeight: 1 }}>
                          {activeDonutIndex !== null && donutData[activeDonutIndex]
                            ? donutData[activeDonutIndex].value
                            : donutTotal}
                        </p>
                        <p className="text-gray-400 font-medium mt-1"
                          style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          {activeDonutIndex !== null && donutData[activeDonutIndex]
                            ? donutData[activeDonutIndex].name
                            : 'Total Users'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {[
                        { name: 'Completed', value: stats.completedCount, color: '#10b981', bg: '#f0fdf4' },
                        { name: 'In Progress', value: stats.inProgressCount, color: '#3b82f6', bg: '#eff6ff' },
                        { name: 'Not Started', value: stats.notStartedCount, color: '#9ca3af', bg: '#f9fafb' },
                      ].map((item, i) => {
                        const pct = donutTotal > 0 ? Math.round((item.value / donutTotal) * 100) : 0
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: item.bg }}>
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-600 text-xs font-medium">{item.name}</p>
                                <p className="text-gray-700 text-xs font-semibold">{item.value}</p>
                              </div>
                              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: item.color }} />
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs w-8 text-right flex-shrink-0">{pct}%</p>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                      <p className="text-gray-400 text-xs">Module completion rate</p>
                      <p className="text-gray-800 text-xs font-bold">{safePercent(stats.completionRate)}</p>
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
                {leaderboardError ? (
                  <div className="py-3">
                    <ErrorCard message={leaderboardError} onRetry={fetchLeaderboard} />
                  </div>
                ) : leaderboardLoading ? (
                  <div className="py-2">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
                ) : topPerformers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1">
                    <p className="text-gray-400 text-xs">No data yet</p>
                    <p className="text-gray-300 text-xs">Complete simulations to appear here</p>
                  </div>
                ) : topPerformers.map((user, i) => (
                  <div key={user.userId} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-300 text-xs font-mono w-4 flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {(user.name || 'U').charAt(0).toUpperCase()}
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
                      <p className="text-xs font-semibold w-8 text-right" style={{ color: scoreColor(user.avgScore) }}>
                        {user.avgScore}%
                      </p>
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
                {leaderboardError ? (
                  <div className="py-3">
                    <ErrorCard message={leaderboardError} onRetry={fetchLeaderboard} />
                  </div>
                ) : leaderboardLoading ? (
                  <div className="py-2">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
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
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {(user.name || 'U').charAt(0).toUpperCase()}
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
                {activityError ? (
                  <div className="py-3 px-2">
                    <ErrorCard message={activityError} onRetry={fetchRecentActivity} />
                  </div>
                ) : activityLoading ? (
                  <div className="py-2 px-2">{[1, 2, 3].map(i => <SkeletonRow key={i} />)}</div>
                ) : recentActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-1">
                    <p className="text-gray-400 text-xs">No activity yet</p>
                    <p className="text-gray-300 text-xs">Completions will appear here</p>
                  </div>
                ) : recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition">
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.user} className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        onError={e => { e.target.style.display = 'none' }} />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                        {(item.user || 'U').charAt(0).toUpperCase()}
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
                    {typeof item.score === 'number' && !isNaN(item.score) && (
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