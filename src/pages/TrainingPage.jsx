import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import TopBar from '../components/dashboard/TopBar'

const categoryIcons = {
  'Social Engineering': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  'Phishing Detection': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  'Password Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
  'Data Privacy': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
  'Network Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" /></svg>,
  'Ransomware': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  'USB & Physical Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /></svg>,
  'Insider Threat': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  'Email Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  'Mobile Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>,
  'Cloud Security': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg>,
  'Zero-Day Awareness': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  'Office Safety': <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
}

const defaultIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>

const colorPalette = [
  '#2563eb', '#059669', '#dc2626', '#7c3aed',
  '#0891b2', '#d97706', '#475569', '#db2777',
  '#0d9488', '#0284c7', '#ea580c', '#65a30d',
  '#9333ea', '#0369a1', '#b45309', '#be185d',
]

function getModuleColor(id, index) {
  const str = String(id)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  const combined = Math.abs(hash) + (index * 137)
  return colorPalette[combined % colorPalette.length]
}

function statusStyle(status) {
  if (status === 'completed') return { bg: '#f0fdf4', text: '#16a34a', label: 'Completed' }
  if (status === 'in-progress') return { bg: '#fffbeb', text: '#ca8a04', label: 'In Progress' }
  return { bg: '#f9fafb', text: '#6b7280', label: 'Not Started' }
}

function TrainingPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filter, setFilter] = useState('all')
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [totalModules, setTotalModules] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => { fetchModules() }, [])

  async function fetchModules() {
    setLoading(true); setFetchError('')
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) { navigate('/login'); return }

      const { data: userProfile, error: profileError } = await supabase
        .from('users').select('organization_id').eq('id', user.id).single()
      if (profileError || !userProfile?.organization_id) {
        setFetchError('Could not load your profile.'); setLoading(false); return
      }

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules').select('id, name, description, category, estimated_time')
        .eq('hidden', false).eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })
      if (modulesError) { setFetchError('Could not load training modules.'); setLoading(false); return }
      if (!modulesData || modulesData.length === 0) { setModules([]); setTotalModules(0); setLoading(false); return }

      const moduleIds = modulesData.map(m => m.id)
      setTotalModules(modulesData.length)

      const { data: progress } = await supabase.from('module_progress')
        .select('module_id, quiz_completed').eq('user_id', user.id).in('module_id', moduleIds)

      const progressMap = {}
      ;(progress || []).forEach(p => {
        if (!progressMap[p.module_id] || p.quiz_completed === true) progressMap[p.module_id] = p.quiz_completed
      })

      const completedIds = Object.entries(progressMap).filter(([, done]) => done === true).map(([id]) => id)
      const inProgressIds = Object.entries(progressMap).filter(([, done]) => done === false).map(([id]) => id)

      setCompletedCount(completedIds.length)
      setInProgressCount(inProgressIds.length)
      setTotalPoints(completedIds.length * 100)

      setModules(modulesData.map((m, index) => ({
        id: m.id, title: m.name, description: m.description,
        category: m.category, estimatedTime: m.estimated_time,
        status: completedIds.includes(m.id) ? 'completed' : inProgressIds.includes(m.id) ? 'in-progress' : 'new',
        color: getModuleColor(m.id, index),
        icon: categoryIcons[m.category] || defaultIcon,
      })))
    } catch (err) {
      setFetchError('Something went wrong. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const completionPercent = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0
  const filteredModules = filter === 'all' ? modules : modules.filter(m => m.status === filter)

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">Training Modules</h1>
            <p className="text-gray-400 text-xs mt-0.5">Expand your cybersecurity knowledge</p>
          </div>

          {fetchError && (
            <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-500 text-sm">{fetchError}</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-1.5">Overall Progress</p>
              <p className="text-gray-900 text-2xl font-bold mb-1.5">
                {completionPercent}<span className="text-gray-400 text-sm font-medium ml-0.5">%</span>
              </p>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }} />
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-1">Completed</p>
              <p className="text-gray-900 text-2xl font-bold">{completedCount}</p>
              <p className="text-gray-300 text-xs mt-0.5">of {totalModules} modules</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-1">In Progress</p>
              <p className="text-gray-900 text-2xl font-bold">{inProgressCount}</p>
              <p className="text-gray-300 text-xs mt-0.5">modules started</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-xs mb-1">Points Earned</p>
              <p className="text-gray-900 text-2xl font-bold">{totalPoints}</p>
              <p className="text-gray-300 text-xs mt-0.5">100 pts per module</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            {[
              { key: 'all', label: 'All' },
              { key: 'new', label: 'Not Started' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                  ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-xl py-14 text-center">
              <p className="text-gray-400 text-sm">
                {filter === 'all' ? 'No modules available yet.'
                  : filter === 'new' ? 'No unstarted modules.'
                  : `No ${filter.replace('-', ' ')} modules.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredModules.map(mod => {
                const ss = statusStyle(mod.status)
                return (
                  <div key={mod.id}
                    className="rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${mod.color}18 0%, ${mod.color}08 100%)`,
                      border: `1px solid ${mod.color}35`,
                    }}
                    onClick={() => mod.status !== 'completed' && navigate(`/training/${mod.id}`)}>

                    {/* Top */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${mod.color}20`, color: mod.color }}>
                        {mod.icon}
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: ss.bg, color: ss.text }}>
                        {ss.label}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm font-semibold mb-0.5 leading-snug">{mod.title}</p>
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{mod.description}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2"
                      style={{ borderTop: `1px solid ${mod.color}25` }}>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 text-xs">{mod.estimatedTime}m</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-500 text-xs truncate">{mod.category}</span>
                      </div>
                      {mod.status === 'completed' ? (
                        <span className="text-xs font-medium" style={{ color: mod.color }}>✓ Done</span>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/training/${mod.id}`) }}
                          className="text-xs font-semibold transition hover:opacity-80"
                          style={{ color: mod.color }}>
                          {mod.status === 'in-progress' ? 'Continue →' : 'Start →'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TrainingPage