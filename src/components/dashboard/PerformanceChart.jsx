import { useState, useEffect } from 'react'
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '../../supabaseClient'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  const simEntry = payload.find(p => p.dataKey === 'simScore' && p.value != null)
  const modEntry = payload.find(p => p.dataKey === 'moduleScore' && p.value != null)
  if (!simEntry && !modEntry) return null
  return (
    <div style={{
      backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '10px', padding: '12px 16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)', minWidth: '160px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '10px', fontWeight: 500 }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
        {simEntry && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Simulation</span>
            </div>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{simEntry.value}%</span>
          </div>
        )}
        {modEntry && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>Module</span>
            </div>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{modEntry.value}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

function CustomDot({ cx, cy, value, stroke }) {
  if (value == null) return null
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={stroke} fillOpacity={0.12} />
      <circle cx={cx} cy={cy} r={4} fill="#fff" stroke={stroke} strokeWidth={2.5} />
    </g>
  )
}

function PerformanceChart() {
  const [view, setView] = useState('all')
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ avg: 0, best: 0, latest: 0, improvement: 0, totalAttempts: 0, passRate: 0 })

  useEffect(() => { fetchScores() }, [])

  async function fetchScores() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: simResults } = await supabase.from('simulation_results').select('score, completed_at')
      .eq('user_id', user.id).order('completed_at', { ascending: true })

    const { data: moduleResults } = await supabase.from('module_progress').select('score, completed_at')
      .eq('user_id', user.id).eq('quiz_completed', true).not('score', 'is', null)
      .order('completed_at', { ascending: true })

    function formatLabel(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const simPoints = (simResults || []).map(r => ({ label: formatLabel(r.completed_at), simScore: r.score, moduleScore: null, type: 'simulation', rawDate: r.completed_at }))
    const modulePoints = (moduleResults || []).map(r => ({ label: formatLabel(r.completed_at), simScore: null, moduleScore: r.score, type: 'module', rawDate: r.completed_at }))
    const merged = [...simPoints, ...modulePoints].sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))

    const simScores = (simResults || []).map(r => r.score)
    if (simScores.length > 0) {
      const avg = Math.round(simScores.reduce((a, b) => a + b, 0) / simScores.length)
      const best = Math.max(...simScores)
      const latest = simScores[simScores.length - 1]
      const improvement = simScores.length >= 2 ? simScores[simScores.length - 1] - simScores[0] : 0
      const passRate = Math.round((simScores.filter(s => s >= 80).length / simScores.length) * 100)
      setStats({ avg, best, latest, improvement, totalAttempts: simScores.length, passRate })
    }

    setAllData(merged)
    setLoading(false)
  }

  function getFilteredData() {
    if (allData.length === 0) return []
    const now = new Date()
    if (view === '7D') { const c = new Date(now); c.setDate(c.getDate() - 7); return allData.filter(d => new Date(d.rawDate) >= c) }
    if (view === '30D') { const c = new Date(now); c.setDate(c.getDate() - 30); return allData.filter(d => new Date(d.rawDate) >= c) }
    if (view === '3M') { const c = new Date(now); c.setMonth(c.getMonth() - 3); return allData.filter(d => new Date(d.rawDate) >= c) }
    return allData
  }

  const data = getFilteredData()
  const hasSimData = data.some(d => d.simScore !== null)
  const hasModuleData = data.some(d => d.moduleScore !== null)

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-4">
      <div className="px-5 pt-4 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-800 text-sm font-semibold">Average Performance</p>
            <p className="text-gray-400 text-xs mt-0.5">Simulation & training scores per attempt</p>
          </div>
          <div className="flex items-center gap-0.5 bg-gray-50 border border-gray-100 rounded-lg p-0.5">
            {['7D', '30D', '3M', 'all'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition
                  ${view === v ? 'bg-white text-gray-800 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                {v === 'all' ? 'All' : v}
              </button>
            ))}
          </div>
        </div>

        {!loading && allData.length > 0 && (
          <div className="flex items-center gap-4 flex-wrap">
            {[
              { label: 'Avg', value: stats.avg, suffix: '%' },
              { label: 'Best', value: stats.best, suffix: '%' },
              { label: 'Latest', value: stats.latest, suffix: '%' },
              { label: 'Improvement', value: `${stats.improvement >= 0 ? '+' : ''}${stats.improvement}`, suffix: '%', colored: true, positive: stats.improvement >= 0 },
              { label: 'Pass Rate', value: stats.passRate, suffix: '%' },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-4">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{s.label}</p>
                  <div className="flex items-baseline gap-0.5">
                    <p className={`text-lg font-bold ${s.colored ? s.positive ? 'text-emerald-500' : 'text-red-500' : 'text-gray-900'}`}>{s.value}</p>
                    <p className={`text-xs ${s.colored ? s.positive ? 'text-emerald-400' : 'text-red-400' : 'text-gray-400'}`}>{s.suffix}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="w-px h-6 bg-gray-100" />}
              </div>
            ))}
            <div className="ml-auto">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md
                ${stats.avg >= 80 ? 'bg-emerald-50 text-emerald-600'
                  : stats.avg >= 50 ? 'bg-yellow-50 text-yellow-600'
                  : 'bg-red-50 text-red-500'}`}>
                {stats.avg >= 80 ? '✓ Pass' : stats.avg >= 50 ? '⚠ Average' : '✗ At Risk'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-2 pt-4 pb-3">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-gray-400 text-sm">No data for this period</p>
            <p className="text-gray-300 text-xs">Try a longer time range</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={data} margin={{ top: 8, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={8} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'Pass', position: 'right', fill: '#10b981', fontSize: 9, fontWeight: 600 }} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1} strokeOpacity={0.5} label={{ value: 'Avg', position: 'right', fill: '#f59e0b', fontSize: 9, fontWeight: 600 }} />
                {hasSimData && (
                  <Area type="monotone" dataKey="simScore" stroke="#3b82f6" strokeWidth={2.5} fill="url(#simGrad)" connectNulls={false}
                    dot={props => <CustomDot key={`s-${props.index}`} {...props} stroke="#3b82f6" value={props.payload.simScore} />}
                    activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2.5 }} />
                )}
                {hasModuleData && (
                  <Line type="monotone" dataKey="moduleScore" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" fill="none" connectNulls={false}
                    dot={props => <CustomDot key={`m-${props.index}`} {...props} stroke="#8b5cf6" value={props.payload.moduleScore} />}
                    activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2.5 }} />
                )}
              </ComposedChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between px-4 pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-5">
                {hasSimData && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-3 h-px bg-blue-500" />
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-gray-400 text-xs">Simulation</p>
                  </div>
                )}
                {hasModuleData && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-px bg-purple-500" /><div className="w-1 h-px" /><div className="w-1.5 h-px bg-purple-500" />
                    </div>
                    <p className="text-gray-400 text-xs">Module Quiz</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {[{ color: '#10b981', label: 'Pass ≥80%' }, { color: '#f59e0b', label: 'Avg 50–79%' }, { color: '#ef4444', label: 'Risk <50%' }].map((z, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: z.color }} />
                    <p className="text-gray-400 text-xs">{z.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default PerformanceChart