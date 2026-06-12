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
  function loadSet(key) { try { const raw = localStorage.getItem(key); return new Set(raw ? JSON.parse(raw) : []) } catch { return new Set() } }
  function saveSet(key, set) { try { localStorage.setItem(key, JSON.stringify([...set])) } catch {} }

  function markAsSeen(activityId) {
    if (!userId) return
    setSeenIds(prev => { const u = new Set(prev); u.add(activityId); saveSet(getSeenKey(userId), u); return u })
    const activity = activities.find(a => a.id === activityId)
    if (activity?.action) activity.action()
  }

  function dismiss(e, activityId) {
    e.stopPropagation()
    if (!userId) return
    setDismissedIds(prev => { const u = new Set(prev); u.add(activityId); saveSet(getDismissedKey(userId), u); return u })
  }

  async function fetchActivities() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)
    const seen = loadSet(getSeenKey(user.id))
    const dismissed = loadSet(getDismissedKey(user.id))
    setSeenIds(seen); setDismissedIds(dismissed)

    const { data: simResults } = await supabase.from('simulation_results').select('score, completed_at, batch_id')
      .eq('user_id', user.id).order('completed_at', { ascending: false }).limit(3)

    const simActivities = (simResults || []).map(r => ({
      id: `sim-${r.completed_at}`, title: 'Simulation Exercise', subtitle: `Scored ${r.score}%`,
      time: r.completed_at, type: 'simulation_done', scoreValue: r.score, action: null, isNew: false, count: null,
    }))

    const { data: moduleProgress } = await supabase.from('module_progress').select('completed_at, module_id, modules(name)')
      .eq('user_id', user.id).eq('quiz_completed', true).order('completed_at', { ascending: false }).limit(3)

    const doneModuleIds = (moduleProgress || []).map(p => p.module_id).filter(Boolean)

    const moduleActivities = (moduleProgress || []).map(p => ({
      id: `mod-${p.module_id}`, title: p.modules?.name || 'Training Module', subtitle: 'Module completed',
      time: p.completed_at, type: 'module_done', scoreValue: null, action: null, isNew: false, count: null,
    }))

    const completedBatchIds = new Set((simResults || []).map(r => r.batch_id).filter(Boolean))

    const { data: allSims } = await supabase.from('simulations').select('id, batch_id, created_at').eq('hidden', false).order('created_at', { ascending: false })

    const pendingBatches = {}
    ;(allSims || []).forEach(s => {
      const bid = s.batch_id || s.id
      if (!completedBatchIds.has(bid)) {
        if (!pendingBatches[bid]) pendingBatches[bid] = { count: 0, created_at: s.created_at }
        pendingBatches[bid].count++
      }
    })

    const pendingSimCount = Object.values(pendingBatches).reduce((sum, b) => sum + b.count, 0)
    const latestSimDate = Object.values(pendingBatches).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at
    const simGroupId = 'group-simulations'
    const simGroupActivity = pendingSimCount > 0 ? {
      id: simGroupId, title: `${pendingSimCount} Simulation${pendingSimCount > 1 ? 's' : ''} Pending`,
      subtitle: 'Assigned by your administrator', time: latestSimDate, type: 'new_simulation',
      scoreValue: null, action: () => navigate('/simulations'), isNew: !seen.has(simGroupId), count: pendingSimCount,
    } : null

    const { data: newModules } = await supabase.from('modules').select('id, name, created_at').eq('hidden', false).order('created_at', { ascending: false }).limit(20)
    const pendingModules = (newModules || []).filter(m => !doneModuleIds.includes(m.id))
    const modGroupId = 'group-modules'
    const modGroupActivity = pendingModules.length > 0 ? {
      id: modGroupId, title: `${pendingModules.length} Module${pendingModules.length > 1 ? 's' : ''} Pending`,
      subtitle: 'Continue your learning path', time: pendingModules[0].created_at, type: 'new_module',
      scoreValue: null, action: () => navigate('/training'), isNew: !seen.has(modGroupId), count: pendingModules.length,
    } : null

    const all = [...simActivities, ...moduleActivities, ...(simGroupActivity ? [simGroupActivity] : []), ...(modGroupActivity ? [modGroupActivity] : [])]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
    setActivities(all)
    setLoading(false)
  }

  const visible = activities.filter(a => !dismissedIds.has(a.id))
  const newCount = visible.filter(a => a.isNew && !seenIds.has(a.id)).length

  function scoreColor(score) {
    if (score >= 80) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const typeColors = {
    simulation_done: '#3b82f6',
    module_done: '#10b981',
    new_simulation: '#f59e0b',
    new_module: '#8b5cf6',
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div>
          <p className="text-gray-800 text-sm font-semibold">Recent Activity</p>
          <p className="text-gray-400 text-xs mt-0.5">Your training & simulation history</p>
        </div>
        {newCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">{newCount} new</span>
        )}
      </div>

      <div className="flex-1 flex flex-col p-3">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1"><div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" /><div className="h-2 bg-gray-100 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
            <p className="text-gray-400 text-sm font-medium">No activity yet</p>
            <p className="text-gray-300 text-xs text-center">Complete a module or simulation to see activity here</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {visible.map((activity, index) => {
              const isUnseen = activity.isNew && !seenIds.has(activity.id)
              const isLast = index === visible.length - 1
              return (
                <div key={activity.id}
                  onClick={() => { if (isUnseen) markAsSeen(activity.id); else if (activity.action) activity.action() }}
                  className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition cursor-pointer hover:bg-gray-50
                    ${!isLast ? 'border-b border-gray-50' : ''}`}>

                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100"
                    style={{ color: typeColors[activity.type] }}>
                    <div className="w-3.5 h-3.5">
                      {activity.type === 'simulation_done' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.059l.042.018M14.25 3.104c.251.023.501.05.75.082M19.5 14.5l-4.091-4.091" /></svg>}
                      {activity.type === 'module_done' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>}
                      {activity.type === 'new_simulation' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>}
                      {activity.type === 'new_module' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-gray-700 text-xs font-medium truncate">{activity.title}</p>
                      {isUnseen && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs truncate">{activity.subtitle}</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-gray-300 text-xs flex-shrink-0">{timeAgo(activity.time)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {activity.scoreValue !== null && (
                      <span className="text-xs font-semibold" style={{ color: scoreColor(activity.scoreValue) }}>{activity.scoreValue}%</span>
                    )}
                    {activity.count !== null && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{activity.count}</span>
                    )}
                    {activity.action && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                    <button onClick={e => dismiss(e, activity.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
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