import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import { useProfile } from '../hooks/useProfile'
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
    </svg>
  ),
}

const defaultIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
)

const colorPalette = [
  ['#1d4ed8', '#3b82f6'],
  ['#6d28d9', '#8b5cf6'],
  ['#be123c', '#f43f5e'],
  ['#065f46', '#10b981'],
  ['#c2410c', '#f97316'],
  ['#0e7490', '#06b6d4'],
  ['#86198f', '#d946ef'],
  ['#0f766e', '#14b8a6'],
  ['#b91c1c', '#ef4444'],
  ['#4338ca', '#6366f1'],
  ['#b45309', '#f59e0b'],
  ['#be185d', '#ec4899'],
]

function getModuleColor(id) {
  const sum = String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colorPalette[sum % colorPalette.length]
}

function TrainingPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const profile = useProfile()

  const [totalModules, setTotalModules] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => { fetchModules() }, [])

  async function fetchModules() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTotalModules(data.length)

      let completedIds = []
      let inProgressIds = []

      if (user) {
        // ── Fix: select quiz_completed not completed ──
        const { data: progress } = await supabase
          .from('module_progress')
          .select('module_id, quiz_completed')
          .eq('user_id', user.id)

        completedIds = (progress || []).filter(p => p.quiz_completed === true).map(p => p.module_id)
        inProgressIds = (progress || []).filter(p => p.quiz_completed === false).map(p => p.module_id)

        setCompletedCount(completedIds.length)
        setInProgressCount(inProgressIds.length)
        setTotalPoints(completedIds.length * 100)
      }

      const mapped = data.map(m => ({
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
        color: getModuleColor(m.id),
        icon: categoryIcons[m.category] || defaultIcon,
      }))

      setModules(mapped)
    }

    setLoading(false)
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
            <div className="flex gap-3">
              <button onClick={() => setFilter('all')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                All
              </button>
              <button onClick={() => setFilter('in-progress')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'in-progress' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                In Progress
              </button>
              <button onClick={() => setFilter('completed')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                Completed
              </button>
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
              <p className="text-gray-400 text-sm">No modules found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((mod) => (
                <div key={mod.id}
                  style={{ background: `linear-gradient(135deg, ${mod.color[0]}, ${mod.color[1]})` }}
                  className="rounded-2xl p-6 flex flex-col justify-between min-h-[240px] shadow-lg">

                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white bg-opacity-20 p-2 rounded-xl">
                      {mod.icon}
                    </div>
                    {mod.status === 'new' && (
                      <span className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded-lg">NEW</span>
                    )}
                    {mod.status === 'in-progress' && (
                      <span className="bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-lg">IN PROGRESS</span>
                    )}
                    {mod.status === 'completed' && (
                      <span className="bg-green-400 text-white text-xs font-bold px-2 py-1 rounded-lg">COMPLETED</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-white text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{mod.category}</p>
                    <h2 className="text-white text-lg font-bold mb-2 leading-snug">{mod.title}</h2>
                    <p className="text-white text-xs leading-relaxed opacity-80 line-clamp-2">{mod.description}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-white text-xs opacity-70">⏱ {mod.estimatedTime} mins</span>
                    {mod.status === 'completed' ? (
                      <button className="bg-white font-semibold text-sm px-4 py-1.5 rounded-xl cursor-default opacity-80"
                        style={{ color: mod.color[0] }} disabled>
                        Completed ✓
                      </button>
                    ) : mod.status === 'in-progress' ? (
                      <button onClick={() => navigate(`/training/${mod.id}`)}
                        className="bg-white font-semibold text-sm px-4 py-1.5 rounded-xl hover:bg-gray-100 transition"
                        style={{ color: mod.color[0] }}>
                        Continue →
                      </button>
                    ) : (
                      <button onClick={() => navigate(`/training/${mod.id}`)}
                        className="bg-white font-semibold text-sm px-4 py-1.5 rounded-xl hover:bg-gray-100 transition"
                        style={{ color: mod.color[0] }}>
                        Start →
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