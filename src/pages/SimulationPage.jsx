import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/dashboard/Sidebar'
import { supabase } from '../supabaseClient'
import { useProfile } from '../hooks/useProfile'
import TopBar from '../components/dashboard/TopBar'

function SimulationPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState({})
  const [hasCompleted, setHasCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [completedDate, setCompletedDate] = useState(null)
  const [simulations, setSimulations] = useState([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState(null)
  const profile = useProfile()

  // ── FETCH SIMULATIONS + CHECK IF ALREADY COMPLETED ──
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) setUserId(user.id)

    if (user) {
      const { data: results } = await supabase
        .from('simulation_results')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)

      if (results && results.length > 0) {
        setHasCompleted(true)
        setFinalScore(results[0].score)
        setCompletedDate(new Date(results[0].completed_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        }))
        setLoading(false)
        return
      }
    }

    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('hidden', false)
      .order('created_at', { ascending: true })

    if (!error && data) {
      const mapped = data.map(s => ({
        id: s.id,
        type: s.type,
        title: s.scenario_name,
        imageUrl: s.image_url || '',
        question: s.question,
        options: s.options,
        correctIndex: s.correct_index,
        explanation: s.explanation,
      }))
      setSimulations(mapped)
    }

    setLoading(false)
  }

  const current = simulations[currentIndex]

  function handleSelectOption(index) {
    setUserAnswers({ ...userAnswers, [currentIndex]: index })
  }

  function handleNext() {
    setCurrentIndex(currentIndex + 1)
  }

  async function handleSubmit() {
    const score = simulations.reduce((total, sim, index) => {
      return userAnswers[index] === sim.correctIndex ? total + 1 : total
    }, 0)

    const percentage = Math.round((score / simulations.length) * 100)
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })

    if (userId) {
      await supabase
        .from('simulation_results')
        .insert({
          user_id: userId,
          simulation_id: simulations[0]?.id,
          score: percentage,
          total: simulations.length,
          answers: userAnswers,
        })
    }

    setHasCompleted(true)
    setFinalScore(percentage)
    setCompletedDate(today)

    navigate('/simulation-results', {
      state: {
        simulations,
        userAnswers,
        score,
        total: simulations.length,
      },
    })
  }

  const isLastQuestion = currentIndex === simulations.length - 1
  const hasSelected = userAnswers[currentIndex] !== undefined

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <p className="text-gray-500 text-sm">Loading simulations...</p>
      </div>
    )
  }

  // ── COMPLETED SCREEN ──
  if (hasCompleted) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

          {/* Top bar */}
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

          {/* Completed screen */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 w-full max-w-md text-center">

              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h2 className="text-gray-800 text-2xl font-bold mb-2">Simulation Completed!</h2>
              <p className="text-gray-500 text-sm mb-6">
                You have already completed this simulation. Your results have been sent to your administrator.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6">
                <p className="text-gray-500 text-xs font-semibold mb-3">YOUR RESULT</p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm">Score</p>
                  <p className={`text-lg font-extrabold
                    ${finalScore >= 80 ? 'text-green-500' :
                      finalScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {finalScore}%
                  </p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm">Status</p>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full
                    ${finalScore >= 80 ? 'bg-green-100 text-green-600' :
                      finalScore >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    {finalScore >= 80 ? 'Pass' : finalScore >= 50 ? 'Average' : 'High Risk'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm">Completed on</p>
                  <p className="text-gray-800 text-sm font-semibold">{completedDate}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2 text-left">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-blue-700 text-xs leading-relaxed">
                  This simulation can only be taken once. Contact your administrator if you need to retake it.
                </p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition text-sm"
              >
                Back to Dashboard
              </button>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── NO SIMULATIONS ──
  if (simulations.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">No simulations available right now.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── SIMULATION SCREEN ──
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-60' : 'ml-16'}`}>

        {/* Top bar */}
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <div className="flex-1 p-8">

          <h1 className="text-gray-800 text-2xl font-bold mb-2">{current.title}</h1>

          {simulations.length > 1 && (
            <p className="text-gray-500 text-sm mb-4">
              Question {currentIndex + 1} of {simulations.length}
            </p>
          )}

          {/* Main simulation card */}
          <div className="bg-blue-600 rounded-2xl p-6 mb-6 max-w-5xl">

            <div className="flex justify-between items-center mb-4">
              <span className="text-white font-bold text-sm">Scenario Content</span>
              <span className="text-white text-sm">
                <span className="font-bold">Scenario type: </span>
                {current.type === 'image' ? 'Image' : 'Text'}
              </span>
            </div>

            {current.type === 'image' && current.imageUrl && (
              <div className="rounded-xl overflow-hidden mb-5 border-4 border-black">
                <img
                  src={current.imageUrl}
                  alt="Scenario"
                  className="w-full max-h-64 object-contain rounded-xl bg-white"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x400/1e3a5f/ffffff?text=Scenario+Image'
                  }}
                />
              </div>
            )}

            <p className="text-white text-base font-extrabold mb-5 leading-relaxed">
              {current.question}
            </p>

            <div className="flex flex-col gap-3">
              {current.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectOption(index)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-left text-sm font-medium transition
                    ${userAnswers[currentIndex] === index
                      ? 'bg-blue-800 text-white border-blue-400'
                      : 'bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${userAnswers[currentIndex] === index ? 'border-white bg-white' : 'border-gray-500'}`}>
                    {userAnswers[currentIndex] === index && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  {option}
                </button>
              ))}
            </div>

          </div>

          {/* Next / Submit button */}
          <div className="flex justify-end max-w-5xl">
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!hasSelected}
                className={`font-semibold px-10 py-4 rounded-xl transition text-base
                  ${hasSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!hasSelected}
                className={`font-semibold px-10 py-4 rounded-xl transition text-base
                  ${hasSelected ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Submit
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default SimulationPage