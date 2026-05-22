import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  if (diff < 172800) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentActivities() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()
  }, [])

  async function fetchActivities() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(3)

    const simActivities = (simResults || []).map(r => ({
      id: `sim-${r.completed_at}`,
      title: 'Simulation Exercise',
      score: `Completed with ${r.score}% score`,
      time: timeAgo(r.completed_at),
      type: 'simulation',
      scoreValue: r.score,
    }))

    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('completed_at, module_id, modules(name)')
      .eq('user_id', user.id)
      .eq('completed', true)
      .order('completed_at', { ascending: false })
      .limit(3)

    const moduleActivities = (moduleProgress || []).map(p => ({
      id: `mod-${p.completed_at}`,
      title: p.modules?.name || 'Training Module',
      score: 'Module completed',
      time: timeAgo(p.completed_at),
      type: 'module',
      scoreValue: null,
    }))

    const all = [...simActivities, ...moduleActivities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5)

    setActivities(all)
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-gray-800 text-lg font-bold">Recent Activities</h2>
          <p className="text-gray-400 text-xs mt-0.5">Your latest training actions</p>
        </div>
        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
          {activities.length} activities
        </span>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>

      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-semibold">No activities yet</p>
          <p className="text-gray-400 text-xs text-center">Complete a module or simulation to see your activity here</p>
        </div>

      ) : (
        <div className="flex flex-col gap-3">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition group"
            >
              {/* Icon circle */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${activity.type === 'simulation'
                  ? 'bg-blue-100'
                  : 'bg-green-100'
                }`}>
                {activity.type === 'simulation' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 font-semibold text-sm truncate">{activity.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                    ${activity.type === 'simulation'
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-green-50 text-green-600'
                    }`}>
                    {activity.type === 'simulation' ? 'Simulation' : 'Module'}
                  </span>
                  <span className="text-gray-400 text-xs">{activity.time}</span>
                </div>
              </div>

              {/* Score badge */}
              {activity.scoreValue !== null ? (
                <div className="flex flex-col items-end flex-shrink-0">
                  <p className={`text-lg font-extrabold leading-tight
                    ${activity.scoreValue >= 80 ? 'text-green-500' :
                      activity.scoreValue >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {activity.scoreValue}%
                  </p>
                  <span className={`text-xs font-bold
                    ${activity.scoreValue >= 80 ? 'text-green-400' :
                      activity.scoreValue >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {activity.scoreValue >= 80 ? 'Pass' :
                     activity.scoreValue >= 50 ? 'Average' : 'High Risk'}
                  </span>
                </div>
              ) : (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default RecentActivities