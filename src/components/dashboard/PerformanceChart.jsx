import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// 6 months data
const data6M = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 90 },
]

// 1 year data
const data1Y = [
  { month: 'Jul', score: 50 },
  { month: 'Aug', score: 55 },
  { month: 'Sep', score: 60 },
  { month: 'Oct', score: 58 },
  { month: 'Nov', score: 62 },
  { month: 'Dec', score: 65 },
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 70 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 90 },
]

function PerformanceChart() {
  const [view, setView] = useState('6M')
  const data = view === '6M' ? data6M : data1Y

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">

      {/* Chart header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-gray-800 text-lg font-bold">Performance Over Time</h2>
          <p className="text-gray-400 text-xs">
            Your training scores for the last {view === '6M' ? '6 months' : '1 year'}
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('6M')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
              view === '6M'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setView('1Y')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
              view === '1Y'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            1Y
          </button>
        </div>
      </div>

      {/* Line chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#9ca3af' }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  )
}

export default PerformanceChart