import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ACHIEVEMENT_META = {
  first_simulation: { label: 'First Strike', icon: '⚡', desc: 'Completed first simulation', color: 'bg-blue-50 border-blue-100' },
  perfect_score: { label: 'Flawless', icon: '💎', desc: 'Scored 100% on a simulation', color: 'bg-purple-50 border-purple-100' },
  redeemed: { label: 'Redeemed', icon: '🔄', desc: 'Improved from high risk to pass', color: 'bg-green-50 border-green-100' },
  sim_streak: { label: 'On a Roll', icon: '🔥', desc: 'Completed 3+ simulations', color: 'bg-orange-50 border-orange-100' },
  first_module: { label: 'First Step', icon: '📚', desc: 'Completed first module', color: 'bg-teal-50 border-teal-100' },
  all_modules: { label: 'Graduate', icon: '🎓', desc: 'Completed all modules', color: 'bg-indigo-50 border-indigo-100' },
  daily_streak: { label: 'Dedicated', icon: '📅', desc: '3 modules in one day', color: 'bg-yellow-50 border-yellow-100' },
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ScoreBadge({ score }) {
  if (score >= 80) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Pass</span>
  if (score >= 50) return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">Average</span>
  return <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">High Risk</span>
}

function scoreColor(score) {
  if (score == null) return '#9ca3af'
  if (score >= 80) return '#16a34a'
  if (score >= 50) return '#d97706'
  return '#dc2626'
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        <p className="text-gray-900 text-sm font-bold">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const adminProfile = useProfile()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [user, setUser] = useState(null)
  const [simResults, setSimResults] = useState([])
  const [assignedBatches, setAssignedBatches] = useState([])
  const [moduleProgress, setModuleProgress] = useState([])
  const [achievements, setAchievements] = useState([])
  const [allModules, setAllModules] = useState([])

  // ── Auth guard ──
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) navigate('/login')
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (id && adminProfile?.id) fetchAll()
  }, [id, adminProfile])

  // ── Realtime ──
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`user-profile-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulation_results', filter: `user_id=eq.${id}` }, () => fetchAll())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'module_progress', filter: `user_id=eq.${id}` }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements', filter: `user_id=eq.${id}` }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  async function fetchAll() {
    if (!adminProfile?.id) return
    setLoading(true)
    setFetchError('')

    try {
      const [userRes, simRes, progressRes, achieveRes, modulesRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('simulation_results')
          .select('id, score, completed_at, batch_id, simulation_id, total, simulations(scenario_name, category, difficulty)')
          .eq('user_id', id)
          .order('completed_at', { ascending: false }),
        supabase.from('module_progress')
          .select('*, modules(name, description)')
          .eq('user_id', id),
        supabase.from('achievements').select('*').eq('user_id', id).order('earned_at', { ascending: false }),
        supabase.from('modules').select('id, name, description').eq('hidden', false),
      ])

      if (userRes.error) {
        console.error('User fetch error:', userRes.error)
        setFetchError('Could not load user profile.')
        setLoading(false)
        return
      }

      if (simRes.error) console.error('Sim results error:', simRes.error)
      if (progressRes.error) console.error('Progress error:', progressRes.error)
      if (achieveRes.error) console.error('Achievements error:', achieveRes.error)
      if (modulesRes.error) console.error('Modules error:', modulesRes.error)

      // ── Pending batches: org sims not yet completed by user ──
      const now = new Date().toISOString()
      const { data: allOrgSims, error: orgSimsError } = await supabase
        .from('simulations')
        .select('id, scenario_name, category, difficulty, batch_id, expires_at, created_at')
        .eq('organization_id', adminProfile.id)
        .eq('hidden', false)
        .or(`expires_at.is.null,expires_at.gt.${now}`)

      if (orgSimsError) console.error('Org sims error:', orgSimsError)

      const batchMap = {}
      ;(allOrgSims || []).forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) {
          batchMap[bid] = { batch_id: bid, created_at: s.created_at, expires_at: s.expires_at, sims: [] }
        }
        batchMap[bid].sims.push(s)
      })

      const completedBatchIds = new Set((simRes.data || []).map(r => r.batch_id).filter(Boolean))
      const pending = Object.values(batchMap).filter(b => !completedBatchIds.has(b.batch_id))

      setAssignedBatches(pending)
      setUser(userRes.data)
      setSimResults(simRes.data || [])
      setModuleProgress(progressRes.data || [])
      setAchievements(achieveRes.data || [])
      setAllModules(modulesRes.data || [])

    } catch (err) {
      console.error('Unexpected error in fetchAll:', err)
      setFetchError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (fetchError || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 font-semibold mb-2">{fetchError || 'User not found'}</p>
              <button onClick={() => navigate('/admin/users')} className="text-blue-500 text-sm">← Back to Users</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Stats — null-safe score calculation ──
  const validScores = simResults.filter(r => r.score != null)
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length)
    : null

  const completedModules = moduleProgress.filter(p => p.quiz_completed).length
  const totalModules = allModules.length

  const riskLevel = avgScore === null ? 'No Data'
    : avgScore >= 80 ? 'Low Risk'
      : avgScore >= 50 ? 'Medium Risk'
        : 'High Risk'

  const riskColor = avgScore === null ? 'bg-gray-100 text-gray-500'
    : avgScore >= 80 ? 'bg-green-100 text-green-700'
      : avgScore >= 50 ? 'bg-yellow-100 text-yellow-700'
        : 'bg-red-100 text-red-600'

  const chartData = [...simResults].reverse().map(r => ({
    label: formatDateShort(r.completed_at),
    fullDate: formatDate(r.completed_at),
    score: r.score,
  }))

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'simulations', label: `Simulations (${simResults.length})` },
    { id: 'pending', label: `Pending (${assignedBatches.length})` },
    { id: 'training', label: `Training (${completedModules}/${totalModules})` },
    { id: 'achievements', label: `Achievements (${achievements.length})` },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* Back */}
          <button onClick={() => navigate('/admin/users')}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm font-medium transition mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Users
          </button>

          {/* Profile header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-16 h-16 rounded-2xl object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-gray-900 text-xl font-bold">{user.full_name}</h1>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColor}`}>{riskLevel}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-500 text-xs font-medium">Live</span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{user.job_title || 'No title'} · {user.department || 'No department'}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Joined {formatDate(user.created_at)}
                    </span>
                    {user.employee_id && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                        </svg>
                        {user.employee_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap justify-end">
                {[
                  { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: scoreColor(avgScore) },
                  { label: 'Completed Sims', value: simResults.length, color: '#0f0f0f' },
                  { label: 'Pending Sims', value: assignedBatches.length, color: '#f59e0b' },
                  { label: 'Modules', value: `${completedModules}/${totalModules}`, color: '#0d0d0e' },
                  { label: 'Achievements', value: achievements.length, color: '#0f0f0f' },
                ].map((stat, i) => (
                  <div key={i} className="text-center px-4 py-3 bg-gray-50 rounded-xl min-w-[75px]">
                    <p className="text-xl font-extrabold mb-0.5" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-gray-400 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-6 shadow-sm flex-wrap">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap
                  ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-gray-800 text-sm font-bold mb-1">Score Trend</h2>
                <p className="text-gray-400 text-xs mb-5">Performance across all completed simulations with dates</p>
                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <p className="text-gray-400 text-sm">No simulation data yet</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={6} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5} fill="url(#scoreGrad)"
                        dot={{ r: 4, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-gray-800 text-sm font-bold mb-4">Recent Activity</h2>
                {simResults.length === 0 && moduleProgress.filter(p => p.quiz_completed).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2">
                    <p className="text-gray-400 text-xs text-center">No activity yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {[
                      ...simResults.slice(0, 3).map(r => ({
                        type: 'sim',
                        label: r.simulations?.scenario_name || 'Simulation',
                        score: r.score,
                        time: r.completed_at,
                      })),
                      ...moduleProgress.filter(p => p.quiz_completed).slice(0, 2).map(p => ({
                        type: 'module',
                        label: p.modules?.name || 'Module',
                        score: p.score,
                        time: p.completed_at,
                      })),
                    ]
                      .sort((a, b) => new Date(b.time) - new Date(a.time))
                      .slice(0, 6)
                      .map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
                            ${item.type === 'sim' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                            {item.type === 'sim' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 text-xs font-semibold truncate">{item.label}</p>
                            <p className="text-gray-400 text-xs">{timeAgo(item.time)}</p>
                          </div>
                          {item.score != null && (
                            <p className="text-xs font-bold flex-shrink-0" style={{ color: scoreColor(item.score) }}>
                              {item.score}%
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SIMULATIONS TAB */}
          {activeTab === 'simulations' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-gray-800 text-sm font-bold">Simulation History</h2>
                  <p className="text-gray-400 text-xs mt-0.5">Full record including deleted simulations</p>
                </div>
                {simResults.length > 0 && (
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Average</p>
                    <p className="text-sm font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore}%</p>
                  </div>
                )}
              </div>

              {simResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-sm font-medium">No simulations completed yet</p>
                </div>
              ) : (
                <>
                  <div className="grid px-6 py-3 bg-gray-50 border-b border-gray-100"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.2fr' }}>
                    {['Scenario', 'Category', 'Difficulty', 'Score', 'Completed'].map(h => (
                      <p key={h} className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{h}</p>
                    ))}
                  </div>

                  {simResults.map((r, i) => (
                    <div key={i} className="grid px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center"
                      style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1.2fr' }}>
                      <div>
                        <p className="text-gray-800 text-sm font-semibold">
                          {r.simulations?.scenario_name || <span className="text-gray-400 italic text-xs">Simulation deleted</span>}
                        </p>
                      </div>
                      <div>
                        <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                          {r.simulations?.category || '—'}
                        </span>
                      </div>
                      <div>
                        {r.simulations?.difficulty ? (
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg
                            ${r.simulations.difficulty === 'Easy' ? 'bg-green-100 text-green-700'
                              : r.simulations.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'}`}>
                            {r.simulations.difficulty}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold" style={{ color: scoreColor(r.score) }}>{r.score}%</p>
                        <ScoreBadge score={r.score} />
                      </div>
                      <div>
                        <p className="text-gray-700 text-xs font-medium">{formatDate(r.completed_at)}</p>
                        <p className="text-gray-400 text-xs">{timeAgo(r.completed_at)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                    <p className="text-gray-400 text-xs">{simResults.length} simulation{simResults.length !== 1 ? 's' : ''} total</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-600 font-semibold">{simResults.filter(r => r.score >= 80).length} Pass</span>
                      <span className="text-yellow-600 font-semibold">{simResults.filter(r => r.score >= 50 && r.score < 80).length} Average</span>
                      <span className="text-red-500 font-semibold">{simResults.filter(r => r.score < 50).length} High Risk</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-gray-800 text-sm font-bold">Pending Simulations</h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  {assignedBatches.length > 0
                    ? `${assignedBatches.length} batch${assignedBatches.length > 1 ? 'es' : ''} assigned and not yet completed`
                    : 'All simulations completed'}
                </p>
              </div>

              {assignedBatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-semibold">All caught up!</p>
                  <p className="text-gray-400 text-xs">This user has completed all assigned simulations</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {assignedBatches.map((batch) => {
                    const categories = [...new Set(batch.sims.map(s => s.category).filter(Boolean))]
                    const isExpiringSoon = batch.expires_at && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 2)
                    return (
                      <div key={batch.batch_id} className="px-6 py-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="text-gray-700 text-xs font-semibold">
                                {batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}
                              </span>
                              <span className="text-gray-300">·</span>
                              {categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-gray-500 text-xs">{cat}</span>
                              ))}
                              {categories.length > 3 && (
                                <span className="text-gray-400 text-xs">+{categories.length - 3} more</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs">
                              Assigned {formatDate(batch.created_at)}
                              {batch.expires_at && (
                                <span className={`ml-2 ${isExpiringSoon ? 'text-red-400 font-semibold' : ''}`}>
                                  · Expires {formatDate(batch.expires_at)}
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="bg-orange-50 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0">
                            Pending
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRAINING TAB */}
          {activeTab === 'training' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-gray-800 text-sm font-bold">Training Progress</h2>
                  <p className="text-gray-400 text-xs mt-0.5">{completedModules} of {totalModules} modules completed</p>
                </div>
                {totalModules > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((completedModules / totalModules) * 100)}%` }} />
                    </div>
                    <p className="text-gray-600 text-xs font-bold">{Math.round((completedModules / totalModules) * 100)}%</p>
                  </div>
                )}
              </div>

              {allModules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2">
                  <p className="text-gray-400 text-sm">No modules available</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {allModules.map(module => {
                    const progress = moduleProgress.find(p => p.module_id === module.id)
                    const isCompleted = progress?.quiz_completed === true
                    const isStarted = !!progress && !isCompleted
                    const score = progress?.score
                    const completedAt = progress?.completed_at

                    return (
                      <div key={module.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                          ${isCompleted ? 'bg-green-100' : isStarted ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : isStarted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm font-semibold">{module.name}</p>
                          {module.description && (
                            <p className="text-gray-400 text-xs truncate max-w-xs">{module.description}</p>
                          )}
                          {isCompleted && completedAt && (
                            <p className="text-gray-400 text-xs mt-0.5">Completed {formatDate(completedAt)}</p>
                          )}
                          {isStarted && (
                            <p className="text-blue-400 text-xs mt-0.5">In progress</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {score != null && (
                            <p className="text-sm font-bold" style={{ color: scoreColor(score) }}>{score}%</p>
                          )}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                            ${isCompleted ? 'bg-green-100 text-green-700'
                              : isStarted ? 'bg-blue-100 text-blue-600'
                                : 'bg-gray-100 text-gray-500'}`}>
                            {isCompleted ? 'Completed' : isStarted ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ACHIEVEMENTS TAB */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {achievements.map((a, i) => {
                const meta = ACHIEVEMENT_META[a.badge_type] || { label: a.badge_type, icon: '🏅', desc: '', color: 'bg-gray-50 border-gray-100' }
                const [bg, border] = meta.color.split(' ')
                return (
                  <div key={i} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 ${border}`}>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${bg}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-bold mb-0.5">{meta.label}</p>
                      <p className="text-gray-500 text-xs mb-2">{meta.desc}</p>
                      <p className="text-gray-400 text-xs">Earned {timeAgo(a.earned_at)}</p>
                    </div>
                  </div>
                )
              })}

              {Object.entries(ACHIEVEMENT_META)
                .filter(([key]) => !achievements.find(a => a.badge_type === key))
                .map(([key, meta]) => {
                  const [bg] = meta.color.split(' ')
                  return (
                    <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 opacity-35">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 grayscale ${bg}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 text-sm font-bold mb-0.5">{meta.label}</p>
                        <p className="text-gray-400 text-xs mb-2">{meta.desc}</p>
                        <p className="text-gray-300 text-xs">Not yet earned</p>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default UserProfile