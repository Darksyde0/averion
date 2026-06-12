import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function StatsCards() {
  const [stats, setStats] = useState({
    trainingProgress: 0,
    latestScore: null,
    pendingModules: 0,
    threatLevel: 'Low',
  })

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: allModules } = await supabase.from('modules').select('id').eq('hidden', false)
    const totalModules = allModules?.length || 0

    const { data: progress } = await supabase.from('module_progress').select('module_id, quiz_completed')
      .eq('user_id', user.id).eq('quiz_completed', true)
    const completedCount = progress?.length || 0
    const pendingCount = totalModules - completedCount
    const trainingProgress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0

    const { data: simResults } = await supabase.from('simulation_results').select('score, completed_at')
      .eq('user_id', user.id).order('completed_at', { ascending: false }).limit(1)
    const latestScore = simResults?.[0]?.score ?? null

    let threatLevel = 'Low'
    if (latestScore === null) threatLevel = 'Unknown'
    else if (latestScore >= 80) threatLevel = 'Low'
    else if (latestScore >= 50) threatLevel = 'Medium'
    else threatLevel = 'High'

    setStats({ trainingProgress, latestScore, pendingModules: pendingCount, threatLevel })
  }

  const threatColor = stats.threatLevel === 'Low' ? '#10b981'
    : stats.threatLevel === 'Medium' ? '#f59e0b'
    : stats.threatLevel === 'High' ? '#ef4444'
    : '#9ca3af'

  const scoreColor = stats.latestScore === null ? '#9ca3af'
    : stats.latestScore >= 80 ? '#10b981'
    : stats.latestScore >= 50 ? '#f59e0b'
    : '#ef4444'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

      {/* Training Progress */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
        <p className="text-gray-400 text-xs mb-2">Training Progress</p>
        <p className="text-gray-900 text-2xl font-bold mb-2">{stats.trainingProgress}<span className="text-gray-400 text-sm font-medium ml-0.5">%</span></p>
        <div className="w-full bg-gray-100 rounded-full h-1">
          <div className="bg-blue-500 h-1 rounded-full transition-all duration-500"
            style={{ width: `${stats.trainingProgress}%` }} />
        </div>
        <p className="text-gray-300 text-xs mt-1.5">of modules complete</p>
      </div>

      {/* Latest Score */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
        <p className="text-gray-400 text-xs mb-2">Latest Simulation</p>
        <p className="text-2xl font-bold mb-0.5" style={{ color: scoreColor }}>
          {stats.latestScore !== null ? `${stats.latestScore}%` : '—'}
        </p>
        <p className="text-gray-300 text-xs">
          {stats.latestScore !== null ? 'Most recent attempt' : 'No simulation yet'}
        </p>
      </div>

      {/* Pending Training */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
        <p className="text-gray-400 text-xs mb-2">Pending Training</p>
        <p className="text-gray-900 text-2xl font-bold mb-0.5">{stats.pendingModules}</p>
        <p className="text-gray-300 text-xs">modules to complete</p>
      </div>

      {/* Threat Awareness */}
      <div className="bg-white border border-gray-100 rounded-xl px-4 py-3.5">
        <p className="text-gray-400 text-xs mb-2">Threat Awareness</p>
        <p className="text-2xl font-bold mb-0.5" style={{ color: threatColor }}>{stats.threatLevel}</p>
        <p className="text-gray-300 text-xs">
          {stats.threatLevel === 'Low' ? 'Good awareness level'
            : stats.threatLevel === 'Medium' ? 'Needs improvement'
            : stats.threatLevel === 'High' ? 'Needs urgent attention'
            : 'Complete a simulation'}
        </p>
      </div>

    </div>
  )
}

export default StatsCards