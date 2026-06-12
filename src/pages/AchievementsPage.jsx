import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

const ACHIEVEMENT_META = {
  first_simulation: {
    title: 'First Strike',
    description: 'Completed your first simulation exercise',
    color: '#2563eb',
    category: 'Simulation',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
      </svg>
    ),
  },
  perfect_score: {
    title: 'Flawless',
    description: 'Scored 100% on a simulation',
    color: '#059669',
    category: 'Simulation',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  redeemed: {
    title: 'Redeemed',
    description: 'Went from high risk to a passing score',
    color: '#d97706',
    category: 'Simulation',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  sim_streak: {
    title: 'On a Roll',
    description: 'Completed 3 simulations',
    color: '#ea580c',
    category: 'Simulation',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  first_module: {
    title: 'First Step',
    description: 'Completed your first training module',
    color: '#7c3aed',
    category: 'Training',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  all_modules: {
    title: 'Graduate',
    description: 'Completed all available training modules',
    color: '#0891b2',
    category: 'Training',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  daily_streak: {
    title: 'Dedicated',
    description: 'Completed 3 modules in a single day',
    color: '#be185d',
    category: 'Training',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  first_login: {
    title: 'Welcome Aboard',
    description: 'Logged into Averion for the first time',
    color: '#9333ea',
    category: 'General',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
      </svg>
    ),
  },
}

const ALL_TYPES = Object.keys(ACHIEVEMENT_META)

function AchievementsPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [earnedMap, setEarnedMap] = useState({})

  const categories = ['All', 'General', 'Simulation', 'Training']

  useEffect(() => { fetchAchievements() }, [])

  async function fetchAchievements() {
    setLoading(true)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { navigate('/login'); return }
      const { data, error } = await supabase.from('achievements')
        .select('badge_type, earned_at').eq('user_id', user.id)
      if (error) { console.error('Achievements fetch error:', error); setLoading(false); return }
      const map = {}
      ;(data || []).forEach(a => { map[a.badge_type] = a.earned_at })
      setEarnedMap(map)
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const earned = ALL_TYPES.filter(t => earnedMap[t])
  const locked = ALL_TYPES.filter(t => !earnedMap[t])
  const completionPct = ALL_TYPES.length > 0 ? Math.round((earned.length / ALL_TYPES.length) * 100) : 0
  const latestType = earned.length > 0
    ? earned.reduce((a, b) => new Date(earnedMap[a]) > new Date(earnedMap[b]) ? a : b)
    : null

  function getFiltered(list) {
    if (filter === 'All') return list
    return list.filter(t => ACHIEVEMENT_META[t].category === filter)
  }

  const filteredEarned = getFiltered(earned)
  const filteredLocked = getFiltered(locked)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">Achievements</h1>
            <p className="text-gray-400 text-xs mt-0.5">Track your progress and earn badges</p>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              {[1,2,3,4].map(i => <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1">Earned</p>
                <p className="text-gray-900 text-2xl font-bold">{earned.length}</p>
                <p className="text-gray-300 text-xs mt-0.5">of {ALL_TYPES.length} badges</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1">Locked</p>
                <p className="text-gray-900 text-2xl font-bold">{locked.length}</p>
                <p className="text-gray-300 text-xs mt-0.5">still to unlock</p>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1.5">Completion</p>
                <p className="text-gray-900 text-2xl font-bold mb-1.5">{completionPct}<span className="text-gray-400 text-sm font-medium ml-0.5">%</span></p>
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }} />
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-xs mb-1">Latest Badge</p>
                {latestType ? (
                  <>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                      style={{ backgroundColor: `${ACHIEVEMENT_META[latestType].color}15`, color: ACHIEVEMENT_META[latestType].color }}>
                      {ACHIEVEMENT_META[latestType].icon}
                    </div>
                    <p className="text-gray-600 text-xs font-medium truncate">{ACHIEVEMENT_META[latestType].title}</p>
                  </>
                ) : (
                  <>
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-xs">None yet</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Overall progress */}
          {!loading && (
            <div className="bg-white border border-gray-100 rounded-xl px-5 py-4 mb-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-700 text-xs font-semibold">Overall Progress</p>
                <p className="text-gray-400 text-xs">{earned.length} / {ALL_TYPES.length} unlocked</p>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, #2563eb, #0891b2)' }} />
              </div>
              <div className="flex justify-between mt-1.5">
                <p className="text-gray-300 text-xs">Beginner</p>
                <p className="text-gray-300 text-xs">Expert</p>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${filter === cat ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-28" />)}
            </div>
          ) : (
            <>
              {filteredEarned.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">Earned</p>
                    <span className="bg-emerald-50 text-emerald-600 text-xs font-medium px-2 py-0.5 rounded-md">{filteredEarned.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredEarned.map(type => {
                      const meta = ACHIEVEMENT_META[type]
                      return (
                        <div key={type}
                          className="bg-white border rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition group relative overflow-hidden"
                          style={{ borderColor: `${meta.color}25` }}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `linear-gradient(135deg, ${meta.color}06, transparent)` }} />

                          {/* Badge icon */}
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
                            style={{ backgroundColor: `${meta.color}12`, color: meta.color }}>
                            {meta.icon}
                          </div>

                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <p className="text-gray-800 text-sm font-semibold">{meta.title}</p>
                              <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed mb-2">{meta.description}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md"
                                style={{ backgroundColor: `${meta.color}12`, color: meta.color }}>
                                {meta.category}
                              </span>
                              <span className="text-gray-300 text-xs">·</span>
                              <span className="text-gray-400 text-xs">{formatDate(earnedMap[type])}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredLocked.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Locked</p>
                    <span className="bg-gray-100 text-gray-400 text-xs font-medium px-2 py-0.5 rounded-md">{filteredLocked.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredLocked.map(type => {
                      const meta = ACHIEVEMENT_META[type]
                      return (
                        <div key={type}
                          className="bg-white border border-dashed border-gray-200 rounded-xl p-4 flex items-start gap-3 opacity-50">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 relative">
                            <div className="text-gray-300">{meta.icon}</div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-500 text-sm font-semibold mb-0.5">{meta.title}</p>
                            <p className="text-gray-400 text-xs leading-relaxed mb-2">{meta.description}</p>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-400">
                              {meta.category}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredEarned.length === 0 && filteredLocked.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-xl py-14 text-center">
                  <p className="text-gray-400 text-sm font-medium">No achievements in this category</p>
                  <p className="text-gray-300 text-xs mt-1">Keep training to unlock more badges</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AchievementsPage