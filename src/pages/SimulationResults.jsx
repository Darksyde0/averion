// SimulationResults.jsx
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import TopBar from '../components/dashboard/TopBar'
import { supabase } from '../supabaseClient'

function SimulationResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setAuthChecked(true)
    }
    checkAuth()
  }, [navigate])

  const state = location.state
  useEffect(() => {
    if (authChecked && (!state || !state.simulations || state.simulations.length === 0)) navigate('/simulations')
  }, [authChecked, state, navigate])

  const { simulations = [], userAnswers = {}, score = 0, total = 0 } = state || {}
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  function scoreColor(s) {
    if (s >= 80) return '#10b981'
    if (s >= 50) return '#f59e0b'
    return '#ef4444'
  }

  const sc = scoreColor(percentage)
  const resultLabel = percentage >= 80 ? 'Excellent result' : percentage >= 50 ? 'Moderate — keep improving' : 'Needs attention'

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="w-5 h-5 border-2 border-gray-200 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-1 p-6">

          <div className="mb-6">
            <h1 className="text-gray-900 text-lg font-semibold">Simulation Complete</h1>
            <p className="text-xs mt-0.5 font-medium" style={{ color: sc }}>{resultLabel}</p>
          </div>

          {/* Score card */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center gap-6 mb-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: `3px solid ${sc}` }}>
              <div className="text-center">
                <p className="text-2xl font-bold leading-tight" style={{ color: sc }}>{percentage}%</p>
                <p className="text-gray-400 text-xs">Score</p>
              </div>
            </div>
            <div>
              <p className="text-gray-700 text-sm font-medium mb-0.5">
                <span className="font-bold" style={{ color: sc }}>{score}</span>
                <span className="text-gray-400"> / {total} correct</span>
              </p>
              <p className="text-gray-400 text-xs">Your score has been sent to your administrator</p>
            </div>
          </div>

          {/* Answer review */}
          <p className="text-gray-700 text-sm font-semibold mb-3">Answer Review</p>

          <div className="flex flex-col gap-3 mb-6">
            {simulations.map((sim, index) => {
              const userAnswer = userAnswers[index]
              const isCorrect = userAnswer === sim.correctIndex
              return (
                <div key={sim.id} className="bg-white border border-gray-100 rounded-xl p-5">
                  <div className="flex items-start gap-2 mb-4">
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5
                      ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{sim.question}</p>
                  </div>

                  <div className="flex flex-col gap-1.5 mb-4">
                    {sim.options.map((option, optIndex) => {
                      const isCorrectOpt = optIndex === sim.correctIndex
                      const isUserWrong = optIndex === userAnswer && !isCorrect
                      return (
                        <div key={optIndex}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs border
                            ${isCorrectOpt ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-medium'
                              : isUserWrong ? 'border-red-100 bg-red-50 text-red-600'
                              : 'border-gray-100 bg-gray-50 text-gray-500'}`}>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                            ${isCorrectOpt ? 'bg-emerald-500 text-white' : isUserWrong ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {isCorrectOpt ? '✓' : isUserWrong ? '✗' : ''}
                          </span>
                          {option}
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-gray-900 rounded-lg px-4 py-3">
                    <p className="text-gray-400 text-xs font-medium mb-1">Explanation</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{sim.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pb-6">
            <button onClick={() => navigate('/dashboard')}
              className="px-4 py-2.5 rounded-lg text-xs font-medium bg-gray-900 hover:bg-gray-800 text-white transition">
              Back to Dashboard
            </button>
            <button onClick={() => navigate('/simulations')}
              className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition">
              View All Simulations
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SimulationResults