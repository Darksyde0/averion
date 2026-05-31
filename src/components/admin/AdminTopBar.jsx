import { useState, useEffect, useRef } from 'react'
import { useProfile } from '../../hooks/useProfile'
import { supabase } from '../../supabaseClient'

const LAST_SEEN_KEY = 'averion_notif_last_seen'

// ── Module-level cache — survives page navigation ──
let notifCache = []
let userMapCache = {}
let userIdsCache = []

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 172800) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function NotifIcon({ type }) {
  if (type === 'simulation_complete') return (
    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
  if (type === 'module_complete') return (
    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    </div>
  )
  if (type === 'at_risk') return (
    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </div>
  )
  if (type === 'new_user') return (
    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    </div>
  )
  if (type === 'achievement') return (
    <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    </div>
  )
  if (type === 'expiring_soon') return (
    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  )
  return (
    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    </div>
  )
}

function AdminTopBar({ onMenuClick }) {
  const profile = useProfile()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef(null)

  // ── Outside click ──
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Initial fetch + Realtime subscriptions ──
  useEffect(() => {
    if (!profile?.id) return

    // Load from cache or fetch fresh
    if (notifCache.length > 0) {
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY) || '1970-01-01'
      const withRead = notifCache.map(n => ({ ...n, read: new Date(n.time) <= new Date(lastSeen) }))
      setNotifications(withRead)
      setUnreadCount(withRead.filter(n => !n.read).length)
    } else {
      fetchNotifications()
    }

    // ── Realtime subscriptions ──
    const channel = supabase
      .channel(`admin-notif-${profile.id}`)

      // New simulation result
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'simulation_results',
      }, payload => {
        const r = payload.new
        if (!userIdsCache.includes(r.user_id)) return
        const userName = userMapCache[r.user_id]?.name || 'A user'
        const newNotif = {
          id: `sim-${r.user_id}-${r.completed_at}`,
          type: r.score < 50 ? 'at_risk' : 'simulation_complete',
          title: r.score < 50
            ? `${userName} is at risk`
            : `${userName} completed a simulation`,
          subtitle: r.score < 50
            ? `Scored ${r.score}% — below the 50% threshold`
            : `Scored ${r.score}%`,
          time: r.completed_at || new Date().toISOString(),
          score: r.score,
          read: false,
        }
        addNotification(newNotif)
      })

      // Module completed
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'module_progress',
      }, payload => {
        const p = payload.new
        if (!p.quiz_completed || !userIdsCache.includes(p.user_id)) return
        const userName = userMapCache[p.user_id]?.name || 'A user'
        const newNotif = {
          id: `mod-${p.user_id}-${p.completed_at || Date.now()}`,
          type: 'module_complete',
          title: `${userName} completed a module`,
          subtitle: 'Training Module',
          time: p.completed_at || new Date().toISOString(),
          read: false,
        }
        addNotification(newNotif)
      })

      // New user joined
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'users',
        filter: `organization_id=eq.${profile.id}`,
      }, payload => {
        const u = payload.new
        if (u.role !== 'user') return
        // Update user caches
        userMapCache[u.id] = { name: u.full_name || 'A user', avatar: u.avatar_url }
        userIdsCache = [...userIdsCache, u.id]
        const newNotif = {
          id: `user-${u.id}`,
          type: 'new_user',
          title: `${u.full_name || 'A new user'} joined your organization`,
          subtitle: 'Ready to begin training',
          time: u.created_at || new Date().toISOString(),
          read: false,
        }
        addNotification(newNotif)
      })

      // Achievement earned
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'achievements',
      }, payload => {
        const a = payload.new
        if (!userIdsCache.includes(a.user_id)) return
        const userName = userMapCache[a.user_id]?.name || 'A user'
        const newNotif = {
          id: `ach-${a.user_id}-${a.badge_type}`,
          type: 'achievement',
          title: `${userName} earned an achievement`,
          subtitle: a.badge_type?.replace(/_/g, ' '),
          time: a.earned_at || new Date().toISOString(),
          read: false,
        }
        addNotification(newNotif)
      })

      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile])

  // ── Add single notification to top of list ──
  function addNotification(newNotif) {
    notifCache = [newNotif, ...notifCache.filter(n => n.id !== newNotif.id)].slice(0, 15)
    setNotifications([...notifCache])
    setUnreadCount(prev => prev + 1)
  }

  async function fetchNotifications() {
    setNotifLoading(true)
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY) || '1970-01-01'

    const userRes = await supabase
      .from('users')
      .select('id, full_name, avatar_url')
      .eq('role', 'user')
      .eq('organization_id', profile.id)

    const users = userRes.data || []
    if (users.length === 0) { setNotifLoading(false); return }

    const userIds = users.map(u => u.id)
    const userMap = {}
    users.forEach(u => { userMap[u.id] = { name: u.full_name || 'A user', avatar: u.avatar_url } })

    // ── Save to module cache for realtime use ──
    userIdsCache = userIds
    userMapCache = userMap

    const notifs = []

    // ── 1. Simulation completions ──
    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('user_id, score, completed_at')
      .in('user_id', userIds)
      .order('completed_at', { ascending: false })
      .limit(5)

    ;(simResults || []).forEach(r => {
      notifs.push({
        id: `sim-${r.user_id}-${r.completed_at}`,
        type: 'simulation_complete',
        title: `${userMap[r.user_id]?.name} completed a simulation`,
        subtitle: `Scored ${r.score}%`,
        time: r.completed_at,
        score: r.score,
      })
    })

    // ── 2. Module completions ──
    const { data: moduleProgress } = await supabase
      .from('module_progress')
      .select('user_id, completed_at, modules(name)')
      .in('user_id', userIds)
      .eq('quiz_completed', true)
      .order('completed_at', { ascending: false })
      .limit(5)

    ;(moduleProgress || []).forEach(p => {
      notifs.push({
        id: `mod-${p.user_id}-${p.completed_at}`,
        type: 'module_complete',
        title: `${userMap[p.user_id]?.name} completed a module`,
        subtitle: p.modules?.name || 'Training Module',
        time: p.completed_at,
      })
    })

    // ── 3. At-risk users (score < 50) ──
    const { data: allSims } = await supabase
      .from('simulation_results')
      .select('user_id, score, completed_at')
      .in('user_id', userIds)
      .lt('score', 50)
      .order('completed_at', { ascending: false })
      .limit(5)

    ;(allSims || []).forEach(r => {
      notifs.push({
        id: `risk-${r.user_id}-${r.completed_at}`,
        type: 'at_risk',
        title: `${userMap[r.user_id]?.name} is at risk`,
        subtitle: `Scored ${r.score}% — below the 50% threshold`,
        time: r.completed_at,
        score: r.score,
      })
    })

    // ── 4. New users (joined in last 7 days) ──
    const sevenDaysAgo = new Date(Date.now() - 86400000 * 7).toISOString()
    const { data: newUsers } = await supabase
      .from('users')
      .select('id, full_name, created_at')
      .eq('role', 'user')
      .eq('organization_id', profile.id)
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false })

    ;(newUsers || []).forEach(u => {
      notifs.push({
        id: `user-${u.id}`,
        type: 'new_user',
        title: `${u.full_name || 'A new user'} joined your organization`,
        subtitle: 'Ready to begin training',
        time: u.created_at,
      })
    })

    // ── 5. Achievements earned ──
    const { data: achievements } = await supabase
      .from('achievements')
      .select('user_id, badge_type, earned_at')
      .in('user_id', userIds)
      .order('earned_at', { ascending: false })
      .limit(5)

    ;(achievements || []).forEach(a => {
      notifs.push({
        id: `ach-${a.user_id}-${a.badge_type}`,
        type: 'achievement',
        title: `${userMap[a.user_id]?.name} earned an achievement`,
        subtitle: a.badge_type?.replace(/_/g, ' '),
        time: a.earned_at,
      })
    })

    // ── 6. Expiring simulations (within 48hrs) ──
    const now = new Date().toISOString()
    const in48hrs = new Date(Date.now() + 86400000 * 2).toISOString()
    const { data: expiringSims } = await supabase
      .from('simulations')
      .select('id, scenario_name, expires_at, batch_id')
      .eq('organization_id', profile.id)
      .gte('expires_at', now)
      .lte('expires_at', in48hrs)
      .order('expires_at', { ascending: true })

    const seenBatches = new Set()
    ;(expiringSims || []).forEach(s => {
      const key = s.batch_id || s.id
      if (!seenBatches.has(key)) {
        seenBatches.add(key)
        notifs.push({
          id: `exp-${key}`,
          type: 'expiring_soon',
          title: 'Simulation batch expiring soon',
          subtitle: `Expires ${new Date(s.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
          time: s.expires_at,
        })
      }
    })

    // ── Sort + mark read based on lastSeen ──
    const sorted = notifs
      .filter(n => n.time)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 15)
      .map(n => ({ ...n, read: new Date(n.time) <= new Date(lastSeen) }))

    // ── Save to module cache ──
    notifCache = sorted

    setNotifications(sorted)
    setUnreadCount(sorted.filter(n => !n.read).length)
    setNotifLoading(false)
  }

  function markAllRead() {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString())
    notifCache = notifCache.map(n => ({ ...n, read: true }))
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  function getScoreColor(score) {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  return (
    <div className="bg-[#0d1117] border-b border-white border-opacity-5 flex items-center justify-between px-6 h-14 flex-shrink-0">

      {/* Hamburger */}
      <button onClick={onMenuClick}
        className="text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white hover:bg-opacity-5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const opening = !notifOpen
              setNotifOpen(opening)
              if (opening) markAllRead()
            }}
            className="relative text-gray-500 hover:text-white transition p-1.5 rounded-lg hover:bg-white hover:bg-opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center px-1">
                <span className="text-white font-bold leading-none" style={{ fontSize: '10px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* ── Dropdown ── */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-100">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-800 text-sm font-bold">Notifications</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-green-500 text-xs font-medium">Live</span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {notifications.length > 0
                      ? `${notifications.length} recent activities`
                      : 'No notifications yet'}
                  </p>
                </div>
                {notifications.some(n => !n.read) && (
                  <button onClick={markAllRead}
                    className="text-blue-500 hover:text-blue-700 text-xs font-semibold transition">
                    Mark all read
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
                {notifLoading ? (
                  <div className="flex flex-col gap-3 p-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center gap-3 px-2 py-2">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded w-3/4 mb-1.5" />
                          <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No notifications yet</p>
                    <p className="text-gray-300 text-xs">Activity from your users will appear here</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {notifications.map(notif => (
                      <div key={notif.id}
                        className={`flex items-start gap-3 px-3 py-3 rounded-xl transition hover:bg-gray-50 cursor-default
                          ${!notif.read ? 'bg-blue-50/40' : ''}`}>
                        <NotifIcon type={notif.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-gray-800 text-xs font-semibold leading-snug">{notif.title}</p>
                            {!notif.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5 truncate">
                            {notif.subtitle}
                            {notif.score !== undefined && (
                              <span className={`ml-1 font-semibold ${getScoreColor(notif.score)}`}>
                                · {notif.score}%
                              </span>
                            )}
                          </p>
                          <p className="text-gray-300 text-xs mt-1">{timeAgo(notif.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-gray-400 text-xs">
                    Live updates · {notifications.length} activities shown
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Admin pill */}
        <div className="flex items-center gap-2.5 bg-white bg-opacity-5 border border-white border-opacity-5 rounded-full pl-3 pr-1.5 py-1.5">
          <div className="text-right">
            <p className="text-white text-xs font-semibold leading-tight">
              {profile?.full_name || 'Loading...'}
            </p>
            <p className="text-red-400 text-xs leading-tight">Admin</p>
          </div>
          <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0 ring-1 ring-white ring-opacity-10">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default AdminTopBar
