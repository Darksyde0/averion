import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const categoryConfig = {
  'Social Engineering': {
    colors: ['#be123c', '#f43f5e'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  'Phishing Detection': {
    colors: ['#1d4ed8', '#3b82f6'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  'Password Security': {
    colors: ['#065f46', '#10b981'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  'Data Privacy': {
    colors: ['#6d28d9', '#8b5cf6'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  'Network Security': {
    colors: ['#0e7490', '#06b6d4'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
      </svg>
    ),
  },
}

const defaultConfig = {
  colors: ['#1d4ed8', '#3b82f6'],
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
}

function RecommendedModules() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchRecommended() }, [])

  async function fetchRecommended() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // ── Fix: use quiz_completed not completed ──
    const { data: completed } = await supabase
      .from('module_progress')
      .select('module_id')
      .eq('user_id', user.id)
      .eq('quiz_completed', true)

    const completedIds = (completed || []).map(p => p.module_id)

    const { data: allModules } = await supabase
      .from('modules')
      .select('id, name, description, category, estimated_time')
      .eq('hidden', false)
      .order('created_at', { ascending: true })
      .limit(10)

    const recommended = (allModules || [])
      .filter(m => !completedIds.includes(m.id))
      .slice(0, 3)

    setModules(recommended)
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div>
          <h2 className="text-gray-800 text-sm font-bold">Recommended for You</h2>
          <p className="text-gray-400 text-xs mt-0.5">Modules you haven't completed yet</p>
        </div>
        <button onClick={() => navigate('/training')}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-500 text-xs font-semibold transition-colors duration-200 group">
          View All
          <svg xmlns="http://www.w3.org/2000/svg"
            className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-200"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col p-4">

        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-2.5 bg-gray-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 text-sm font-bold mb-0.5">All caught up!</p>
              <p className="text-gray-400 text-xs">You've completed all available modules</p>
            </div>
          </div>

        ) : (
          <div className="flex flex-col gap-2">
            {modules.map((mod, index) => {
              const config = categoryConfig[mod.category] || defaultConfig
              const [from, to] = config.colors

              return (
                <div key={mod.id}
                  onClick={() => navigate(`/training/${mod.id}`)}
                  className="group flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative overflow-hidden">

                  {/* Subtle left accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: `linear-gradient(to bottom, ${from}, ${to})` }} />

                  {/* ── Icon ── */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    {config.icon}
                  </div>

                  {/* ── Info ── */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-gray-800 font-semibold truncate" style={{ fontSize: '12px' }}>
                        {mod.name}
                      </p>
                      {index === 0 && (
                        <span className="flex-shrink-0 text-white font-bold px-1.5 py-0.5 rounded leading-none"
                          style={{ fontSize: '8px', background: `linear-gradient(135deg, ${from}, ${to})` }}>
                          UP NEXT
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 truncate mb-1" style={{ fontSize: '10px' }}>
                      {mod.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-gray-400" style={{ fontSize: '10px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {mod.estimated_time} mins
                      </span>
                      <span className="font-medium px-1.5 py-0.5 rounded-full"
                        style={{ fontSize: '9px', color: from, backgroundColor: `${from}15` }}>
                        {mod.category}
                      </span>
                    </div>
                  </div>

                  {/* ── Arrow ── */}
                  <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              )
            })}

            {/* ── View all link ── */}
            <button onClick={() => navigate('/training')}
              className="mt-1 w-full py-2.5 rounded-xl border border-dashed border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 text-xs font-semibold transition-all duration-200">
              Browse all training modules →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default RecommendedModules