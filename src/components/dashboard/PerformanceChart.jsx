import { useState, useEffect } from 'react'
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { supabase } from '../../supabaseClient'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const validPayload = payload.find(p => p.value !== null && p.value !== undefined)
    if (!validPayload) return null

    const score = validPayload.value
    const type = validPayload.payload?.type
    const riskLabel = score >= 80 ? 'Pass' : score >= 50 ? 'Average' : 'High Risk'
    const riskColor = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

    return (
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        padding: '10px 14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        minWidth: '140px',
      }}>
        <p style={{ color: '#9ca3af', fontSize: '10px', marginBottom: '4px' }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px', marginBottom: '4px' }}>
          <p style={{ color: '#111827', fontSize: '22px', fontWeight: '800', lineHeight: 1 }}>{score}</p>
          <p style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600' }}>%</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: riskColor }} />
          <p style={{ color: riskColor, fontSize: '11px', fontWeight: '700' }}>{riskLabel}</p>
          <span style={{ color: '#e5e7eb', fontSize: '11px' }}>·</span>
          <p style={{ color: '#9ca3af', fontSize: '11px' }}>{type === 'simulation' ? 'Simulation' : 'Module'}</p>
        </div>
      </div>
    )
  }
  return null
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
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      })
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
      const c = new Date(now)
      c.setDate(c.getDate() - 7)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    if (view === '30D') {
      const c = new Date(now)
      c.setDate(c.getDate() - 30)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    if (view === '3M') {
      const c = new Date(now)
      c.setMonth(c.getMonth() - 3)
      return allData.filter(d => new Date(d.rawDate) >= c)
    }
    return allData
  }

  const data = getFilteredData()
  const hasSimData = data.some(d => d.simScore !== null)
  const hasModuleData = data.some(d => d.moduleScore !== null)

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-50">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-gray-900 text-base font-bold">Performance Over Time</h2>
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

        {/* ── Stats ── */}
        {!loading && allData.length > 0 && (
          <div className="flex items-center gap-5 flex-wrap">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Avg Score</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-gray-900 text-xl font-extrabold">{stats.avg}</p>
                <p className="text-gray-400 text-xs font-semibold">%</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Best Score</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-gray-900 text-xl font-extrabold">{stats.best}</p>
                <p className="text-gray-400 text-xs font-semibold">%</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Latest</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-gray-900 text-xl font-extrabold">{stats.latest}</p>
                <p className="text-gray-400 text-xs font-semibold">%</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Improvement</p>
              <div className="flex items-baseline gap-0.5">
                <p className={`text-xl font-extrabold ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
                </p>
                <p className={`text-xs font-semibold ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>%</p>
              </div>
            </div>

            <div className="w-px h-7 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Pass Rate</p>
              <div className="flex items-baseline gap-0.5">
                <p className="text-gray-900 text-xl font-extrabold">{stats.passRate}</p>
                <p className="text-gray-400 text-xs font-semibold">%</p>
              </div>
            </div>

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

      {/* ── Chart ── */}
      <div className="px-2 pt-4 pb-3">
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
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="modGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />

                <XAxis dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false} dy={8} />

                <YAxis domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} />

                <Tooltip content={<CustomTooltip />}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }} />

                {/* ── Reference lines ── */}
                <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="4 3"
                  strokeWidth={1} strokeOpacity={0.6}
                  label={{ value: 'Pass', position: 'right', fill: '#22c55e', fontSize: 9, fontWeight: 700 }} />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 3"
                  strokeWidth={1} strokeOpacity={0.6}
                  label={{ value: 'Avg', position: 'right', fill: '#f59e0b', fontSize: 9, fontWeight: 700 }} />

                {/* ── Simulation line ── */}
                {hasSimData && (
                  <Line
                    type="monotone"
                    dataKey="simScore"
                    name="Simulation"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      if (payload.simScore === null || payload.simScore === undefined) return null
                      const color = payload.simScore >= 80 ? '#22c55e' :
                        payload.simScore >= 50 ? '#f59e0b' : '#ef4444'
                      return (
                        <circle key={`sim-${cx}-${cy}`}
                          cx={cx} cy={cy} r={5}
                          fill={color} stroke="#fff" strokeWidth={2.5} />
                      )
                    }}
                    activeDot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 3, r: 7 }}
                    connectNulls={false}
                  />
                )}

                {/* ── Module line ── */}
                {hasModuleData && (
                  <Line
                    type="monotone"
                    dataKey="moduleScore"
                    name="Module"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    dot={(props) => {
                      const { cx, cy, payload } = props
                      if (payload.moduleScore === null || payload.moduleScore === undefined) return null
                      const color = payload.moduleScore >= 80 ? '#22c55e' :
                        payload.moduleScore >= 50 ? '#f59e0b' : '#ef4444'
                      return (
                        <circle key={`mod-${cx}-${cy}`}
                          cx={cx} cy={cy} r={5}
                          fill={color} stroke="#fff" strokeWidth={2.5} />
                      )
                    }}
                    activeDot={{ fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3, r: 7 }}
                    connectNulls={false}
                  />
                )}

              </ComposedChart>
            </ResponsiveContainer>

            {/* ── Legend ── */}
            <div className="flex items-center justify-between px-4 pt-2 flex-wrap gap-3">
              <div className="flex items-center gap-5">
                {hasSimData && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-0.5 bg-blue-500 rounded-full" />
                    <p className="text-gray-400 text-xs">Simulation</p>
                  </div>
                )}
                {hasModuleData && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-px border-t-2 border-dashed border-purple-500" />
                    <p className="text-gray-400 text-xs">Module</p>
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
