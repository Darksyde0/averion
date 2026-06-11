import { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { supabase } from '../../supabaseClient'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null

  const simEntry = payload.find(p => p.dataKey === 'simScore' && p.value != null)
  const modEntry = payload.find(p => p.dataKey === 'moduleScore' && p.value != null)

  if (!simEntry && !modEntry) return null

  return (
    <div style={{
      backgroundColor: '#0f172a',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '14px',
      padding: '12px 16px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
      minWidth: '160px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '10px', fontWeight: 600 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {simEntry && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>Simulation</span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{simEntry.value}%</span>
          </div>
        )}
        {modEntry && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px' }}>Module</span>
            </div>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{modEntry.value}%</span>
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
  const [stats, setStats] = useState({
    avg: 0, best: 0, latest: 0, improvement: 0,
    totalAttempts: 0, passRate: 0,
  })

  useEffect(() => { fetchScores() }, [])

  async function fetchScores() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: simResults } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true })

    const { data: moduleResults } = await supabase
      .from('module_progress')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .eq('quiz_completed', true)
      .not('score', 'is', null)
      .order('completed_at', { ascending: true })

    function formatLabel(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const simPoints = (simResults || []).map(r => ({
      label: formatLabel(r.completed_at),
      simScore: r.score,
      moduleScore: null,
      type: 'simulation',
      rawDate: r.completed_at,
    }))

    const modulePoints = (moduleResults || []).map(r => ({
      label: formatLabel(r.completed_at),
      simScore: null,
      moduleScore: r.score,
      type: 'module',
      rawDate: r.completed_at,
    }))

    const merged = [...simPoints, ...modulePoints]
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))

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
    if (view === '7D') {
      const c = new Date(now); c.setDate(c.getDate() - 7)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    if (view === '30D') {
      const c = new Date(now); c.setDate(c.getDate() - 30)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    if (view === '3M') {
      const c = new Date(now); c.setMonth(c.getMonth() - 3)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    return allData
  }

  const data = getFilteredData()
  const hasSimData = data.some(d => d.simScore !== null)
  const hasModuleData = data.some(d => d.moduleScore !== null)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">

      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-50">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-gray-900 text-base font-bold">Average Performance</h2>
            <p className="text-gray-400 text-xs mt-0.5">Simulation & training scores per attempt</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {['7D', '30D', '3M', 'all'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                  ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {v === 'all' ? 'All' : v}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        {!loading && allData.length > 0 && (
          <div className="flex items-center gap-5 flex-wrap">
            {[
              { label: 'Overall Avg', value: stats.avg, suffix: '%', color: 'text-gray-900' },
              { label: 'Best Score', value: stats.best, suffix: '%', color: 'text-gray-900' },
              { label: 'Latest', value: stats.latest, suffix: '%', color: 'text-gray-900' },
              {
                label: 'Improvement',
                value: `${stats.improvement >= 0 ? '+' : ''}${stats.improvement}`,
                suffix: '%',
                color: stats.improvement >= 0 ? 'text-green-500' : 'text-red-500',
              },
              { label: 'Pass Rate', value: stats.passRate, suffix: '%', color: 'text-gray-900' },
            ].map((s, i, arr) => (
              <div key={i} className="flex items-center gap-5">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">{s.label}</p>
                  <div className="flex items-baseline gap-0.5">
                    <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                    <p className={`text-xs font-semibold ${s.color === 'text-gray-900' ? 'text-gray-400' : s.color}`}>{s.suffix}</p>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="w-px h-7 bg-gray-100" />}
              </div>
            ))}
            <div className="ml-auto">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                ${stats.avg >= 80 ? 'bg-green-100 text-green-700' :
                  stats.avg >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-600'}`}>
                {stats.avg >= 80 ? '✓ Pass' : stats.avg >= 50 ? '⚠ Average' : '✗ High Risk'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-2 pt-6 pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>

        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">No data for this period</p>
            <p className="text-gray-300 text-xs">Try a longer time range</p>
          </div>

        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="0"
                  stroke="#f3f4f6"
                  vertical={false}
                  horizontal={true}
                />

                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />

                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                  ticks={[0, 25, 50, 75, 100]}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke: '#e5e7eb',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />

                <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 3"
                  strokeWidth={1} strokeOpacity={0.5}
                  label={{ value: 'Pass', position: 'right', fill: '#22c55e', fontSize: 9, fontWeight: 700 }} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 3"
                  strokeWidth={1} strokeOpacity={0.5}
                  label={{ value: 'Avg', position: 'right', fill: '#f59e0b', fontSize: 9, fontWeight: 700 }} />

                {/* Simulation — filled area + line */}
                {hasSimData && (
                  <Area
                    type="monotone"
                    dataKey="simScore"
                    name="Simulation"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#simGrad)"
                    connectNulls={false}
                    dot={(props) => (
                      <CustomDot key={`sim-dot-${props.index}`} {...props} stroke="#3b82f6" value={props.payload.simScore} />
                    )}
                    activeDot={{
                      r: 6,
                      fill: '#3b82f6',
                      stroke: '#fff',
                      strokeWidth: 3,
                    }}
                  />
                )}

                {/* Module — line only, no fill */}
                {hasModuleData && (
                  <Line
                    type="monotone"
                    dataKey="moduleScore"
                    name="Module"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    fill="none"
                    connectNulls={false}
                    dot={(props) => (
                      <CustomDot key={`mod-dot-${props.index}`} {...props} stroke="#8b5cf6" value={props.payload.moduleScore} />
                    )}
                    activeDot={{
                      r: 6,
                      fill: '#8b5cf6',
                      stroke: '#fff',
                      strokeWidth: 3,
                    }}
                  />
                )}

              </ComposedChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-between px-4 pt-3 flex-wrap gap-3">
              <div className="flex items-center gap-6">
                {hasSimData && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="w-4 h-px bg-blue-500" />
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-gray-500 text-xs font-medium">Simulation</p>
                  </div>
                )}
                {hasModuleData && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      <div className="w-1 h-px bg-purple-500" />
                      <div className="w-1 h-px bg-transparent" />
                      <div className="w-1 h-px bg-purple-500" />
                      <div className="w-1 h-px bg-transparent" />
                      <div className="w-1 h-px bg-purple-500" />
                    </div>
                    <p className="text-gray-500 text-xs font-medium">Module Quiz</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {[
                  { color: '#22c55e', label: 'Pass ≥80%' },
                  { color: '#f59e0b', label: 'Avg 50–79%' },
                  { color: '#ef4444', label: 'Risk <50%' },
                ].map((z, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
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