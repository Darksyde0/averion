import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminSidebar from '../../components/admin/AdminSidebar'
import AdminTopBar from '../../components/admin/AdminTopBar'
import { supabase } from '../../supabaseClient'
import { useProfile } from '../../hooks/useProfile'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ACHIEVEMENT_META = {
  first_simulation: { label: 'First Strike', icon: null, desc: 'Completed first simulation', color: '#3b82f6', bg: '#eff6ff' },
  perfect_score: { label: 'Flawless', icon: null, desc: 'Scored 100% on a simulation', color: '#8b5cf6', bg: '#f5f3ff' },
  redeemed: { label: 'Redeemed', icon: null, desc: 'Improved from high risk to pass', color: '#10b981', bg: '#ecfdf5' },
  sim_streak: { label: 'On a Roll', icon: null, desc: 'Completed 3+ simulations', color: '#f97316', bg: '#fff7ed' },
  first_module: { label: 'First Step', icon: null, desc: 'Completed first module', color: '#0891b2', bg: '#ecfeff' },
  all_modules: { label: 'Graduate', icon: null, desc: 'Completed all modules', color: '#6366f1', bg: '#eef2ff' },
  daily_streak: { label: 'Dedicated', icon: null, desc: '3 modules in one day', color: '#ca8a04', bg: '#fefce8' },
}

// ── SVG achievement icons ──
function AchievementIcon({ type, color, size = 18 }) {
  const s = size
  if (type === 'first_simulation') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
  if (type === 'perfect_score') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
  if (type === 'redeemed') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  )
  if (type === 'sim_streak') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  )
  if (type === 'first_module') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  )
  if (type === 'all_modules') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
  if (type === 'daily_streak') return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
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
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return 'Unknown' }
}

function formatDate(dateStr) {
  try {
    if (!dateStr) return '—'
    const raw = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const date = new Date(raw)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return '—' }
}

function formatDateShort(dateStr) {
  try {
    if (!dateStr) return '—'
    const raw = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const date = new Date(raw)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '—' }
}

function scoreColor(score) {
  if (score == null || isNaN(score)) return '#9ca3af'
  if (score >= 80) return '#10b981'
  if (score >= 50) return '#f59e0b'
  return '#ef4444'
}

