import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'


function SimulationResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const profile = useProfile()

  const { simulations, userAnswers, score, total } = location.state || {
    simulations: [],
    userAnswers: {},
    score: 0,
    total: 0,
  }

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  function getResultMessage() {
    if (percentage >= 80) return { text: 'Excellent! You are security aware 🎉', color: 'text-green-500' }
    if (percentage >= 50) return { text: 'Moderate risk — keep learning 💪', color: 'text-yellow-500' }
    return { text: 'High risk — please review security training 📚', color: 'text-red-500' }
  }

  const result = getResultMessage()

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />


        {/* Results content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-3xl font-bold mb-2">
            Simulation Complete!
          </h1>
          <p className={`text-lg font-bold mb-6 ${result.color}`}>
            {result.text}
          </p>

          {/* Score card */}
          <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-8 mb-8">
            <div className="w-28 h-28 rounded-full border-8 border-blue-600 flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <p className="text-blue-600 text-3xl font-extrabold">{percentage}%</p>
                <p className="text-gray-400 text-xs">Score</p>
              </div>
            </div>
            <div>
              <p className="text-gray-700 text-lg font-semibold">
                You got <span className="text-green-500 font-bold">{score}</span> out of{' '}
                <span className="font-bold">{total}</span> correct
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Your score has been sent to your admin
              </p>
            </div>
          </div>

          {/* Answer review */}
          <h2 className="text-gray-800 text-xl font-bold mb-4">Answer Review</h2>

          <div className="flex flex-col gap-6 mb-8">
            {simulations.map((sim, index) => {
              const userAnswer = userAnswers[index]
              const isCorrect = userAnswer === sim.correctIndex

              return (
                <div key={sim.id} className="bg-white rounded-2xl shadow p-6">

                  <p className="text-gray-800 font-semibold text-sm mb-4">
                    Q{index + 1}: {sim.question}
                  </p>

                  <div className="flex flex-col gap-2 mb-4">
                    {sim.options.map((option, optIndex) => {
                      let style = 'bg-gray-100 text-gray-700 border-gray-200'
                      if (optIndex === sim.correctIndex) {
                        style = 'bg-green-100 text-green-800 border-green-400'
                      }
                      if (optIndex === userAnswer && !isCorrect) {
                        style = 'bg-red-100 text-red-800 border-red-400'
                      }

                      return (
                        <div
                          key={optIndex}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${style}`}
                        >
                          {optIndex === sim.correctIndex && (
                            <span className="text-green-600 font-bold">✓</span>
                          )}
                          {optIndex === userAnswer && !isCorrect && (
                            <span className="text-red-600 font-bold">✗</span>
                          )}
                          {optIndex !== sim.correctIndex && optIndex !== userAnswer && (
                            <span className="w-4" />
                          )}
                          {option}
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-[#0d1117] rounded-xl p-4">
                    <p className="text-blue-400 font-bold text-sm mb-1">Explanation</p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {sim.explanation}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>

          {/* Button */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Back to Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default SimulationResults