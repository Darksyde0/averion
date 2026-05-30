import { useState, useEffect } from 'react'
import Sidebar from '../components/dashboard/Sidebar'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

const ACHIEVEMENT_META = {
  first_simulation: {
    title: 'First Strike',
    description: 'Completed your first simulation exercise',
    icon: '🎯',
    color: ['#1d4ed8', '#3b82f6'],
    category: 'Simulation',
  },
  perfect_score: {
    title: 'Flawless',
    description: 'Scored 100% on a simulation',
    icon: '💯',
    color: ['#065f46', '#10b981'],
    category: 'Simulation',
  },
  redeemed: {
    title: 'Redeemed',
    description: 'Went from high risk to a passing score',
    icon: '⚡',
    color: ['#b45309', '#f59e0b'],
    category: 'Simulation',
  },
  sim_streak: {
    title: 'On a Roll',
    description: 'Completed 3 simulations',
    icon: '🔥',
    color: ['#c2410c', '#f97316'],
    category: 'Simulation',
  },
  first_module: {
    title: 'First Step',
    description: 'Completed your first training module',
    icon: '📚',
    color: ['#6d28d9', '#8b5cf6'],
    category: 'Training',
  },
  all_modules: {
    title: 'Graduate',
    description: 'Completed all available training modules',
    icon: '🎓',
    color: ['#0e7490', '#06b6d4'],
    category: 'Training',
  },
  daily_streak: {
    title: 'Dedicated',
    description: 'Completed 3 modules in a single day',
    icon: '🏃',
    color: ['#be123c', '#f43f5e'],
    category: 'Training',
  },
  first_login: {
    title: 'Welcome Aboard',
    description: 'Logged into Averion for the first time',
    icon: '🥇',
    color: ['#86198f', '#d946ef'],
    category: 'General',
  },
}

// All possible achievements (for showing locked ones)
const ALL_TYPES = Object.keys(ACHIEVEMENT_META)

function AchievementsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [earnedMap, setEarnedMap] = useState({})
  const profile = useProfile()

  const categories = ['All', 'General', 'Simulation', 'Training']

  useEffect(() => { fetchAchievements() }, [])

  async function fetchAchievements() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
  .from('achievements')
  .select('badge_type, earned_at')
  .eq('user_id', user.id)

const map = {}
;(data || []).forEach(a => { map[a.badge_type] = a.earned_at })
    setEarnedMap(map)
    setLoading(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const earned = ALL_TYPES.filter(t => earnedMap[t])
  const locked = ALL_TYPES.filter(t => !earnedMap[t])
  const completionPct = ALL_TYPES.length > 0
    ? Math.round((earned.length / ALL_TYPES.length) * 100)
    : 0

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-8">

          {/* ── Header ── */}
          <div className="mb-8">
            <h1 className="text-gray-900 text-2xl font-bold">Achievements</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track your progress and earn badges</p>
          </div>

          {/* ── Stats strip ── */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              {/* Total earned */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Earned</p>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="text-sm">🏆</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-blue-600">{earned.length}</p>
                <p className="text-gray-400 text-xs mt-1">of {ALL_TYPES.length} badges</p>
              </div>

              {/* Locked */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Locked</p>
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-sm">🔒</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-500">{locked.length}</p>
                <p className="text-gray-400 text-xs mt-1">still to unlock</p>
              </div>

              {/* Completion */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Completion</p>
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                    <span className="text-sm">📊</span>
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-green-500">{completionPct}%</p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }} />
                </div>
              </div>

              {/* Latest badge */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Latest</p>
                  <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center">
                    <span className="text-sm">⭐</span>
                  </div>
                </div>
                {latestType ? (
                  <>
                    <p className="text-2xl mb-0.5">{ACHIEVEMENT_META[latestType].icon}</p>
                    <p className="text-gray-700 text-xs font-semibold truncate">{ACHIEVEMENT_META[latestType].title}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl mb-0.5">🔒</p>
                    <p className="text-gray-400 text-xs">None yet</p>
                  </>
                )}
              </div>

            </div>
          )}

          {/* ── Progress bar ── */}
          {!loading && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-700 text-sm font-semibold">Overall Progress</p>
                <p className="text-gray-400 text-xs">{earned.length} / {ALL_TYPES.length} unlocked</p>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${completionPct}%`,
                    background: 'linear-gradient(90deg, #1d4ed8, #06b6d4)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-gray-400 text-xs">Beginner</p>
                <p className="text-gray-400 text-xs">Expert</p>
              </div>
            </div>
          )}

          {/* ── Filter tabs ── */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* ── Achievement cards ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
              ))}
            </div>
          ) : (
            <>
              {/* Earned */}
              {filteredEarned.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-gray-800 text-sm font-bold uppercase tracking-wide">Earned</h2>
                    <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {filteredEarned.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEarned.map(type => {
                      const meta = ACHIEVEMENT_META[type]
                      return (
                        <div key={type}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 items-start hover:shadow-md transition-shadow duration-200 relative overflow-hidden group">

                          {/* Subtle gradient background on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: `linear-gradient(135deg, ${meta.color[0]}08, ${meta.color[1]}05)` }} />

                          {/* Icon */}
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 shadow-sm"
                            style={{ background: `linear-gradient(135deg, ${meta.color[0]}, ${meta.color[1]})` }}>
                            <span className="text-2xl">{meta.icon}</span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-gray-800 font-bold text-sm">{meta.title}</h3>
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed mb-2">{meta.description}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: `${meta.color[0]}15`, color: meta.color[1] }}>
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

              {/* Locked */}
              {filteredLocked.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-gray-800 text-sm font-bold uppercase tracking-wide">Locked</h2>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                      {filteredLocked.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLocked.map(type => {
                      const meta = ACHIEVEMENT_META[type]
                      return (
                        <div key={type}
                          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-dashed flex gap-4 items-start opacity-60">

                          {/* Icon — greyed out */}
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100 relative">
                            <span className="text-2xl grayscale opacity-40">{meta.icon}</span>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-500 font-bold text-sm mb-1">{meta.title}</h3>
                            <p className="text-gray-400 text-xs leading-relaxed mb-2">{meta.description}</p>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                              {meta.category}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredEarned.length === 0 && filteredLocked.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <p className="text-4xl mb-4">🏆</p>
                  <p className="text-gray-500 text-sm font-semibold">No achievements in this category</p>
                  <p className="text-gray-400 text-xs mt-1">Keep training to unlock more badges</p>
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