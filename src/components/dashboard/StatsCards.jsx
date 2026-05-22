import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function StatsCards() {
  const [stats, setStats] = useState({
    trainingProgress: 0,
    latestScore: null,
    latestModuleName: '',
    pendingModules: 0,
    threatLevel: 'Low',
  })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // ── Total visible modules ──
    const { data: allModules } = await supabase
      .from('modules')
      .select('id, name')
      .eq('hidden', false)

    const totalModules = allModules?.length || 0

    // ── Completed modules (from module_progress) ──
    const { data: progress } = await supabase
      .from('module_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed', true)

    const completedCount = progress?.length || 0
    const pendingCount = totalModules - completedCount
    const trainingProgress = totalModules > 0
      ? Math.round((completedCount / totalModules) * 100)
      : 0

    // ── Latest simulation score ──
    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(1)

    const latestScore = simResults?.[0]?.score ?? null

    // ── Threat level based on latest score ──
    let threatLevel = 'Low'
    if (latestScore === null) threatLevel = 'Unknown'
    else if (latestScore >= 80) threatLevel = 'Low'
    else if (latestScore >= 50) threatLevel = 'Medium'
    else threatLevel = 'High'

    setStats({
      trainingProgress,
      latestScore,
      pendingModules: pendingCount,
      threatLevel,
    })
  }

  const threatColor =
    stats.threatLevel === 'Low' ? 'text-green-500' :
    stats.threatLevel === 'Medium' ? 'text-yellow-500' :
    stats.threatLevel === 'High' ? 'text-red-500' :
    'text-gray-400'

  const threatDesc =
    stats.threatLevel === 'Low' ? 'Good awareness level' :
    stats.threatLevel === 'Medium' ? 'Needs improvement' :
    stats.threatLevel === 'High' ? 'Needs urgent attention' :
    'Complete a simulation'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

      {/* Training Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Training Progress</p>
        <p className="text-blue-600 text-2xl font-bold mb-2">
          {stats.trainingProgress}% Complete
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${stats.trainingProgress}%` }}
          />
        </div>
      </div>

      {/* Latest Score */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Latest Simulation Score</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">
          {stats.latestScore !== null ? 'Most recent attempt' : 'No simulation yet'}
        </p>
        <p className={`text-2xl font-bold ${
          stats.latestScore === null ? 'text-gray-400' :
          stats.latestScore >= 80 ? 'text-green-500' :
          stats.latestScore >= 50 ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {stats.latestScore !== null ? `${stats.latestScore}%` : 'N/A'}
        </p>
      </div>

      {/* Pending Training */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Pending Training</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">Modules to complete</p>
        <p className="text-red-500 text-2xl font-bold">{stats.pendingModules}</p>
      </div>

      {/* Threat Awareness */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <p className="text-gray-500 text-xs mb-1">Threat Awareness</p>
        <p className="text-gray-700 text-sm font-semibold mb-1">{threatDesc}</p>
        <p className={`text-2xl font-bold ${threatColor}`}>
          {stats.threatLevel}
        </p>
      </div>

    </div>
  )
}

export default StatsCards