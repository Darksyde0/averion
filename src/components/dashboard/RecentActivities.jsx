import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

function timeAgo(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function RecentActivities() {
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [seenIds, setSeenIds] = useState(new Set())
  const [dismissedIds, setDismissedIds] = useState(new Set())
  const [userId, setUserId] = useState(null)

  useEffect(() => { fetchActivities() }, [])

  function getSeenKey(uid) { return `averion_seen_${uid}` }
  function getDismissedKey(uid) { return `averion_dismissed_${uid}` }

  function loadSet(key) {
    try {
      const raw = localStorage.getItem(key)
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  }

  function saveSet(key, set) {
    try { localStorage.setItem(key, JSON.stringify([...set])) } catch {}
  }

  function markAsSeen(activityId) {
    if (!userId) return
    setSeenIds(prev => {
      const updated = new Set(prev)
      updated.add(activityId)
      saveSet(getSeenKey(userId), updated)
      return updated
    })
    const activity = activities.find(a => a.id === activityId)
    if (activity?.action) activity.action()
  }

  function dismiss(e, activityId) {
    e.stopPropagation()
    if (!userId) return
    setDismissedIds(prev => {
      const updated = new Set(prev)
      updated.add(activityId)
      saveSet(getDismissedKey(userId), updated)
      return updated
    })
  }

  async function fetchActivities() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    setUserId(user.id)
    const seen = loadSet(getSeenKey(user.id))
    const dismissed = loadSet(getDismissedKey(user.id))
    setSeenIds(seen)
    setDismissedIds(dismissed)

    // ── 1. User's simulation results ──
    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('score, completed_at, batch_id')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(3)

    const simActivities = (simResults || []).map(r => ({
      id: `sim-${r.completed_at}`,
      title: 'Simulation Exercise',
      subtitle: `Scored ${r.score}%`,
      time: r.completed_at,
      type: 'simulation_done',
      scoreValue: r.score,
      action: null,
      isNew: false,
      count: null,
    }))

    // ── 2. User's completed modules ──
    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('completed_at, module_id, modules(name)')
      .eq('user_id', user.id)
      .eq('quiz_completed', true)
      .order('completed_at', { ascending: false })
      .limit(3)

    const doneModuleIds = (moduleProgress || []).map(p => p.module_id).filter(Boolean)

    const moduleActivities = (moduleProgress || []).map(p => ({
      id: `mod-${p.module_id}`,
      title: p.modules?.name || 'Training Module',
      subtitle: 'Completed',
      time: p.completed_at,
      type: 'module_done',
      scoreValue: null,
      action: null,
      isNew: false,
      count: null,
    }))

    // ── 3. New simulations — only batches NOT yet completed by user ──
    const completedBatchIds = new Set(
      (simResults || []).map(r => r.batch_id).filter(Boolean)
    )

    const { data: allSims } = await supabase
      .from('simulations')
      .select('id, batch_id, created_at')
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    // Group by batch_id, filter out completed batches
    const pendingBatches = {}
    ;(allSims || []).forEach(s => {
      const bid = s.batch_id || s.id
      if (!completedBatchIds.has(bid)) {
        if (!pendingBatches[bid]) {
          pendingBatches[bid] = { count: 0, created_at: s.created_at }
        }
        pendingBatches[bid].count++
      }
    })

    const pendingSimCount = Object.values(pendingBatches)
      .reduce((sum, b) => sum + b.count, 0)

    const latestSimDate = Object.values(pendingBatches)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at

    const simGroupId = 'group-simulations'
    const simGroupActivity = pendingSimCount > 0 ? {
      id: simGroupId,
      title: `${pendingSimCount} Simulation${pendingSimCount > 1 ? 's' : ''} Pending`,
      subtitle: 'Assigned by your administrator',
      time: latestSimDate,
      type: 'new_simulation',
      scoreValue: null,
      action: () => navigate('/simulations'),
      isNew: !seen.has(simGroupId),
      count: pendingSimCount,
    } : null

    // ── 4. New modules — only uncompleted ones ──
    const { data: newModules } = await supabase
      .from('modules')
      .select('id, name, created_at, category')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(20)

    const pendingModules = (newModules || []).filter(m => !doneModuleIds.includes(m.id))
    const modGroupId = 'group-modules'
    const modGroupActivity = pendingModules.length > 0 ? {
      id: modGroupId,
      title: `${pendingModules.length} Training Module${pendingModules.length > 1 ? 's' : ''} Pending`,
      subtitle: 'Continue your learning path',
      time: pendingModules[0].created_at,
      type: 'new_module',
      scoreValue: null,
      action: () => navigate('/training'),
      isNew: !seen.has(modGroupId),
      count: pendingModules.length,
    } : null

    const all = [
      ...simActivities,
      ...moduleActivities,
      ...(simGroupActivity ? [simGroupActivity] : []),
      ...(modGroupActivity ? [modGroupActivity] : []),
    ].sort((a, b) => new Date(b.time) - new Date(a.time))

    setActivities(all)
    setLoading(false)
  }

  const visible = activities.filter(a => !dismissedIds.has(a.id))
  const newCount = visible.filter(a => a.isNew && !seenIds.has(a.id)).length

  const typeConfig = {
    simulation_done: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      color: 'text-blue-600',
      label: 'Simulation',
      labelBg: 'bg-blue-50 text-blue-600',
      dot: 'bg-blue-400',
    },
    module_done: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      color: 'text-green-600',
      label: 'Completed',
      labelBg: 'bg-green-50 text-green-600',
      dot: 'bg-green-400',
    },
    new_simulation: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      color: 'text-orange-500',
      label: 'New',
      labelBg: 'bg-orange-50 text-orange-600',
      dot: 'bg-orange-400',
    },
    new_module: {
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      color: 'text-purple-600',
      label: 'Pending',
      labelBg: 'bg-purple-50 text-purple-600',
      dot: 'bg-purple-400',
    },
  }

  const icons = {
    simulation_done: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" />
      </svg>
    ),
    module_done: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    new_simulation: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    new_module: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div>
          <h2 className="text-gray-800 text-sm font-bold">Recent Activities</h2>
          <p className="text-gray-400 text-xs mt-0.5">Training actions & new content</p>
        </div>
        <div className="flex items-center gap-1.5">
          {newCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {newCount} new
            </span>
          )}
          <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
            {visible.length}
          </span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col p-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-xs font-semibold">No activities yet</p>
            <p className="text-gray-400 text-xs text-center leading-relaxed">
              Complete a module or simulation<br />to see your activity here
            </p>
          </div>

        ) : (
          <div className="flex flex-col gap-1.5">
            {visible.map((activity) => {
              const isUnseen = activity.isNew && !seenIds.has(activity.id)
              const cfg = typeConfig[activity.type]

              return (
                <div key={activity.id}
                  onClick={() => {
                    if (isUnseen) markAsSeen(activity.id)
                    else if (activity.action) activity.action()
                  }}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 relative
                    ${isUnseen
                      ? 'border-blue-200 bg-blue-50/80 cursor-pointer hover:bg-blue-100'
                      : activity.action
                        ? 'border-gray-100 hover:bg-gray-50 cursor-pointer'
                        : 'border-gray-100 hover:bg-gray-50/50'
                    }`}>

                  {/* ── Icon ── */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.color}`}>
                    {icons[activity.type]}
                  </div>

                  {/* ── Info ── */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-gray-800 font-semibold truncate" style={{ fontSize: '12px' }}>
                        {activity.title}
                      </p>
                      {isUnseen && (
                        <span className="flex-shrink-0 bg-red-500 text-white font-bold px-1 py-0.5 rounded leading-none"
                          style={{ fontSize: '8px' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-gray-400 truncate" style={{ fontSize: '10px' }}>
                        {activity.subtitle}
                      </span>
                      <span className="text-gray-200" style={{ fontSize: '10px' }}>·</span>
                      <span className="text-gray-400 flex-shrink-0" style={{ fontSize: '10px' }}>
                        {timeAgo(activity.time)}
                      </span>
                    </div>
                  </div>

                  {/* ── Right ── */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {activity.scoreValue !== null && (
                      <span className={`text-xs font-bold
                        ${activity.scoreValue >= 80 ? 'text-green-500' :
                          activity.scoreValue >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {activity.scoreValue}%
                      </span>
                    )}

                    {activity.count !== null && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.iconBg} ${cfg.color}`}>
                        {activity.count}
                      </span>
                    )}

                    {/* X button */}
                    <button onClick={(e) => dismiss(e, activity.id)}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentActivities