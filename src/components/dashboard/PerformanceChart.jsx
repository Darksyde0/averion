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
    const score = payload[0].value
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
    const status = score >= 80 ? 'Pass' : score >= 50 ? 'Average' : 'High Risk'
    return (
      <div style={{
        backgroundColor: '#0d1117',
        border: '1px solid #1e3a5f',
        borderRadius: '12px',
        padding: '12px 16px',
      }}>
        <p style={{ color: '#9ca3af', fontSize: '11px', marginBottom: '4px' }}>{label}</p>
        <p style={{ color: '#fff', fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{score}%</p>
        <span style={{
          backgroundColor: `${color}20`,
          color,
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '999px',
        }}>
          {status}
        </span>
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

  useEffect(() => {
    fetchScores()
  }, [])

  async function fetchScores() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: results } = await supabase
      .from('simulation_results')
      .select('score, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: true })

    if (!results || results.length === 0) {
      setLoading(false)
      return
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const grouped = {}
    results.forEach(r => {
      const date = new Date(r.completed_at)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!grouped[key]) {
        grouped[key] = { scores: [], month: monthNames[date.getMonth()], date }
      }
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

  // Filter data based on selected view
  function getFilteredData() {
    if (allData.length === 0) return []
    const now = new Date()

    if (view === '30D') {
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 30)
      return allData.filter(d => new Date(d.date) >= cutoff)
    }
    if (view === '3M') {
      const cutoff = new Date(now)
      cutoff.setMonth(cutoff.getMonth() - 3)
      return allData.filter(d => new Date(d.date) >= cutoff)
    }
    if (view === '6M') {
      return allData.slice(-6)
    }
    if (view === '1Y') {
      return allData.slice(-12)
    }
    return allData
  }

  const data = getFilteredData()

  const viewLabels = {
    '30D': 'last 30 days',
    '3M': 'last 3 months',
    '6M': 'last 6 months',
    '1Y': 'last 12 months',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-gray-800 text-lg font-bold">Performance Over Time</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Your simulation scores for the {viewLabels[view]}
          </p>
        </div>
        <div className="flex gap-2">
          {['30D', '3M', '6M', '1Y'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition
                ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stat pills */}
      {!loading && allData.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50 rounded-xl px-4 py-3">
            <p className="text-blue-400 text-xs font-semibold mb-0.5">Average Score</p>
            <p className="text-blue-700 text-xl font-extrabold">{stats.avg}%</p>
          </div>
          <div className="bg-green-50 rounded-xl px-4 py-3">
            <p className="text-green-400 text-xs font-semibold mb-0.5">Best Score</p>
            <p className="text-green-700 text-xl font-extrabold">{stats.best}%</p>
          </div>
          <div className={`rounded-xl px-4 py-3 ${stats.improvement >= 0 ? 'bg-purple-50' : 'bg-red-50'}`}>
            <p className={`text-xs font-semibold mb-0.5 ${stats.improvement >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              Improvement
            </p>
            <p className={`text-xl font-extrabold ${stats.improvement >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
              {stats.improvement >= 0 ? '+' : ''}{stats.improvement}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 text-sm">Loading chart...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-semibold">No data for this period</p>
          <p className="text-gray-400 text-xs">Try selecting a longer time range</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#scoreGradient)"
              dot={{ fill: '#fff', stroke: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, r: 7 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

    </div>
  )
}

export default PerformanceChart