import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const categoryColors = {
  'Social Engineering': '#ef4444',
  'Phishing Detection': '#3b82f6',
  'Password Security': '#10b981',
  'Data Privacy': '#8b5cf6',
  'Network Security': '#06b6d4',
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

    const { data: completed } = await supabase.from('module_progress').select('module_id')
      .eq('user_id', user.id).eq('quiz_completed', true)
    const completedIds = (completed || []).map(p => p.module_id)

    const { data: allModules } = await supabase.from('modules')
      .select('id, name, description, category, estimated_time').eq('hidden', false)
      .order('created_at', { ascending: true }).limit(10)

    setModules((allModules || []).filter(m => !completedIds.includes(m.id)).slice(0, 3))
    setLoading(false)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
        <div>
          <p className="text-gray-800 text-sm font-semibold">Recommended</p>
          <p className="text-gray-400 text-xs mt-0.5">Modules you haven't completed yet</p>
        </div>
        <button onClick={() => navigate('/training')}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 text-xs font-medium transition group">
          View all
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
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
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-8 gap-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">All caught up!</p>
            <p className="text-gray-300 text-xs">You've completed all available modules</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {modules.map((mod, index) => {
              const color = categoryColors[mod.category] || '#3b82f6'
              const isLast = index === modules.length - 1
              return (
                <div key={mod.id} onClick={() => navigate(`/training/${mod.id}`)}
                  className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg cursor-pointer hover:bg-gray-50 transition
                    ${!isLast ? 'border-b border-gray-50' : ''}`}>

                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100"
                    style={{ color }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-gray-700 text-xs font-medium truncate">{mod.name}</p>
                      {index === 0 && (
                        <span className="flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400" style={{ fontSize: '9px' }}>
                          UP NEXT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400 text-xs">{mod.estimated_time}m</span>
                      <span className="text-gray-200">·</span>
                      <span className="text-gray-400 text-xs truncate">{mod.category}</span>
                    </div>
                  </div>

                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              )
            })}

            <button onClick={() => navigate('/training')}
              className="mt-2 w-full py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 text-xs font-medium transition">
              Browse all modules
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendedModules