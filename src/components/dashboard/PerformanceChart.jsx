import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { supabase } from '../../supabaseClient'

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '10px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      }}>
        <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '2px' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: '18px', fontWeight: '800', lineHeight: 1 }}>
          {payload[0].value}<span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af' }}>%</span>
        </p>
      </div>
    )
  }
  return null
}

function PerformanceChart() {
  const [view, setView] = useState('6M')
  const [allData, setAllData] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ avg: 0, best: 0, improvement: 0 })

  useEffect(() => { fetchScores() }, [])

  async function fetchScores() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: results } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true })

    if (!results || results.length === 0) { setLoading(false); return }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const grouped = {}
    results.forEach(r => {
      const date = new Date(r.completed_at)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!grouped[key]) grouped[key] = { scores: [], month: monthNames[date.getMonth()], date }
      grouped[key].scores.push(r.score)
    })

    const allMonths = Object.values(grouped)
      .sort((a, b) => a.date - b.date)
      .map(m => ({
        month: m.month,
        score: Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length),
        date: m.date,
      }))

    const scores = allMonths.map(m => m.score)
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const best = Math.max(...scores)
    const improvement = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0

    setStats({ avg, best, improvement })
    setAllData(allMonths)
    setLoading(false)
  }

  function getFilteredData() {
    if (allData.length === 0) return []
    const now = new Date()
    if (view === '30D') { const c = new Date(now); c.setDate(c.getDate() - 30); return allData.filter(d => new Date(d.date) >= c) }
    if (view === '3M') { const c = new Date(now); c.setMonth(c.getMonth() - 3); return allData.filter(d => new Date(d.date) >= c) }
    if (view === '6M') return allData.slice(-6)
    if (view === '1Y') return allData.slice(-12)
    return allData
  }

  const data = getFilteredData()

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-6">

      {/* ── Top section: header + stats ── */}
      <div className="px-6 pt-6 pb-5 border-b border-gray-50">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-gray-900 text-base font-bold">Performance</h2>
            <p className="text-gray-400 text-xs mt-0.5">Simulation score history</p>
          </div>

          {/* Time range pills */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {['30D', '3M', '6M', '1Y'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition
                  ${view === v ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        {!loading && allData.length > 0 && (
          <div className="flex items-center gap-6">

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Avg Score</p>
              <div className="flex items-baseline gap-1">
                <p className="text-gray-900 text-2xl font-extrabold">{stats.avg}</p>
                <p className="text-gray-400 text-sm font-semibold">%</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Best Score</p>
              <div className="flex items-baseline gap-1">
                <p className="text-gray-900 text-2xl font-extrabold">{stats.best}</p>
                <p className="text-gray-400 text-sm font-semibold">%</p>
              </div>
            </div>

            <div className="w-px h-8 bg-gray-100" />

            <div>
              <p className="text-gray-400 text-xs mb-0.5">Improvement</p>
              <div className="flex items-baseline gap-1">
                <p className={`text-2xl font-extrabold ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
                </p>
                <p className={`text-sm font-semibold ${stats.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>%</p>
              </div>
            </div>

            {/* Status badge on the right */}
            <div className="ml-auto">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full
                ${stats.avg >= 80 ? 'bg-green-100 text-green-700' : stats.avg >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                {stats.avg >= 80 ? '✓ On Track' : stats.avg >= 50 ? 'Needs Work' : 'High Risk'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Chart ── */}
      <div className="px-2 pt-4 pb-2">
        {loading ? (
          <div className="flex items-center justify-center h-56">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-xs">Loading...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-2">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-semibold">No data for this period</p>
            <p className="text-gray-400 text-xs">Try a longer time range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />

              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}%`}
              />

              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />

              <Area
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#blueGrad)"
                dot={{ fill: '#fff', stroke: '#3b82f6', strokeWidth: 2, r: 3.5 }}
                activeDot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 3, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}

export default PerformanceChart