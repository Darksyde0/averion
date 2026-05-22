import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { useProfile } from '../hooks/useProfile'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

function AchievementsPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [allAchievements, setAllAchievements] = useState([])
  const profile = useProfile()

  const categories = ['All', 'General', 'Simulation', 'Training']

  useEffect(() => {
    fetchAchievements()
  }, [])

  async function fetchAchievements() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Fetch simulation results
    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true })

    // Fetch completed modules
    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('module_id, completed, completed_at')
      .eq('user_id', user.id)
      .eq('completed', true)

    // Fetch total visible modules count
    const { data: allModules } = await supabase
      .from('modules')
      .select('id')
      .eq('hidden', false)

    const simCount = simResults?.length || 0
    const bestScore = simResults?.length
      ? Math.max(...simResults.map(r => r.score))
      : 0
    const completedModules = moduleProgress?.length || 0
    const totalModules = allModules?.length || 0

    // Format date helper
    function formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    }

    // ── DEFINE ALL ACHIEVEMENTS WITH REAL DATA ──
    const achievements = [

      // ── GENERAL ──
      {
        id: 1,
        title: 'First Steps',
        description: 'Logged in to Averion for the first time',
        icon: '🥇',
        color: 'from-yellow-400 to-yellow-600',
        category: 'General',
        earned: true, // always true if they're on this page
        date: profile?.created_at ? formatDate(profile.created_at) : 'Recently',
      },
      {
        id: 8,
        title: 'All Rounder',
        description: 'Complete both a simulation and at least one training module',
        icon: '🌟',
        color: 'from-pink-400 to-purple-500',
        category: 'General',
        earned: simCount >= 1 && completedModules >= 1,
        date: simCount >= 1 && completedModules >= 1 ? 'Completed' : null,
        progress: Math.min(100, Math.round(((simCount >= 1 ? 1 : 0) + (completedModules >= 1 ? 1 : 0)) / 2 * 100)),
        progressLabel: `${simCount >= 1 ? '✓' : '✗'} Simulation, ${completedModules >= 1 ? '✓' : '✗'} Module`,
      },

      // ── SIMULATION ──
      {
        id: 2,
        title: 'Simulation Starter',
        description: 'Completed your first simulation exercise',
        icon: '🎯',
        color: 'from-blue-400 to-blue-600',
        category: 'Simulation',
        earned: simCount >= 1,
        date: simCount >= 1 ? formatDate(simResults[0].completed_at) : null,
        progress: simCount >= 1 ? 100 : 0,
        progressLabel: simCount >= 1 ? 'Completed' : 'Not started',
      },
      {
        id: 4,
        title: 'Perfect Score',
        description: 'Score 100% on any simulation',
        icon: '💯',
        color: 'from-green-400 to-green-600',
        category: 'Simulation',
        earned: bestScore === 100,
        date: bestScore === 100 ? 'Achieved' : null,
        progress: bestScore,
        progressLabel: `Best score: ${bestScore}%`,
      },
      {
        id: 5,
        title: 'On Fire',
        description: 'Complete 5 simulations in total',
        icon: '🔥',
        color: 'from-orange-400 to-red-500',
        category: 'Simulation',
        earned: simCount >= 5,
        date: simCount >= 5 ? 'Achieved' : null,
        progress: Math.min(100, Math.round((simCount / 5) * 100)),
        progressLabel: `${simCount} of 5 completed`,
      },
      {
        id: 7,
        title: 'High Scorer',
        description: 'Score 80% or above on a simulation',
        icon: '⚡',
        color: 'from-yellow-300 to-orange-400',
        category: 'Simulation',
        earned: bestScore >= 80,
        date: bestScore >= 80 ? 'Achieved' : null,
        progress: bestScore,
        progressLabel: `Best score: ${bestScore}%`,
      },

      // ── TRAINING ──
      {
        id: 3,
        title: 'Knowledge Seeker',
        description: 'Completed your first training module',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        category: 'Training',
        earned: completedModules >= 1,
        date: completedModules >= 1
          ? formatDate(moduleProgress[0].completed_at)
          : null,
        progress: completedModules >= 1 ? 100 : 0,
        progressLabel: completedModules >= 1 ? 'Completed' : 'Not started',
      },
      {
        id: 6,
        title: 'Cyber Guardian',
        description: 'Complete all available training modules',
        icon: '🛡️',
        color: 'from-teal-400 to-teal-600',
        category: 'Training',
        earned: totalModules > 0 && completedModules >= totalModules,
        date: totalModules > 0 && completedModules >= totalModules ? 'Achieved' : null,
        progress: totalModules > 0
          ? Math.round((completedModules / totalModules) * 100)
          : 0,
        progressLabel: `${completedModules} of ${totalModules} modules done`,
      },
    ]

    setAllAchievements(achievements)
    setLoading(false)
  }

  const earned = allAchievements.filter(a => a.earned)
  const locked = allAchievements.filter(a => !a.earned)
  const latestBadge = earned[earned.length - 1]

  const filteredEarned = filter === 'All' ? earned : earned.filter(a => a.category === filter)
  const filteredLocked = filter === 'All' ? locked : locked.filter(a => a.category === filter)

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 p-8">

          <div className="mb-6">
            <h1 className="text-gray-800 text-3xl font-bold">Achievements</h1>
            <p className="text-gray-500 text-sm mt-1">Track your progress and earn badges</p>
          </div>

          {/* Stats cards */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[1,2,3,4].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs font-semibold mb-1">Total Earned</p>
                <p className="text-3xl font-extrabold text-blue-600">{earned.length}</p>
                <p className="text-gray-400 text-xs mt-1">of {allAchievements.length} badges</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs font-semibold mb-1">Locked</p>
                <p className="text-3xl font-extrabold text-gray-400">{locked.length}</p>
                <p className="text-gray-400 text-xs mt-1">still to unlock</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs font-semibold mb-1">Completion</p>
                <p className="text-3xl font-extrabold text-green-500">
                  {allAchievements.length > 0
                    ? Math.round((earned.length / allAchievements.length) * 100)
                    : 0}%
                </p>
                <p className="text-gray-400 text-xs mt-1">overall progress</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs font-semibold mb-1">Latest Badge</p>
                <p className="text-3xl">{latestBadge?.icon || '🔒'}</p>
                <p className="text-gray-400 text-xs mt-1">{latestBadge?.title || 'None yet'}</p>
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition
                  ${filter === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-48" />
              ))}
            </div>
          ) : (
            <>
              {/* Earned Badges */}
              {filteredEarned.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🏆</span>
                    <h2 className="text-gray-800 text-lg font-bold">Earned Badges</h2>
                    <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {filteredEarned.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {filteredEarned.map(achievement => (
                      <div
                        key={achievement.id}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center"
                      >
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${achievement.color} flex items-center justify-center mb-4 shadow-lg`}>
                          <span className="text-3xl">{achievement.icon}</span>
                        </div>
                        <h3 className="text-gray-800 text-base font-bold mb-1">{achievement.title}</h3>
                        <p className="text-gray-500 text-xs mb-3 leading-relaxed">{achievement.description}</p>
                        <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-green-600 text-xs font-semibold">Earned {achievement.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locked Badges */}
              {filteredLocked.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🔒</span>
                    <h2 className="text-gray-800 text-lg font-bold">Locked Badges</h2>
                    <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                      {filteredLocked.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {filteredLocked.map(achievement => (
                      <div
                        key={achievement.id}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center text-center opacity-75"
                      >
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4 relative">
                          <span className="text-3xl grayscale opacity-50">{achievement.icon}</span>
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gray-400 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-gray-600 text-base font-bold mb-1">{achievement.title}</h3>
                        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{achievement.description}</p>
                        <div className="w-full mb-2">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-400 text-xs">{achievement.progressLabel}</span>
                            <span className="text-gray-500 text-xs font-semibold">{achievement.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredEarned.length === 0 && filteredLocked.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                  <p className="text-4xl mb-4">🏆</p>
                  <p className="text-gray-500 text-sm font-semibold">No achievements found for this category</p>
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