function ScorePill({ score }) {
  if (score == null) return null
  const color = scoreColor(score)
  const label = score >= 80 ? 'Pass' : score >= 50 ? 'Average' : 'At Risk'
  const bg = score >= 80 ? '#f0fdf4' : score >= 50 ? '#fefce8' : '#fef2f2'
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
      style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  )
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  try {
    return (
      <div style={{
        background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px', padding: '10px 14px',
        boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>{payload[0].value}%</p>
      </div>
    )
  } catch { return null }
}

function EmptyState({ icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2">
      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-1">
        {icon}
      </div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      {sub && <p className="text-gray-300 text-xs">{sub}</p>}
    </div>
  )
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

  // ── Auth + role guard ──
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser()
        if (error || !authUser) { navigate('/login'); return }
        const { data: profile, error: profileError } = await supabase
          .from('users').select('role').eq('id', authUser.id).single()
        if (profileError || !profile || profile.role !== 'admin') navigate('/login')
      } catch { navigate('/login') }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (id && adminProfile?.id) fetchAll()
  }, [id, adminProfile])

  // ── Realtime updates ──
  useEffect(() => {
    if (!id) return
    const channel = supabase.channel(`user-profile-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'simulation_results', filter: `user_id=eq.${id}` }, () => fetchAll())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'module_progress', filter: `user_id=eq.${id}` }, () => fetchAll())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'achievements', filter: `user_id=eq.${id}` }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [id])

  const fetchAll = useCallback(async () => {
    if (!adminProfile?.id || !id) return
    setLoading(true)
    setFetchError('')
    try {
      const [userRes, simRes, progressRes, achieveRes, modulesRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('simulation_results')
          .select('id, score, completed_at, batch_id, simulation_id, total, simulations(scenario_name, category, difficulty)')
          .eq('user_id', id).order('completed_at', { ascending: false }),
        supabase.from('module_progress').select('*, modules(name, description)').eq('user_id', id),
        supabase.from('achievements').select('*').eq('user_id', id).order('earned_at', { ascending: false }),
        supabase.from('modules').select('id, name, description').eq('hidden', false),
      ])

      if (userRes.error) {
        setFetchError('Could not load user profile.')
        setLoading(false)
        return
      }

      // Verify this user belongs to admin's org
      if (userRes.data?.organization_id !== adminProfile.id) {
        setFetchError('You do not have access to this user profile.')
        setLoading(false)
        return
      }

      if (simRes.error) console.error('Sim results error:', simRes.error)
      if (progressRes.error) console.error('Progress error:', progressRes.error)
      if (achieveRes.error) console.error('Achievements error:', achieveRes.error)
      if (modulesRes.error) console.error('Modules error:', modulesRes.error)

      const now = new Date().toISOString()
      const { data: allOrgSims, error: orgSimsError } = await supabase
        .from('simulations').select('id, scenario_name, category, difficulty, batch_id, expires_at, created_at')
        .eq('organization_id', adminProfile.id).eq('hidden', false)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
      if (orgSimsError) console.error('Org sims error:', orgSimsError)

      const batchMap = {}
      ;(allOrgSims || []).forEach(s => {
        const bid = s.batch_id || s.id
        if (!batchMap[bid]) batchMap[bid] = { batch_id: bid, created_at: s.created_at, expires_at: s.expires_at, sims: [] }
        batchMap[bid].sims.push(s)
      })

      const completedBatchIds = new Set((simRes.data || []).map(r => r.batch_id).filter(Boolean))
      const pending = Object.values(batchMap).filter(b => !completedBatchIds.has(b.batch_id))

      setUser(userRes.data)
      setSimResults(simRes.data || [])
      setModuleProgress(progressRes.data || [])
      setAchievements(achieveRes.data || [])
      setAllModules(modulesRes.data || [])
      setAssignedBatches(pending)
    } catch (err) {
      console.error('fetchAll error:', err)
      setFetchError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [id, adminProfile])

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ──
  if (fetchError || !user) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
        <AdminSidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
          <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center max-w-sm w-full">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <p className="text-gray-700 text-sm font-semibold mb-1">{fetchError || 'User not found'}</p>
              <p className="text-gray-400 text-xs mb-5">This profile could not be loaded.</p>
              <button onClick={() => navigate('/admin/users')}
                className="text-xs font-medium text-blue-500 hover:text-blue-700 transition">
                Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Derived stats ──
  const validScores = simResults.filter(r => typeof r.score === 'number' && !isNaN(r.score))
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, r) => sum + r.score, 0) / validScores.length)
    : null

  const completedModules = moduleProgress.filter(p => p.quiz_completed === true).length
  const totalModules = allModules.length

  const riskLabel = avgScore === null ? 'No Data'
    : avgScore >= 80 ? 'Low Risk'
    : avgScore >= 50 ? 'Medium Risk'
    : 'High Risk'

  const riskStyle = avgScore === null
    ? { color: '#6b7280', bg: '#f9fafb' }
    : avgScore >= 80
    ? { color: '#10b981', bg: '#f0fdf4' }
    : avgScore >= 50
    ? { color: '#f59e0b', bg: '#fefce8' }
    : { color: '#ef4444', bg: '#fef2f2' }

  const chartData = [...simResults].reverse()
    .filter(r => r.completed_at && typeof r.score === 'number')
    .map(r => ({
      label: formatDateShort(r.completed_at),
      score: r.score,
    }))

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'simulations', label: 'Simulations', count: simResults.length },
    { id: 'pending', label: 'Pending', count: assignedBatches.length },
    { id: 'training', label: 'Training', count: `${completedModules}/${totalModules}` },
    { id: 'achievements', label: 'Achievements', count: achievements.length },
  ]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <AdminSidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-48' : 'ml-16'}`}>
        <AdminTopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 overflow-y-auto p-6">

          {/* Back */}
          <button onClick={() => navigate('/admin/users')}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-xs font-medium transition mb-5 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Users
          </button>

          {/* Profile header */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
            <div className="flex items-start justify-between gap-6 flex-wrap">

              {/* Left: avatar + info */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name}
                      className="w-14 h-14 rounded-xl object-cover"
                      onError={e => { e.target.style.display = 'none' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold"
                      style={{ background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
                      {initials}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
                </div>

                <div>
                  <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                    <h1 className="text-gray-900 text-lg font-bold">{user.full_name}</h1>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                      style={{ color: riskStyle.color, backgroundColor: riskStyle.bg }}>
                      {riskLabel}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="relative w-1.5 h-1.5">
                        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                        <span className="relative block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <span className="text-emerald-500 text-xs font-medium">Live</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">
                    {user.job_title || 'No title'} {user.department ? `· ${user.department}` : ''}
                  </p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      {user.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Joined {formatDate(user.created_at)}
                    </span>
                    {user.employee_id && (
                      <span className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                        </svg>
                        {user.employee_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: stat pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: scoreColor(avgScore) },
                  { label: 'Simulations', value: simResults.length, color: '#111827' },
                  { label: 'Pending', value: assignedBatches.length, color: assignedBatches.length > 0 ? '#f59e0b' : '#111827' },
                  { label: 'Modules', value: `${completedModules}/${totalModules}`, color: '#111827' },
                  { label: 'Achievements', value: achievements.length, color: '#111827' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col items-center px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 min-w-[70px]">
                    <p className="text-lg font-bold leading-tight" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-0.5 whitespace-nowrap">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 mb-5">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold
                    ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Score trend */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                  <p className="text-gray-800 text-sm font-semibold">Score Trend</p>
                  <p className="text-gray-400 text-xs mt-0.5">Performance across all completed simulations</p>
                </div>
                <div className="px-2 py-4">
                  {chartData.length === 0 ? (
                    <EmptyState
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>}
                      title="No simulation data yet"
                      sub="Scores will appear here once simulations are completed"
                    />
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={6} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(59,130,246,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2}
                          fill="url(#scoreGrad)"
                          dot={{ r: 3.5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                          activeDot={{ r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2.5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Recent activity */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="px-5 pt-4 pb-3 border-b border-gray-50">
                  <p className="text-gray-800 text-sm font-semibold">Recent Activity</p>
                  <p className="text-gray-400 text-xs mt-0.5">Latest completions</p>
                </div>
                <div className="px-4 py-3">
                  {simResults.length === 0 && moduleProgress.filter(p => p.quiz_completed).length === 0 ? (
                    <EmptyState
                      icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      title="No activity yet"
                    />
                  ) : (
                    <div className="flex flex-col gap-1">
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
                        .filter(item => item.time)
                        .sort((a, b) => new Date(b.time) - new Date(a.time))
                        .slice(0, 6)
                        .map((item, i) => (
                          <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'sim' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                              {item.type === 'sim' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-700 text-xs font-medium truncate">{item.label}</p>
                              <p className="text-gray-400 text-xs">{timeAgo(item.time)}</p>
                            </div>
                            {typeof item.score === 'number' && !isNaN(item.score) && (
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
            </div>
          )}

          {/* SIMULATIONS TAB */}
          {activeTab === 'simulations' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Simulation History</p>
                  <p className="text-gray-400 text-xs mt-0.5">Full record including deleted simulations</p>
                </div>
                {avgScore !== null && (
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Average</p>
                    <p className="text-sm font-bold" style={{ color: scoreColor(avgScore) }}>{avgScore}%</p>
                  </div>
                )}
              </div>

              {simResults.length === 0 ? (
                <EmptyState
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  title="No simulations completed yet"
                />
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid px-5 py-2.5 bg-gray-50 border-b border-gray-100"
                    style={{ gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 1fr' }}>
                    {['Scenario', 'Category', 'Difficulty', 'Score', 'Completed'].map(h => (
                      <p key={h} className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{h}</p>
                    ))}
                  </div>

                  {simResults.map((r, i) => (
                    <div key={i} className="grid px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition items-center"
                      style={{ gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 1fr' }}>
                      <p className="text-gray-700 text-xs font-medium pr-4">
                        {r.simulations?.scenario_name || <span className="text-gray-300 italic">Simulation deleted</span>}
                      </p>
                      <div>
                        {r.simulations?.category ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-600">
                            {r.simulations.category}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                      <div>
                        {r.simulations?.difficulty ? (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: r.simulations.difficulty === 'Easy' ? '#f0fdf4' : r.simulations.difficulty === 'Medium' ? '#fefce8' : '#fef2f2',
                              color: r.simulations.difficulty === 'Easy' ? '#16a34a' : r.simulations.difficulty === 'Medium' ? '#ca8a04' : '#dc2626',
                            }}>
                            {r.simulations.difficulty}
                          </span>
                        ) : <span className="text-gray-300 text-xs">—</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold" style={{ color: scoreColor(r.score) }}>{r.score}%</p>
                        <ScorePill score={r.score} />
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs font-medium">{formatDate(r.completed_at)}</p>
                        <p className="text-gray-400 text-xs">{timeAgo(r.completed_at)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-gray-400 text-xs">{simResults.length} simulation{simResults.length !== 1 ? 's' : ''} total</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="font-semibold" style={{ color: '#10b981' }}>{validScores.filter(r => r.score >= 80).length} Pass</span>
                      <span className="font-semibold" style={{ color: '#f59e0b' }}>{validScores.filter(r => r.score >= 50 && r.score < 80).length} Average</span>
                      <span className="font-semibold" style={{ color: '#ef4444' }}>{validScores.filter(r => r.score < 50).length} At Risk</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PENDING TAB */}
          {activeTab === 'pending' && (
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-gray-800 text-sm font-semibold">Pending Simulations</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {assignedBatches.length > 0
                    ? `${assignedBatches.length} batch${assignedBatches.length > 1 ? 'es' : ''} not yet completed`
                    : 'All simulations completed'}
                </p>
              </div>

              {assignedBatches.length === 0 ? (
                <EmptyState
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  title="All caught up"
                  sub="This user has completed all assigned simulations"
                />
              ) : (
                <div className="divide-y divide-gray-50">
                  {assignedBatches.map((batch) => {
                    const categories = [...new Set(batch.sims.map(s => s.category).filter(Boolean))]
                    const isExpiringSoon = batch.expires_at && new Date(batch.expires_at) < new Date(Date.now() + 86400000 * 2)
                    return (
                      <div key={batch.batch_id} className="px-5 py-4 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1.5">
                              <p className="text-gray-700 text-xs font-semibold">
                                {batch.sims.length} question{batch.sims.length > 1 ? 's' : ''}
                              </p>
                              {categories.slice(0, 3).map(cat => (
                                <span key={cat} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">{cat}</span>
                              ))}
                              {categories.length > 3 && (
                                <span className="text-gray-400 text-xs">+{categories.length - 3} more</span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs">
                              Assigned {formatDate(batch.created_at)}
                              {batch.expires_at && (
                                <span className={`ml-2 font-medium ${isExpiringSoon ? 'text-red-400' : 'text-gray-400'}`}>
                                  · Expires {formatDate(batch.expires_at)}
                                </span>
                              )}
                            </p>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 flex-shrink-0">
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
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-gray-800 text-sm font-semibold">Training Progress</p>
                  <p className="text-gray-400 text-xs mt-0.5">{completedModules} of {totalModules} modules completed</p>
                </div>
                {totalModules > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((completedModules / totalModules) * 100)}%`, backgroundColor: '#3b82f6' }} />
                    </div>
                    <p className="text-gray-600 text-xs font-bold">
                      {Math.round((completedModules / totalModules) * 100)}%
                    </p>
                  </div>
                )}
              </div>

              {allModules.length === 0 ? (
                <EmptyState
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
                  title="No modules available"
                />
              ) : (
                <div className="divide-y divide-gray-50">
                  {allModules.map(module => {
                    const progress = moduleProgress.find(p => p.module_id === module.id)
                    const isCompleted = progress?.quiz_completed === true
                    const isStarted = !!progress && !isCompleted
                    const score = progress?.score
                    const completedAt = progress?.completed_at

                    return (
                      <div key={module.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0`}
                          style={{
                            backgroundColor: isCompleted ? '#f0fdf4' : isStarted ? '#eff6ff' : '#f9fafb',
                          }}>
                          {isCompleted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : isStarted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 text-sm font-medium">{module.name}</p>
                          {module.description && (
                            <p className="text-gray-400 text-xs truncate max-w-sm">{module.description}</p>
                          )}
                          {isCompleted && completedAt && (
                            <p className="text-gray-400 text-xs mt-0.5">Completed {formatDate(completedAt)}</p>
                          )}
                          {isStarted && <p className="text-blue-400 text-xs mt-0.5">In progress</p>}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {typeof score === 'number' && !isNaN(score) && (
                            <p className="text-sm font-bold" style={{ color: scoreColor(score) }}>{score}%</p>
                          )}
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: isCompleted ? '#f0fdf4' : isStarted ? '#eff6ff' : '#f9fafb',
                              color: isCompleted ? '#16a34a' : isStarted ? '#3b82f6' : '#9ca3af',
                            }}>
                            {isCompleted ? 'Done' : isStarted ? 'In Progress' : 'Not Started'}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {/* Earned */}
              {achievements.map((a, i) => {
                const meta = ACHIEVEMENT_META[a.badge_type] || {
                  label: a.badge_type, desc: '', color: '#6b7280', bg: '#f9fafb'
                }
                return (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: meta.bg }}>
                      <AchievementIcon type={a.badge_type} color={meta.color} size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 text-sm font-semibold mb-0.5">{meta.label}</p>
                      <p className="text-gray-400 text-xs mb-1.5">{meta.desc}</p>
                      <p className="text-gray-300 text-xs">Earned {timeAgo(a.earned_at)}</p>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ backgroundColor: meta.color }} />
                  </div>
                )
              })}

              {/* Locked */}
              {Object.entries(ACHIEVEMENT_META)
                .filter(([key]) => !achievements.find(a => a.badge_type === key))
                .map(([key, meta]) => (
                  <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 flex items-start gap-4 opacity-40">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <AchievementIcon type={key} color="#9ca3af" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-600 text-sm font-semibold mb-0.5">{meta.label}</p>
                      <p className="text-gray-400 text-xs mb-1.5">{meta.desc}</p>
                      <p className="text-gray-300 text-xs">Not yet earned</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-200 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default UserProfile