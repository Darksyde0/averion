import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

const categoryIcons = {
  'Social Engineering': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  'Phishing Detection': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  'Password Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  ),
  'Data Privacy': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  'Network Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.997 0 0121 12c0 .778-.099 1.533-.284 2.253" />
    </svg>
  ),
  'Ransomware': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  'USB & Physical Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  ),
  'Insider Threat': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  'Email Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  'Mobile Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
  'Cloud Security': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
  ),
  'Zero-Day Awareness': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  'Office Safety': (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
}

const defaultIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
)

const colorPalette = [
  ['#0e7490', '#0891b2'],
  ['#1d4ed8', '#2563eb'],
  ['#6d28d9', '#7c3aed'],
  ['#9f1239', '#be123c'],
  ['#c2410c', '#ea580c'],
  ['#065f46', '#047857'],
  ['#86198f', '#a21caf'],
  ['#0f766e', '#0d9488'],
  ['#1e40af', '#1d4ed8'],
  ['#4338ca', '#4f46e5'],
  ['#92400e', '#b45309'],
  ['#9d174d', '#be185d'],
]

function getModuleColor(id, index) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const combined = Math.abs(hash) + (index * 137)
  return colorPalette[combined % colorPalette.length]
}

function TrainingPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  const [totalModules, setTotalModules] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => { fetchModules() }, [])

  async function fetchModules() {
    setLoading(true)
    setFetchError('')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        navigate('/login')
        return
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile?.organization_id) {
        console.error('Profile error:', profileError)
        setFetchError('Could not load your profile. Please try again.')
        setLoading(false)
        return
      }

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('id, name, description, category, estimated_time')
        .eq('hidden', false)
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (modulesError) {
        console.error('Modules error:', modulesError)
        setFetchError('Could not load training modules. Please try again.')
        setLoading(false)
        return
      }

      if (!modulesData || modulesData.length === 0) {
        setModules([])
        setTotalModules(0)
        setLoading(false)
        return
      }

      const moduleIds = modulesData.map(m => m.id)
      setTotalModules(modulesData.length)

      const { data: progress, error: progressError } = await supabase
        .from('module_progress')
        .select('module_id, quiz_completed')
        .eq('user_id', user.id)
        .in('module_id', moduleIds)

      if (progressError) {
        console.error('Progress error:', progressError)
      }

      const progressList = progress || []

      const progressMap = {}
      progressList.forEach(p => {
        if (!progressMap[p.module_id] || p.quiz_completed === true) {
          progressMap[p.module_id] = p.quiz_completed
        }
      })

      const completedIds = Object.entries(progressMap)
        .filter(([, done]) => done === true)
        .map(([id]) => id)

      const inProgressIds = Object.entries(progressMap)
        .filter(([, done]) => done === false)
        .map(([id]) => id)

      setCompletedCount(completedIds.length)
      setInProgressCount(inProgressIds.length)
      setTotalPoints(completedIds.length * 100)

      const mapped = modulesData.map((m, index) => ({
        id: m.id,
        title: m.name,
        description: m.description,
        category: m.category,
        estimatedTime: m.estimated_time,
        status: completedIds.includes(m.id)
          ? 'completed'
          : inProgressIds.includes(m.id)
            ? 'in-progress'
            : 'new',
        color: getModuleColor(m.id, index),
        icon: categoryIcons[m.category] || defaultIcon,
      }))

      setModules(mapped)

    } catch (err) {
      console.error('Unexpected error in fetchModules:', err)
      setFetchError('Something went wrong. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const completionPercent = totalModules > 0
    ? Math.round((completedCount / totalModules) * 100)
    : 0

  const filteredModules = filter === 'all'
    ? modules
    : modules.filter(m => m.status === filter)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-3xl font-bold mb-1">Training Modules</h1>
          <p className="text-gray-500 text-sm mb-6">Expand your cybersecurity knowledge</p>

          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-red-600 text-sm">{fetchError}</p>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Total Modules</p>
              <p className="text-blue-600 text-xl font-bold">{completionPercent}% Complete</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Completed</p>
              <p className="text-gray-800 text-2xl font-bold">{completedCount}</p>
              <p className="text-gray-400 text-xs mt-1">of {totalModules} modules</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">In Progress</p>
              <p className="text-gray-800 text-2xl font-bold">{inProgressCount}</p>
              <p className="text-gray-400 text-xs mt-1">modules started</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-500 text-xs mb-1">Total Points</p>
              <p className="text-gray-800 text-2xl font-bold">{totalPoints}</p>
              <p className="text-gray-400 text-xs mt-1">100 pts per module</p>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
            <p className="text-gray-700 text-sm font-semibold mb-3">Filter by Status</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { key: 'all', label: 'All', active: 'bg-blue-600 text-white' },
                { key: 'new', label: 'Not Started', active: 'bg-gray-700 text-white' },
                { key: 'in-progress', label: 'In Progress', active: 'bg-orange-500 text-white' },
                { key: 'completed', label: 'Completed', active: 'bg-green-600 text-white' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition
                    ${filter === f.key ? f.active : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modules grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading modules...</p>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">
                {filter === 'all'
                  ? 'No modules available yet.'
                  : filter === 'new'
                    ? 'No unstarted modules.'
                    : `No ${filter.replace('-', ' ')} modules.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-2xl p-6 flex flex-col justify-between min-h-[240px] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ background: `linear-gradient(160deg, ${mod.color[0]} 0%, ${mod.color[1]} 100%)` }}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 rounded-xl bg-white bg-opacity-20">
                      {mod.icon}
                    </div>
                    {mod.status === 'new' && (
                      <span className="bg-white bg-opacity-25 text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-white border-opacity-30">
                        NEW
                      </span>
                    )}
                    {mod.status === 'in-progress' && (
                      <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        IN PROGRESS
                      </span>
                    )}
                    {mod.status === 'completed' && (
                      <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        COMPLETED
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">
                      {mod.category}
                    </p>
                    <h2 className="text-white text-lg font-bold mb-2 leading-snug">{mod.title}</h2>
                    <p className="text-white text-xs leading-relaxed opacity-80 line-clamp-2">
                      {mod.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-white text-xs opacity-70">⏱ {mod.estimatedTime} mins</span>
                    {mod.status === 'completed' ? (
                      <button
                        disabled
                        className="text-xs font-bold px-4 py-2 rounded-xl cursor-default"
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.35)',
                          color: '#fff',
                        }}>
                        Completed ✓
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/training/${mod.id}`)}
                        className="text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.35)',
                          color: '#fff',
                        }}>
                        {mod.status === 'in-progress' ? 'Continue →' : 'Start →'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default TrainingPage